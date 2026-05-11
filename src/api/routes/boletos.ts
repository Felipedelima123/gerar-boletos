import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { BoletoRequestSchema, LoteRequestSchema } from '../schemas/boleto.js';
import { GeradorDeBoletoCarne, Boleto, Datas, Bancos } from '../../core/index.js';
import { BoletoStringify } from '../../core/stringify.js';
import { GeradorDeBoleto as GeradorPDF } from '../../core/gerador.js';
import type { BoletoInput } from '../../core/types/index.js';

type BancoConstructor = new () => BoletoInput['banco'];

function resolverBanco(nomeBanco: string): BoletoInput['banco'] {
  const mapa: Record<string, string> = {
    bradesco: 'Bradesco',
    'banco-do-brasil': 'BancoBrasil',
    bancodobrasil: 'BancoBrasil',
    banrisul: 'Banrisul',
    caixa: 'Caixa',
    cecred: 'Cecred',
    itau: 'Itau',
    santander: 'Santander',
    sicoob: 'Sicoob',
    sicredi: 'Sicredi',
  };

  const chave = mapa[nomeBanco.toLowerCase()] ?? nomeBanco;
  const BancoClass = (Bancos as Record<string, BancoConstructor | undefined>)[chave];

  if (!BancoClass) {
    throw new Error(
      `Banco "${nomeBanco}" não suportado. Válidos: ${Object.keys(mapa).join(', ')} ou códigos: 237, 001, 041, 104, 085, 341, 033, 756, 748`
    );
  }

  return new BancoClass();
}

function buildBoletoObj(body: ReturnType<typeof BoletoRequestSchema.parse>) {
  const banco = resolverBanco(body.banco);
  const { datas, valor, especieDocumento, numeroDocumento, valorCobrado, valorMoraMultaJuros } = body.boleto;

  const parse = (v: number | string | undefined, fallback: number | string = 0) =>
    parseFloat(String(v ?? fallback)).toFixed(2);

  return Boleto.novoBoleto()
    .comDatas(
      Datas.novasDatas()
        .comVencimento(datas.vencimento)
        .comProcessamento(datas.processamento)
        .comDocumento(datas.documentos)
    )
    .comBeneficiario(BoletoStringify.createBeneficiario(body.beneficiario))
    .comPagador(BoletoStringify.createPagador(body.pagador))
    .comBanco(banco as BoletoInput['banco'])
    .comValorBoleto(parse(valor))
    .comNumeroDoDocumento(numeroDocumento)
    .comEspecieDocumento(especieDocumento)
    .comInstrucoes(BoletoStringify.createInstrucoes(body.instrucoes))
    .comInformativo(BoletoStringify.createInformativo(body.informativo))
    .comCodigoBarras(body.boleto.codigoBarras)
    .comLinhaDigitavel(body.boleto.linhaDigitavel)
    .comPixEmv(body.boleto.pixQrCode)
    .comValorCobrado(parse(valorCobrado, valor))
    .comValorDescontos(parse(body.boleto.valorDescontos))
    .comValorMoraMultaJuros(parse(valorMoraMultaJuros))
    .comValorDeducoes(parse(body.boleto.valorDeducoes))
    .comLocaisDePagamento(body.locaisDePagamento ?? [])
    .comIdUnico();
}

function handleError(err: unknown, reply: FastifyReply) {
  const message = err instanceof Error ? err.message : 'Erro interno';
  return reply.status(500).send({ error: message });
}

export async function boletosRoutes(app: FastifyInstance) {
  // ──────────────────────────────────────────
  // POST /api/v1/boletos — base64 + metadados
  // ──────────────────────────────────────────
  app.post('/api/v1/boletos', async (req: FastifyRequest, reply: FastifyReply) => {
    const parsed = BoletoRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Dados inválidos', detalhes: parsed.error.flatten() });
    }

    try {
      const boletoInfo = [buildBoletoObj(parsed.data)];
      const gerador = new GeradorPDF(boletoInfo);
      const [base64, linhas] = await Promise.all([
        gerador.gerarPDF({ base64: true }) as Promise<string>,
        gerador.gerarLinhaDigitavel(),
      ]);
      const codigoBarras =
        boletoInfo[0]._codigoBarras ?? boletoInfo[0].getBanco().geraCodigoDeBarrasPara(boletoInfo[0]);
      return reply.send({ base64, linhaDigitavel: linhas[0]?.linha ?? '', codigoBarras });
    } catch (err) {
      return handleError(err, reply);
    }
  });

  // ──────────────────────────────────────────
  // POST /api/v1/boletos/pdf — binário PDF
  // ──────────────────────────────────────────
  app.post('/api/v1/boletos/pdf', async (req: FastifyRequest, reply: FastifyReply) => {
    const parsed = BoletoRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Dados inválidos', detalhes: parsed.error.flatten() });
    }

    try {
      const boletoInfo = [buildBoletoObj(parsed.data)];
      const pdfDoc = await new GeradorPDF(boletoInfo).gerarPDF();
      reply.header('Content-Type', 'application/pdf');
      reply.header('Content-Disposition', 'attachment; filename="boleto.pdf"');
      return reply.send(pdfDoc);
    } catch (err) {
      return handleError(err, reply);
    }
  });

  // ──────────────────────────────────────────
  // POST /api/v1/boletos/png — imagem PNG
  // ──────────────────────────────────────────
  app.post('/api/v1/boletos/png', async (req: FastifyRequest, reply: FastifyReply) => {
    const parsed = BoletoRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Dados inválidos', detalhes: parsed.error.flatten() });
    }

    try {
      const { scale = 2.0 } = (req.query as Record<string, string | number>);
      const boletoInfo = [buildBoletoObj(parsed.data)];
      const paginas = await new GeradorPDF(boletoInfo).gerarPNG({
        scale: typeof scale === 'string' ? parseFloat(scale) : scale,
      });

      if (paginas.length === 1) {
        // Boleto simples — retorna PNG binário
        reply.header('Content-Type', 'image/png');
        reply.header('Content-Disposition', 'attachment; filename="boleto.png"');
        return reply.send(paginas[0].buffer);
      }

      // Múltiplas páginas — retorna array base64
      return reply.send({
        paginas: paginas.map((p) => ({
          pagina: p.page,
          base64: p.buffer.toString('base64'),
          mimeType: p.mimeType,
        })),
      });
    } catch (err) {
      return handleError(err, reply);
    }
  });

  // ──────────────────────────────────────────
  // POST /api/v1/boletos/carne — carnê (múltiplos boletos)
  // ──────────────────────────────────────────
  app.post('/api/v1/boletos/carne', async (req: FastifyRequest, reply: FastifyReply) => {
    const parsed = LoteRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Dados inválidos', detalhes: parsed.error.flatten() });
    }

    try {
      const boletosInfo = parsed.data.boletos.map((b) => buildBoletoObj(b));
      const base64 = (await new GeradorDeBoletoCarne(boletosInfo).gerarPDF({ base64: true })) as string;
      return reply.send({ base64 });
    } catch (err) {
      return handleError(err, reply);
    }
  });
}
