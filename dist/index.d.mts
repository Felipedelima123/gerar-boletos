import fs from 'fs';
import * as pdfkit from 'pdfkit';

interface EnderecoInput {
    logradouro?: string;
    bairro?: string;
    cidade?: string;
    estadoUF?: string;
    cep?: string;
}
interface DadosBancariosInput {
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
interface PagadorInput {
    nome: string;
    registroNacional: string;
    endereco?: EnderecoInput;
}
interface BeneficiarioInput {
    nome: string;
    cnpj?: string;
    cpf?: string;
    registroNacional?: string;
    dadosBancarios: DadosBancariosInput;
    endereco?: EnderecoInput;
}
interface DatasInput {
    vencimento: string | Date;
    processamento: string | Date;
    documentos: string | Date;
}
interface PixEmvInput {
    emv: string;
    instrucoes?: string[];
}
interface BoletoDocumentoInput {
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
interface BoletoInput {
    banco: IBanco;
    pagador: PagadorInput;
    beneficiario: BeneficiarioInput;
    instrucoes?: string | string[];
    informativo?: string | string[];
    locaisDePagamento?: string[];
    boleto: BoletoDocumentoInput;
}
interface BoletoGeradoResult {
    base64: string;
    linhaDigitavel: string;
    codigoBarras: string;
}
interface PdfOptions {
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
interface IBanco {
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
interface IEndereco {
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
interface IPagador {
    getNome(): string;
    getIdentificacao(): string;
    getRegistroNacional(): string;
    getRegistroNacionalFormatado(): string;
    temRegistroNacional(): string | false;
    getEndereco(): IEndereco | null;
    getNomeSomente(): string;
    _registroNacional: string;
}
interface IBeneficiario {
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
interface IDatas {
    getDocumento(): Date;
    getDocumentoFormatado(): string;
    getProcessamento(): Date;
    getProcessamentoFormatado(): string;
    getVencimento(): Date;
    getVencimentoFormatado(): string;
}
interface IBoleto {
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

declare class Endereco implements IEndereco {
    private _logradouro;
    private _bairro;
    private _cep;
    private _cidade;
    private _uf;
    getLogradouro(): string;
    comLogradouro(v: string): this;
    getBairro(): string;
    comBairro(v: string): this;
    getCep(): string;
    comCep(v: string): this;
    getCepFormatado(): string;
    getCidade(): string;
    comCidade(v: string): this;
    getUf(): string;
    comUf(v: string): this;
    getPrimeiraLinha(): string;
    getSegundaLinha(): string;
    getEnderecoCompleto(): string;
    static novoEndereco(): Endereco;
}
declare class Pagador implements IPagador {
    private _nome;
    _registroNacional: string;
    private _documento;
    private _endereco;
    getNome(): string;
    comNome(v: string): this;
    getNomeSomente(): string;
    getIdentificacao(): string;
    getRegistroNacional(): string;
    comRegistroNacional(v: string): this;
    comCPF(v: string): this;
    comCNPJ(v: string): this;
    getRegistroNacionalFormatado(): string;
    temRegistroNacional(): string | false;
    getDocumento(): string;
    comDocumento(v: string): this;
    getEndereco(): IEndereco | null;
    comEndereco(v: IEndereco): this;
    static novoPagador(): Pagador;
}
declare class Beneficiario implements IBeneficiario {
    private _nome;
    _registroNacional: string;
    private _agencia;
    private _digitoAgencia;
    private _codigo;
    private _digitoCodigoBeneficiario;
    private _carteira;
    _nossoNumero: string;
    private _digitoNossoNumero;
    private _numeroConvenio;
    private _documento;
    private _endereco;
    private _posto;
    getNome(): string;
    comNome(v: string): this;
    getIdentificacao(): string;
    getIdentificacaoCompleta(): string;
    getRegistroNacional(): string;
    comRegistroNacional(v: string): this;
    comCPF(v: string): this;
    comCNPJ(v: string): this;
    getRegistroNacionalFormatado(): string;
    temRegistroNacional(): string | false;
    getAgencia(): string;
    comAgencia(v: string): this;
    getAgenciaFormatada(): string;
    getDigitoAgencia(): string;
    comDigitoAgencia(v: string): this;
    getCodigoBeneficiario(): string;
    comCodigoBeneficiario(v: string): this;
    getDigitoCodigoBeneficiario(): string;
    comDigitoCodigoBeneficiario(v: string): this;
    getCarteira(): string;
    comCarteira(v: string): this;
    getNossoNumero(): string;
    comNossoNumero(v: string): this;
    getDigitoNossoNumero(): string;
    comDigitoNossoNumero(v: string): this;
    getNumeroConvenio(): string;
    comNumeroConvenio(v: string): this;
    getDocumento(): string;
    comDocumento(v: string): this;
    getEndereco(): IEndereco | null;
    comEndereco(v: IEndereco): this;
    getCodposto(): string;
    comCodPosto(v: string): this;
    static novoBeneficiario(): Beneficiario;
}
declare class Datas implements IDatas {
    private _documento;
    private _processamento;
    private _vencimento;
    comDocumento(input: string | Date, locate?: 'usa' | 'brl'): this;
    getDocumento(): Date;
    getDocumentoFormatado(): string;
    comProcessamento(input: string | Date, locate?: 'usa' | 'brl'): this;
    getProcessamento(): Date;
    getProcessamentoFormatado(): string;
    comVencimento(input: string | Date, locate?: 'usa' | 'brl'): this;
    getVencimento(): Date;
    getVencimentoFormatado(): string;
    static novasDatas(): Datas;
}
declare class Boleto implements IBoleto {
    private _banco;
    private _pagador;
    private _beneficiario;
    private _datas;
    private _valorBoleto;
    private _valorCobrado;
    private _valorDescontos;
    private _valorDeducoes;
    private _valorMulta;
    private _valorAcrescimos;
    private _valorMoraMultaJuros;
    private _numeroDoDocumento;
    private _especieDocumento;
    private _especieMoeda;
    private _codigoEspecieMoeda;
    private _aceite;
    private _instrucoes;
    private _descricoes;
    private _informativo;
    private _locaisDePagamento;
    private _quantidadeDeMoeda;
    _codigoBarras?: string;
    _linhaDigitavel?: string;
    /** @deprecated use _pixEmv — mantido para retrocompatibilidade */
    _qrCode?: string;
    private _pixEmv?;
    private _idUnico;
    getBanco(): IBanco;
    comBanco(v: IBanco): this;
    getPagador(): IPagador;
    comPagador(v: IPagador): this;
    getBeneficiario(): IBeneficiario;
    comBeneficiario(v: IBeneficiario): this;
    getDatas(): IDatas;
    comDatas(v: IDatas): this;
    getFatorVencimento(): string;
    getEspecieMoeda(): string;
    comEspecieMoeda(v: string): this;
    getCodigoEspecieMoeda(): string;
    comCodigoEspecieMoeda(v: string | number): this;
    getAceite(): boolean;
    getAceiteFormatado(): "N" | "S";
    comAceite(v: boolean): this;
    getEspecieDocumento(): string;
    comEspecieDocumento(v: string): this;
    getValorFormatado(): string;
    getValorFormatadoBRL(): string;
    getValorBoleto(): string;
    comValorBoleto(v: string | number): this;
    getNumeroDoDocumento(): string;
    getNumeroDoDocumentoFormatado(): string;
    comNumeroDoDocumento(v: string): this;
    getInstrucoes(): string[];
    comInstrucoes(v: string | string[]): this;
    getInformativo(): string[];
    comInformativo(v: string | string[]): this;
    getLocaisDePagamento(): string[];
    comLocaisDePagamento(v: string | string[]): this;
    getValorDescontosFormatadoBRL(): string;
    getValorDescontos(): string;
    comValorDescontos(v: string | number): this;
    getValorDeducoesFormatadoBRL(): string;
    getValorDeducoes(): string;
    comValorDeducoes(v: string | number): this;
    getValorMoraMultaJuros(): string;
    getValorMoraMultaJurosFormatadoBRL(): string;
    comValorMoraMultaJuros(v: string | number): this;
    getValorCobrado(): string;
    getValorCobradoFormatadoBRL(): string;
    comValorCobrado(v: string | number): this;
    comCodigoBarras(v?: string): this;
    comLinhaDigitavel(v?: string): this;
    /** Aceita string EMV (retrocompat) ou objeto {emv, instrucoes?} */
    comPixEmv(v?: string | PixEmvInput): this;
    /** @deprecated use comPixEmv() */
    comQrCode(v?: string): this;
    getPixEmv(): string | PixEmvInput | undefined;
    getPixEmvString(): string | undefined;
    getPixInstrucoes(): string[];
    comIdUnico(): this;
    getLinhaDigitavelFormatado(): {
        linha: string;
        numeroDocumento: string;
    };
    static novoBoleto(): Boleto;
}
declare const especiesDeDocumento: Record<string, string>;

declare class BoletoStringify {
    static enderecoPagador(end: EnderecoInput | undefined): Endereco;
    static createPagador(p: PagadorInput): Pagador;
    static createBeneficiario(b: BeneficiarioInput): Beneficiario;
    static createInstrucoes(instrucoes: string | string[] | undefined): string[];
    static createInformativo(informativo: string | string[] | undefined): string[];
}

declare const PDFDocument$1: typeof pdfkit;

declare class GeradorDeBoleto {
    private _boletos;
    constructor(boletos: IBoleto | IBoleto[]);
    gerarPDF(args?: Partial<PdfOptions>): Promise<string | InstanceType<typeof PDFDocument$1>>;
    gerarLinhaDigitavel(): Promise<Array<{
        linha: string;
        numeroDocumento: string;
    }>>;
    gerarPNG(args?: Partial<PdfOptions> & {
        scale?: number;
    }): Promise<Array<{
        page: number;
        buffer: Buffer;
        mimeType: string;
    }>>;
}

declare const PDFDocument: typeof pdfkit;

declare class GeradorDeBoletoCarne {
    private _boletos;
    constructor(boletos: IBoleto | IBoleto[]);
    gerarPDF(args?: Partial<PdfOptions>): Promise<string | InstanceType<typeof PDFDocument>>;
}

declare class Bradesco implements IBanco {
    imprimirNome: boolean;
    nome: string;
    getTitulos(): {
        instrucoes: string;
        nomeDoPagador: string;
        especie: string;
        quantidade: string;
        valor: string;
        moraMulta: string;
    };
    exibirReciboDoPagadorCompleto(): boolean;
    exibirCampoCip(): boolean;
    geraCodigoDeBarrasPara(boleto: IBoleto): string;
    getNumeroFormatadoComDigito(): string;
    getNumeroFormatado(): string;
    getCarteiraFormatado(b: IBeneficiario): string;
    getCarteiraTexto(b: IBeneficiario): string;
    getCodigoFormatado(b: IBeneficiario): string;
    getImagem(): string;
    getNossoNumeroFormatado(b: IBeneficiario): string;
    getNome(): string;
    getImprimirNome(): boolean;
    getNossoNumeroECodigoDocumento(boleto: IBoleto): string;
    getAgenciaECodigoBeneficiario(boleto: IBoleto): string;
}

declare class BancoBrasil implements IBanco {
    imprimirNome: boolean;
    nome: string;
    getTitulos(): {
        informativo: string;
        instrucoes: string;
        nomeDoPagador: string;
        especie: string;
        quantidade: string;
        valor: string;
        moraMulta: string;
    };
    exibirReciboDoPagadorCompleto(): boolean;
    exibirCampoCip(): boolean;
    geraCodigoDeBarrasPara(boleto: IBoleto): string;
    getNumeroFormatadoComDigito(): string;
    getNumeroFormatado(): string;
    getCarteiraFormatado(b: IBeneficiario): string;
    getCarteiraTexto(b: IBeneficiario): string;
    getCodigoFormatado(b: IBeneficiario): string;
    getImagem(): string;
    getNossoNumeroFormatado(b: IBeneficiario): string;
    getNome(): string;
    getImprimirNome(): boolean;
    getNossoNumeroECodigoDocumento(boleto: IBoleto): string;
    getAgenciaECodigoBeneficiario(boleto: IBoleto): string;
}

declare class Banrisul implements IBanco {
    imprimirNome: boolean;
    nome: string;
    getTitulos(): {
        informativo: string;
        instrucoes: string;
        nomeDoPagador: string;
        localDePagamento: string;
        vencimento: string;
        agenciaECodigoBeneficiario: string;
        nossoNumero: string;
        especie: string;
        quantidade: string;
        valor: string;
        valorDocumento: string;
        descontos: string;
        outrasDeducoes: string;
        moraMulta: string;
        outrosAcrescimos: string;
        valorCobrado: string;
    };
    exibirReciboDoPagadorCompleto(): boolean;
    exibirCampoCip(): boolean;
    geraCodigoDeBarrasPara(boleto: IBoleto): string;
    calculaDuploDigito(beneficiario: IBeneficiario): string;
    calcularDVNossoNumero(nossoNumero: string): string;
    calcularModulo10(campo: string): number;
    calcularModulo11(campo: string): number;
    getNumeroFormatadoComDigito(): string;
    getNumeroFormatado(): string;
    getCarteiraFormatado(b: IBeneficiario): string;
    getCarteiraTexto(b: IBeneficiario): string;
    getCodigoFormatado(b: IBeneficiario): string;
    getImagem(): string;
    getNossoNumeroFormatado(b: IBeneficiario): string;
    getNome(): string;
    getImprimirNome(): boolean;
    getNossoNumeroECodigoDocumento(boleto: IBoleto): string;
    getAgenciaECodigoBeneficiario(boleto: IBoleto): string;
}

declare class Caixa implements IBanco {
    imprimirNome: boolean;
    nome: string;
    getTitulos(): {
        instrucoes: string;
        nomeDoPagador: string;
        especie: string;
        quantidade: string;
        valor: string;
    };
    exibirReciboDoPagadorCompleto(): boolean;
    exibirCampoCip(): boolean;
    geraCodigoDeBarrasPara(boleto: IBoleto): string;
    getNumeroFormatadoComDigito(): string;
    getNumeroFormatado(): string;
    getCarteiraFormatado(b: IBeneficiario): string;
    getCarteiraTexto(b: IBeneficiario): string;
    getCodigoFormatado(b: IBeneficiario): string;
    getImagem(): string;
    getNossoNumeroFormatado(b: IBeneficiario): string;
    getNome(): string;
    getImprimirNome(): boolean;
    getNossoNumeroECodigoDocumento(boleto: IBoleto): string;
    getAgenciaECodigoBeneficiario(boleto: IBoleto): string;
}

declare class Cecred implements IBanco {
    imprimirNome: boolean;
    nome: string;
    getTitulos(): {
        instrucoes: string;
        nomeDoPagador: string;
        especie: string;
        quantidade: string;
        valor: string;
        moraMulta: string;
    };
    exibirReciboDoPagadorCompleto(): boolean;
    exibirCampoCip(): boolean;
    geraCodigoDeBarrasPara(boleto: IBoleto): string;
    getNumeroFormatadoComDigito(): string;
    getNumeroFormatado(): string;
    getCarteiraFormatado(b: IBeneficiario): string;
    getCarteiraTexto(b: IBeneficiario): string;
    getCodigoFormatado(b: IBeneficiario): string;
    getImagem(): string;
    getNossoNumeroFormatado(b: IBeneficiario): string;
    getNome(): string;
    getImprimirNome(): boolean;
    getLocaisDePagamentoPadrao(): string[];
    getNossoNumeroECodigoDocumento(boleto: IBoleto): string;
    getAgenciaECodigoBeneficiario(boleto: IBoleto): string;
}

declare class Itau implements IBanco {
    imprimirNome: boolean;
    nome: string;
    getTitulos(): {};
    exibirReciboDoPagadorCompleto(): boolean;
    exibirCampoCip(): boolean;
    geraCodigoDeBarrasPara(boleto: IBoleto): string;
    getNumeroFormatadoComDigito(): string;
    getNumeroFormatado(): string;
    getCarteiraFormatado(b: IBeneficiario): string;
    getCarteiraTexto(b: IBeneficiario): string;
    getCodigoFormatado(b: IBeneficiario): string;
    getImagem(): string;
    getNossoNumeroFormatado(b: IBeneficiario): string;
    getNome(): string;
    getImprimirNome(): boolean;
    getNossoNumeroECodigoDocumento(boleto: IBoleto): string;
    getAgenciaECodigoBeneficiario(boleto: IBoleto): string;
}

declare class Santander implements IBanco {
    imprimirNome: boolean;
    nome: string;
    getTitulos(): {
        instrucoes: string;
        nomeDoPagador: string;
        especie: string;
        quantidade: string;
        valor: string;
        moraMulta: string;
    };
    exibirReciboDoPagadorCompleto(): boolean;
    exibirCampoCip(): boolean;
    geraCodigoDeBarrasPara(boleto: IBoleto): string;
    getNumeroFormatadoComDigito(): string;
    getNumeroFormatado(): string;
    getCarteiraFormatado(b: IBeneficiario): string;
    getCarteiraTexto(b: IBeneficiario): string;
    getCodigoFormatado(b: IBeneficiario): string;
    getImagem(): string;
    getNossoNumeroFormatado(b: IBeneficiario): string;
    getNome(): string;
    getImprimirNome(): boolean;
    getNossoNumeroECodigoDocumento(boleto: IBoleto): string;
    getAgenciaECodigoBeneficiario(boleto: IBoleto): string;
}

declare class Sicoob implements IBanco {
    imprimirNome: boolean;
    nome: string;
    getTitulos(): {
        localDoPagamento: string;
        especieDoDocumento: string;
        instrucoes: string;
        agenciaECodigoDoBeneficiario: string;
        valorDoDocumento: string;
        igualDoValorDoDocumento: string;
        nomeDoPagador: string;
    };
    exibirReciboDoPagadorCompleto(): boolean;
    exibirCampoCip(): boolean;
    geraCodigoDeBarrasPara(boleto: IBoleto): string;
    getNumeroFormatadoComDigito(): string;
    getNumeroFormatado(): string;
    getCarteiraFormatado(b: IBeneficiario): string;
    getCarteiraTexto(b: IBeneficiario): string;
    getCodigoFormatado(b: IBeneficiario): string;
    getImagem(): string;
    getNossoNumeroFormatado(b: IBeneficiario): string;
    getNome(): string;
    getImprimirNome(): boolean;
    getNossoNumeroECodigoDocumento(boleto: IBoleto): string;
    getAgenciaECodigoBeneficiario(boleto: IBoleto): string;
}

declare class Sicredi implements IBanco {
    imprimirNome: boolean;
    nome: string;
    getTitulos(): {
        instrucoes: string;
        nomeDoPagador: string;
        especie: string;
        quantidade: string;
        valor: string;
        moraMulta: string;
    };
    exibirReciboDoPagadorCompleto(): boolean;
    exibirCampoCip(): boolean;
    geraCodigoDeBarrasPara(boleto: IBoleto): string;
    getNumeroFormatadoComDigito(): string;
    getNumeroFormatado(): string;
    getCarteiraFormatado(b: IBeneficiario): string;
    getCarteiraTexto(b: IBeneficiario): string;
    getCodigoFormatado(b: IBeneficiario): string;
    getImagem(): string;
    getNossoNumeroFormatado(b: IBeneficiario): string;
    getNome(): string;
    getImprimirNome(): boolean;
    getNossoNumeroECodigoDocumento(boleto: IBoleto): string;
    getAgenciaECodigoBeneficiario(boleto: IBoleto): string;
}

declare const Bancos: {
    readonly Bradesco: typeof Bradesco;
    readonly BancoBrasil: typeof BancoBrasil;
    readonly Banrisul: typeof Banrisul;
    readonly Caixa: typeof Caixa;
    readonly Cecred: typeof Cecred;
    readonly Itau: typeof Itau;
    readonly Santander: typeof Santander;
    readonly Sicoob: typeof Sicoob;
    readonly Sicredi: typeof Sicredi;
    readonly '237': typeof Bradesco;
    readonly '001': typeof BancoBrasil;
    readonly '041': typeof Banrisul;
    readonly '104': typeof Caixa;
    readonly '085': typeof Cecred;
    readonly '341': typeof Itau;
    readonly '033': typeof Santander;
    readonly '756': typeof Sicoob;
    readonly '748': typeof Sicredi;
};
type BancoNome = keyof typeof Bancos;

declare function removerMascara(texto: unknown): string;
interface NumeroArgs {
    separadorDecimal?: string;
    separadorDeMilhar?: string;
    casasDecimais?: number;
}
declare function numero(n: number, args?: NumeroArgs): string;
interface DinheiroArgs extends NumeroArgs {
    simbolo?: string;
    posicionamento?: 'esquerda' | 'direita';
}
declare function dinheiro(n: number, args?: DinheiroArgs): string;
declare function linhaDigitavel(valor: string): string;
declare const boletoBancario: typeof linhaDigitavel;
declare function hora(data: unknown, args?: {
    comSegundos?: boolean;
}): unknown;
declare function data(d: unknown): unknown;
declare function dataEHora(d: unknown, args?: {
    comSegundos?: boolean;
}): unknown;
declare function cnpj(texto: string): string;
declare function cpf(texto: string): string;
declare function pisPasep(texto: string): string;
declare const nit: typeof pisPasep;
declare function registroNacional(texto: string): string;
declare function placa(texto: string): string;
declare function cep(texto: string): string;
declare function dinheiroPorExtenso(numero: number): string;

declare const formatacoes_boletoBancario: typeof boletoBancario;
declare const formatacoes_cep: typeof cep;
declare const formatacoes_cnpj: typeof cnpj;
declare const formatacoes_cpf: typeof cpf;
declare const formatacoes_data: typeof data;
declare const formatacoes_dataEHora: typeof dataEHora;
declare const formatacoes_dinheiro: typeof dinheiro;
declare const formatacoes_dinheiroPorExtenso: typeof dinheiroPorExtenso;
declare const formatacoes_hora: typeof hora;
declare const formatacoes_linhaDigitavel: typeof linhaDigitavel;
declare const formatacoes_nit: typeof nit;
declare const formatacoes_numero: typeof numero;
declare const formatacoes_pisPasep: typeof pisPasep;
declare const formatacoes_placa: typeof placa;
declare const formatacoes_registroNacional: typeof registroNacional;
declare const formatacoes_removerMascara: typeof removerMascara;
declare namespace formatacoes {
  export { formatacoes_boletoBancario as boletoBancario, formatacoes_cep as cep, formatacoes_cnpj as cnpj, formatacoes_cpf as cpf, formatacoes_data as data, formatacoes_dataEHora as dataEHora, formatacoes_dinheiro as dinheiro, formatacoes_dinheiroPorExtenso as dinheiroPorExtenso, formatacoes_hora as hora, formatacoes_linhaDigitavel as linhaDigitavel, formatacoes_nit as nit, formatacoes_numero as numero, formatacoes_pisPasep as pisPasep, formatacoes_placa as placa, formatacoes_registroNacional as registroNacional, formatacoes_removerMascara as removerMascara };
}

declare function eTituloDeEleitor(tituloDeEleitor: unknown): string | false;
declare function eEan(ean: unknown): boolean;
declare function eRegistroNacional(rn: unknown, tipo?: string): string | false;
declare function eCnpj(cnpj: unknown): boolean;
declare function eMatriz(cnpj: unknown): boolean | null;
declare function eFilial(cnpj: unknown): number | false | null;
declare function eCpf(cpf: unknown): boolean;
declare function ePisPasep(pisPasep: unknown): boolean;
declare const eNit: typeof ePisPasep;
declare function ePlaca(placa: unknown): boolean;
declare function eCep(cep: unknown): boolean;

declare const validacoes_eCep: typeof eCep;
declare const validacoes_eCnpj: typeof eCnpj;
declare const validacoes_eCpf: typeof eCpf;
declare const validacoes_eEan: typeof eEan;
declare const validacoes_eFilial: typeof eFilial;
declare const validacoes_eMatriz: typeof eMatriz;
declare const validacoes_eNit: typeof eNit;
declare const validacoes_ePisPasep: typeof ePisPasep;
declare const validacoes_ePlaca: typeof ePlaca;
declare const validacoes_eRegistroNacional: typeof eRegistroNacional;
declare const validacoes_eTituloDeEleitor: typeof eTituloDeEleitor;
declare namespace validacoes {
  export { validacoes_eCep as eCep, validacoes_eCnpj as eCnpj, validacoes_eCpf as eCpf, validacoes_eEan as eEan, validacoes_eFilial as eFilial, validacoes_eMatriz as eMatriz, validacoes_eNit as eNit, validacoes_ePisPasep as ePisPasep, validacoes_ePlaca as ePlaca, validacoes_eRegistroNacional as eRegistroNacional, validacoes_eTituloDeEleitor as eTituloDeEleitor };
}

declare class GeradorDeBoletoEntrada {
    private _boletosInfo;
    private _inputs;
    private _processado;
    constructor(input: BoletoInput | BoletoInput[]);
    processar(): this;
    /** Reseta o estado processado (útil para reutilizar a instância com novos dados). */
    resetar(): this;
    private gerador;
    gerarBase64(): Promise<BoletoGeradoResult>;
    gerarLinhaDigitavel(): Promise<Array<{
        linha: string;
        numeroDocumento: string;
    }>>;
    gerarStream(opts?: Partial<PdfOptions>): Promise<NodeJS.ReadableStream>;
    gerarBuffer(): Promise<Buffer>;
    gerarPNG(args?: Partial<PdfOptions> & {
        scale?: number;
    }): Promise<Array<{
        page: number;
        buffer: Buffer;
        mimeType: string;
    }>>;
    gerarArquivo(dir?: string, filename?: string, modelo?: 'carne'): Promise<{
        stream: fs.WriteStream;
    }>;
}

export { BancoBrasil, type BancoNome, Bancos, Banrisul, Beneficiario, type BeneficiarioInput, Boleto, type BoletoDocumentoInput, type BoletoGeradoResult, type BoletoInput, BoletoStringify, Bradesco, Caixa, Cecred, type DadosBancariosInput, Datas, type DatasInput, Endereco, type EnderecoInput, GeradorDeBoleto, GeradorDeBoletoCarne, GeradorDeBoletoEntrada, type IBanco, type IBeneficiario, type IBoleto, type IDatas, type IEndereco, type IPagador, Itau, Pagador, type PagadorInput, type PdfOptions, type PixEmvInput, Santander, Sicoob, Sicredi, especiesDeDocumento, formatacoes, validacoes };
