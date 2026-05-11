import path from 'path';
import { pad } from '../utils/string.js';
import { CodigoDeBarrasBuilder } from '../codigo-de-barras-builder.js';
import type { IBanco, IBeneficiario, IBoleto } from '../types/index.js';


const NUMERO = '756';
const DIGITO = '0';

export class Sicoob implements IBanco {
  imprimirNome = true;
  nome = '';

  getTitulos() {
    return {
      localDoPagamento: 'Local de Pagamento',
      especieDoDocumento: 'Espécie',
      instrucoes: 'Instruções (texto de responsabilidade do beneficiário)',
      agenciaECodigoDoBeneficiario: 'Coop. contratante/Cód. Beneficiário',
      valorDoDocumento: 'Valor Documento',
      igualDoValorDoDocumento: '',
      nomeDoPagador: 'Nome do Pagador',
    };
  }

  exibirReciboDoPagadorCompleto() { return false; }
  exibirCampoCip() { return false; }

  geraCodigoDeBarrasPara(boleto: IBoleto): string {
    const beneficiario = boleto.getBeneficiario();
    const campoLivre = [
      this.getCarteiraFormatado(beneficiario),
      beneficiario.getAgenciaFormatada(),
      pad(beneficiario.getCarteira(), 2, '0'),
      this.getCodigoFormatado(beneficiario),
      this.getNossoNumeroFormatado(beneficiario),
      beneficiario.getDigitoNossoNumero(),
      '001',
    ].join('');
    return new CodigoDeBarrasBuilder(boleto).comCampoLivre(campoLivre);
  }

  getNumeroFormatadoComDigito() { return `${NUMERO}-${DIGITO}`; }
  getNumeroFormatado() { return NUMERO; }
  getCarteiraFormatado(b: IBeneficiario) { return pad(b.getCarteira(), 1, '0'); }
  getCarteiraTexto(b: IBeneficiario) { return this.getCarteiraFormatado(b); }
  getCodigoFormatado(b: IBeneficiario) { return pad(b.getCodigoBeneficiario(), 7, '0'); }
  getImagem() { return path.resolve(process.cwd(), 'lib/boleto/bancos/logotipos/sicoob.png'); }
  getNossoNumeroFormatado(b: IBeneficiario) { return pad(b.getNossoNumero(), 7, '0'); }
  getNome() { return this.nome; }
  getImprimirNome() { return this.imprimirNome; }

  getNossoNumeroECodigoDocumento(boleto: IBoleto): string {
    const b = boleto.getBeneficiario();
    return `${pad(b.getCarteira(), 2, '0')}/${this.getNossoNumeroFormatado(b)}-${b.getDigitoNossoNumero()}`;
  }

  getAgenciaECodigoBeneficiario(boleto: IBoleto): string {
    const b = boleto.getBeneficiario();
    let codigo = this.getCodigoFormatado(b);
    const digito = b.getDigitoCodigoBeneficiario();
    if (digito) codigo += `-${digito}`;
    return `${b.getAgenciaFormatada()}/${codigo}`;
  }
}
