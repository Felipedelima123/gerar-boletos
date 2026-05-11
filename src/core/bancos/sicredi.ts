import path from 'path';
import { pad } from '../utils/string.js';
import { CodigoDeBarrasBuilder } from '../codigo-de-barras-builder.js';
import type { IBanco, IBeneficiario, IBoleto } from '../types/index.js';


const NUMERO = '748';
const DIGITO = 'X';

export class Sicredi implements IBanco {
  imprimirNome = false;
  nome = 'Sicredi';

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

    const arrayDigito = (
      '1' +
      beneficiario.getCarteira() +
      beneficiario.getNossoNumero() +
      beneficiario.getDigitoNossoNumero() +
      beneficiario.getAgenciaFormatada() +
      beneficiario.getCodposto() +
      beneficiario.getCodigoBeneficiario() +
      '10'
    ).split('');

    const pesos = [9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let soma = 0;
    for (let i = 0; i < arrayDigito.length; i++) {
      soma += pesos[i] * parseInt(arrayDigito[i], 10);
    }
    let digCampoLivre = soma % 11;
    if (digCampoLivre === 1 || digCampoLivre === 0) {
      digCampoLivre = 0;
    } else {
      digCampoLivre = 11 - digCampoLivre;
    }

    const nosso = beneficiario.getNossoNumero();
    const campoLivre = [
      '1',
      this.getCarteiraFormatado(beneficiario),
      nosso.substring(0, 3),
      nosso.substring(3, 8),
      beneficiario.getDigitoNossoNumero(),
      beneficiario.getAgenciaFormatada(),
      beneficiario.getCodposto(),
      beneficiario.getCodigoBeneficiario(),
      '1',
      '0',
      String(digCampoLivre),
    ];

    return new CodigoDeBarrasBuilder(boleto).comCampoLivre(campoLivre);
  }

  getNumeroFormatadoComDigito() { return `${NUMERO}-${DIGITO}`; }
  getNumeroFormatado() { return NUMERO; }
  getCarteiraFormatado(b: IBeneficiario) { return pad(b.getCarteira(), 1, '0'); }
  getCarteiraTexto(b: IBeneficiario) { return pad(b.getCarteira(), 2, '0'); }
  getCodigoFormatado(b: IBeneficiario) { return pad(b.getCodigoBeneficiario(), 7, '0'); }
  getImagem() { return path.resolve(process.cwd(), 'lib/boleto/bancos/logotipos/sicredi.png'); }
  getNossoNumeroFormatado(b: IBeneficiario) { return pad(b.getNossoNumero(), 8, '0'); }
  getNome() { return this.nome; }
  getImprimirNome() { return this.imprimirNome; }

  getNossoNumeroECodigoDocumento(boleto: IBoleto): string {
    const b = boleto.getBeneficiario();
    const nosso = this.getNossoNumeroFormatado(b);
    return `${nosso.substring(0, 2)}/${nosso.substring(2)}-${b.getDigitoNossoNumero()}`;
  }

  getAgenciaECodigoBeneficiario(boleto: IBoleto): string {
    const b = boleto.getBeneficiario();
    const codposto = b.getCodposto();
    let codigo = b.getCodigoBeneficiario();
    const digito = b.getDigitoCodigoBeneficiario();
    if (digito) codigo += `-${digito}`;
    return `${b.getAgenciaFormatada()}/${codposto ? codposto + '.' : ''}${codigo}`;
  }
}
