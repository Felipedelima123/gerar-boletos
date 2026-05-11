import path from 'path';
import { pad } from '../utils/string.js';
import { CodigoDeBarrasBuilder } from '../codigo-de-barras-builder.js';
import type { IBanco, IBeneficiario, IBoleto } from '../types/index.js';


const NUMERO = '085';
const DIGITO = '1';

export class Cecred implements IBanco {
  imprimirNome = false;
  nome = 'Ailos';

  getTitulos() {
    return {
      instrucoes: 'Instruções (texto de responsabilidade do beneficiário)',
      nomeDoPagador: 'Pagador',
      especie: 'Moeda',
      quantidade: 'Quantidade',
      valor: 'x Valor',
      moraMulta: '(+) Moras / Multa',
    };
  }

  exibirReciboDoPagadorCompleto() { return true; }
  exibirCampoCip() { return true; }

  geraCodigoDeBarrasPara(boleto: IBoleto): string {
    const beneficiario = boleto.getBeneficiario();
    const errorMsg = 'Erro ao gerar código de barras,';

    if (!beneficiario.getNumeroConvenio() || beneficiario.getNumeroConvenio().length !== 6)
      throw new Error(`${errorMsg} número convênio da cooperativa não possui 6 dígitos: ${beneficiario.getNumeroConvenio()}`);
    if (!beneficiario.getNossoNumero() || beneficiario.getNossoNumero().length !== 17)
      throw new Error(`${errorMsg} nosso número não possui 17 dígitos: ${beneficiario.getNossoNumero()}`);
    if (!beneficiario.getCarteira() || beneficiario.getCarteira().length !== 2)
      throw new Error(`${errorMsg} código carteira não possui 2 dígitos: ${beneficiario.getCarteira()}`);

    const campoLivre = [
      beneficiario.getNumeroConvenio(),
      beneficiario.getNossoNumero(),
      beneficiario.getCarteira().substring(0, 2),
    ];
    return new CodigoDeBarrasBuilder(boleto).comCampoLivre(campoLivre);
  }

  getNumeroFormatadoComDigito() { return `${NUMERO}-${DIGITO}`; }
  getNumeroFormatado() { return NUMERO; }
  getCarteiraFormatado(b: IBeneficiario) { return pad(b.getCarteira(), 2, '0'); }
  getCarteiraTexto(b: IBeneficiario) { return pad(b.getCarteira(), 2, '0'); }
  getCodigoFormatado(b: IBeneficiario) { return pad(b.getCodigoBeneficiario(), 7, '0'); }
  getImagem() { return path.resolve(process.cwd(), 'lib/boleto/bancos/logotipos/ailos.png'); }
  getNossoNumeroFormatado(b: IBeneficiario) { return pad(b.getNossoNumero(), 11, '0'); }
  getNome() { return this.nome; }
  getImprimirNome() { return this.imprimirNome; }

  getLocaisDePagamentoPadrao() {
    return [
      'PAGAVEL PREFERENCIALMENTE NAS COOPERATIVAS DO SISTEMA AILOS.',
      'APOS VENCIMENTO PAGAR SOMENTE NA COOPERATIVA ',
    ];
  }

  getNossoNumeroECodigoDocumento(boleto: IBoleto): string {
    const b = boleto.getBeneficiario();
    let nossoNumero = this.getNossoNumeroFormatado(b);
    if (b.getDigitoNossoNumero()) nossoNumero += `-${b.getDigitoNossoNumero()}`;
    return nossoNumero;
  }

  getAgenciaECodigoBeneficiario(boleto: IBoleto): string {
    const b = boleto.getBeneficiario();
    let codigo = this.getCodigoFormatado(b);
    const digito = b.getDigitoCodigoBeneficiario();
    if (digito) codigo += `-${digito}`;
    const agenciaComDigito = `${b.getAgenciaFormatada()}-${b.getDigitoAgencia()}`;
    return `${agenciaComDigito}/${codigo}`;
  }
}
