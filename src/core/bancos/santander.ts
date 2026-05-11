import path from 'path';
import { pad } from '../utils/string.js';
import { CodigoDeBarrasBuilder } from '../codigo-de-barras-builder.js';
import type { IBanco, IBeneficiario, IBoleto } from '../types/index.js';


const NUMERO = '033';
const DIGITO = '7';

export class Santander implements IBanco {
  imprimirNome = false;
  nome = 'Banco Santander S.A.';

  getTitulos() {
    return {
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
    const nosso = this.getNossoNumeroFormatado(beneficiario);
    const campoLivre = [
      '9',
      beneficiario.getCodigoBeneficiario().substring(0, 4),
      beneficiario.getCodigoBeneficiario().substring(4),
      nosso.substring(0, 7),
      nosso.substring(7),
      beneficiario.getDigitoNossoNumero(),
      '0',
      this.getCarteiraFormatado(beneficiario),
    ];
    return new CodigoDeBarrasBuilder(boleto).comCampoLivre(campoLivre);
  }

  getNumeroFormatadoComDigito() { return `${NUMERO}-${DIGITO}`; }
  getNumeroFormatado() { return NUMERO; }
  getCarteiraFormatado(b: IBeneficiario) { return pad(b.getCarteira(), 2, '0'); }
  getCarteiraTexto(b: IBeneficiario) { return pad(b.getCarteira(), 2, '0'); }
  getCodigoFormatado(b: IBeneficiario) { return pad(b.getCodigoBeneficiario(), 7, '0'); }
  getImagem() { return path.resolve(process.cwd(), 'lib/boleto/bancos/logotipos/santander.png'); }
  getNossoNumeroFormatado(b: IBeneficiario) { return pad(b.getNossoNumero(), 12, '0'); }
  getNome() { return this.nome; }
  getImprimirNome() { return this.imprimirNome; }

  getNossoNumeroECodigoDocumento(boleto: IBoleto): string {
    const b = boleto.getBeneficiario();
    return `${this.getNossoNumeroFormatado(b)}-${b.getDigitoNossoNumero()}`;
  }

  getAgenciaECodigoBeneficiario(boleto: IBoleto): string {
    const b = boleto.getBeneficiario();
    let codigo = this.getCodigoFormatado(b);
    const digito = b.getDigitoCodigoBeneficiario();
    if (digito) codigo += `-${digito}`;
    return `${b.getAgenciaFormatada()}/${codigo}`;
  }
}
