import path from 'path';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit') as typeof import('pdfkit');
import { Base64Encode } from 'base64-stream';
import { gerarLinhaDigitavel } from './gerador-linha-digitavel.js';
import { PixRenderer } from './pix-renderer.js';
import type { IBoleto, PdfOptions } from './types/index.js';


const FONTES_DIR = path.resolve(process.cwd(), 'lib/boleto/fontes');
const TIMES = path.join(FONTES_DIR, 'Times New Roman.ttf');
const TIMES_BOLD = path.join(FONTES_DIR, 'Times New Roman Bold.ttf');
const TIMES_ITALIC = path.join(FONTES_DIR, 'Times New Roman Italic.ttf');
const TIMES_BOLD_ITALIC = path.join(FONTES_DIR, 'Times New Roman Bold Italic.ttf');
const CODE25I = path.join(FONTES_DIR, 'Code25I.ttf');
const TESOURA = path.resolve(process.cwd(), 'lib/boleto/imagens/tesoura128.png');

const PDF_DEFAULTS: Required<PdfOptions> = {
  ajusteY: -80,
  ajusteX: 0,
  autor: '',
  titulo: '',
  criador: '',
  tamanhoDaFonteDoTitulo: 8,
  tamanhoDaFonte: 10,
  tamanhoDaLinhaDigitavel: 14,
  tamanhoDoCodigoDeBarras: 32,
  corDoLayout: 'black',
  alturaDaPagina: 600,
  larguraDaPagina: 844.68,
  exibirCampoUnidadeBeneficiaria: false,
  informacoesPersonalizadas: () => {},
  stream: undefined as unknown as NodeJS.WritableStream,
  base64: false,
  creditos: '',
};

function i25(text: string): string {
  const start = String.fromCharCode(201);
  const stop = String.fromCharCode(202);
  const pairs = text.match(/.{2}/g) ?? [];
  return pairs.reduce((acc, part) => {
    const value = parseInt(part, 10);
    let ascii: number;
    if (value >= 0 && value <= 93) ascii = value + 33;
    else ascii = value + 101;
    return acc + String.fromCharCode(ascii);
  }, start) + stop;
}

