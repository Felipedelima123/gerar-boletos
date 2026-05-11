import path from 'path';
import QRCode from 'qrcode';
import type { IBoleto } from './types/index.js';

const PIX_LOGO = path.resolve(process.cwd(), 'lib/boleto/imagens/pix-logo.png');

// Dimensões do bloco PIX — calibradas para caber entre o fim das instruções (x≈270)
// e o início da coluna de valores financeiros (x=434)
const LOGO_SIZE = 55;
const QR_SIZE = 80;
const LOGO_QR_GAP = 8;
const LINE_SPACING = 10;
// Largura total do bloco: LOGO_SIZE + LOGO_QR_GAP + QR_SIZE + margem = 153pt
// Fica dentro dos ~160pt disponíveis entre x=270 e x=434

interface BasePositions {
  margemDoSegundoBloco: number;
  larguraInstrucoes: number;
  tituloDaSetimaLinha: number;
}

async function gerarQRCodeBuffer(emv: string): Promise<Buffer> {
  const dataUrl = await QRCode.toDataURL(emv, { errorCorrectionLevel: 'M', margin: 1 });
  return Buffer.from(dataUrl.replace(/^data:image\/png;base64,/, ''), 'base64');
}

export class PixRenderer {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private pdf: any;
  private boleto: IBoleto;
  private args: { ajusteX: number; ajusteY: number; corDoLayout: string; tamanhoDaFonte: number };
  private base: BasePositions;

  constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pdf: any,
    boleto: IBoleto,
    args: { ajusteX: number; ajusteY: number; corDoLayout: string; tamanhoDaFonte: number },
    base: BasePositions
  ) {
    this.pdf = pdf;
    this.boleto = boleto;
    this.args = args;
    this.base = base;
  }

  private calcularPosicoes() {
    const { ajusteX, ajusteY } = this.args;
    const { margemDoSegundoBloco, larguraInstrucoes, tituloDaSetimaLinha } = this.base;

    // O bloco PIX começa logo após o fim da área de instruções
    const xInicio = ajusteX + margemDoSegundoBloco + larguraInstrucoes + 10;
    const yTopo = ajusteY + tituloDaSetimaLinha + 2;

    return {
      // Linha separadora vertical
      linhaX: xInicio - 5,
      linhaY1: yTopo - 5,
      linhaY2: yTopo + QR_SIZE + 10,
      // Logo PIX (lado esquerdo)
      logoX: xInicio,
      logoY: yTopo + (QR_SIZE - LOGO_SIZE) / 2, // centraliza verticalmente com o QR
      // QR Code (lado direito do logo)
      qrX: xInicio + LOGO_SIZE + LOGO_QR_GAP,
      qrY: yTopo,
      // Texto de instruções (abaixo de ambos)
      textoX: xInicio,
      textoY: yTopo + QR_SIZE + LINE_SPACING,
      textoWidth: LOGO_SIZE + LOGO_QR_GAP + QR_SIZE,
    };
  }

  private renderizarSeparador(pos: ReturnType<typeof this.calcularPosicoes>) {
    this.pdf
      .moveTo(pos.linhaX, pos.linhaY1)
      .lineTo(pos.linhaX, pos.linhaY2)
      .stroke('#aaaaaa');
  }

  private renderizarLogoPix(pos: ReturnType<typeof this.calcularPosicoes>) {
    try {
      this.pdf.image(PIX_LOGO, pos.logoX, pos.logoY, { width: LOGO_SIZE, height: LOGO_SIZE });
    } catch {
      // Logo não encontrada — continua sem ela
    }
  }

  private async renderizarQRCode(pos: ReturnType<typeof this.calcularPosicoes>, emv: string) {
    const qrBuffer = await gerarQRCodeBuffer(emv);
    this.pdf.image(qrBuffer, pos.qrX, pos.qrY, { width: QR_SIZE, height: QR_SIZE });
  }

  private renderizarInstrucoes(
    pos: ReturnType<typeof this.calcularPosicoes>,
    instrucoes: string[]
  ) {
    instrucoes.slice(0, 3).forEach((linha, i) => {
      this.pdf
        .font('normal')
        .fontSize(this.args.tamanhoDaFonte - 2)
        .text(linha, pos.textoX, pos.textoY + i * LINE_SPACING, {
          lineBreak: false,
          width: pos.textoWidth,
          align: 'center',
        });
    });
  }

  async render() {
    const emv = this.boleto.getPixEmvString();
    if (!emv) return;

    const instrucoes =
      this.boleto.getPixInstrucoes().length > 0
        ? this.boleto.getPixInstrucoes()
        : ['Escaneie o QR Code', 'ou use o copia e cola'];

    const pos = this.calcularPosicoes();
    this.renderizarSeparador(pos);
    this.renderizarLogoPix(pos);
    await this.renderizarQRCode(pos, emv);
    this.renderizarInstrucoes(pos, instrucoes);
  }
}
