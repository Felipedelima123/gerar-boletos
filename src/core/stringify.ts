import { Beneficiario, Endereco, Pagador } from './boleto.js';
import type { BeneficiarioInput, EnderecoInput, PagadorInput } from './types/index.js';

export class BoletoStringify {
  static enderecoPagador(end: EnderecoInput | undefined) {
    const e = Endereco.novoEndereco();
    if (!end) return e;
    if (end.logradouro) e.comLogradouro(end.logradouro);
    if (end.bairro) e.comBairro(end.bairro);
    if (end.cidade) e.comCidade(end.cidade);
    if (end.estadoUF) e.comUf(end.estadoUF);
    if (end.cep) e.comCep(end.cep);
    return e;
  }

  static createPagador(p: PagadorInput) {
    const pagador = Pagador.novoPagador()
      .comNome(p.nome)
      .comRegistroNacional(p.registroNacional);
    if (p.endereco) pagador.comEndereco(this.enderecoPagador(p.endereco));
    return pagador;
  }

  static createBeneficiario(b: BeneficiarioInput) {
    const rn = b.cnpj ?? b.cpf ?? b.registroNacional ?? '';
    const novoBeneficiario = Beneficiario.novoBeneficiario()
      .comNome(b.nome)
      .comRegistroNacional(rn)
      .comCarteira(b.dadosBancarios.carteira)
      .comAgencia(b.dadosBancarios.agencia)
      .comDigitoAgencia(b.dadosBancarios.agenciaDigito ?? '')
      .comCodigoBeneficiario(b.dadosBancarios.conta)
      .comDigitoCodigoBeneficiario(b.dadosBancarios.contaDigito ?? '')
      .comNossoNumero(b.dadosBancarios.nossoNumero)
      .comDigitoNossoNumero(b.dadosBancarios.nossoNumeroDigito ?? '');

    if (b.dadosBancarios.convenio) novoBeneficiario.comNumeroConvenio(b.dadosBancarios.convenio);
    if (b.dadosBancarios.posto) novoBeneficiario.comCodPosto(b.dadosBancarios.posto);
    if (b.endereco) novoBeneficiario.comEndereco(this.enderecoPagador(b.endereco));

    return novoBeneficiario;
  }

  static createInstrucoes(instrucoes: string | string[] | undefined): string[] {
    if (!instrucoes) return [];
    return Array.isArray(instrucoes) ? instrucoes : [instrucoes];
  }

  static createInformativo(informativo: string | string[] | undefined): string[] {
    if (!informativo) return [];
    return Array.isArray(informativo) ? informativo : [informativo];
  }
}
