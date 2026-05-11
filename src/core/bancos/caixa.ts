import path from 'path';
import { pad } from '../utils/string.js';
import { CodigoDeBarrasBuilder } from '../codigo-de-barras-builder.js';
import { mod11 } from '../gerador-digito.js';
import type { IBanco, IBeneficiario, IBoleto } from '../types/index.js';


const NUMERO = '104';
const DIGITO = '0';

export class Caixa implements IBanco {
  imprimirNome = false;
  nome = 'Caixa Econômica Federal S/A';

  getTitulos() {
    return {
      instrucoes: 'Instruções (texto de responsabilidade do beneficiário)',
      nomeDoPagador: 'Nome do Pagador',
      especie: 'Espécie Moeda',
      quantidade: 'Quantidade Moeda',
      valor: 'xValor',
    };
  }

  exibirReciboDoPagadorCompleto() { return true; }
  exibirCampoCip() { return false; }

  geraCodigoDeBarrasPara(boleto: IBoleto): string {
    const beneficiario = boleto.getBeneficiario();
    const carteira = beneficiario.getCarteira();
    const contaCorrente = pad(beneficiario.getCodigoBeneficiario(), 6, '0');
    const nossoNumeroFormatado = this.getNossoNumeroFormatado(beneficiario);
    const campoLivre: (string | number)[] = [];

    if (carteira === '14' || carteira === '24') {
      campoLivre.push(contaCorrente);
      campoLivre.push(beneficiario.getDigitoCodigoBeneficiario());
      campoLivre.push(nossoNumeroFormatado.substring(2, 5));
      campoLivre.push(nossoNumeroFormatado.substring(0, 1));
      campoLivre.push(nossoNumeroFormatado.substring(5, 8));
      campoLivre.push(nossoNumeroFormatado.substring(1, 2));
      campoLivre.push(nossoNumeroFormatado.substring(8));

      const digito = mod11(campoLivre.join(''), { de: [0, 10, 11], para: 0 });
      campoLivre.push(digito);
    } else {
      throw new Error(`Carteira "${carteira}" não implementada para o banco Caixa`);
    }

    return new CodigoDeBarrasBuilder(boleto).comCampoLivre(campoLivre.join(''));
  }

  getNumeroFormatadoComDigito() { return `${NUMERO}-${DIGITO}`; }
  getNumeroFormatado() { return NUMERO; }
  getCarteiraFormatado(b: IBeneficiario) { return pad(b.getCarteira(), 2, '0'); }
  getCarteiraTexto(b: IBeneficiario): string {
    const map: Record<string, string> = { '1': 'RG', '14': 'RG', '2': 'SR', '24': 'SR' };
    return map[b.getCarteira()] ?? b.getCarteira();
  }
  getCodigoFormatado(b: IBeneficiario) { return pad(b.getCodigoBeneficiario(), 5, '0'); }
  getImagem() { return path.resolve(process.cwd(), 'lib/boleto/bancos/logotipos/caixa-economica-federal.png'); }
  getNossoNumeroFormatado(b: IBeneficiario) { return pad(b.getCarteira(), 2, '0') + pad(b.getNossoNumero(), 15, '0'); }
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
