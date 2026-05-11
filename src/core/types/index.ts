export interface EnderecoInput {
  logradouro?: string;
  bairro?: string;
  cidade?: string;
  estadoUF?: string;
  cep?: string;
}

export interface DadosBancariosInput {
  carteira: string;
  agencia: string;
  agenciaDigito?: string;
  conta: string;
  contaDigito?: string;
  nossoNumero: string;
  nossoNumeroDigito?: string;
  convenio?: string;
  posto?: string;
}

export interface PagadorInput {
  nome: string;
  registroNacional: string;
  endereco?: EnderecoInput;
}

export interface BeneficiarioInput {
  nome: string;
  cnpj?: string;
  cpf?: string;
  registroNacional?: string;
  dadosBancarios: DadosBancariosInput;
  endereco?: EnderecoInput;
}

export interface DatasInput {
  vencimento: string | Date;
  processamento: string | Date;
  documentos: string | Date;
}

export interface PixEmvInput {
  emv: string;
  instrucoes?: string[];
}

export interface BoletoDocumentoInput {
  numeroDocumento: string;
  especieDocumento: string;
  valor: number;
  datas: DatasInput;
  codigoBarras?: string;
  linhaDigitavel?: string;
  /** String EMV do PIX ou objeto com {emv, instrucoes} */
  pixQrCode?: string | PixEmvInput;
  valorCobrado?: number;
  valorDescontos?: number;
  valorMoraMultaJuros?: number;
  valorDeducoes?: number;
  valorAcrescimos?: number;
}

export interface BoletoInput {
  banco: IBanco;
  pagador: PagadorInput;
  beneficiario: BeneficiarioInput;
  instrucoes?: string | string[];
  informativo?: string | string[];
  locaisDePagamento?: string[];
  boleto: BoletoDocumentoInput;
}

export interface BoletoGeradoResult {
  base64: string;
  linhaDigitavel: string;
  codigoBarras: string;
}

export interface PdfOptions {
  stream?: NodeJS.WritableStream;
  base64?: boolean;
  creditos?: string;
  ajusteY?: number;
  ajusteX?: number;
  autor?: string;
  titulo?: string;
  criador?: string;
  tamanhoDaFonteDoTitulo?: number;
  tamanhoDaFonte?: number;
  tamanhoDaLinhaDigitavel?: number;
  tamanhoDoCodigoDeBarras?: number;
  corDoLayout?: string;
  alturaDaPagina?: number;
  larguraDaPagina?: number;
  exibirCampoUnidadeBeneficiaria?: boolean;
  informacoesPersonalizadas?: (pdf: unknown, x: number, y: number) => void;
}

export interface IBanco {
  getTitulos(): Record<string, string>;
  exibirReciboDoPagadorCompleto(): boolean;
  exibirCampoCip(): boolean;
  geraCodigoDeBarrasPara(boleto: IBoleto): string;
  getNumeroFormatadoComDigito(): string;
  getNumeroFormatado(): string;
  getCarteiraFormatado(beneficiario: IBeneficiario): string;
  getCarteiraTexto(beneficiario: IBeneficiario): string;
  getCodigoFormatado(beneficiario: IBeneficiario): string;
  getImagem(): string;
  getNossoNumeroFormatado(beneficiario: IBeneficiario): string;
  getNossoNumeroECodigoDocumento(boleto: IBoleto): string;
  getNome(): string;
  getImprimirNome(): boolean;
  getAgenciaECodigoBeneficiario(boleto: IBoleto): string;
  imprimirNome?: boolean;
  nome?: string;
  getLocaisDePagamentoPadrao?(): string[];
}

export interface IEndereco {
  getLogradouro(): string;
  getBairro(): string;
  getCep(): string;
  getCepFormatado(): string;
  getCidade(): string;
  getUf(): string;
  getPrimeiraLinha(): string;
  getSegundaLinha(): string;
  getEnderecoCompleto(): string;
}

export interface IPagador {
  getNome(): string;
  getIdentificacao(): string;
  getRegistroNacional(): string;
  getRegistroNacionalFormatado(): string;
  temRegistroNacional(): string | false;
  getEndereco(): IEndereco | null;
  getNomeSomente(): string;
  _registroNacional: string;
}

export interface IBeneficiario {
  getNome(): string;
  getIdentificacao(): string;
  getRegistroNacional(): string;
  getRegistroNacionalFormatado(): string;
  temRegistroNacional(): string | false;
  getAgencia(): string;
  getAgenciaFormatada(): string;
  getDigitoAgencia(): string;
  getCodigoBeneficiario(): string;
  getDigitoCodigoBeneficiario(): string;
  getCarteira(): string;
  getNossoNumero(): string;
  getDigitoNossoNumero(): string;
  getNumeroConvenio(): string;
  getEndereco(): IEndereco | null;
  getIdentificacaoCompleta(): string;
  getCodposto(): string;
  _nossoNumero: string;
}

export interface IDatas {
  getDocumento(): Date;
  getDocumentoFormatado(): string;
  getProcessamento(): Date;
  getProcessamentoFormatado(): string;
  getVencimento(): Date;
  getVencimentoFormatado(): string;
}

export interface IBoleto {
  getBanco(): IBanco;
  getPagador(): IPagador;
  getBeneficiario(): IBeneficiario;
  getDatas(): IDatas;
  getValorBoleto(): string;
  getValorFormatado(): string;
  getValorFormatadoBRL(): string;
  getFatorVencimento(): string;
  getCodigoEspecieMoeda(): string;
  getAceiteFormatado(): string;
  getEspecieDocumento(): string;
  getNumeroDoDocumento(): string;
  getNumeroDoDocumentoFormatado(): string;
  getInstrucoes(): string[];
  getInformativo(): string[];
  getLocaisDePagamento(): string[];
  getEspecieMoeda(): string;
  getValorDescontosFormatadoBRL(): string;
  getValorDeducoesFormatadoBRL(): string;
  getValorMoraMultaJurosFormatadoBRL(): string;
  getValorCobradoFormatadoBRL(): string;
  getPixEmv(): string | PixEmvInput | undefined;
  getPixEmvString(): string | undefined;
  getPixInstrucoes(): string[];
  _codigoBarras?: string;
  _linhaDigitavel?: string;
  /** @deprecated use getPixEmvString() — mantido para retrocompatibilidade */
  _qrCode?: string;
}
