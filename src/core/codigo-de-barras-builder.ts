import { validar } from './valida-codigo-barras.js';
import { mod11 } from './gerador-digito.js';
import { insert } from './utils/string.js';
import type { IBoleto } from './types/index.js';

export class CodigoDeBarrasBuilder {
  private _codigoDeBarras: string;

  constructor(boleto: IBoleto) {
    const banco = boleto.getBanco();
    const partes: string[] = [
      banco.getNumeroFormatado(),
      boleto.getCodigoEspecieMoeda(),
      boleto.getFatorVencimento(),
      boleto.getValorFormatado(),
    ];
    this._codigoDeBarras = partes.join('');
  }

  comCampoLivre(campoLivre: string | string[]): string {
    let codigo = this._codigoDeBarras;
    const campo = Array.isArray(campoLivre) ? campoLivre.join('') : campoLivre;

    if (!campo.length) throw new Error('Campo livre está vazio');

    codigo += campo;

    const digito = mod11(codigo);
    codigo = insert(codigo, 4, String(digito));

    validar(codigo);
    return codigo;
  }
}
