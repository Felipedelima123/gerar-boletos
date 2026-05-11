import crypto from 'crypto';
import { format, parse } from 'date-fns';
import { pad } from './utils/string.js';
import { removerMascara, registroNacional as formatRegistroNacional, cep as formatCep } from './utils/formatacoes.js';
import { eRegistroNacional } from './utils/validacoes.js';
import { gerarLinhaDigitavel } from './gerador-linha-digitavel.js';
import type { IBanco, IBeneficiario, IBoleto, IDatas, IEndereco, IPagador, PixEmvInput } from './types/index.js';

// ──────────────────────────────────────────
// Endereco
// ──────────────────────────────────────────

export class Endereco implements IEndereco {
  private _logradouro = '';
  private _bairro = '';
  private _cep = '';
  private _cidade = '';
  private _uf = '';

  getLogradouro() { return this._logradouro; }
  comLogradouro(v: string) { this._logradouro = v; return this; }

  getBairro() { return this._bairro; }
  comBairro(v: string) { this._bairro = v; return this; }

  getCep() { return this._cep; }
  comCep(v: string) { this._cep = v; return this; }
  getCepFormatado() { return formatCep(this._cep); }

  getCidade() { return this._cidade; }
  comCidade(v: string) { this._cidade = v; return this; }

  getUf() { return this._uf; }
  comUf(v: string) { this._uf = v; return this; }

  getPrimeiraLinha(): string {
    let r = '';
    if (this._logradouro) r += this._logradouro;
    if (this._logradouro && this._bairro) r += ', ';
    if (this._bairro) r += this._bairro;
    return r;
  }

  getSegundaLinha(): string {
    let r = '';
    if (this._cidade) r += this._cidade;
    if (this._cidade && this._uf) r += '/';
    if (this._uf) r += this._uf;
    if (r && this._cep) r += ' — ';
    if (this._cep) r += this.getCepFormatado();
    return r;
  }

  getEnderecoCompleto(): string {
    return [this._logradouro, this._bairro, this._cep ? this.getCepFormatado() : '', this._cidade, this._uf]
      .filter(Boolean).join(' ');
  }

  static novoEndereco() { return new Endereco(); }
}

// ──────────────────────────────────────────
// Pagador
// ──────────────────────────────────────────

export class Pagador implements IPagador {
  private _nome = '';
  _registroNacional = '';
  private _documento = '';
  private _endereco: IEndereco | null = null;

  getNome() { return this._nome; }
  comNome(v: string) { this._nome = v; return this; }
  getNomeSomente() { return (this._nome || '').toUpperCase(); }

  getIdentificacao(): string {
    let id = this._nome;
    const tipo = this.temRegistroNacional();
    if (tipo) {
      id += ` (${tipo.toUpperCase()}: ${this.getRegistroNacionalFormatado()})`;
    }
    return (id || '').toUpperCase();
  }

  getRegistroNacional() { return this._registroNacional; }
  comRegistroNacional(v: string) { this._registroNacional = v; return this; }
  comCPF(v: string) { return this.comRegistroNacional(v); }
  comCNPJ(v: string) { return this.comRegistroNacional(v); }
  getRegistroNacionalFormatado() { return formatRegistroNacional(this._registroNacional); }
  temRegistroNacional() { return eRegistroNacional(this._registroNacional); }

  getDocumento() { return this._documento; }
  comDocumento(v: string) { this._documento = v; return this; }

  getEndereco() { return this._endereco; }
  comEndereco(v: IEndereco) { this._endereco = v; return this; }

  static novoPagador() { return new Pagador().comEndereco(Endereco.novoEndereco()); }
}

// ──────────────────────────────────────────
// Beneficiario
// ──────────────────────────────────────────

