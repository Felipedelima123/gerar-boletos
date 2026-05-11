import { mod } from './utils/math.js';
import { series } from './utils/array.js';

export function mod10(campo: string): number {
  const digito = mod({
    value: campo,
    factors: [2, 1],
    divider: 10,
    direction: 'rightToLeft',
    cumplimentaryToDivider: true,
    reduceSummationTerms: true,
  });
  return digito === 10 ? 0 : digito;
}

interface Substituicoes {
  de: number | number[];
  para: number;
}

export function mod11(codigoDeBarras: string, substituicoes?: Substituicoes): number {
  const subs = substituicoes ?? { de: [0, 1, 10, 11], para: 1 };
  if (!Array.isArray(subs.de)) subs.de = [subs.de];

  let digito = mod({
    value: codigoDeBarras,
    factors: series(2, 9),
    cumplimentaryToDivider: true,
  });

  if ((subs.de as number[]).includes(digito)) {
    digito = subs.para;
  }

  return digito;
}
