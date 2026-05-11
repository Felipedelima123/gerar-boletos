import path from 'path';
import { pad } from '../utils/string.js';
import { CodigoDeBarrasBuilder } from '../codigo-de-barras-builder.js';
import type { IBanco, IBeneficiario, IBoleto } from '../types/index.js';


const NUMERO = '041';
const DIGITO = '8';

export class Banrisul implements IBanco {
  imprimirNome = false;
  nome = 'Banco do Estado do Rio Grande do Sul S.A.';

  getTitulos() {
    return {
      informativo: '',
      instrucoes: 'Informações de responsabilidade do beneficiário',
      nomeDoPagador: 'Nome do Pagador',
      localDePagamento: 'Local de Pagamento',
      vencimento: 'Vencimento',
      agenciaECodigoBeneficiario: 'Agência/Código do Beneficiário',
      nossoNumero: 'Nosso Número',
      especie: 'Moeda',
      quantidade: 'Quantidade',
      valor: '(x) Valor',
      valorDocumento: '(=) Valor do Documento',
      descontos: '(-) Desconto/Abatimento',
      outrasDeducoes: '(-) Outras Deduções',
      moraMulta: '(+) Juros/Multa',
      outrosAcrescimos: '(+) Outros Acréscimos',
      valorCobrado: '(=) Valor Cobrado',
    };
  }

  exibirReciboDoPagadorCompleto() { return true; }
  exibirCampoCip() { return true; }

  geraCodigoDeBarrasPara(boleto: IBoleto): string {
    const beneficiario = boleto.getBeneficiario();
    const campoLivre = [
      '1',
      beneficiario.getAgenciaFormatada(),
      this.getCodigoFormatado(beneficiario),
      this.getNossoNumeroFormatado(beneficiario),
      '00',
      this.calculaDuploDigito(beneficiario),
      '1',
    ];
    return new CodigoDeBarrasBuilder(boleto).comCampoLivre(campoLivre);
  }

  calculaDuploDigito(beneficiario: IBeneficiario): string {
    return this.calcularDVNossoNumero(this.getNossoNumeroFormatado(beneficiario));
  }

  calcularDVNossoNumero(nossoNumero: string): string {
    let digito1 = this.calcularModulo10(nossoNumero);
    let nossoNumeroComDV1 = nossoNumero + digito1;
    let digito2 = this.calcularModulo11(nossoNumeroComDV1);

    if (digito2 === -1) {
      digito1 = (digito1 + 1) % 10;
      nossoNumeroComDV1 = nossoNumero + digito1;
      digito2 = this.calcularModulo11(nossoNumeroComDV1);
    }

    return pad(String(digito1) + String(digito2), 2, '0');
  }

  calcularModulo10(campo: string): number {
    let soma = 0;
    let peso = 2;
    for (let i = campo.length - 1; i >= 0; i--) {
      let resultado = parseInt(campo.charAt(i)) * peso;
      if (resultado > 9) resultado -= 9;
      soma += resultado;
      peso = peso === 2 ? 1 : 2;
    }
    const resto = soma % 10;
    return resto === 0 ? 0 : 10 - resto;
  }

  calcularModulo11(campo: string): number {
    let soma = 0;
    let peso = 2;
    for (let i = campo.length - 1; i >= 0; i--) {
      soma += parseInt(campo.charAt(i)) * peso;
      peso++;
      if (peso > 7) peso = 2;
    }
    const resto = soma % 11;
    if (resto === 0) return 0;
    if (resto === 1) return -1;
    return 11 - resto;
  }

  getNumeroFormatadoComDigito() { return `${NUMERO}-${DIGITO}`; }
  getNumeroFormatado() { return NUMERO; }
  getCarteiraFormatado(b: IBeneficiario) { return pad(b.getCarteira(), 2, '0'); }
  getCarteiraTexto(b: IBeneficiario) { return pad(b.getCarteira(), 2, '0'); }
  getCodigoFormatado(b: IBeneficiario) { return pad(b.getCodigoBeneficiario(), 7, '0'); }
  getImagem() { return path.resolve(process.cwd(), 'lib/boleto/bancos/logotipos/banrisul.png'); }
  getNossoNumeroFormatado(b: IBeneficiario) { return pad(b.getNossoNumero(), 8, '0'); }
  getNome() { return this.nome; }
  getImprimirNome() { return this.imprimirNome; }

  getNossoNumeroECodigoDocumento(boleto: IBoleto): string {
    const b = boleto.getBeneficiario();
    return this.getNossoNumeroFormatado(b) + this.calculaDuploDigito(b);
  }

  getAgenciaECodigoBeneficiario(boleto: IBoleto): string {
    const b = boleto.getBeneficiario();
    let codigo = this.getCodigoFormatado(b);
    const digito = b.getDigitoCodigoBeneficiario();
    if (digito) codigo += `.${digito}`;
    return `${b.getAgenciaFormatada()}.${codigo}`;
  }
}