export class Beneficiario implements IBeneficiario {
  private _nome = '';
  _registroNacional = '';
  private _agencia = '';
  private _digitoAgencia = '';
  private _codigo = '';
  private _digitoCodigoBeneficiario = '';
  private _carteira = '';
  _nossoNumero = '';
  private _digitoNossoNumero = '';
  private _numeroConvenio = '';
  private _documento = '';
  private _endereco: IEndereco | null = null;
  private _posto = '';

  getNome() { return this._nome; }
  comNome(v: string) { this._nome = v; return this; }

  getIdentificacao(): string {
    let id = this._nome;
    const tipo = this.temRegistroNacional();
    if (tipo) {
      id += ` (${tipo.toUpperCase()}: ${this.getRegistroNacionalFormatado()})`;
    }
    return (id || '').toUpperCase();
  }

  getIdentificacaoCompleta(): string {
    const id = this.getIdentificacao();
    const end = this.getEndereco()?.getEnderecoCompleto() ?? '';
    return [id, end].filter(Boolean).join('\n');
  }

  getRegistroNacional() { return this._registroNacional; }
  comRegistroNacional(v: string) { this._registroNacional = v; return this; }
  comCPF(v: string) { return this.comRegistroNacional(v); }
  comCNPJ(v: string) { return this.comRegistroNacional(v); }
  getRegistroNacionalFormatado() { return formatRegistroNacional(this._registroNacional); }
  temRegistroNacional() { return eRegistroNacional(this._registroNacional); }

  getAgencia() { return this._agencia; }
  comAgencia(v: string) { this._agencia = v; return this; }
  getAgenciaFormatada() { return pad(this._agencia, 4, '0'); }

  getDigitoAgencia() { return this._digitoAgencia; }
  comDigitoAgencia(v: string) { this._digitoAgencia = v; return this; }

  getCodigoBeneficiario() { return this._codigo; }
  comCodigoBeneficiario(v: string) { this._codigo = v; return this; }

  getDigitoCodigoBeneficiario() { return this._digitoCodigoBeneficiario; }
  comDigitoCodigoBeneficiario(v: string) { this._digitoCodigoBeneficiario = v; return this; }

  getCarteira() { return this._carteira; }
  comCarteira(v: string) { this._carteira = v; return this; }

  getNossoNumero() { return this._nossoNumero; }
  comNossoNumero(v: string) { this._nossoNumero = v; return this; }

  getDigitoNossoNumero() { return this._digitoNossoNumero; }
  comDigitoNossoNumero(v: string) { this._digitoNossoNumero = v; return this; }

  getNumeroConvenio() { return this._numeroConvenio; }
  comNumeroConvenio(v: string) { this._numeroConvenio = v; return this; }

  getDocumento() { return this._documento; }
  comDocumento(v: string) { this._documento = v; return this; }

  getEndereco() { return this._endereco; }
  comEndereco(v: IEndereco) { this._endereco = v; return this; }

  getCodposto() { return this._posto; }
  comCodPosto(v: string) { this._posto = v; return this; }

  static novoBeneficiario() { return new Beneficiario(); }
}

// ──────────────────────────────────────────
// Datas
// ──────────────────────────────────────────

function removerHoras(data: Date): Date {
  data.setHours(0, 0, 0, 0);
  return data;
}

function formatarData(data: Date): string {
  return [pad(data.getDate(), 2, '0'), pad(data.getMonth() + 1, 2, '0'), data.getFullYear()].join('/');
}

function validarData(data: Date): boolean {
  const ano = data.getFullYear();
  return ano >= 1997 && ano < 2999;
}

function parseDateInput(input: string | Date, locate: 'usa' | 'brl' = 'usa'): Date {
  if (input instanceof Date) {
    if (locate === 'brl') {
      return new Date(format(input, 'yyyy-MM-dd'));
    }
    return input;
  }
  if (locate === 'brl') {
    return parse(input, 'dd-MM-yyyy', new Date());
  }
  return new Date(input);
}

