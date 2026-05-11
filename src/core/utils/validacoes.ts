import { removerMascara } from './formatacoes.js';
import { capitalize } from './string.js';
import { mod } from './math.js';

export function eTituloDeEleitor(tituloDeEleitor: unknown): string | false {
  if (typeof tituloDeEleitor !== 'string') return false;

  const titulo = removerMascara(tituloDeEleitor);
  if (titulo.length !== 12) return false;

  const primeiraBase = titulo.substring(0, 8);
  const segundaBase = titulo.substring(8, 10);
  const base = titulo.substring(0, 10);
  let estado = parseInt(segundaBase, 10);

  if (estado < 1 || estado > 28) return false;

  const primeiroResto = mod(primeiraBase);
  const primeiroDigito = primeiroResto === 0 && estado < 3 ? 0 : primeiroResto < 2 ? 0 : 11 - primeiroResto;

  const segundoResto = mod(segundaBase + primeiroDigito, [2, 3, 4]);
  const segundoDigito = segundoResto === 0 && estado < 3 ? 0 : segundoResto < 2 ? 0 : 11 - segundoResto;

  if (titulo === base + primeiroDigito + segundoDigito) {
    const estados: Record<number, string> = {
      1: 'SP', 2: 'MG', 3: 'RJ', 4: 'RS', 5: 'BA', 6: 'PR', 7: 'CE', 8: 'PE',
      9: 'SC', 10: 'GO', 11: 'MA', 12: 'PB', 13: 'PA', 14: 'ES', 15: 'PI',
      16: 'RN', 17: 'AL', 18: 'MT', 19: 'MS', 20: 'DF', 21: 'SE', 22: 'AM',
      23: 'RS', 24: 'AC', 25: 'AP', 26: 'RR', 27: 'TO', 28: 'ZZ',
    };
    return estados[estado] || false;
  }

  return false;
}

export function eEan(ean: unknown): boolean {
  if (typeof ean !== 'string' || !/^(?:\d{8}|\d{12,14})$/.test(ean)) return false;

  const digits = ean.split('').map(Number);
  let peso = 1;
  const digitoVerificador = digits.pop()!;
  const soma = digits.reduceRight((anterior, atual) => {
    peso = 4 - peso;
    return anterior + atual * peso;
  }, 0);
  const calculado = (soma + (10 - (soma % 10)) % 10) - soma;

  return digitoVerificador === calculado;
}

export function eRegistroNacional(rn: unknown, tipo?: string): string | false {
  if (typeof rn !== 'string') return false;

  const cleaned = removerMascara(rn);

  if (typeof tipo === 'undefined') {
    if (cleaned.length === 14 && eCnpj(cleaned)) return 'cnpj';
    if (cleaned.length === 11 && eCpf(cleaned)) return 'cpf';
  } else if (['cpf', 'cnpj'].includes(tipo.toLowerCase())) {
    const fns: Record<string, (s: string) => boolean> = { cpf: eCpf, cnpj: eCnpj };
    const fn = fns[tipo.toLowerCase()];
    if (fn && fn(cleaned)) return tipo;
  }

  return false;
}

const casosTriviaisDeCnpjFalsos = [
  '000000000000', '111111111111', '222222222222', '333333333333',
  '444444444444', '555555555555', '666666666666', '777777777777',
  '888888888888', '999999999999',
];

export function eCnpj(cnpj: unknown): boolean {
  if (typeof cnpj !== 'string') return false;
  const c = removerMascara(cnpj);
  if (c.length !== 14) return false;

  const base = c.substring(0, 12);
  if (casosTriviaisDeCnpjFalsos.includes(base)) return false;

  const primeiroResto = mod(base);
  const primeiroDigito = primeiroResto < 2 ? 0 : 11 - primeiroResto;

  const segundoResto = mod(base + primeiroDigito);
  const segundoDigito = segundoResto < 2 ? 0 : 11 - segundoResto;

  return c === base + primeiroDigito + segundoDigito;
}

const regexMatrizFilial = /^[0-9]{8}([0-9]{4})[0-9]{2}$/;

export function eMatriz(cnpj: unknown): boolean | null {
  if (!eCnpj(cnpj)) return null;
  const matches = regexMatrizFilial.exec(removerMascara(cnpj as string));
  return matches !== null && matches.length === 2 && matches[1] === '0001';
}

export function eFilial(cnpj: unknown): number | false | null {
  if (!eCnpj(cnpj)) return null;
  const matches = regexMatrizFilial.exec(removerMascara(cnpj as string));
  if (matches !== null && matches.length === 2 && matches[1] !== '0001') {
    return parseInt(matches[1], 10);
  }
  return false;
}

export function eCpf(cpf: unknown): boolean {
  if (typeof cpf !== 'string') return false;
  const c = removerMascara(cpf);
  if (c.length !== 11) return false;

  const base = c.substring(0, 9);
  const multiplicadores = [2, 3, 4, 5, 6, 7, 8, 9, 10];

  const primeiroResto = mod(base, multiplicadores);
  const primeiroDigito = primeiroResto < 2 ? 0 : 11 - primeiroResto;

  const multiplicadores2 = [...multiplicadores, 11];
  const segundoResto = mod(base + primeiroDigito, multiplicadores2);
  const segundoDigito = segundoResto < 2 ? 0 : 11 - segundoResto;

  return c === base + primeiroDigito + segundoDigito;
}

export function ePisPasep(pisPasep: unknown): boolean {
  if (typeof pisPasep !== 'string') return false;
  const p = removerMascara(pisPasep);
  if (p.length !== 11) return false;

  const base = p.substring(0, 10);
  const multiplicadores = [3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const resto = mod(base, multiplicadores, 11, 'leftToRight');
  const subtracao = 11 - resto;
  const digito = subtracao === 10 || subtracao === 11 ? 0 : subtracao;

  return p === base + digito;
}

export const eNit = ePisPasep;

const regexPlaca = /^[a-zA-Z]{3}-?[0-9]{4}$/;
export function ePlaca(placa: unknown): boolean {
  return regexPlaca.test(placa as string);
}

const regexCep = /^\d{2}\.?\d{3}-?\d{3}$/;
export function eCep(cep: unknown): boolean {
  return regexCep.test(cep as string);
}
