import fs from 'fs';
import { Boleto, Datas, Beneficiario, Pagador, Endereco, especiesDeDocumento } from './boleto.js';
import { BoletoStringify } from './stringify.js';
import { GeradorDeBoleto as GeradorPDF } from './gerador.js';
import { GeradorDeBoletoCarne } from './gerador-carne.js';
import { Bancos } from './bancos/index.js';
import * as formatacoes from './utils/formatacoes.js';
import * as validacoes from './utils/validacoes.js';
import type { BoletoInput, BoletoGeradoResult, PdfOptions } from './types/index.js';
import type { IBoleto } from './types/index.js';

export { Bancos, Boleto, Datas, Beneficiario, Pagador, Endereco, especiesDeDocumento };
export { BoletoStringify };
export { GeradorPDF as GeradorDeBoleto };
export { GeradorDeBoletoCarne };
export { formatacoes, validacoes };
export * from './types/index.js';
export * from './bancos/index.js';

function parseValor(v: string | number | undefined, fallback: string | number = 0): string {
  const n = parseFloat(String(v ?? fallback));
  return isNaN(n) ? '0.00' : n.toFixed(2);
}

export class GeradorDeBoletoEntrada {
  private _boletosInfo: IBoleto[] = [];
  private _inputs: BoletoInput[];
  private _processado = false;

  constructor(input: BoletoInput | BoletoInput[]) {
    this._inputs = Array.isArray(input) ? input : [input];
  }

  processar(): this {
    // Idempotente: processa apenas uma vez
    if (this._processado) return this;

    for (const input of this._inputs) {
      const { datas, valor, especieDocumento, numeroDocumento, valorCobrado, valorMoraMultaJuros } = input.boleto;

      const boletoInfo = Boleto.novoBoleto()
        .comDatas(
          Datas.novasDatas()
            .comVencimento(datas.vencimento)
            .comProcessamento(datas.processamento)
            .comDocumento(datas.documentos)
        )
        .comBeneficiario(BoletoStringify.createBeneficiario(input.beneficiario))
        .comPagador(BoletoStringify.createPagador(input.pagador))
        .comBanco(input.banco)
        .comValorBoleto(parseValor(valor))
        .comNumeroDoDocumento(numeroDocumento)
        .comEspecieDocumento(especieDocumento)
        .comInstrucoes(BoletoStringify.createInstrucoes(input.instrucoes))
        .comInformativo(BoletoStringify.createInformativo(input.informativo))
        .comCodigoBarras(input.boleto.codigoBarras)
        .comLinhaDigitavel(input.boleto.linhaDigitavel)
        .comPixEmv(input.boleto.pixQrCode)
        .comValorCobrado(parseValor(valorCobrado, valor))
        .comValorDescontos(parseValor(input.boleto.valorDescontos))
        .comValorMoraMultaJuros(parseValor(valorMoraMultaJuros))
        .comValorDeducoes(parseValor(input.boleto.valorDeducoes))
        .comLocaisDePagamento(input.locaisDePagamento ?? [])
        .comIdUnico();

      this._boletosInfo.push(boletoInfo);
    }

    this._processado = true;
    return this;
  }

  /** Reseta o estado processado (útil para reutilizar a instância com novos dados). */
  resetar(): this {
    this._boletosInfo = [];
    this._processado = false;
    return this;
  }

  private gerador(): GeradorPDF {
    this.processar();
    return new GeradorPDF(this._boletosInfo);
  }

  async gerarBase64(): Promise<BoletoGeradoResult> {
    const gerador = this.gerador();
    const [base64, linhas] = await Promise.all([
      gerador.gerarPDF({ base64: true }) as Promise<string>,
      gerador.gerarLinhaDigitavel(),
    ]);
    const codigoBarras =
      this._boletosInfo[0]?._codigoBarras ??
      this._boletosInfo[0]?.getBanco().geraCodigoDeBarrasPara(this._boletosInfo[0]) ??
      '';
    return { base64, linhaDigitavel: linhas[0]?.linha ?? '', codigoBarras };
  }

  async gerarLinhaDigitavel(): Promise<Array<{ linha: string; numeroDocumento: string }>> {
    return this.gerador().gerarLinhaDigitavel();
  }

  async gerarStream(opts?: Partial<PdfOptions>): Promise<NodeJS.ReadableStream> {
    const pdf = await this.gerador().gerarPDF(opts);
    return pdf as unknown as NodeJS.ReadableStream;
  }

  async gerarBuffer(): Promise<Buffer> {
    const base64 = await this.gerador().gerarPDF({ base64: true }) as string;
    return Buffer.from(base64, 'base64');
  }

  async gerarPNG(args?: Partial<PdfOptions> & { scale?: number }): Promise<Array<{ page: number; buffer: Buffer; mimeType: string }>> {
    return this.gerador().gerarPNG(args);
  }

  async gerarArquivo(dir = './tmp/boletos', filename = 'boleto', modelo?: 'carne'): Promise<{ stream: fs.WriteStream }> {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const stream = fs.createWriteStream(`${dir}/${filename}.pdf`);
    this.processar();
    const Gerador = modelo === 'carne' ? GeradorDeBoletoCarne : GeradorPDF;
    await new Gerador(this._boletosInfo).gerarPDF({ stream });
    return { stream };
  }
}
