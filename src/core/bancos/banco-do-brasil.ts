import path from 'path';
import { pad } from '../utils/string.js';
import { CodigoDeBarrasBuilder } from '../codigo-de-barras-builder.js';
import type { IBanco, IBeneficiario, IBoleto } from '../types/index.js';


const NUMERO = '001';
const DIGITO = '9';

export class BancoBrasil implements IBanco {
  imprimirNome = false;
  nome = 'Banco do Brasil S.A.';

  getTitulos() {
    return {
      informativo: '',
      instrucoes: 'Informações de responsabilidade do beneficiário',
      nomeDoPagador: 'Nome do Pagador',
      especie: 'Moeda',
      quantidade: 'Quantidade',
      valor: 'Valor',
      moraMulta: '(+) Juros / Multa',
    };
  }

  exibirReciboDoPagadorCompleto() { return true; }
  exibirCampoCip() { return false; }

  geraCodigoDeBarrasPara(boleto: IBoleto): string {
    const beneficiario = boleto.getBeneficiario();
    const campoLivre: string[] = [];

    if (beneficiario.getNossoNumero().length === 11) {
      campoLivre.push(beneficiario.getNossoNumero());
      campoLivre.push(beneficiario.getAgenciaFormatada());
      campoLivre.push(beneficiario.getCodigoBeneficiario());
      campoLivre.push(beneficiario.getCarteira().substring(0, 2));
    }

    if (beneficiario.getNossoNumero().length === 17) {
      campoLivre.push('000000');
      campoLivre.push(beneficiario.getNossoNumero());
      campoLivre.push(beneficiario.getCarteira().substring(0, 2));
    }

    return new CodigoDeBarrasBuilder(boleto).comCampoLivre(campoLivre);
  }

  getNumeroFormatadoComDigito() { return `${NUMERO}-${DIGITO}`; }
  getNumeroFormatado() { return NUMERO; }
  getCarteiraFormatado(b: IBeneficiario) { return pad(b.getCarteira(), 2, '0'); }
  getCarteiraTexto(b: IBeneficiario) { return pad(b.getCarteira(), 2, '0'); }
  getCodigoFormatado(b: IBeneficiario) { return pad(b.getCodigoBeneficiario(), 7, '0'); }
  getImagem() { return path.resolve(process.cwd(), 'lib/boleto/bancos/logotipos/banco-do-brasil.png'); }
  getNossoNumeroFormatado(b: IBeneficiario) { return pad(b.getNossoNumero(), 17, '0'); }
  getNome() { return this.nome; }
  getImprimirNome() { return this.imprimirNome; }

  getNossoNumeroECodigoDocumento(boleto: IBoleto): string {
    return this.getNossoNumeroFormatado(boleto.getBeneficiario());
  }

  getAgenciaECodigoBeneficiario(boleto: IBoleto): string {
    const b = boleto.getBeneficiario();
    let codigo = this.getCodigoFormatado(b);
    const digito = b.getDigitoCodigoBeneficiario();
    if (digito) codigo += `-${digito}`;
    return `${b.getAgenciaFormatada()}/${codigo}`;
  }
}
