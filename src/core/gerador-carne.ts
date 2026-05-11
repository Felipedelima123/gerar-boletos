import path from 'path';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit') as typeof import('pdfkit');
import { Base64Encode } from 'base64-stream';
import QRCode from 'qrcode';
import { gerarLinhaDigitavel } from './gerador-linha-digitavel.js';
import type { IBoleto, PdfOptions } from './types/index.js';


const FONTES_DIR = path.resolve(process.cwd(), 'lib/boleto/fontes');
const TIMES = path.join(FONTES_DIR, 'Times New Roman.ttf');
const TIMES_BOLD = path.join(FONTES_DIR, 'Times New Roman Bold.ttf');
const TIMES_ITALIC = path.join(FONTES_DIR, 'Times New Roman Italic.ttf');
const TIMES_BOLD_ITALIC = path.join(FONTES_DIR, 'Times New Roman Bold Italic.ttf');
const CODE25I = path.join(FONTES_DIR, 'Code25I.ttf');
const TESOURA = path.resolve(process.cwd(), 'lib/boleto/imagens/tesoura128.png');

const PDF_DEFAULTS = {
  ajusteY: -80, ajusteX: 0, autor: '', titulo: '', criador: '',
  tamanhoDaFonteDoTitulo: 6, tamanhoDaFontes: 10, tamanhoDaFonte: 8,
  tamanhoDaLinhaDigitavel: 10, tamanhoDoCodigoDeBarras: 25,
  corDoLayout: 'black', alturaDaPagina: 600, larguraDaPagina: 844.68,
  exibirCampoUnidadeBeneficiaria: false,
  informacoesPersonalizadas: (_pdf: unknown, _x: number, _y: number) => {},
};

async function generateQRCode(text: string): Promise<Buffer> {
  const dataUrl = await QRCode.toDataURL(text);
  return Buffer.from(dataUrl.replace(/^data:image\/png;base64,/, ''), 'base64');
}

function i25(text: string): string {
  const start = String.fromCharCode(201);
  const stop = String.fromCharCode(202);
  return (text.match(/.{2}/g) ?? []).reduce((acc, part) => {
    const value = parseInt(part, 10);
    const ascii = value >= 0 && value <= 93 ? value + 33 : value + 101;
    return acc + String.fromCharCode(ascii);
  }, start) + stop;
}

export class GeradorDeBoletoCarne {
  private _boletos: IBoleto[];

  constructor(boletos: IBoleto | IBoleto[]) {
    this._boletos = Array.isArray(boletos) ? boletos : [boletos];
  }