export class Datas implements IDatas {
  private _documento!: Date;
  private _processamento!: Date;
  private _vencimento!: Date;

  comDocumento(input: string | Date, locate: 'usa' | 'brl' = 'usa') {
    const d = parseDateInput(input, locate);
    if (!validarData(d)) throw new Error('O ano do documento deve ser maior que 1997 e menor que 2999');
    this._documento = removerHoras(d);
    return this;
  }
  getDocumento() { return this._documento; }
  getDocumentoFormatado() { return formatarData(this._documento); }

  comProcessamento(input: string | Date, locate: 'usa' | 'brl' = 'usa') {
    const d = parseDateInput(input, locate);
    if (!validarData(d)) throw new Error('O ano do documento deve ser maior que 1997 e menor que 2999');
    this._processamento = removerHoras(d);
    return this;
  }
  getProcessamento() { return this._processamento; }
  getProcessamentoFormatado() { return formatarData(this._processamento); }

  comVencimento(input: string | Date, locate: 'usa' | 'brl' = 'usa') {
    const d = parseDateInput(input, locate);
    if (!validarData(d)) throw new Error('O ano do documento deve ser maior que 1997 e menor que 2999');
    this._vencimento = removerHoras(d);
    return this;
  }
  getVencimento() { return this._vencimento; }
  getVencimentoFormatado() { return formatarData(this._vencimento); }

  static novasDatas() { return new Datas(); }
}

// ──────────────────────────────────────────
// Boleto
// ──────────────────────────────────────────

const DATA_BASE = new Date(1997, 10 - 1, 7);

function formatarValor(valor: string | number): string {
  const valorArray = valor.toString().split('.');
  const inteiros = valorArray[0];
  let decimais = valorArray.length > 1 ? valorArray[1] : '00';
  decimais = pad(decimais, 2, '0', 'right').substr(0, 2);
  return pad(inteiros + decimais, 10, '0');
}

function formatarBRL(valor: string): string {
  let zeroAEsquerda = true;
  let i = -1;
  const intPart = valor.substr(0, 8).split('').reduce((acc, cur) => {
    if (cur === '0' && zeroAEsquerda) return acc;
    zeroAEsquerda = false;
    return acc + cur;
  }, '');

  const formatted = intPart.split('').reduceRight((acc, cur) => {
    i++;
    return cur + (i !== 0 && i % 3 === 0 ? '.' : '') + acc;
  }, '') || '0';

  return `R$ ${formatted},${valor.substr(8, 2)}`;
}

export class Boleto implements IBoleto {
  private _banco!: IBanco;
  private _pagador!: IPagador;
  private _beneficiario!: IBeneficiario;
  private _datas!: IDatas;
  private _valorBoleto = '0';
  private _valorCobrado = '0';
  private _valorDescontos = '0';
  private _valorDeducoes = '0';
  private _valorMulta = '0';
  private _valorAcrescimos = '0';
  private _valorMoraMultaJuros = '0';
  private _numeroDoDocumento = '';
  private _especieDocumento = 'DV';
  private _especieMoeda = 'R$';
  private _codigoEspecieMoeda = '9';
  private _aceite = false;
  private _instrucoes: string[] = [];
  private _descricoes: string[] = [];
  private _informativo: string[] = [];
  private _locaisDePagamento: string[] = [];
  private _quantidadeDeMoeda = '';
  _codigoBarras?: string;
  _linhaDigitavel?: string;
  /** @deprecated use _pixEmv — mantido para retrocompatibilidade */
  _qrCode?: string;
  private _pixEmv?: string | PixEmvInput;
  private _idUnico = '';

  getBanco() { return this._banco; }
  comBanco(v: IBanco) { this._banco = v; return this; }

  getPagador() { return this._pagador; }
  comPagador(v: IPagador) { this._pagador = v; return this; }

  getBeneficiario() { return this._beneficiario; }
  comBeneficiario(v: IBeneficiario) { this._beneficiario = v; return this; }

