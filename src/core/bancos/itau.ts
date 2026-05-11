import path from 'path';
import { pad, insert } from '../utils/string.js';
import { CodigoDeBarrasBuilder } from '../codigo-de-barras-builder.js';
import { mod10 } from '../gerador-digito.js';
import type { IBanco, IBeneficiario, IBoleto } from '../types/index.js';


const NUMERO = '341';
const DIGITO = '7';

export class Itau implements IBanco {
  imprimirNome = true;
  nome = 'Banco Itaú S/A';

  getTitulos() { return {}; }
  exibirReciboDoPagadorCompleto() { return false; }
  exibirCampoCip() { return false; }

  geraCodigoDeBarrasPara(boleto: IBoleto): string {
    const beneficiario = boleto.getBeneficiario();
    let campoLivre = [
      this.getCarteiraFormatado(beneficiario),
      this.getNossoNumeroFormatado(beneficiario),
      beneficiario.getAgenciaFormatada(),
      this.getCodigoFormatado(beneficiario),
      '000',
    ].join('');

    const digito1 = mod10(campoLivre.substring(11, 20));
    campoLivre = insert(campoLivre, 20, String(digito1));

    const digito2 = mod10(campoLivre.substring(11, 20) + campoLivre.substring(0, 11));
    campoLivre = insert(campoLivre, 11, String(digito2));

    return new CodigoDeBarrasBuilder(boleto).comCampoLivre(campoLivre);
  }

  getNumeroFormatadoComDigito() { return `${NUMERO}-${DIGITO}`; }
  getNumeroFormatado() { return NUMERO; }
  getCarteiraFormatado(b: IBeneficiario) { return pad(b.getCarteira(), 3, '0'); }
  getCarteiraTexto(b: IBeneficiario) { return this.getCarteiraFormatado(b); }
  getCodigoFormatado(b: IBeneficiario) { return pad(b.getCodigoBeneficiario(), 5, '0'); }
  getImagem() { return path.resolve(process.cwd(), 'lib/boleto/bancos/logotipos/itau.png'); }
  getNossoNumeroFormatado(b: IBeneficiario) { return pad(b.getNossoNumero(), 8, '0'); }
  getNome() { return this.nome; }
  getImprimirNome() { return this.imprimirNome; }

  getNossoNumeroECodigoDocumento(boleto: IBoleto): string {
    const b = boleto.getBeneficiario();
    return `${b.getCarteira()}/${this.getNossoNumeroFormatado(b)}-${b.getDigitoNossoNumero()}`;
  }

  getAgenciaECodigoBeneficiario(boleto: IBoleto): string {
    const b = boleto.getBeneficiario();
    let codigo = this.getCodigoFormatado(b);
    const digito = b.getDigitoCodigoBeneficiario();
    if (digito) codigo += `-${digito}`;
    return `${b.getAgenciaFormatada()}/${codigo}`;
  }
}