  gerarPDF(args?: Partial<PdfOptions>): Promise<string | InstanceType<typeof PDFDocument>> {
    return new Promise(async (resolve) => {
      const opts = Object.assign({}, PDF_DEFAULTS, args ?? {});
      const boletos = this._boletos;
      const ESPACO = 23;
      const ESPACAMENTO = 260;
      let boletosNaPagina = 0;

      const pdf = new PDFDocument({
        size: [opts.alturaDaPagina, opts.larguraDaPagina],
        info: { Author: opts.autor, Title: opts.titulo, Creator: opts.criador },
      });

      if ((opts as { stream?: NodeJS.WritableStream }).stream) {
        pdf.pipe((opts as { stream: NodeJS.WritableStream }).stream);
      }

      pdf.registerFont('normal', TIMES);
      pdf.registerFont('negrito', TIMES_BOLD);
      pdf.registerFont('italico', TIMES_ITALIC);
      pdf.registerFont('negrito-italico', TIMES_BOLD_ITALIC);
      pdf.registerFont('codigoDeBarras', CODE25I);

      for (const [indice, boleto] of boletos.entries()) {
        if (boletosNaPagina === 3) { pdf.addPage(); boletosNaPagina = 0; }

        const offsetY = boletosNaPagina * ESPACAMENTO;
        const banco = boleto.getBanco();
        const pagador = boleto.getPagador();
        const beneficiario = boleto.getBeneficiario();
        const datas = boleto.getDatas();
        const aX = opts.ajusteX;
        const aY = opts.ajusteY + offsetY;

        const zeroLinha = boleto._qrCode ? 190 : 120;
        const linha1 = zeroLinha + 45;
        const linha2 = linha1 + ESPACO;
        const linha3 = linha2 + ESPACO;
        const linha4Opcional = linha3 + ESPACO;
        const linha5 = linha4Opcional + ESPACO;
        const linhaTeste = linha5 + ESPACO;
        const linha6 = linhaTeste + 90;
        const linha7 = linha6 + 50;

        const dH = (x1: number, y: number, x2: number) =>
          pdf.moveTo(aX + x1, aY + y).lineTo(aX + x2, aY + y).stroke(opts.corDoLayout);
        const dV = (x: number, y1: number, y2: number) =>
          pdf.moveTo(aX + x, aY + y1).lineTo(aX + x, aY + y2).stroke(opts.corDoLayout);

        dH(27, linha1, 572); dH(27, linha2, 572);
        dH(27, linha3, banco.exibirReciboDoPagadorCompleto() ? 572 : 329);
        if (banco.exibirReciboDoPagadorCompleto()) dH(27, linha4Opcional, 572);
        dH(27, linha5, banco.exibirReciboDoPagadorCompleto() ? 572 : 329);
        dH(434, linhaTeste, 572);
        dH(27, linha6, 572); dH(27, linha7, 572);
        dV(27, linha1, linha7); dV(572, linha1, linha7); dV(434, linha1, linha6);

        const margem = 30;
        const margemLayout = margem - 4;
        const altLogotipo = 20;
        const sepV = linha7 + 2 * 16 - 4;
        const linha21 = sepV + altLogotipo + 4;
        const linha22 = linha21 + ESPACO + 8;
        const linha23 = linha22 + ESPACO;
        const linha24 = linha23 + ESPACO;
        const linha25 = linha24 + ESPACO;
        const campos = 434;
        const linha26 = linha25 + ESPACO;
        const linha27 = linha26 + ESPACO;
        const linha28 = linha27 + ESPACO;
        const linha29 = linha28 + ESPACO;
        const linha211 = linha29 + ESPACO + 0.4;
        const linha212 = linha211 + 56.6;

        dH(margemLayout, linha21, 571); dH(margemLayout, linha22, 571);
        dH(margemLayout, linha23, 571); dH(margemLayout, linha24, 571);
        dH(margemLayout, linha25, 571);
        dH(campos, linha26, 571); dH(campos, linha27, 571); dH(campos, linha28, 571);
        dH(campos, linha29, 571);
        dH(margemLayout, linha211, 571); dH(margemLayout, linha212, 571);
        dV(margemLayout + 0.5, linha21, linha212); dV(570.5, linha21, linha212);
        dV(campos, linha21, linha211);

        const linhaSep = linha7 + 16;
        pdf.moveTo(aX + 27, aY + linhaSep).lineTo(aX + 572, aY + linhaSep).dash(3, { space: 5 }).stroke(opts.corDoLayout);
        pdf.image(TESOURA, aX + margemLayout, aY + linhaSep - 3.2, { width: 10 });

        const TITULOS = Object.assign({
          instrucoes: 'Instruções', informativo: 'INFORMATIVO',
          dataDocumento: 'Data Documento', nomeDoPagador: 'Nome do Cliente',
          agenciaECodigoDoBeneficiario: 'Agência / Código do Beneficiário',
          nossoNumero: 'Nosso Número', especie: 'Espécie', especieDoDocumento: 'Espécie Doc.',
          quantidade: 'Quantidade', numeroDoDocumento: 'Nº do Documento',
          dataDeProcessamento: 'Data Processamento', valorDoDocumento: 'Valor do Documento',
          valor: 'Valor', carteira: 'Carteira', moraMulta: '(+) Mora / Multa / Juros',
          localDoPagamento: 'Local do Pagamento', igualDoValorDoDocumento: '(=) ',
        }, banco.getTitulos() ?? {});

        if (boleto._qrCode) {
          const pixLinha0 = 95;
          const qrBuffer = await generateQRCode(boleto._qrCode);
          pdf.image(qrBuffer, aX + 480, aY + pixLinha0, { width: 90 });
          boleto.getInformativo().forEach((info, idx) => {
            pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(info, aX + margem, aY + pixLinha0 + 12 + idx * opts.tamanhoDaFonte, { lineBreak: false, width: 400, align: 'left' });
          });
          pdf.rect(aX + 27, aY + pixLinha0 + 88, 545, 23).fill('#DFDFDF');
          pdf.font('negrito').fontSize(6).fillColor('black').text(boleto._qrCode, aX + 32, aY + pixLinha0 + 90, { lineBreak: false, width: 500, align: 'left' });
          pdf.rect(aX + 27, aY + pixLinha0 - 10, 545, 120).undash().stroke();
        }

        const codigoDeBarras = boleto._codigoBarras || banco.geraCodigoDeBarrasPara(boleto);
        const linhaDigitavel = boleto._linhaDigitavel
          ? gerarLinhaDigitavel(boleto._linhaDigitavel)
          : gerarLinhaDigitavel(codigoDeBarras, banco);

        const tamCel = 124.5;
        const colLat = 440;
        const dif = 10;

        const segundaLinha2 = linha21 - 20.25;
        pdf.image(banco.getImagem(), aX + margemLayout, aY + segundaLinha2 - 5, { height: altLogotipo });
        if (banco.imprimirNome) pdf.font('negrito').fontSize(opts.tamanhoDaLinhaDigitavel).text(banco.nome ?? '', aX + margemLayout + 26, aY + segundaLinha2, { lineBreak: false, width: 100, align: 'left' });
        pdf.font('negrito').fontSize(opts.tamanhoDaLinhaDigitavel).text(banco.getNumeroFormatadoComDigito(), aX + margemLayout + 131, aY + segundaLinha2, { lineBreak: false, width: 39.8, align: 'center' });
        pdf.font('negrito').fontSize(opts.tamanhoDaLinhaDigitavel).text(linhaDigitavel, aX + margemLayout + 145, aY + segundaLinha2, { lineBreak: false, width: 400, align: 'right' });

        const terceira = segundaLinha2 + 38;
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.localDoPagamento, aX + margem, aY + terceira - dif - 7, { lineBreak: false, width: 294, align: 'left' });
        boleto.getLocaisDePagamento().forEach((l, i) => {
          if (i > 1) return;
          pdf.font('normal').fontSize(opts.tamanhoDaFonteDoTitulo + 3).text(l, aX + margem, aY + terceira + 2 - opts.tamanhoDaFonte + i * opts.tamanhoDaFonte, { lineBreak: false, width: 400, align: 'left' });
        });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text('Vencimento', aX + colLat, aY + terceira - dif - 7, { lineBreak: false, width: tamCel, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(datas.getVencimentoFormatado(), aX + colLat, aY + terceira, { lineBreak: false, width: tamCel, align: 'right' });

        const quarta = terceira + 24;
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text('Beneficiário', aX + margem, aY + quarta - dif, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(beneficiario.getIdentificacao(), aX + margem, aY + quarta, { lineBreak: false, width: 400, align: 'left' });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.agenciaECodigoDoBeneficiario, aX + colLat, aY + quarta - dif, { lineBreak: false, width: tamCel, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(banco.getAgenciaECodigoBeneficiario(boleto), aX + colLat, aY + quarta, { lineBreak: false, width: tamCel, align: 'right' });

        const quinta = quarta + ESPACO;
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.dataDocumento, aX + margem, aY + quinta - dif, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(datas.getDocumentoFormatado(), aX + margem, aY + quinta, { lineBreak: false, width: 61.5, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(boleto.getNumeroDoDocumentoFormatado(), aX + margem + 68, aY + quinta, { lineBreak: false, width: 84, align: 'left' });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.numeroDoDocumento, aX + margem + 68, aY + quinta - dif, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.especieDoDocumento, aX + margem + 158, aY + quinta - dif, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(boleto.getEspecieDocumento(), aX + margem + 158, aY + quinta, { lineBreak: false, width: 81, align: 'center' });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text('Aceite', aX + margem + 244, aY + quinta - dif, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(boleto.getAceiteFormatado(), aX + margem + 244, aY + quinta, { lineBreak: false, width: 55, align: 'center' });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.dataDeProcessamento, aX + margem + 305, aY + quinta - dif, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(datas.getProcessamentoFormatado(), aX + margem + 305, aY + quinta, { lineBreak: false, width: 93.5, align: 'left' });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.nossoNumero, aX + colLat, aY + quinta - dif, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(beneficiario._nossoNumero, aX + colLat, aY + quinta, { lineBreak: false, width: tamCel, align: 'right' });

        const sexta = quinta + ESPACO;
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text('Uso do Banco', aX + margem, aY + sexta - dif, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.carteira, aX + margem + 105, aY + sexta - dif, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(banco.getCarteiraTexto(beneficiario), aX + margem + 104.5, aY + sexta, { lineBreak: false, width: 71, align: 'center' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(boleto.getEspecieMoeda(), aX + margem + 181.5, aY + sexta, { lineBreak: false, width: 71, align: 'center' });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.especie, aX + margem + 182, aY + sexta - dif, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.quantidade, aX + margem + 259, aY + sexta - dif, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.valor, aX + margem + 351, aY + sexta - dif, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.igualDoValorDoDocumento + TITULOS.valorDoDocumento, aX + colLat, aY + sexta - dif, { lineBreak: false, width: tamCel, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(boleto.getValorFormatadoBRL(), aX + colLat, aY + sexta, { lineBreak: false, width: tamCel, align: 'right' });

        const setima = sexta + ESPACO;
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.instrucoes, aX + margem, aY + setima - dif, { lineBreak: false, width: 294, align: 'left' });
        const instrY = setima - dif + 12;
        boleto.getInstrucoes().forEach((instr, i) => {
          pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(instr, aX + margem, aY + instrY + i * opts.tamanhoDaFonte, { lineBreak: false, width: 400, align: 'left' });
        });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text('Pagador', aX + 30, aY + setima - dif + 115, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(pagador.getIdentificacao(), aX + 30, aY + setima - dif + 125, { lineBreak: false, width: 535, align: 'left' });

        const endP = pagador.getEndereco();
        if (endP) {
          let esp = opts.tamanhoDaFonte;
          if (endP.getPrimeiraLinha()) {
            pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(endP.getPrimeiraLinha(), aX + 30, aY + setima - dif + 125 + esp, { lineBreak: false, width: 535, align: 'left' });
            esp += esp;
          }
          if (endP.getSegundaLinha()) {
            pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(endP.getSegundaLinha(), aX + 30, aY + setima - dif + 125 + esp, { lineBreak: false, width: 535, align: 'left' });
          }
        }

        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text('(-) Desconto / Abatimento', aX + colLat, aY + setima - dif, { lineBreak: false, width: tamCel, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(boleto.getValorDescontosFormatadoBRL(), aX + colLat, aY + setima, { lineBreak: false, width: tamCel, align: 'right' });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text('(-) Outras Deduções', aX + colLat, aY + (setima + ESPACO) - dif, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.moraMulta, aX + colLat, aY + (setima + 2 * ESPACO) - dif, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(boleto.getValorMoraMultaJurosFormatadoBRL(), aX + colLat, aY + (setima + 2 * ESPACO) - dif + 7, { lineBreak: false, width: tamCel, align: 'right' });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text('(+) Outros Acréscimos', aX + colLat, aY + (setima + 3 * ESPACO) - dif, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text('(=) Valor Cobrado', aX + colLat, aY + (setima + 4 * ESPACO) - dif, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(boleto.getValorCobradoFormatadoBRL(), aX + colLat, aY + (setima + 4 * ESPACO) - dif + 7, { lineBreak: false, width: tamCel, align: 'right' });

        pdf.font('codigoDeBarras').fontSize(opts.tamanhoDoCodigoDeBarras).text(i25(codigoDeBarras), aX + margemLayout, aY + linha212 + 3.5, { lineBreak: false, width: 340, align: 'left' });

        opts.informacoesPersonalizadas(pdf, aX + margemLayout, aY + linha212 + opts.tamanhoDoCodigoDeBarras + 10);
        boletosNaPagina++;
      }

      if ((opts as { base64?: boolean }).base64) {
        let finalString = '';
        const stream = pdf.pipe(new Base64Encode());
        pdf.end();
        stream.on('data', (chunk: string) => { finalString += chunk; });
        stream.on('end', () => resolve(finalString));
      } else {
        pdf.end();
        resolve(pdf);
      }
    });
  }
}