  getDatas() { return this._datas; }
  comDatas(v: IDatas) { this._datas = v; return this; }

  getFatorVencimento(): string {
    const vencimento = this._datas.getVencimento();
    const diferencaEmDias = (vencimento.getTime() - DATA_BASE.getTime()) / (1000 * 60 * 60 * 24);
    if (diferencaEmDias > 9999) throw new Error('Data fora do formato aceito');
    return Math.floor(diferencaEmDias).toString();
  }

  getEspecieMoeda() { return this._especieMoeda; }
  comEspecieMoeda(v: string) { this._especieMoeda = v; return this; }

  getCodigoEspecieMoeda() { return this._codigoEspecieMoeda; }
  comCodigoEspecieMoeda(v: string | number) { this._codigoEspecieMoeda = v.toString(); return this; }

  getAceite() { return this._aceite; }
  getAceiteFormatado() { return this._aceite ? 'N' : 'S'; }
  comAceite(v: boolean) { this._aceite = v; return this; }

  getEspecieDocumento() { return this._especieDocumento; }
  comEspecieDocumento(v: string) { this._especieDocumento = v; return this; }

  getValorFormatado() { return formatarValor(this._valorBoleto); }
  getValorFormatadoBRL() { return formatarBRL(this.getValorFormatado()); }
  getValorBoleto() { return this._valorBoleto; }
  comValorBoleto(v: string | number) {
    const val = Number(v);
    if (val < 0) throw new Error('Valor deve ser maior ou igual a zero');
    if (val > 99999999.99) throw new Error('Valor deve ser menor do que noventa e nove milhoes');
    this._valorBoleto = String(v);
    return this;
  }

  getNumeroDoDocumento() { return this._numeroDoDocumento || ''; }
  getNumeroDoDocumentoFormatado() { return pad(this._numeroDoDocumento || '', 4, '0'); }
  comNumeroDoDocumento(v: string) { this._numeroDoDocumento = v; return this; }

  getInstrucoes() { return this._instrucoes || []; }
  comInstrucoes(v: string | string[]) {
    const arr = typeof v === 'string' ? [v] : v;
    if (arr.length > 5) throw new Error('Máximo de cinco instruções permitidas');
    this._instrucoes = arr;
    return this;
  }

  getInformativo() { return this._informativo || []; }
  comInformativo(v: string | string[]) {
    const arr = typeof v === 'string' ? [v] : v;
    if (arr.length > 5) throw new Error('Máximo de cinco instruções permitidas');
    this._informativo = arr;
    return this;
  }

  getLocaisDePagamento(): string[] {
    if (this._locaisDePagamento?.length) return this._locaisDePagamento;
    if (this._banco?.getLocaisDePagamentoPadrao) return this._banco.getLocaisDePagamentoPadrao();
    return [];
  }
  comLocaisDePagamento(v: string | string[]) {
    const arr = typeof v === 'string' ? [v] : v;
    if (arr.length > 2) throw new Error('Máximo de dois locais de pagamento permitidos');
    this._locaisDePagamento = arr;
    return this;
  }

  getValorDescontosFormatadoBRL() {
    if (!Number(this._valorDescontos)) return '';
    return formatarBRL(formatarValor(this._valorDescontos));
  }
  getValorDescontos() { return this._valorDescontos || '0'; }
  comValorDescontos(v: string | number) { this._valorDescontos = String(v); return this; }

  getValorDeducoesFormatadoBRL() {
    if (!Number(this._valorDeducoes)) return '';
    return formatarBRL(formatarValor(this._valorDeducoes));
  }
  getValorDeducoes() { return this._valorDeducoes || '0'; }
  comValorDeducoes(v: string | number) { this._valorDeducoes = String(v); return this; }

