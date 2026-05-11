import { linhaDigitavel as formatarLinhaDigitavel } from './utils/formatacoes.js';
import { validar } from './valida-codigo-barras.js';
import { mod10 } from './gerador-digito.js';
import type { IBanco } from './types/index.js';

export function gerarLinhaDigitavel(codigoDeBarras: string, banco?: IBanco): string {
  if (typeof codigoDeBarras === 'string' && codigoDeBarras.length === 47 && !banco) {
    const p1 = codigoDeBarras.substring(0, 5);
    const p2 = codigoDeBarras.substring(5, 10);
    const p3 = codigoDeBarras.substring(10, 15);
    const p4 = codigoDeBarras.substring(15, 21);
    const p5 = codigoDeBarras.substring(21, 26);
    const p6 = codigoDeBarras.substring(26, 32);
    const p7 = codigoDeBarras.substring(32, 33);
    const p8 = codigoDeBarras.substring(33, 34);
    const p9 = codigoDeBarras.substring(34, 47);
    return `${p1}.${p2} ${p3}.${p4} ${p5}.${p6} ${p7} ${p8}${p9}`;
  }

  validar(codigoDeBarras);

  const ld: (string | number)[] = [];

  ld.push(codigoDeBarras.substring(0, 3));
  ld.push(codigoDeBarras.substring(3, 4));
  ld.push(codigoDeBarras.substring(19, 24));
  ld.push(mod10(ld.join('')));

  ld.push(codigoDeBarras.substring(24, 34));
  ld.push(mod10(ld.join('').substring(10, 20)));

  ld.push(codigoDeBarras.substring(34));
  ld.push(mod10(ld.join('').substring(21, 31)));

  ld.push(codigoDeBarras.substring(4, 5));
  ld.push(codigoDeBarras.substring(5, 9));
  ld.push(codigoDeBarras.substring(9, 19));

  return formatarLinhaDigitavel(ld.join(''));
}
