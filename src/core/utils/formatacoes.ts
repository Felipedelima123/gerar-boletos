import { pad, insert } from './string.js';
import { isValidDate } from './date.js';

export function removerMascara(texto: unknown): string {
  if (typeof texto !== 'string') return texto as string;
  return texto
    .trim()
    .replace(/\(/g, '').replace(/\)/g, '').replace(/\./g, '')
    .replace(/\//g, '').replace(/-/g, '').replace(/\s/g, '')
    .replace(/R\$/g, '').replace(/%/g, '').trim();
}

interface NumeroArgs {
  separadorDecimal?: string;
  separadorDeMilhar?: string;
  casasDecimais?: number;
}

export function numero(n: number, args?: NumeroArgs): string {
  if (isNaN(n)) return String(n);

  const casasOriginais = n.toString().split('.')[1]?.length ?? 0;
  const opts = Object.assign({ separadorDecimal: ',', separadorDeMilhar: '.', casasDecimais: casasOriginais }, args);

  const re = `\\d(?=(\\d{3})+${opts.casasDecimais > 0 ? '\\D' : '$'})`;
  let num = parseFloat(n.toFixed(opts.casasDecimais)).toFixed(opts.casasDecimais);
  if (opts.separadorDecimal) num = num.replace('.', opts.separadorDecimal);
  return num.replace(new RegExp(re, 'g'), `$&${opts.separadorDeMilhar}`);
}

interface DinheiroArgs extends NumeroArgs {
  simbolo?: string;
  posicionamento?: 'esquerda' | 'direita';
}

export function dinheiro(n: number, args?: DinheiroArgs): string {
  if (isNaN(n)) return String(n);
  const opts = Object.assign({ simbolo: 'R$ ', posicionamento: 'esquerda' }, args);
  const formatted = numero(n, opts);
  return opts.posicionamento === 'esquerda' ? opts.simbolo + formatted : formatted + opts.simbolo;
}

export function linhaDigitavel(valor: string): string {
  const v = removerMascara(valor);
  if (v.length !== 47) return v;

  let r = v;
  r = insert(r, 5, '.');
  r = insert(r, 11, ' ');
  r = insert(r, 17, '.');
  r = insert(r, 24, ' ');
  r = insert(r, 30, '.');
  r = insert(r, 37, ' ');
  r = insert(r, 39, ' ');
  return r;
}

export const boletoBancario = linhaDigitavel;

export function hora(data: unknown, args?: { comSegundos?: boolean }): unknown {
  if (!isValidDate(data)) return data;
  const opts = Object.assign({ comSegundos: true }, args);
  const componentes = [pad(data.getHours(), 2, '0'), pad(data.getMinutes(), 2, '0')];
  if (opts.comSegundos) componentes.push(pad(data.getSeconds(), 2, '0'));
  return componentes.join(':');
}

export function data(d: unknown): unknown {
  if (!isValidDate(d)) return d;
  return [pad(d.getDate(), 2, '0'), pad(d.getMonth() + 1, 2, '0'), d.getFullYear()].join('/');
}

export function dataEHora(d: unknown, args?: { comSegundos?: boolean }): unknown {
  if (!isValidDate(d)) return d;
  return [data(d), hora(d, args)].join(' ');
}

export function cnpj(texto: string): string {
  const t = texto.trim();
  if (t.length > 14) return texto;
  const c = removerMascara(t);
  if (c.length !== 14) return texto;
  return `${c.substr(0, 2)}.${c.substr(2, 3)}.${c.substr(5, 3)}/${c.substr(8, 4)}-${c.substr(12, 2)}`;
}

export function cpf(texto: string): string {
  const t = texto.trim();
  if (t.length > 11) return texto;
  const c = removerMascara(t);
  if (c.length !== 11) return texto;
  return `${c.substr(0, 3)}.${c.substr(3, 3)}.${c.substr(6, 3)}-${c.substr(9, 2)}`;
}

export function pisPasep(texto: string): string {
  const t = texto.trim();
  if (t.length > 11) return texto;
  const c = removerMascara(t);
  if (c.length !== 11) return texto;
  return `${c.substr(0, 3)}.${c.substr(3, 4)}.${c.substr(7, 3)}-${c.substr(10, 1)}`;
}

export const nit = pisPasep;

export function registroNacional(texto: string): string {
  const { eRegistroNacional } = require('./validacoes.js') as typeof import('./validacoes.js');
  const tipo = eRegistroNacional(texto);
  if (!tipo) return texto;
  const fns: Record<string, (s: string) => string> = { cpf, cnpj };
  return fns[tipo] ? fns[tipo](texto) : texto;
}

export function placa(texto: string): string {
  const t = texto.trim().replace(/-/g, '');
  return `${t.substr(0, 3).toUpperCase()}-${t.substr(3, 4)}`;
}

export function cep(texto: string): string {
  const t = removerMascara(texto);
  return `${t.substr(0, 2)}.${t.substr(2, 3)}-${t.substr(5, 3)}`;
}

export function dinheiroPorExtenso(numero: number): string {
  const ex = [
    ['zero','um','dois','três','quatro','cinco','seis','sete','oito','nove','dez','onze','doze','treze','quatorze','quinze','dezesseis','dezessete','dezoito','dezenove'],
    ['dez','vinte','trinta','quarenta','cinquenta','sessenta','setenta','oitenta','noventa'],
    ['cem','cento','duzentos','trezentos','quatrocentos','quinhentos','seiscentos','setecentos','oitocentos','novecentos'],
    ['mil','milhão','bilhão','trilhão','quadrilhão','quintilhão','sextilhão','setilhão','octilhão','nonilhão','decilhão','undecilhão','dodecilhão','tredecilhão','quatrodecilhão','quindecilhão','sedecilhão','septendecilhão','octencilhão','nonencilhão'],
  ];

  let numStr = numero.toString().replace('.', ',');
  const c = true;
  const e = ' e ';
  const $ = 'real';
  const d = 'centavo';

  const n = numStr.replace(c ? /[^,\d]/g : /\D/g, '').split(',');
  const r: string[] = [];

  for (let f = n.length - 1, j = -1; ++j <= f;) {
    let s: string[] = [];
    if (j) n[j] = (('.' + n[j]) as unknown as number * 1).toFixed(2).slice(2);
    const v = n[j];
    const l = v.length;
    const a = (v.slice(l % 3).match(/\d{3}/g) || []);
    const parts = l % 3 ? [v.slice(0, l % 3), ...a] : [...a];
    if (!parts.length) continue;

    for (let ai = -1, pl = parts.length; ++ai < pl;) {
      const i = parts[ai] as unknown as number * 1;
      if (!i) continue;
      let t = '';
      if (i % 100 < 20) t += ex[0][i % 100];
      else {
        t += ex[1][(Math.floor(i % 100 / 10)) - 1];
        if (i % 10) t += e + ex[0][i % 10];
      }
      const hundreds = i < 100 ? t : !(i % 100) ? ex[2][i === 100 ? 0 : Math.floor(i / 100)] : ex[2][Math.floor(i / 100)] + e + t;
      const tail = pl - ai - 2;
      s.push(hundreds + (tail > -1 ? ' ' + (i > 1 && tail > 0 ? ex[3][tail].replace('?o', '?es') : ex[3][tail]) : ''));
    }

    const aStr = s.length > 1 ? (() => { const last = s.pop()!; return s.join(' ') + e + last; })() : s.join('') || ((!j && (Number(n[j + 1]) > 0) || r.length) ? '' : ex[0][0]);
    if (aStr) r.push(aStr + (c ? (' ' + (Number(v) > 1 ? j ? d + 's' : (/0{6,}$/.test(n[0]) ? 'de ' : '') + $.replace('l', 'is') : j ? d : $)) : ''));
  }

  const resultado = r.join(e);
  return resultado === 'zero real' ? 'zero reais' : resultado;
}