  getValorMoraMultaJuros() { return this._valorMoraMultaJuros || '0'; }
  getValorMoraMultaJurosFormatadoBRL() {
    if (!Number(this._valorMoraMultaJuros)) return '';
    return formatarBRL(formatarValor(this._valorMoraMultaJuros));
  }
  comValorMoraMultaJuros(v: string | number) { this._valorMoraMultaJuros = String(v); return this; }

  getValorCobrado() { return this._valorCobrado || '0'; }
  getValorCobradoFormatadoBRL() {
    if (!Number(this._valorCobrado)) return '';
    return formatarBRL(formatarValor(this._valorCobrado));
  }
  comValorCobrado(v: string | number) { this._valorCobrado = String(v); return this; }

  comCodigoBarras(v?: string) { this._codigoBarras = v; return this; }
  comLinhaDigitavel(v?: string) { this._linhaDigitavel = v; return this; }

  /** Aceita string EMV (retrocompat) ou objeto {emv, instrucoes?} */
  comPixEmv(v?: string | PixEmvInput) {
    if (typeof v === 'string') {
      this._pixEmv = v;
      this._qrCode = v;
    } else if (v && typeof v === 'object') {
      if (!v.emv) throw new Error('PIX EMV objeto deve conter propriedade "emv"');
      this._pixEmv = v;
      this._qrCode = v.emv;
    } else {
      this._pixEmv = undefined;
      this._qrCode = undefined;
    }
    return this;
  }

  /** @deprecated use comPixEmv() */
  comQrCode(v?: string) { return this.comPixEmv(v); }

  getPixEmv() { return this._pixEmv; }

  getPixEmvString(): string | undefined {
    if (!this._pixEmv) return undefined;
    return typeof this._pixEmv === 'string' ? this._pixEmv : this._pixEmv.emv;
  }

  getPixInstrucoes(): string[] {
    if (!this._pixEmv || typeof this._pixEmv === 'string') return [];
    return this._pixEmv.instrucoes ?? [];
  }

  comIdUnico() { this._idUnico = crypto.randomBytes(16).toString('hex'); return this; }

  getLinhaDigitavelFormatado() {
    const numeroDocumento = this.getNumeroDoDocumentoFormatado();
    const linha = gerarLinhaDigitavel(this._banco.geraCodigoDeBarrasPara(this), this._banco);
    return { linha, numeroDocumento };
  }

  static novoBoleto(): Boleto {
    return new Boleto()
      .comEspecieMoeda('R$')
      .comCodigoEspecieMoeda(9)
      .comAceite(false)
      .comEspecieDocumento('DV');
  }
}

// ──────────────────────────────────────────
// Constantes
// ──────────────────────────────────────────

export const especiesDeDocumento: Record<string, string> = {
  DMI: 'Duplicata de Venda Mercantil por Indicação',
  DM: 'Duplicata de Venda Mercantil',
  DSI: 'Duplicata de Prestação de Serviços por Indicação de Comprovante',
  NP: 'Nota Promissória',
  ME: 'Mensalidade Escolar',
  DS: 'Duplicata de Prestação de Serviços Original',
  CT: 'Espécie de Contrato',
  LC: 'Letra de Câmbio',
  CPS: 'Conta de Prestação de Serviços de Profissional Liberal ou Declaração do Profissional',
  EC: 'Encargos Condominiais',
  DD: 'Documento de Dívida',
  CCB: 'Cédula de Crédito Bancário',
  CBI: 'Cédula de Crédito Bancário por Indicação',
  CH: 'Cheque',
  CM: 'Contrato de Mútuo',
  RA: 'Recibo de Aluguel Para Pessoa Jurídica (Contrato Aluguel e Recibo)',
  CD: 'Confissão de Dívida Apenas Para Falência de Declaração do Devedor',
  FS: 'Fatura de Serviço',
  TA: 'Termo de Acordo - Ex. Ação Trabalhista',
  CC: 'Contrato de Câmbio',
  DV: 'Diversos',
};