function formatCpfCnpj(cpfCnpj: string): string | false {
  if (cpfCnpj.length === 11) {
    return cpfCnpj.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  return false;
}

function merge<T>(defaults: T, overrides: Partial<T>): T {
  return Object.assign({}, defaults, overrides);
}

export class GeradorDeBoleto {
  private _boletos: IBoleto[];

  constructor(boletos: IBoleto | IBoleto[]) {
    this._boletos = Array.isArray(boletos) ? boletos : [boletos];
  }

  gerarPDF(args?: Partial<PdfOptions>): Promise<string | InstanceType<typeof PDFDocument>> {
    return new Promise(async (resolve) => {
      const opts = merge(PDF_DEFAULTS, args ?? {}) as Required<PdfOptions>;
      const boletos = this._boletos;
      const ESPACO = 23;

      const pdf = new PDFDocument({
        size: [opts.alturaDaPagina!, opts.larguraDaPagina!],
        info: { Author: opts.autor, Title: opts.titulo, Creator: opts.criador },
      });

      if (opts.stream) pdf.pipe(opts.stream!);
      const aX = opts.ajusteX ?? 0;
      const aY = opts.ajusteY ?? -80;

      pdf.registerFont('normal', TIMES);
      pdf.registerFont('negrito', TIMES_BOLD);
      pdf.registerFont('italico', TIMES_ITALIC);
      pdf.registerFont('negrito-italico', TIMES_BOLD_ITALIC);
      pdf.registerFont('codigoDeBarras', CODE25I);

      for (const [indice, boleto] of boletos.entries()) {
        const banco = boleto.getBanco();
        const pagador = boleto.getPagador();
        const beneficiario = boleto.getBeneficiario();
        const datas = boleto.getDatas();

        const zeroLinha = boleto._qrCode ? 190 : 120;
        const linha1 = zeroLinha + 45;
        const linha2 = linha1 + ESPACO;
        const linha3 = linha2 + ESPACO;
        const linha4Opcional = linha3 + ESPACO;
        const linha5 = linha4Opcional + ESPACO;
        const linhaTeste = linha5 + ESPACO;
        const linha6 = linhaTeste + 90;
        const linha7 = linha6 + 50;

        const drawH = (x1: number, y: number, x2: number) =>
          pdf.moveTo(aX + x1, aY + y).lineTo(aX + x2, aY + y).stroke(opts.corDoLayout);
        const drawV = (x: number, y1: number, y2: number) =>
          pdf.moveTo(aX + x, aY + y1).lineTo(aX + x, aY + y2).stroke(opts.corDoLayout);

        drawH(27, linha1, 572); drawH(27, linha2, 572);
        drawH(27, linha3, banco.exibirReciboDoPagadorCompleto() ? 572 : 329);
        if (banco.exibirReciboDoPagadorCompleto()) drawH(27, linha4Opcional, 572);
        drawH(27, linha5, banco.exibirReciboDoPagadorCompleto() ? 572 : 329);
        drawH(434, linhaTeste, 572);
        drawH(27, linha6, 572); drawH(27, linha7, 572);

        const linhaLateral1 = linhaTeste + ESPACO;
        const linhaLateral2 = linhaLateral1 + ESPACO;
        const linhaLateral3 = linhaLateral2 + ESPACO;
        drawH(434, linhaLateral1, 571); drawH(434, linhaLateral2, 571); drawH(434, linhaLateral3, 571);

        drawV(27, linha1 - 0.5, linha7); drawV(572, linha1 - 0.5, linha7);
        drawV(434, linha1, linha6);

        const col001 = 93.5;
        const col002 = col001 + 92.5;
        const col003 = col002 + 84.5;
        const col004 = col003 + 61;
        drawV(col001, linha3, linha4Opcional); drawV(col002, linha3, linha4Opcional);
        drawV(col003, linha3, linha4Opcional); drawV(col004, linha3, linha4Opcional);
        drawV(col001, linha4Opcional, linha5);

        const col281 = 132;
        const col291 = col281 + 76.5;
        const col2101 = col291 + 77;
        const col2111 = col2101 + 92;
        drawV(col281, linha4Opcional, linha5); drawV(col291, linha4Opcional, linha5);
        drawV(col2101, linha4Opcional, linha5); drawV(col2111, linha4Opcional, linha5);

        const colSuperior = 154;
        const colSuperior2 = colSuperior + 41.5;
        drawV(colSuperior, linha1 - 25, linha1); drawV(colSuperior2, linha1 - 25, linha1);

        // Bloco 2 (ficha de compensação)
        const margem2 = 30;
        const margemLayout2 = margem2 - 4;
        const altLogotipo = 20;
        const separadorV = linha7 + 2 * 16 - 4;
        const linha21 = separadorV + altLogotipo + 4;
        const linha22 = linha21 + ESPACO + 8;
        const linha23 = linha22 + ESPACO;
        const linha24 = linha23 + ESPACO;
        const linha25 = linha24 + ESPACO;
        const camposLaterais = 434;
        const linha26 = linha25 + ESPACO;
        const linha27 = linha26 + ESPACO;
        const linha28 = linha27 + ESPACO;
        const linha29 = linha28 + ESPACO;
        const linha211 = linha29 + ESPACO + 0.4;
        const linha212 = linha211 + 56.6;

        drawH(margemLayout2, linha21, 571); drawH(margemLayout2, linha22, 571);
        drawH(margemLayout2, linha23, 571); drawH(margemLayout2, linha24, 571);
        drawH(margemLayout2, linha25, 571);
        drawH(camposLaterais, linha26, 571); drawH(camposLaterais, linha27, 571);
        drawH(camposLaterais, linha28, 571);
        if (opts.exibirCampoUnidadeBeneficiaria) {
          const linha28_2 = linha28 + 12.4;
          drawH(margemLayout2, linha28_2, camposLaterais);
        }
        drawH(camposLaterais, linha29, 571);
        drawH(margemLayout2, linha211, 571); drawH(margemLayout2, linha212, 571);

        drawV(margemLayout2 + 0.5, linha21, linha212); drawV(571 - 0.5, linha21, linha212);
        drawV(camposLaterais, linha21, linha211);
        drawV(93.5, linha23, linha24);
        if (banco.exibirCampoCip()) drawV(93.5, linha24, linha25);
        drawV(93.5 + 92.5, linha23, linha24); drawV(93.5 + 177, linha23, linha24);
        drawV(93.5 + 238, linha23, linha24);
        drawV(margemLayout2 + 106, linha24, linha25); drawV(margemLayout2 + 182.5, linha24, linha25);
        drawV(margemLayout2 + 259.5, linha24, linha25); drawV(margemLayout2 + 351.5, linha24, linha25);

        const col212 = 154;
        drawV(col212, separadorV, linha21);
        drawV(col212 + 1, separadorV, linha21);
        drawV(col212 + 2, separadorV, linha21);
        drawV(col212 + 43.5, separadorV, linha21);
        drawV(col212 + 44.5, separadorV, linha21);
        drawV(col212 + 45.5, separadorV, linha21);

        const linhaSeparadora = linha7 + 16;
        pdf.moveTo(aX + 27, aY + linhaSeparadora).lineTo(aX + 572, aY + linhaSeparadora).dash(3, { space: 5 }).stroke(opts.corDoLayout);
        pdf.image(TESOURA, aX + margemLayout2, aY + linhaSeparadora - 3.2, { width: 10 });

        const TITULOS = Object.assign({
          instrucoes: 'Instruções',
          informativo: 'INFORMATIVO',
          dataDocumento: 'Data Documento',
          nomeDoPagador: 'Nome do Cliente',
          agenciaECodigoDoBeneficiario: 'Agência / Código do Beneficiário',
          nossoNumero: 'Nosso Número',
          especie: 'Espécie',
          especieDoDocumento: 'Espécie Doc.',
          quantidade: 'Quantidade',
          numeroDoDocumento: 'Nº do Documento',
          dataDeProcessamento: 'Data Processamento',
          valorDoDocumento: 'Valor do Documento',
          valor: 'Valor',
          carteira: 'Carteira',
          moraMulta: '(+) Mora / Multa / Juros',
          localDoPagamento: 'Local do Pagamento',
          igualDoValorDoDocumento: '(=) ',
        }, banco.getTitulos() ?? {});

        if (opts.creditos) {
          pdf.font('italico').fontSize(8).text(opts.creditos, aX + 3, aY + 90, { width: 560, align: 'center' });
        }

        // PIX — recibo do pagador (copia e cola + QR)
        const pixEmvStr = boleto.getPixEmvString();
        if (pixEmvStr) {
          const pixLinha0 = 95;

          // Instruções PIX (do objeto ou do informativo)
          const pixInstrucoes = boleto.getPixInstrucoes().length > 0
            ? boleto.getPixInstrucoes()
            : boleto.getInformativo();

          pdf.font('negrito').fontSize(10).text(TITULOS.informativo, aX + 250, aY + pixLinha0, { lineBreak: false, width: 294, align: 'left' });

          const instrucaoY = pixLinha0 + 12;
          pixInstrucoes.forEach((info, idx) => {
            pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(info, aX + margem2, aY + instrucaoY + idx * opts.tamanhoDaFonte, { lineBreak: false, width: 400, align: 'left' });
          });

          pdf.fontSize(10).text('Pague agora via PIX, basta acessar o aplicativo de sua instituição financeira', aX + 30, aY + pixLinha0 + 66, { lineBreak: false, width: 350, align: 'left' });
          pdf.font('negrito').fontSize(10).text('PIX copia e cola', aX + 30, aY + pixLinha0 + 75, { lineBreak: false, width: 294, align: 'left' });
          pdf.rect(aX + 27, aY + pixLinha0 + 88, 545, 23).fill('#DFDFDF');
          pdf.font('negrito').fontSize(6).fillColor('black').text(pixEmvStr, aX + 32, aY + pixLinha0 + 90, { lineBreak: false, width: 500, align: 'left' });
          pdf.rect(aX + 27, aY + pixLinha0 - 10, 545, 120).undash().stroke();
        }

        // Recibo do Pagador (bloco 1)
        const segundaLinha3 = linha1 - 20.25;
        pdf.image(banco.getImagem(), aX + margemLayout2, aY + segundaLinha3 - 5, { height: altLogotipo });
        pdf.font('negrito').fontSize(opts.tamanhoDaLinhaDigitavel).text('Recibo do Pagador', aX + margemLayout2 + 145, aY + segundaLinha3, { lineBreak: false, width: 400, align: 'right' });
        pdf.font('negrito').fontSize(opts.tamanhoDaLinhaDigitavel).text(banco.getNumeroFormatadoComDigito(), aX + margemLayout2 + 131, aY + linha1 - 20.25, { lineBreak: false, width: 39.8, align: 'center' });

        const primeiraLinha = linha1 + 9;
        const difTitVal = 10;
        const colunaLateralLinhaSupBloco1 = 440;
        const tamCelulasDir = 124.5;

        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.localDoPagamento, aX + margem2, aY + primeiraLinha - 7, { lineBreak: false, width: 294, align: 'left' });
        boleto.getLocaisDePagamento().forEach((local, idx) => {
          if (idx > 1) return;
          pdf.font('normal').fontSize(opts.tamanhoDaFonteDoTitulo + 2).text(local, aX + margem2, aY + primeiraLinha + 2, { lineBreak: false, width: 400, align: 'left' });
        });

        const LinhaBaseBloco1 = linha2 - 20.25;
        const linhaSuperiorLayout1 = LinhaBaseBloco1 + 9;
        const colunaLateral = 440;

        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text('Vencimento', aX + colunaLateralLinhaSupBloco1, aY + linhaSuperiorLayout1 - difTitVal, { lineBreak: false, width: tamCelulasDir, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(datas.getVencimentoFormatado(), aX + colunaLateralLinhaSupBloco1, aY + linhaSuperiorLayout1, { lineBreak: false, width: tamCelulasDir, align: 'right' });

        const quartaLinha1 = LinhaBaseBloco1 + 30;
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text('Beneficiário', aX + margem2, aY + quartaLinha1 - difTitVal, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(beneficiario.getIdentificacao(), aX + margem2, aY + quartaLinha1, { lineBreak: false, width: 400, align: 'left' });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.agenciaECodigoDoBeneficiario, aX + colunaLateral, aY + quartaLinha1 - difTitVal, { lineBreak: false, width: tamCelulasDir, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(banco.getAgenciaECodigoBeneficiario(boleto), aX + colunaLateral, aY + quartaLinha1, { lineBreak: false, width: tamCelulasDir, align: 'right' });

        const quintaLinha1 = quartaLinha1 + ESPACO;
        const tituloCip = margem2 + 68;

        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.dataDocumento, aX + margem2, aY + quintaLinha1 - difTitVal, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(datas.getDocumentoFormatado(), aX + margem2, aY + quintaLinha1, { lineBreak: false, width: 61.5, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(boleto.getNumeroDoDocumentoFormatado(), aX + margem2 + 68, aY + quintaLinha1, { lineBreak: false, width: 84, align: 'left' });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.numeroDoDocumento, aX + margem2 + 68, aY + quintaLinha1 - difTitVal, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.especieDoDocumento, aX + margem2 + 158, aY + quintaLinha1 - difTitVal, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(boleto.getEspecieDocumento(), aX + margem2 + 158, aY + quintaLinha1, { lineBreak: false, width: 81, align: 'center' });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text('Aceite', aX + margem2 + 244, aY + quintaLinha1 - difTitVal, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(boleto.getAceiteFormatado(), aX + margem2 + 244, aY + quintaLinha1, { lineBreak: false, width: 55, align: 'center' });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.dataDeProcessamento, aX + margem2 + 305, aY + quintaLinha1 - difTitVal, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(datas.getProcessamentoFormatado(), aX + margem2 + 305, aY + quintaLinha1, { lineBreak: false, width: 93.5, align: 'left' });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.nossoNumero, aX + colunaLateral, aY + quintaLinha1 - difTitVal, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(beneficiario._nossoNumero, aX + colunaLateral, aY + quintaLinha1, { lineBreak: false, width: tamCelulasDir, align: 'right' });

        const sextaLinha1 = quintaLinha1 + ESPACO;
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text('Uso do Banco', aX + margem2, aY + sextaLinha1 - difTitVal, { lineBreak: false, width: 294, align: 'left' });
        if (banco.exibirCampoCip()) {
          pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text('CIP', aX + tituloCip, aY + sextaLinha1 - difTitVal, { lineBreak: false, width: 31, align: 'left' });
          pdf.font('normal').fontSize(opts.tamanhoDaFonte).text('', aX + tituloCip, aY + sextaLinha1, { lineBreak: false, width: 31, align: 'center' });
        }
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.carteira, aX + margem2 + 105, aY + sextaLinha1 - difTitVal, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(banco.getCarteiraTexto(beneficiario), aX + margem2 + 104.5, aY + sextaLinha1, { lineBreak: false, width: 71, align: 'center' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(boleto.getEspecieMoeda(), aX + margem2 + 181.5, aY + sextaLinha1, { lineBreak: false, width: 71, align: 'center' });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.especie, aX + margem2 + 182, aY + sextaLinha1 - difTitVal, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.quantidade, aX + margem2 + 259, aY + sextaLinha1 - difTitVal, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.valor, aX + margem2 + 351, aY + sextaLinha1 - difTitVal, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.igualDoValorDoDocumento + TITULOS.valorDoDocumento, aX + colunaLateral, aY + sextaLinha1 - difTitVal, { lineBreak: false, width: tamCelulasDir, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(boleto.getValorFormatadoBRL(), aX + colunaLateral, aY + sextaLinha1, { lineBreak: false, width: tamCelulasDir, align: 'right' });

        const setimaLinha1 = sextaLinha1 + ESPACO;
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.instrucoes, aX + margem2, aY + setimaLinha1 - difTitVal, { lineBreak: false, width: 294, align: 'left' });
        const instrucaoY1 = setimaLinha1 - difTitVal + 12;
        boleto.getInstrucoes().forEach((instr, idx) => {
          pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(instr, aX + margem2, aY + instrucaoY1 + idx * opts.tamanhoDaFonte, { lineBreak: false, width: 400, align: 'left' });
        });
        if (opts.exibirCampoUnidadeBeneficiaria) {
          pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text('Unidade Beneficiária', aX + 30, aY + setimaLinha1 - difTitVal + 70, { lineBreak: false, width: 294, align: 'left' });
        }

        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text('Pagador', aX + 30, aY + setimaLinha1 - difTitVal + 115, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(pagador.getIdentificacao(), aX + 30, aY + setimaLinha1 - difTitVal + 125, { lineBreak: false, width: 294, align: 'left' });

        const enderecoPagador = pagador.getEndereco();
        if (enderecoPagador) {
          let esp = opts.tamanhoDaFonte;
          if (enderecoPagador.getPrimeiraLinha()) {
            pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(enderecoPagador.getPrimeiraLinha(), aX + 30, aY + setimaLinha1 - difTitVal + 125 + esp, { lineBreak: false, width: 535, align: 'left' });
            esp += esp;
          }
          if (enderecoPagador.getSegundaLinha()) {
            pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(enderecoPagador.getSegundaLinha(), aX + 30, aY + setimaLinha1 - difTitVal + 125 + esp, { lineBreak: false, width: 535, align: 'left' });
          }
        }

        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text('Código de Baixa', aX + 370, aY + setimaLinha1 - difTitVal + 150, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text('Autenticação Mecânica', aX + 360, aY + setimaLinha1 - difTitVal + 165, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo + 1).text('FICHA DE COMPENSAÇÃO', aX + 421, aY + setimaLinha1 - difTitVal + 165, { lineBreak: false, width: 150, align: 'right' });

        // Descontos/acréscimos bloco 1
        const oitavaLinha1 = setimaLinha1 + ESPACO;
        const nonaLinha1 = oitavaLinha1 + ESPACO;
        const decimaLinha1 = nonaLinha1 + ESPACO;
        const decimaPrimLinha1 = decimaLinha1 + ESPACO;

        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text('(-) Desconto / Abatimento', aX + colunaLateral, aY + setimaLinha1 - difTitVal, { lineBreak: false, width: tamCelulasDir, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(boleto.getValorDescontosFormatadoBRL(), aX + colunaLateral, aY + setimaLinha1, { lineBreak: false, width: tamCelulasDir, align: 'right' });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text('(-) Outras Deduções', aX + colunaLateral, aY + oitavaLinha1 - difTitVal, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(boleto.getValorDeducoesFormatadoBRL(), aX + colunaLateral, aY + oitavaLinha1, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.moraMulta, aX + colunaLateral, aY + nonaLinha1 - difTitVal, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(boleto.getValorMoraMultaJurosFormatadoBRL(), aX + colunaLateral, aY + nonaLinha1 - difTitVal + 7, { lineBreak: false, width: tamCelulasDir, align: 'right' });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text('(+) Outros Acréscimos', aX + colunaLateral, aY + decimaLinha1 - difTitVal, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text('(=) Valor Cobrado', aX + colunaLateral, aY + decimaPrimLinha1 - difTitVal, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(boleto.getValorCobradoFormatadoBRL(), aX + colunaLateral, aY + decimaPrimLinha1 - difTitVal + 7, { lineBreak: false, width: tamCelulasDir, align: 'right' });

        // ── Ficha de compensação (bloco 2) ──
        const codigoDeBarras = boleto._codigoBarras || banco.geraCodigoDeBarrasPara(boleto);
        const linhaDigitavel = boleto._linhaDigitavel
          ? gerarLinhaDigitavel(boleto._linhaDigitavel)
          : gerarLinhaDigitavel(codigoDeBarras, banco);

        const segundaLinha2 = linha21 - 20.25;
        pdf.image(banco.getImagem(), aX + margemLayout2, aY + segundaLinha2 - 5, { height: altLogotipo });

        if (banco.imprimirNome) {
          pdf.font('negrito').fontSize(opts.tamanhoDaLinhaDigitavel).text(banco.nome ?? '', aX + margemLayout2 + 26, aY + segundaLinha2, { lineBreak: false, width: 100, align: 'left' });
        }

        pdf.font('negrito').fontSize(opts.tamanhoDaLinhaDigitavel).text(banco.getNumeroFormatadoComDigito(), aX + margemLayout2 + 131, aY + segundaLinha2, { lineBreak: false, width: 39.8, align: 'center' });
        pdf.font('negrito').fontSize(opts.tamanhoDaLinhaDigitavel).text(linhaDigitavel, aX + margemLayout2 + 145, aY + segundaLinha2, { lineBreak: false, width: 400, align: 'right' });

        const terceiraLinha = segundaLinha2 + 38;
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.localDoPagamento, aX + margem2, aY + terceiraLinha - difTitVal - 7, { lineBreak: false, width: 294, align: 'left' });
        boleto.getLocaisDePagamento().forEach((local, idx) => {
          if (idx > 1) return;
          pdf.font('normal').fontSize(opts.tamanhoDaFonteDoTitulo + 3).text(local, aX + margem2, aY + terceiraLinha + 2 - opts.tamanhoDaFonte + idx * opts.tamanhoDaFonte, { lineBreak: false, width: 400, align: 'left' });
        });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text('Vencimento', aX + colunaLateral, aY + terceiraLinha - difTitVal - 7, { lineBreak: false, width: tamCelulasDir, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(datas.getVencimentoFormatado(), aX + colunaLateral, aY + terceiraLinha, { lineBreak: false, width: tamCelulasDir, align: 'right' });

        const quartaLinha = terceiraLinha + 24;
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text('Beneficiário', aX + margem2, aY + quartaLinha - difTitVal, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(beneficiario.getIdentificacao(), aX + margem2, aY + quartaLinha, { lineBreak: false, width: 400, align: 'left' });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.agenciaECodigoDoBeneficiario, aX + colunaLateral, aY + quartaLinha - difTitVal, { lineBreak: false, width: tamCelulasDir, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(banco.getAgenciaECodigoBeneficiario(boleto), aX + colunaLateral, aY + quartaLinha, { lineBreak: false, width: tamCelulasDir, align: 'right' });

        const quintaLinha = quartaLinha + ESPACO;
        const tituloCip2 = margem2 + 68;
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.dataDocumento, aX + margem2, aY + quintaLinha - difTitVal, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(datas.getDocumentoFormatado(), aX + margem2, aY + quintaLinha, { lineBreak: false, width: 61.5, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(boleto.getNumeroDoDocumentoFormatado(), aX + margem2 + 68, aY + quintaLinha, { lineBreak: false, width: 84, align: 'left' });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.numeroDoDocumento, aX + margem2 + 68, aY + quintaLinha - difTitVal, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.especieDoDocumento, aX + margem2 + 158, aY + quintaLinha - difTitVal, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(boleto.getEspecieDocumento(), aX + margem2 + 158, aY + quintaLinha, { lineBreak: false, width: 81, align: 'center' });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text('Aceite', aX + margem2 + 244, aY + quintaLinha - difTitVal, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(boleto.getAceiteFormatado(), aX + margem2 + 244, aY + quintaLinha, { lineBreak: false, width: 55, align: 'center' });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.dataDeProcessamento, aX + margem2 + 305, aY + quintaLinha - difTitVal, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(datas.getProcessamentoFormatado(), aX + margem2 + 305, aY + quintaLinha, { lineBreak: false, width: 93.5, align: 'left' });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.nossoNumero, aX + colunaLateral, aY + quintaLinha - difTitVal, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(beneficiario._nossoNumero, aX + colunaLateral, aY + quintaLinha, { lineBreak: false, width: tamCelulasDir, align: 'right' });

        const sextaLinha = quintaLinha + ESPACO;
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text('Uso do Banco', aX + margem2, aY + sextaLinha - difTitVal, { lineBreak: false, width: 294, align: 'left' });
        if (banco.exibirCampoCip()) {
          pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text('CIP', aX + tituloCip2, aY + sextaLinha - difTitVal, { lineBreak: false, width: 31, align: 'left' });
          pdf.font('normal').fontSize(opts.tamanhoDaFonte).text('', aX + tituloCip2, aY + sextaLinha, { lineBreak: false, width: 31, align: 'center' });
        }
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.carteira, aX + margem2 + 105, aY + sextaLinha - difTitVal, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(banco.getCarteiraTexto(beneficiario), aX + margem2 + 104.5, aY + sextaLinha, { lineBreak: false, width: 71, align: 'center' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(boleto.getEspecieMoeda(), aX + margem2 + 181.5, aY + sextaLinha, { lineBreak: false, width: 71, align: 'center' });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.especie, aX + margem2 + 182, aY + sextaLinha - difTitVal, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.quantidade, aX + margem2 + 259, aY + sextaLinha - difTitVal, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.valor, aX + margem2 + 351, aY + sextaLinha - difTitVal, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.igualDoValorDoDocumento + TITULOS.valorDoDocumento, aX + colunaLateral, aY + sextaLinha - difTitVal, { lineBreak: false, width: tamCelulasDir, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(boleto.getValorFormatadoBRL(), aX + colunaLateral, aY + sextaLinha, { lineBreak: false, width: tamCelulasDir, align: 'right' });

        const setimaLinha = sextaLinha + ESPACO;
        const larguraInstrucoes = pixEmvStr ? 240 : 400;

        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.instrucoes, aX + margem2, aY + setimaLinha - difTitVal, { lineBreak: false, width: 294, align: 'left' });
        const instrucaoY2 = setimaLinha - difTitVal + 12;
        boleto.getInstrucoes().forEach((instr, idx) => {
          pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(instr, aX + margem2, aY + instrucaoY2 + idx * opts.tamanhoDaFonte, { lineBreak: false, width: larguraInstrucoes, align: 'left' });
        });

        // PIX — ficha de compensação (logo + QR Code lado a lado)
        if (pixEmvStr) {
          const pixRenderer = new PixRenderer(
            pdf,
            boleto,
            { ajusteX: aX, ajusteY: aY, corDoLayout: opts.corDoLayout, tamanhoDaFonte: opts.tamanhoDaFonte },
            { margemDoSegundoBloco: margem2, larguraInstrucoes, tituloDaSetimaLinha: setimaLinha - difTitVal }
          );
          await pixRenderer.render();
        }
        if (opts.exibirCampoUnidadeBeneficiaria) {
          pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text('Unidade Beneficiária', aX + 30, aY + setimaLinha - difTitVal + 70, { lineBreak: false, width: 294, align: 'left' });
        }

        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text('Pagador', aX + 30, aY + setimaLinha - difTitVal + 115, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(pagador.getIdentificacao(), aX + 30, aY + setimaLinha - difTitVal + 125, { lineBreak: false, width: 535, align: 'left' });

        const endPagador2 = pagador.getEndereco();
        if (endPagador2) {
          let esp = opts.tamanhoDaFonte;
          if (endPagador2.getPrimeiraLinha()) {
            pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(endPagador2.getPrimeiraLinha(), aX + 30, aY + setimaLinha - difTitVal + 125 + esp, { lineBreak: false, width: 535, align: 'left' });
            esp += esp;
          }
          if (endPagador2.getSegundaLinha()) {
            pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(endPagador2.getSegundaLinha(), aX + 30, aY + setimaLinha - difTitVal + 125 + esp, { lineBreak: false, width: 535, align: 'left' });
          }
        }

        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text('Código de Baixa', aX + 370, aY + setimaLinha - difTitVal + 159, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text('Autenticação Mecânica', aX + 360, aY + setimaLinha - difTitVal + 171.5, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo + 1).text('FICHA DE COMPENSAÇÃO', aX + 421, aY + setimaLinha - difTitVal + 171.5, { lineBreak: false, width: 150, align: 'right' });

        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text('(-) Desconto / Abatimento', aX + colunaLateral, aY + setimaLinha - difTitVal, { lineBreak: false, width: tamCelulasDir, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(boleto.getValorDescontosFormatadoBRL(), aX + colunaLateral, aY + setimaLinha, { lineBreak: false, width: tamCelulasDir, align: 'right' });

        const oitavaLinha = setimaLinha + ESPACO;
        const nonaLinha = oitavaLinha + ESPACO;
        const decimaLinha = nonaLinha + ESPACO;
        const decimaPrimLinha = decimaLinha + ESPACO;

        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text('(-) Outras Deduções', aX + colunaLateral, aY + oitavaLinha - difTitVal, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(boleto.getValorDeducoesFormatadoBRL(), aX + colunaLateral, aY + oitavaLinha, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.moraMulta, aX + colunaLateral, aY + nonaLinha - difTitVal, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(boleto.getValorMoraMultaJurosFormatadoBRL(), aX + colunaLateral, aY + nonaLinha - difTitVal + 7, { lineBreak: false, width: tamCelulasDir, align: 'right' });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text('(+) Outros Acréscimos', aX + colunaLateral, aY + decimaLinha - difTitVal, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('negrito').fontSize(opts.tamanhoDaFonteDoTitulo).text('(=) Valor Cobrado', aX + colunaLateral, aY + decimaPrimLinha - difTitVal, { lineBreak: false, width: 294, align: 'left' });
        pdf.font('normal').fontSize(opts.tamanhoDaFonte).text(boleto.getValorCobradoFormatadoBRL(), aX + colunaLateral, aY + decimaPrimLinha - difTitVal + 7, { lineBreak: false, width: tamCelulasDir, align: 'right' });

        // Código de barras
        pdf.font('codigoDeBarras').fontSize(opts.tamanhoDoCodigoDeBarras).text(i25(codigoDeBarras), aX + margemLayout2, aY + linha212 + 3.5, { lineBreak: false, width: 340, align: 'left' });

        opts.informacoesPersonalizadas(pdf, aX + margemLayout2, aY + linha212 + opts.tamanhoDoCodigoDeBarras + 10);

        if (indice < boletos.length - 1) pdf.addPage();
      }

      if (opts.base64) {
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

  gerarLinhaDigitavel(): Promise<Array<{ linha: string; numeroDocumento: string }>> {
    return Promise.resolve(
      this._boletos.map((boleto) => {
        const banco = boleto.getBanco();
        const linha = gerarLinhaDigitavel(banco.geraCodigoDeBarrasPara(boleto), banco);
        return { linha, numeroDocumento: boleto.getNumeroDoDocumentoFormatado() };
      })
    );
  }

  async gerarPNG(args?: Partial<PdfOptions> & { scale?: number }): Promise<Array<{ page: number; buffer: Buffer; mimeType: string }>> {
    const { pdf: pdfToImg } = await import('pdf-to-img');
    const scale = args?.scale ?? 2.0;

    const chunks: Buffer[] = [];
    const pdfDoc = await this.gerarPDF({ ...args, stream: undefined, base64: false }) as unknown as NodeJS.ReadableStream;

    await new Promise<void>((resolve, reject) => {
      pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
      pdfDoc.on('end', resolve);
      pdfDoc.on('error', reject);
    });

    const pdfBuffer = Buffer.concat(chunks);
    const document = await pdfToImg(pdfBuffer, { scale });

    const images: Array<{ page: number; buffer: Buffer; mimeType: string }> = [];
    let page = 1;
    for await (const image of document) {
      images.push({ page, buffer: image as Buffer, mimeType: 'image/png' });
      page++;
    }
    return images;
  }
}
