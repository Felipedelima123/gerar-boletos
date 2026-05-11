var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod2) => __copyProps(__defProp({}, "__esModule", { value: true }), mod2);

// src/core/utils/string.ts
function pad(str, length, padStr, type) {
  const s = str == null ? "" : String(str);
  const len = ~~length;
  let padlen = 0;
  let p = padStr || " ";
  if (p.length > 1) p = p.charAt(0);
  function strRepeat(c, qty) {
    if (qty < 1) return "";
    let result = "";
    let q = qty;
    let ch = c;
    while (q > 0) {
      if (q & 1) result += ch;
      q >>= 1;
      ch += ch;
    }
    return result;
  }
  switch (type) {
    case "right":
      padlen = len - s.length;
      return s + strRepeat(p, padlen);
    case "both":
      padlen = len - s.length;
      return strRepeat(p, Math.ceil(padlen / 2)) + s + strRepeat(p, Math.floor(padlen / 2));
    default:
      padlen = len - s.length;
      return strRepeat(p, padlen) + s;
  }
}
function insert(string, index, value) {
  return [string.substring(0, index), value, string.substring(index)].join("");
}
var init_string = __esm({
  "src/core/utils/string.ts"() {
    "use strict";
  }
});

// src/core/utils/date.ts
import { parse, format, isValid } from "date-fns";
function isValidDate(date) {
  return date instanceof Date && isValid(date);
}
var init_date = __esm({
  "src/core/utils/date.ts"() {
    "use strict";
  }
});

// src/core/utils/array.ts
function series(from, to) {
  let params = [from, to];
  if (from > to) params = [to, from];
  const result = [];
  while (params[0] <= params[1]) {
    result.push(params[0]++);
  }
  return from > to ? result.reverse() : result;
}
var init_array = __esm({
  "src/core/utils/array.ts"() {
    "use strict";
  }
});

// src/core/utils/math.ts
function mod(valueOrOptions, factors, divider, direction) {
  let value;
  let reduceSummationTerms = false;
  let cumplimentaryToDivider = false;
  if (typeof valueOrOptions === "object") {
    value = valueOrOptions.value;
    factors = valueOrOptions.factors;
    divider = valueOrOptions.divider;
    direction = valueOrOptions.direction;
    reduceSummationTerms = valueOrOptions.reduceSummationTerms ?? false;
    cumplimentaryToDivider = valueOrOptions.cumplimentaryToDivider ?? false;
  } else {
    value = valueOrOptions;
  }
  if (divider === void 0) divider = 11;
  if (factors === void 0) factors = series(2, 9);
  if (direction === void 0) direction = "rightToLeft";
  const reduceMethod = direction === "leftToRight" ? "reduce" : "reduceRight";
  let i = 0;
  const facs = factors;
  let result = value.split("")[reduceMethod]((last, current) => {
    if (i > facs.length - 1) i = 0;
    let total = facs[i++] * parseInt(current, 10);
    if (reduceSummationTerms) {
      total = total.toString().split("").map(Number).reduce((a, b) => a + b, 0);
    }
    return total + last;
  }, 0) % divider;
  if (cumplimentaryToDivider) {
    result = divider - result;
  }
  return result;
}
var init_math = __esm({
  "src/core/utils/math.ts"() {
    "use strict";
    init_array();
  }
});

// src/core/utils/validacoes.ts
var validacoes_exports = {};
__export(validacoes_exports, {
  eCep: () => eCep,
  eCnpj: () => eCnpj,
  eCpf: () => eCpf,
  eEan: () => eEan,
  eFilial: () => eFilial,
  eMatriz: () => eMatriz,
  eNit: () => eNit,
  ePisPasep: () => ePisPasep,
  ePlaca: () => ePlaca,
  eRegistroNacional: () => eRegistroNacional,
  eTituloDeEleitor: () => eTituloDeEleitor
});
function eTituloDeEleitor(tituloDeEleitor) {
  if (typeof tituloDeEleitor !== "string") return false;
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
    const estados = {
      1: "SP",
      2: "MG",
      3: "RJ",
      4: "RS",
      5: "BA",
      6: "PR",
      7: "CE",
      8: "PE",
      9: "SC",
      10: "GO",
      11: "MA",
      12: "PB",
      13: "PA",
      14: "ES",
      15: "PI",
      16: "RN",
      17: "AL",
      18: "MT",
      19: "MS",
      20: "DF",
      21: "SE",
      22: "AM",
      23: "RS",
      24: "AC",
      25: "AP",
      26: "RR",
      27: "TO",
      28: "ZZ"
    };
    return estados[estado] || false;
  }
  return false;
}
function eEan(ean) {
  if (typeof ean !== "string" || !/^(?:\d{8}|\d{12,14})$/.test(ean)) return false;
  const digits = ean.split("").map(Number);
  let peso = 1;
  const digitoVerificador = digits.pop();
  const soma = digits.reduceRight((anterior, atual) => {
    peso = 4 - peso;
    return anterior + atual * peso;
  }, 0);
  const calculado = soma + (10 - soma % 10) % 10 - soma;
  return digitoVerificador === calculado;
}
function eRegistroNacional(rn, tipo) {
  if (typeof rn !== "string") return false;
  const cleaned = removerMascara(rn);
  if (typeof tipo === "undefined") {
    if (cleaned.length === 14 && eCnpj(cleaned)) return "cnpj";
    if (cleaned.length === 11 && eCpf(cleaned)) return "cpf";
  } else if (["cpf", "cnpj"].includes(tipo.toLowerCase())) {
    const fns = { cpf: eCpf, cnpj: eCnpj };
    const fn = fns[tipo.toLowerCase()];
    if (fn && fn(cleaned)) return tipo;
  }
  return false;
}
function eCnpj(cnpj2) {
  if (typeof cnpj2 !== "string") return false;
  const c = removerMascara(cnpj2);
  if (c.length !== 14) return false;
  const base = c.substring(0, 12);
  if (casosTriviaisDeCnpjFalsos.includes(base)) return false;
  const primeiroResto = mod(base);
  const primeiroDigito = primeiroResto < 2 ? 0 : 11 - primeiroResto;
  const segundoResto = mod(base + primeiroDigito);
  const segundoDigito = segundoResto < 2 ? 0 : 11 - segundoResto;
  return c === base + primeiroDigito + segundoDigito;
}
function eMatriz(cnpj2) {
  if (!eCnpj(cnpj2)) return null;
  const matches = regexMatrizFilial.exec(removerMascara(cnpj2));
  return matches !== null && matches.length === 2 && matches[1] === "0001";
}
function eFilial(cnpj2) {
  if (!eCnpj(cnpj2)) return null;
  const matches = regexMatrizFilial.exec(removerMascara(cnpj2));
  if (matches !== null && matches.length === 2 && matches[1] !== "0001") {
    return parseInt(matches[1], 10);
  }
  return false;
}
function eCpf(cpf2) {
  if (typeof cpf2 !== "string") return false;
  const c = removerMascara(cpf2);
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
function ePisPasep(pisPasep2) {
  if (typeof pisPasep2 !== "string") return false;
  const p = removerMascara(pisPasep2);
  if (p.length !== 11) return false;
  const base = p.substring(0, 10);
  const multiplicadores = [3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const resto = mod(base, multiplicadores, 11, "leftToRight");
  const subtracao = 11 - resto;
  const digito = subtracao === 10 || subtracao === 11 ? 0 : subtracao;
  return p === base + digito;
}
function ePlaca(placa2) {
  return regexPlaca.test(placa2);
}
function eCep(cep2) {
  return regexCep.test(cep2);
}
var casosTriviaisDeCnpjFalsos, regexMatrizFilial, eNit, regexPlaca, regexCep;
var init_validacoes = __esm({
  "src/core/utils/validacoes.ts"() {
    "use strict";
    init_formatacoes();
    init_math();
    casosTriviaisDeCnpjFalsos = [
      "000000000000",
      "111111111111",
      "222222222222",
      "333333333333",
      "444444444444",
      "555555555555",
      "666666666666",
      "777777777777",
      "888888888888",
      "999999999999"
    ];
    regexMatrizFilial = /^[0-9]{8}([0-9]{4})[0-9]{2}$/;
    eNit = ePisPasep;
    regexPlaca = /^[a-zA-Z]{3}-?[0-9]{4}$/;
    regexCep = /^\d{2}\.?\d{3}-?\d{3}$/;
  }
});

// src/core/utils/formatacoes.ts
var formatacoes_exports = {};
__export(formatacoes_exports, {
  boletoBancario: () => boletoBancario,
  cep: () => cep,
  cnpj: () => cnpj,
  cpf: () => cpf,
  data: () => data,
  dataEHora: () => dataEHora,
  dinheiro: () => dinheiro,
  dinheiroPorExtenso: () => dinheiroPorExtenso,
  hora: () => hora,
  linhaDigitavel: () => linhaDigitavel,
  nit: () => nit,
  numero: () => numero,
  pisPasep: () => pisPasep,
  placa: () => placa,
  registroNacional: () => registroNacional,
  removerMascara: () => removerMascara
});
function removerMascara(texto) {
  if (typeof texto !== "string") return texto;
  return texto.trim().replace(/\(/g, "").replace(/\)/g, "").replace(/\./g, "").replace(/\//g, "").replace(/-/g, "").replace(/\s/g, "").replace(/R\$/g, "").replace(/%/g, "").trim();
}
function numero(n, args) {
  if (isNaN(n)) return String(n);
  const casasOriginais = n.toString().split(".")[1]?.length ?? 0;
  const opts = Object.assign({ separadorDecimal: ",", separadorDeMilhar: ".", casasDecimais: casasOriginais }, args);
  const re = `\\d(?=(\\d{3})+${opts.casasDecimais > 0 ? "\\D" : "$"})`;
  let num = parseFloat(n.toFixed(opts.casasDecimais)).toFixed(opts.casasDecimais);
  if (opts.separadorDecimal) num = num.replace(".", opts.separadorDecimal);
  return num.replace(new RegExp(re, "g"), `$&${opts.separadorDeMilhar}`);
}
function dinheiro(n, args) {
  if (isNaN(n)) return String(n);
  const opts = Object.assign({ simbolo: "R$ ", posicionamento: "esquerda" }, args);
  const formatted = numero(n, opts);
  return opts.posicionamento === "esquerda" ? opts.simbolo + formatted : formatted + opts.simbolo;
}
function linhaDigitavel(valor) {
  const v = removerMascara(valor);
  if (v.length !== 47) return v;
  let r = v;
  r = insert(r, 5, ".");
  r = insert(r, 11, " ");
  r = insert(r, 17, ".");
  r = insert(r, 24, " ");
  r = insert(r, 30, ".");
  r = insert(r, 37, " ");
  r = insert(r, 39, " ");
  return r;
}
function hora(data2, args) {
  if (!isValidDate(data2)) return data2;
  const opts = Object.assign({ comSegundos: true }, args);
  const componentes = [pad(data2.getHours(), 2, "0"), pad(data2.getMinutes(), 2, "0")];
  if (opts.comSegundos) componentes.push(pad(data2.getSeconds(), 2, "0"));
  return componentes.join(":");
}
function data(d) {
  if (!isValidDate(d)) return d;
  return [pad(d.getDate(), 2, "0"), pad(d.getMonth() + 1, 2, "0"), d.getFullYear()].join("/");
}
function dataEHora(d, args) {
  if (!isValidDate(d)) return d;
  return [data(d), hora(d, args)].join(" ");
}
function cnpj(texto) {
  const t = texto.trim();
  if (t.length > 14) return texto;
  const c = removerMascara(t);
  if (c.length !== 14) return texto;
  return `${c.substr(0, 2)}.${c.substr(2, 3)}.${c.substr(5, 3)}/${c.substr(8, 4)}-${c.substr(12, 2)}`;
}
function cpf(texto) {
  const t = texto.trim();
  if (t.length > 11) return texto;
  const c = removerMascara(t);
  if (c.length !== 11) return texto;
  return `${c.substr(0, 3)}.${c.substr(3, 3)}.${c.substr(6, 3)}-${c.substr(9, 2)}`;
}
function pisPasep(texto) {
  const t = texto.trim();
  if (t.length > 11) return texto;
  const c = removerMascara(t);
  if (c.length !== 11) return texto;
  return `${c.substr(0, 3)}.${c.substr(3, 4)}.${c.substr(7, 3)}-${c.substr(10, 1)}`;
}
function registroNacional(texto) {
  const { eRegistroNacional: eRegistroNacional2 } = (init_validacoes(), __toCommonJS(validacoes_exports));
  const tipo = eRegistroNacional2(texto);
  if (!tipo) return texto;
  const fns = { cpf, cnpj };
  return fns[tipo] ? fns[tipo](texto) : texto;
}
function placa(texto) {
  const t = texto.trim().replace(/-/g, "");
  return `${t.substr(0, 3).toUpperCase()}-${t.substr(3, 4)}`;
}
function cep(texto) {
  const t = removerMascara(texto);
  return `${t.substr(0, 2)}.${t.substr(2, 3)}-${t.substr(5, 3)}`;
}
function dinheiroPorExtenso(numero2) {
  const ex = [
    ["zero", "um", "dois", "tr\xEAs", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"],
    ["dez", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"],
    ["cem", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"],
    ["mil", "milh\xE3o", "bilh\xE3o", "trilh\xE3o", "quadrilh\xE3o", "quintilh\xE3o", "sextilh\xE3o", "setilh\xE3o", "octilh\xE3o", "nonilh\xE3o", "decilh\xE3o", "undecilh\xE3o", "dodecilh\xE3o", "tredecilh\xE3o", "quatrodecilh\xE3o", "quindecilh\xE3o", "sedecilh\xE3o", "septendecilh\xE3o", "octencilh\xE3o", "nonencilh\xE3o"]
  ];
  let numStr = numero2.toString().replace(".", ",");
  const c = true;
  const e = " e ";
  const $ = "real";
  const d = "centavo";
  const n = numStr.replace(c ? /[^,\d]/g : /\D/g, "").split(",");
  const r = [];
  for (let f = n.length - 1, j = -1; ++j <= f; ) {
    let s = [];
    if (j) n[j] = (("." + n[j]) * 1).toFixed(2).slice(2);
    const v = n[j];
    const l = v.length;
    const a = v.slice(l % 3).match(/\d{3}/g) || [];
    const parts = l % 3 ? [v.slice(0, l % 3), ...a] : [...a];
    if (!parts.length) continue;
    for (let ai = -1, pl = parts.length; ++ai < pl; ) {
      const i = parts[ai] * 1;
      if (!i) continue;
      let t = "";
      if (i % 100 < 20) t += ex[0][i % 100];
      else {
        t += ex[1][Math.floor(i % 100 / 10) - 1];
        if (i % 10) t += e + ex[0][i % 10];
      }
      const hundreds = i < 100 ? t : !(i % 100) ? ex[2][i === 100 ? 0 : Math.floor(i / 100)] : ex[2][Math.floor(i / 100)] + e + t;
      const tail = pl - ai - 2;
      s.push(hundreds + (tail > -1 ? " " + (i > 1 && tail > 0 ? ex[3][tail].replace("?o", "?es") : ex[3][tail]) : ""));
    }
    const aStr = s.length > 1 ? (() => {
      const last = s.pop();
      return s.join(" ") + e + last;
    })() : s.join("") || (!j && Number(n[j + 1]) > 0 || r.length ? "" : ex[0][0]);
    if (aStr) r.push(aStr + (c ? " " + (Number(v) > 1 ? j ? d + "s" : (/0{6,}$/.test(n[0]) ? "de " : "") + $.replace("l", "is") : j ? d : $) : ""));
  }
  const resultado = r.join(e);
  return resultado === "zero real" ? "zero reais" : resultado;
}
var boletoBancario, nit;
var init_formatacoes = __esm({
  "src/core/utils/formatacoes.ts"() {
    "use strict";
    init_string();
    init_date();
    boletoBancario = linhaDigitavel;
    nit = pisPasep;
  }
});

// src/core/index.ts
import fs from "fs";

// src/core/boleto.ts
init_string();
init_formatacoes();
init_validacoes();
import crypto from "crypto";
import { format as format2, parse as parse2 } from "date-fns";

// src/core/gerador-linha-digitavel.ts
init_formatacoes();

// src/core/valida-codigo-barras.ts
function validar(codigoDeBarras) {
  if (codigoDeBarras.length !== 44) {
    throw new Error(
      [
        "Erro na gera\xE7\xE3o do c\xF3digo de barras.",
        "N\xFAmero de d\xEDgitos diferente de 44.",
        "Verifique se todos os dados foram preenchidos corretamente.",
        `Tamanho encontrado: ${codigoDeBarras.length}`,
        `Valor encontrado: ${codigoDeBarras}`
      ].join(" ")
    );
  }
}

// src/core/gerador-digito.ts
init_math();
init_array();
function mod10(campo) {
  const digito = mod({
    value: campo,
    factors: [2, 1],
    divider: 10,
    direction: "rightToLeft",
    cumplimentaryToDivider: true,
    reduceSummationTerms: true
  });
  return digito === 10 ? 0 : digito;
}
function mod11(codigoDeBarras, substituicoes) {
  const subs = substituicoes ?? { de: [0, 1, 10, 11], para: 1 };
  if (!Array.isArray(subs.de)) subs.de = [subs.de];
  let digito = mod({
    value: codigoDeBarras,
    factors: series(2, 9),
    cumplimentaryToDivider: true
  });
  if (subs.de.includes(digito)) {
    digito = subs.para;
  }
  return digito;
}

// src/core/gerador-linha-digitavel.ts
function gerarLinhaDigitavel(codigoDeBarras, banco) {
  if (typeof codigoDeBarras === "string" && codigoDeBarras.length === 47 && !banco) {
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
  const ld = [];
  ld.push(codigoDeBarras.substring(0, 3));
  ld.push(codigoDeBarras.substring(3, 4));
  ld.push(codigoDeBarras.substring(19, 24));
  ld.push(mod10(ld.join("")));
  ld.push(codigoDeBarras.substring(24, 34));
  ld.push(mod10(ld.join("").substring(10, 20)));
  ld.push(codigoDeBarras.substring(34));
  ld.push(mod10(ld.join("").substring(21, 31)));
  ld.push(codigoDeBarras.substring(4, 5));
  ld.push(codigoDeBarras.substring(5, 9));
  ld.push(codigoDeBarras.substring(9, 19));
  return linhaDigitavel(ld.join(""));
}

// src/core/boleto.ts
var Endereco = class _Endereco {
  constructor() {
    this._logradouro = "";
    this._bairro = "";
    this._cep = "";
    this._cidade = "";
    this._uf = "";
  }
  getLogradouro() {
    return this._logradouro;
  }
  comLogradouro(v) {
    this._logradouro = v;
    return this;
  }
  getBairro() {
    return this._bairro;
  }
  comBairro(v) {
    this._bairro = v;
    return this;
  }
  getCep() {
    return this._cep;
  }
  comCep(v) {
    this._cep = v;
    return this;
  }
  getCepFormatado() {
    return cep(this._cep);
  }
  getCidade() {
    return this._cidade;
  }
  comCidade(v) {
    this._cidade = v;
    return this;
  }
  getUf() {
    return this._uf;
  }
  comUf(v) {
    this._uf = v;
    return this;
  }
  getPrimeiraLinha() {
    let r = "";
    if (this._logradouro) r += this._logradouro;
    if (this._logradouro && this._bairro) r += ", ";
    if (this._bairro) r += this._bairro;
    return r;
  }
  getSegundaLinha() {
    let r = "";
    if (this._cidade) r += this._cidade;
    if (this._cidade && this._uf) r += "/";
    if (this._uf) r += this._uf;
    if (r && this._cep) r += " \u2014 ";
    if (this._cep) r += this.getCepFormatado();
    return r;
  }
  getEnderecoCompleto() {
    return [this._logradouro, this._bairro, this._cep ? this.getCepFormatado() : "", this._cidade, this._uf].filter(Boolean).join(" ");
  }
  static novoEndereco() {
    return new _Endereco();
  }
};
var Pagador = class _Pagador {
  constructor() {
    this._nome = "";
    this._registroNacional = "";
    this._documento = "";
    this._endereco = null;
  }
  getNome() {
    return this._nome;
  }
  comNome(v) {
    this._nome = v;
    return this;
  }
  getNomeSomente() {
    return (this._nome || "").toUpperCase();
  }
  getIdentificacao() {
    let id = this._nome;
    const tipo = this.temRegistroNacional();
    if (tipo) {
      id += ` (${tipo.toUpperCase()}: ${this.getRegistroNacionalFormatado()})`;
    }
    return (id || "").toUpperCase();
  }
  getRegistroNacional() {
    return this._registroNacional;
  }
  comRegistroNacional(v) {
    this._registroNacional = v;
    return this;
  }
  comCPF(v) {
    return this.comRegistroNacional(v);
  }
  comCNPJ(v) {
    return this.comRegistroNacional(v);
  }
  getRegistroNacionalFormatado() {
    return registroNacional(this._registroNacional);
  }
  temRegistroNacional() {
    return eRegistroNacional(this._registroNacional);
  }
  getDocumento() {
    return this._documento;
  }
  comDocumento(v) {
    this._documento = v;
    return this;
  }
  getEndereco() {
    return this._endereco;
  }
  comEndereco(v) {
    this._endereco = v;
    return this;
  }
  static novoPagador() {
    return new _Pagador().comEndereco(Endereco.novoEndereco());
  }
};
var Beneficiario = class _Beneficiario {
  constructor() {
    this._nome = "";
    this._registroNacional = "";
    this._agencia = "";
    this._digitoAgencia = "";
    this._codigo = "";
    this._digitoCodigoBeneficiario = "";
    this._carteira = "";
    this._nossoNumero = "";
    this._digitoNossoNumero = "";
    this._numeroConvenio = "";
    this._documento = "";
    this._endereco = null;
    this._posto = "";
  }
  getNome() {
    return this._nome;
  }
  comNome(v) {
    this._nome = v;
    return this;
  }
  getIdentificacao() {
    let id = this._nome;
    const tipo = this.temRegistroNacional();
    if (tipo) {
      id += ` (${tipo.toUpperCase()}: ${this.getRegistroNacionalFormatado()})`;
    }
    return (id || "").toUpperCase();
  }
  getIdentificacaoCompleta() {
    const id = this.getIdentificacao();
    const end = this.getEndereco()?.getEnderecoCompleto() ?? "";
    return [id, end].filter(Boolean).join("\n");
  }
  getRegistroNacional() {
    return this._registroNacional;
  }
  comRegistroNacional(v) {
    this._registroNacional = v;
    return this;
  }
  comCPF(v) {
    return this.comRegistroNacional(v);
  }
  comCNPJ(v) {
    return this.comRegistroNacional(v);
  }
  getRegistroNacionalFormatado() {
    return registroNacional(this._registroNacional);
  }
  temRegistroNacional() {
    return eRegistroNacional(this._registroNacional);
  }
  getAgencia() {
    return this._agencia;
  }
  comAgencia(v) {
    this._agencia = v;
    return this;
  }
  getAgenciaFormatada() {
    return pad(this._agencia, 4, "0");
  }
  getDigitoAgencia() {
    return this._digitoAgencia;
  }
  comDigitoAgencia(v) {
    this._digitoAgencia = v;
    return this;
  }
  getCodigoBeneficiario() {
    return this._codigo;
  }
  comCodigoBeneficiario(v) {
    this._codigo = v;
    return this;
  }
  getDigitoCodigoBeneficiario() {
    return this._digitoCodigoBeneficiario;
  }
  comDigitoCodigoBeneficiario(v) {
    this._digitoCodigoBeneficiario = v;
    return this;
  }
  getCarteira() {
    return this._carteira;
  }
  comCarteira(v) {
    this._carteira = v;
    return this;
  }
  getNossoNumero() {
    return this._nossoNumero;
  }
  comNossoNumero(v) {
    this._nossoNumero = v;
    return this;
  }
  getDigitoNossoNumero() {
    return this._digitoNossoNumero;
  }
  comDigitoNossoNumero(v) {
    this._digitoNossoNumero = v;
    return this;
  }
  getNumeroConvenio() {
    return this._numeroConvenio;
  }
  comNumeroConvenio(v) {
    this._numeroConvenio = v;
    return this;
  }
  getDocumento() {
    return this._documento;
  }
  comDocumento(v) {
    this._documento = v;
    return this;
  }
  getEndereco() {
    return this._endereco;
  }
  comEndereco(v) {
    this._endereco = v;
    return this;
  }
  getCodposto() {
    return this._posto;
  }
  comCodPosto(v) {
    this._posto = v;
    return this;
  }
  static novoBeneficiario() {
    return new _Beneficiario();
  }
};
function removerHoras(data2) {
  data2.setHours(0, 0, 0, 0);
  return data2;
}
function formatarData(data2) {
  return [pad(data2.getDate(), 2, "0"), pad(data2.getMonth() + 1, 2, "0"), data2.getFullYear()].join("/");
}
function validarData(data2) {
  const ano = data2.getFullYear();
  return ano >= 1997 && ano < 2999;
}
function parseDateInput(input, locate = "usa") {
  if (input instanceof Date) {
    if (locate === "brl") {
      return new Date(format2(input, "yyyy-MM-dd"));
    }
    return input;
  }
  if (locate === "brl") {
    return parse2(input, "dd-MM-yyyy", /* @__PURE__ */ new Date());
  }
  return new Date(input);
}
var Datas = class _Datas {
  comDocumento(input, locate = "usa") {
    const d = parseDateInput(input, locate);
    if (!validarData(d)) throw new Error("O ano do documento deve ser maior que 1997 e menor que 2999");
    this._documento = removerHoras(d);
    return this;
  }
  getDocumento() {
    return this._documento;
  }
  getDocumentoFormatado() {
    return formatarData(this._documento);
  }
  comProcessamento(input, locate = "usa") {
    const d = parseDateInput(input, locate);
    if (!validarData(d)) throw new Error("O ano do documento deve ser maior que 1997 e menor que 2999");
    this._processamento = removerHoras(d);
    return this;
  }
  getProcessamento() {
    return this._processamento;
  }
  getProcessamentoFormatado() {
    return formatarData(this._processamento);
  }
  comVencimento(input, locate = "usa") {
    const d = parseDateInput(input, locate);
    if (!validarData(d)) throw new Error("O ano do documento deve ser maior que 1997 e menor que 2999");
    this._vencimento = removerHoras(d);
    return this;
  }
  getVencimento() {
    return this._vencimento;
  }
  getVencimentoFormatado() {
    return formatarData(this._vencimento);
  }
  static novasDatas() {
    return new _Datas();
  }
};
var DATA_BASE = new Date(1997, 10 - 1, 7);
function formatarValor(valor) {
  const valorArray = valor.toString().split(".");
  const inteiros = valorArray[0];
  let decimais = valorArray.length > 1 ? valorArray[1] : "00";
  decimais = pad(decimais, 2, "0", "right").substr(0, 2);
  return pad(inteiros + decimais, 10, "0");
}
function formatarBRL(valor) {
  let zeroAEsquerda = true;
  let i = -1;
  const intPart = valor.substr(0, 8).split("").reduce((acc, cur) => {
    if (cur === "0" && zeroAEsquerda) return acc;
    zeroAEsquerda = false;
    return acc + cur;
  }, "");
  const formatted = intPart.split("").reduceRight((acc, cur) => {
    i++;
    return cur + (i !== 0 && i % 3 === 0 ? "." : "") + acc;
  }, "") || "0";
  return `R$ ${formatted},${valor.substr(8, 2)}`;
}
var Boleto = class _Boleto {
  constructor() {
    this._valorBoleto = "0";
    this._valorCobrado = "0";
    this._valorDescontos = "0";
    this._valorDeducoes = "0";
    this._valorMulta = "0";
    this._valorAcrescimos = "0";
    this._valorMoraMultaJuros = "0";
    this._numeroDoDocumento = "";
    this._especieDocumento = "DV";
    this._especieMoeda = "R$";
    this._codigoEspecieMoeda = "9";
    this._aceite = false;
    this._instrucoes = [];
    this._descricoes = [];
    this._informativo = [];
    this._locaisDePagamento = [];
    this._quantidadeDeMoeda = "";
    this._idUnico = "";
  }
  getBanco() {
    return this._banco;
  }
  comBanco(v) {
    this._banco = v;
    return this;
  }
  getPagador() {
    return this._pagador;
  }
  comPagador(v) {
    this._pagador = v;
    return this;
  }
  getBeneficiario() {
    return this._beneficiario;
  }
  comBeneficiario(v) {
    this._beneficiario = v;
    return this;
  }
  getDatas() {
    return this._datas;
  }
  comDatas(v) {
    this._datas = v;
    return this;
  }
  getFatorVencimento() {
    const vencimento = this._datas.getVencimento();
    const diferencaEmDias = (vencimento.getTime() - DATA_BASE.getTime()) / (1e3 * 60 * 60 * 24);
    if (diferencaEmDias > 9999) throw new Error("Data fora do formato aceito");
    return Math.floor(diferencaEmDias).toString();
  }
  getEspecieMoeda() {
    return this._especieMoeda;
  }
  comEspecieMoeda(v) {
    this._especieMoeda = v;
    return this;
  }
  getCodigoEspecieMoeda() {
    return this._codigoEspecieMoeda;
  }
  comCodigoEspecieMoeda(v) {
    this._codigoEspecieMoeda = v.toString();
    return this;
  }
  getAceite() {
    return this._aceite;
  }
  getAceiteFormatado() {
    return this._aceite ? "N" : "S";
  }
  comAceite(v) {
    this._aceite = v;
    return this;
  }
  getEspecieDocumento() {
    return this._especieDocumento;
  }
  comEspecieDocumento(v) {
    this._especieDocumento = v;
    return this;
  }
  getValorFormatado() {
    return formatarValor(this._valorBoleto);
  }
  getValorFormatadoBRL() {
    return formatarBRL(this.getValorFormatado());
  }
  getValorBoleto() {
    return this._valorBoleto;
  }
  comValorBoleto(v) {
    const val = Number(v);
    if (val < 0) throw new Error("Valor deve ser maior ou igual a zero");
    if (val > 9999999999e-2) throw new Error("Valor deve ser menor do que noventa e nove milhoes");
    this._valorBoleto = String(v);
    return this;
  }
  getNumeroDoDocumento() {
    return this._numeroDoDocumento || "";
  }
  getNumeroDoDocumentoFormatado() {
    return pad(this._numeroDoDocumento || "", 4, "0");
  }
  comNumeroDoDocumento(v) {
    this._numeroDoDocumento = v;
    return this;
  }
  getInstrucoes() {
    return this._instrucoes || [];
  }
  comInstrucoes(v) {
    const arr = typeof v === "string" ? [v] : v;
    if (arr.length > 5) throw new Error("M\xE1ximo de cinco instru\xE7\xF5es permitidas");
    this._instrucoes = arr;
    return this;
  }
  getInformativo() {
    return this._informativo || [];
  }
  comInformativo(v) {
    const arr = typeof v === "string" ? [v] : v;
    if (arr.length > 5) throw new Error("M\xE1ximo de cinco instru\xE7\xF5es permitidas");
    this._informativo = arr;
    return this;
  }
  getLocaisDePagamento() {
    if (this._locaisDePagamento?.length) return this._locaisDePagamento;
    if (this._banco?.getLocaisDePagamentoPadrao) return this._banco.getLocaisDePagamentoPadrao();
    return [];
  }
  comLocaisDePagamento(v) {
    const arr = typeof v === "string" ? [v] : v;
    if (arr.length > 2) throw new Error("M\xE1ximo de dois locais de pagamento permitidos");
    this._locaisDePagamento = arr;
    return this;
  }
  getValorDescontosFormatadoBRL() {
    if (!Number(this._valorDescontos)) return "";
    return formatarBRL(formatarValor(this._valorDescontos));
  }
  getValorDescontos() {
    return this._valorDescontos || "0";
  }
  comValorDescontos(v) {
    this._valorDescontos = String(v);
    return this;
  }
  getValorDeducoesFormatadoBRL() {
    if (!Number(this._valorDeducoes)) return "";
    return formatarBRL(formatarValor(this._valorDeducoes));
  }
  getValorDeducoes() {
    return this._valorDeducoes || "0";
  }
  comValorDeducoes(v) {
    this._valorDeducoes = String(v);
    return this;
  }
  getValorMoraMultaJuros() {
    return this._valorMoraMultaJuros || "0";
  }
  getValorMoraMultaJurosFormatadoBRL() {
    if (!Number(this._valorMoraMultaJuros)) return "";
    return formatarBRL(formatarValor(this._valorMoraMultaJuros));
  }
  comValorMoraMultaJuros(v) {
    this._valorMoraMultaJuros = String(v);
    return this;
  }
  getValorCobrado() {
    return this._valorCobrado || "0";
  }
  getValorCobradoFormatadoBRL() {
    if (!Number(this._valorCobrado)) return "";
    return formatarBRL(formatarValor(this._valorCobrado));
  }
  comValorCobrado(v) {
    this._valorCobrado = String(v);
    return this;
  }
  comCodigoBarras(v) {
    this._codigoBarras = v;
    return this;
  }
  comLinhaDigitavel(v) {
    this._linhaDigitavel = v;
    return this;
  }
  /** Aceita string EMV (retrocompat) ou objeto {emv, instrucoes?} */
  comPixEmv(v) {
    if (typeof v === "string") {
      this._pixEmv = v;
      this._qrCode = v;
    } else if (v && typeof v === "object") {
      if (!v.emv) throw new Error('PIX EMV objeto deve conter propriedade "emv"');
      this._pixEmv = v;
      this._qrCode = v.emv;
    } else {
      this._pixEmv = void 0;
      this._qrCode = void 0;
    }
    return this;
  }
  /** @deprecated use comPixEmv() */
  comQrCode(v) {
    return this.comPixEmv(v);
  }
  getPixEmv() {
    return this._pixEmv;
  }
  getPixEmvString() {
    if (!this._pixEmv) return void 0;
    return typeof this._pixEmv === "string" ? this._pixEmv : this._pixEmv.emv;
  }
  getPixInstrucoes() {
    if (!this._pixEmv || typeof this._pixEmv === "string") return [];
    return this._pixEmv.instrucoes ?? [];
  }
  comIdUnico() {
    this._idUnico = crypto.randomBytes(16).toString("hex");
    return this;
  }
  getLinhaDigitavelFormatado() {
    const numeroDocumento = this.getNumeroDoDocumentoFormatado();
    const linha = gerarLinhaDigitavel(this._banco.geraCodigoDeBarrasPara(this), this._banco);
    return { linha, numeroDocumento };
  }
  static novoBoleto() {
    return new _Boleto().comEspecieMoeda("R$").comCodigoEspecieMoeda(9).comAceite(false).comEspecieDocumento("DV");
  }
};
var especiesDeDocumento = {
  DMI: "Duplicata de Venda Mercantil por Indica\xE7\xE3o",
  DM: "Duplicata de Venda Mercantil",
  DSI: "Duplicata de Presta\xE7\xE3o de Servi\xE7os por Indica\xE7\xE3o de Comprovante",
  NP: "Nota Promiss\xF3ria",
  ME: "Mensalidade Escolar",
  DS: "Duplicata de Presta\xE7\xE3o de Servi\xE7os Original",
  CT: "Esp\xE9cie de Contrato",
  LC: "Letra de C\xE2mbio",
  CPS: "Conta de Presta\xE7\xE3o de Servi\xE7os de Profissional Liberal ou Declara\xE7\xE3o do Profissional",
  EC: "Encargos Condominiais",
  DD: "Documento de D\xEDvida",
  CCB: "C\xE9dula de Cr\xE9dito Banc\xE1rio",
  CBI: "C\xE9dula de Cr\xE9dito Banc\xE1rio por Indica\xE7\xE3o",
  CH: "Cheque",
  CM: "Contrato de M\xFAtuo",
  RA: "Recibo de Aluguel Para Pessoa Jur\xEDdica (Contrato Aluguel e Recibo)",
  CD: "Confiss\xE3o de D\xEDvida Apenas Para Fal\xEAncia de Declara\xE7\xE3o do Devedor",
  FS: "Fatura de Servi\xE7o",
  TA: "Termo de Acordo - Ex. A\xE7\xE3o Trabalhista",
  CC: "Contrato de C\xE2mbio",
  DV: "Diversos"
};

// src/core/stringify.ts
var BoletoStringify = class {
  static enderecoPagador(end) {
    const e = Endereco.novoEndereco();
    if (!end) return e;
    if (end.logradouro) e.comLogradouro(end.logradouro);
    if (end.bairro) e.comBairro(end.bairro);
    if (end.cidade) e.comCidade(end.cidade);
    if (end.estadoUF) e.comUf(end.estadoUF);
    if (end.cep) e.comCep(end.cep);
    return e;
  }
  static createPagador(p) {
    const pagador = Pagador.novoPagador().comNome(p.nome).comRegistroNacional(p.registroNacional);
    if (p.endereco) pagador.comEndereco(this.enderecoPagador(p.endereco));
    return pagador;
  }
  static createBeneficiario(b) {
    const rn = b.cnpj ?? b.cpf ?? b.registroNacional ?? "";
    const novoBeneficiario = Beneficiario.novoBeneficiario().comNome(b.nome).comRegistroNacional(rn).comCarteira(b.dadosBancarios.carteira).comAgencia(b.dadosBancarios.agencia).comDigitoAgencia(b.dadosBancarios.agenciaDigito ?? "").comCodigoBeneficiario(b.dadosBancarios.conta).comDigitoCodigoBeneficiario(b.dadosBancarios.contaDigito ?? "").comNossoNumero(b.dadosBancarios.nossoNumero).comDigitoNossoNumero(b.dadosBancarios.nossoNumeroDigito ?? "");
    if (b.dadosBancarios.convenio) novoBeneficiario.comNumeroConvenio(b.dadosBancarios.convenio);
    if (b.dadosBancarios.posto) novoBeneficiario.comCodPosto(b.dadosBancarios.posto);
    if (b.endereco) novoBeneficiario.comEndereco(this.enderecoPagador(b.endereco));
    return novoBeneficiario;
  }
  static createInstrucoes(instrucoes) {
    if (!instrucoes) return [];
    return Array.isArray(instrucoes) ? instrucoes : [instrucoes];
  }
  static createInformativo(informativo) {
    if (!informativo) return [];
    return Array.isArray(informativo) ? informativo : [informativo];
  }
};

// src/core/gerador.ts
import path2 from "path";
import { Base64Encode } from "base64-stream";

// src/core/pix-renderer.ts
import path from "path";
import QRCode from "qrcode";
var PIX_LOGO = path.resolve(process.cwd(), "lib/boleto/imagens/pix-logo.png");
var LOGO_SIZE = 55;
var QR_SIZE = 80;
var LOGO_QR_GAP = 8;
var LINE_SPACING = 10;
async function gerarQRCodeBuffer(emv) {
  const dataUrl = await QRCode.toDataURL(emv, { errorCorrectionLevel: "M", margin: 1 });
  return Buffer.from(dataUrl.replace(/^data:image\/png;base64,/, ""), "base64");
}
var PixRenderer = class {
  constructor(pdf, boleto, args, base) {
    this.pdf = pdf;
    this.boleto = boleto;
    this.args = args;
    this.base = base;
  }
  calcularPosicoes() {
    const { ajusteX, ajusteY } = this.args;
    const { margemDoSegundoBloco, larguraInstrucoes, tituloDaSetimaLinha } = this.base;
    const xInicio = ajusteX + margemDoSegundoBloco + larguraInstrucoes + 10;
    const yTopo = ajusteY + tituloDaSetimaLinha + 2;
    return {
      // Linha separadora vertical
      linhaX: xInicio - 5,
      linhaY1: yTopo - 5,
      linhaY2: yTopo + QR_SIZE + 10,
      // Logo PIX (lado esquerdo)
      logoX: xInicio,
      logoY: yTopo + (QR_SIZE - LOGO_SIZE) / 2,
      // centraliza verticalmente com o QR
      // QR Code (lado direito do logo)
      qrX: xInicio + LOGO_SIZE + LOGO_QR_GAP,
      qrY: yTopo,
      // Texto de instruções (abaixo de ambos)
      textoX: xInicio,
      textoY: yTopo + QR_SIZE + LINE_SPACING,
      textoWidth: LOGO_SIZE + LOGO_QR_GAP + QR_SIZE
    };
  }
  renderizarSeparador(pos) {
    this.pdf.moveTo(pos.linhaX, pos.linhaY1).lineTo(pos.linhaX, pos.linhaY2).stroke("#aaaaaa");
  }
  renderizarLogoPix(pos) {
    try {
      this.pdf.image(PIX_LOGO, pos.logoX, pos.logoY, { width: LOGO_SIZE, height: LOGO_SIZE });
    } catch {
    }
  }
  async renderizarQRCode(pos, emv) {
    const qrBuffer = await gerarQRCodeBuffer(emv);
    this.pdf.image(qrBuffer, pos.qrX, pos.qrY, { width: QR_SIZE, height: QR_SIZE });
  }
  renderizarInstrucoes(pos, instrucoes) {
    instrucoes.slice(0, 3).forEach((linha, i) => {
      this.pdf.font("normal").fontSize(this.args.tamanhoDaFonte - 2).text(linha, pos.textoX, pos.textoY + i * LINE_SPACING, {
        lineBreak: false,
        width: pos.textoWidth,
        align: "center"
      });
    });
  }
  async render() {
    const emv = this.boleto.getPixEmvString();
    if (!emv) return;
    const instrucoes = this.boleto.getPixInstrucoes().length > 0 ? this.boleto.getPixInstrucoes() : ["Escaneie o QR Code", "ou use o copia e cola"];
    const pos = this.calcularPosicoes();
    this.renderizarSeparador(pos);
    this.renderizarLogoPix(pos);
    await this.renderizarQRCode(pos, emv);
    this.renderizarInstrucoes(pos, instrucoes);
  }
};

// src/core/gerador.ts
var PDFDocument = __require("pdfkit");
var FONTES_DIR = path2.resolve(process.cwd(), "lib/boleto/fontes");
var TIMES = path2.join(FONTES_DIR, "Times New Roman.ttf");
var TIMES_BOLD = path2.join(FONTES_DIR, "Times New Roman Bold.ttf");
var TIMES_ITALIC = path2.join(FONTES_DIR, "Times New Roman Italic.ttf");
var TIMES_BOLD_ITALIC = path2.join(FONTES_DIR, "Times New Roman Bold Italic.ttf");
var CODE25I = path2.join(FONTES_DIR, "Code25I.ttf");
var TESOURA = path2.resolve(process.cwd(), "lib/boleto/imagens/tesoura128.png");
var PDF_DEFAULTS = {
  ajusteY: -80,
  ajusteX: 0,
  autor: "",
  titulo: "",
  criador: "",
  tamanhoDaFonteDoTitulo: 8,
  tamanhoDaFonte: 10,
  tamanhoDaLinhaDigitavel: 14,
  tamanhoDoCodigoDeBarras: 32,
  corDoLayout: "black",
  alturaDaPagina: 600,
  larguraDaPagina: 844.68,
  exibirCampoUnidadeBeneficiaria: false,
  informacoesPersonalizadas: () => {
  },
  stream: void 0,
  base64: false,
  creditos: ""
};
function i25(text) {
  const start = String.fromCharCode(201);
  const stop = String.fromCharCode(202);
  const pairs = text.match(/.{2}/g) ?? [];
  return pairs.reduce((acc, part) => {
    const value = parseInt(part, 10);
    let ascii;
    if (value >= 0 && value <= 93) ascii = value + 33;
    else ascii = value + 101;
    return acc + String.fromCharCode(ascii);
  }, start) + stop;
}
function merge(defaults, overrides) {
  return Object.assign({}, defaults, overrides);
}
var GeradorDeBoleto = class {
  constructor(boletos) {
    this._boletos = Array.isArray(boletos) ? boletos : [boletos];
  }
  gerarPDF(args) {
    return new Promise(async (resolve) => {
      const opts = merge(PDF_DEFAULTS, args ?? {});
      const boletos = this._boletos;
      const ESPACO = 23;
      const pdf = new PDFDocument({
        size: [opts.alturaDaPagina, opts.larguraDaPagina],
        info: { Author: opts.autor, Title: opts.titulo, Creator: opts.criador }
      });
      if (opts.stream) pdf.pipe(opts.stream);
      const aX = opts.ajusteX ?? 0;
      const aY = opts.ajusteY ?? -80;
      pdf.registerFont("normal", TIMES);
      pdf.registerFont("negrito", TIMES_BOLD);
      pdf.registerFont("italico", TIMES_ITALIC);
      pdf.registerFont("negrito-italico", TIMES_BOLD_ITALIC);
      pdf.registerFont("codigoDeBarras", CODE25I);
      for (const [indice, boleto] of boletos.entries()) {
        const banco = boleto.getBanco();
        const pagador = boleto.getPagador();
        const beneficiario = boleto.getBeneficiario();
        const datas = boleto.getDatas();
        const zeroLinha = boleto._qrCode ? 190 : 120;
        const linha1 = zeroLinha + 45;
        const linha2 = linha1 + ESPACO;
        const linha3 = linha2 + ESPACO;
        const linha4Opcional = linha3 + ESPACO;
        const linha5 = linha4Opcional + ESPACO;
        const linhaTeste = linha5 + ESPACO;
        const linha6 = linhaTeste + 90;
        const linha7 = linha6 + 50;
        const drawH = (x1, y, x2) => pdf.moveTo(aX + x1, aY + y).lineTo(aX + x2, aY + y).stroke(opts.corDoLayout);
        const drawV = (x, y1, y2) => pdf.moveTo(aX + x, aY + y1).lineTo(aX + x, aY + y2).stroke(opts.corDoLayout);
        drawH(27, linha1, 572);
        drawH(27, linha2, 572);
        drawH(27, linha3, banco.exibirReciboDoPagadorCompleto() ? 572 : 329);
        if (banco.exibirReciboDoPagadorCompleto()) drawH(27, linha4Opcional, 572);
        drawH(27, linha5, banco.exibirReciboDoPagadorCompleto() ? 572 : 329);
        drawH(434, linhaTeste, 572);
        drawH(27, linha6, 572);
        drawH(27, linha7, 572);
        const linhaLateral1 = linhaTeste + ESPACO;
        const linhaLateral2 = linhaLateral1 + ESPACO;
        const linhaLateral3 = linhaLateral2 + ESPACO;
        drawH(434, linhaLateral1, 571);
        drawH(434, linhaLateral2, 571);
        drawH(434, linhaLateral3, 571);
        drawV(27, linha1 - 0.5, linha7);
        drawV(572, linha1 - 0.5, linha7);
        drawV(434, linha1, linha6);
        const col001 = 93.5;
        const col002 = col001 + 92.5;
        const col003 = col002 + 84.5;
        const col004 = col003 + 61;
        drawV(col001, linha3, linha4Opcional);
        drawV(col002, linha3, linha4Opcional);
        drawV(col003, linha3, linha4Opcional);
        drawV(col004, linha3, linha4Opcional);
        drawV(col001, linha4Opcional, linha5);
        const col281 = 132;
        const col291 = col281 + 76.5;
        const col2101 = col291 + 77;
        const col2111 = col2101 + 92;
        drawV(col281, linha4Opcional, linha5);
        drawV(col291, linha4Opcional, linha5);
        drawV(col2101, linha4Opcional, linha5);
        drawV(col2111, linha4Opcional, linha5);
        const colSuperior = 154;
        const colSuperior2 = colSuperior + 41.5;
        drawV(colSuperior, linha1 - 25, linha1);
        drawV(colSuperior2, linha1 - 25, linha1);
        const margem2 = 30;
        const margemLayout2 = margem2 - 4;
        const altLogotipo = 20;
        const separadorV = linha7 + 2 * 16 - 4;
        const linha21 = separadorV + altLogotipo + 4;
        const linha22 = linha21 + ESPACO + 8;
        const linha23 = linha22 + ESPACO;
        const linha24 = linha23 + ESPACO;
        const linha25 = linha24 + ESPACO;
        const camposLaterais = 434;
        const linha26 = linha25 + ESPACO;
        const linha27 = linha26 + ESPACO;
        const linha28 = linha27 + ESPACO;
        const linha29 = linha28 + ESPACO;
        const linha211 = linha29 + ESPACO + 0.4;
        const linha212 = linha211 + 56.6;
        drawH(margemLayout2, linha21, 571);
        drawH(margemLayout2, linha22, 571);
        drawH(margemLayout2, linha23, 571);
        drawH(margemLayout2, linha24, 571);
        drawH(margemLayout2, linha25, 571);
        drawH(camposLaterais, linha26, 571);
        drawH(camposLaterais, linha27, 571);
        drawH(camposLaterais, linha28, 571);
        if (opts.exibirCampoUnidadeBeneficiaria) {
          const linha28_2 = linha28 + 12.4;
          drawH(margemLayout2, linha28_2, camposLaterais);
        }
        drawH(camposLaterais, linha29, 571);
        drawH(margemLayout2, linha211, 571);
        drawH(margemLayout2, linha212, 571);
        drawV(margemLayout2 + 0.5, linha21, linha212);
        drawV(571 - 0.5, linha21, linha212);
        drawV(camposLaterais, linha21, linha211);
        drawV(93.5, linha23, linha24);
        if (banco.exibirCampoCip()) drawV(93.5, linha24, linha25);
        drawV(93.5 + 92.5, linha23, linha24);
        drawV(93.5 + 177, linha23, linha24);
        drawV(93.5 + 238, linha23, linha24);
        drawV(margemLayout2 + 106, linha24, linha25);
        drawV(margemLayout2 + 182.5, linha24, linha25);
        drawV(margemLayout2 + 259.5, linha24, linha25);
        drawV(margemLayout2 + 351.5, linha24, linha25);
        const col212 = 154;
        drawV(col212, separadorV, linha21);
        drawV(col212 + 1, separadorV, linha21);
        drawV(col212 + 2, separadorV, linha21);
        drawV(col212 + 43.5, separadorV, linha21);
        drawV(col212 + 44.5, separadorV, linha21);
        drawV(col212 + 45.5, separadorV, linha21);
        const linhaSeparadora = linha7 + 16;
        pdf.moveTo(aX + 27, aY + linhaSeparadora).lineTo(aX + 572, aY + linhaSeparadora).dash(3, { space: 5 }).stroke(opts.corDoLayout);
        pdf.image(TESOURA, aX + margemLayout2, aY + linhaSeparadora - 3.2, { width: 10 });
        const TITULOS = Object.assign({
          instrucoes: "Instru\xE7\xF5es",
          informativo: "INFORMATIVO",
          dataDocumento: "Data Documento",
          nomeDoPagador: "Nome do Cliente",
          agenciaECodigoDoBeneficiario: "Ag\xEAncia / C\xF3digo do Benefici\xE1rio",
          nossoNumero: "Nosso N\xFAmero",
          especie: "Esp\xE9cie",
          especieDoDocumento: "Esp\xE9cie Doc.",
          quantidade: "Quantidade",
          numeroDoDocumento: "N\xBA do Documento",
          dataDeProcessamento: "Data Processamento",
          valorDoDocumento: "Valor do Documento",
          valor: "Valor",
          carteira: "Carteira",
          moraMulta: "(+) Mora / Multa / Juros",
          localDoPagamento: "Local do Pagamento",
          igualDoValorDoDocumento: "(=) "
        }, banco.getTitulos() ?? {});
        if (opts.creditos) {
          pdf.font("italico").fontSize(8).text(opts.creditos, aX + 3, aY + 90, { width: 560, align: "center" });
        }
        const pixEmvStr = boleto.getPixEmvString();
        if (pixEmvStr) {
          const pixLinha0 = 95;
          const pixInstrucoes = boleto.getPixInstrucoes().length > 0 ? boleto.getPixInstrucoes() : boleto.getInformativo();
          pdf.font("negrito").fontSize(10).text(TITULOS.informativo, aX + 250, aY + pixLinha0, { lineBreak: false, width: 294, align: "left" });
          const instrucaoY = pixLinha0 + 12;
          pixInstrucoes.forEach((info, idx) => {
            pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(info, aX + margem2, aY + instrucaoY + idx * opts.tamanhoDaFonte, { lineBreak: false, width: 400, align: "left" });
          });
          pdf.fontSize(10).text("Pague agora via PIX, basta acessar o aplicativo de sua institui\xE7\xE3o financeira", aX + 30, aY + pixLinha0 + 66, { lineBreak: false, width: 350, align: "left" });
          pdf.font("negrito").fontSize(10).text("PIX copia e cola", aX + 30, aY + pixLinha0 + 75, { lineBreak: false, width: 294, align: "left" });
          pdf.rect(aX + 27, aY + pixLinha0 + 88, 545, 23).fill("#DFDFDF");
          pdf.font("negrito").fontSize(6).fillColor("black").text(pixEmvStr, aX + 32, aY + pixLinha0 + 90, { lineBreak: false, width: 500, align: "left" });
          pdf.rect(aX + 27, aY + pixLinha0 - 10, 545, 120).undash().stroke();
        }
        const segundaLinha3 = linha1 - 20.25;
        pdf.image(banco.getImagem(), aX + margemLayout2, aY + segundaLinha3 - 5, { height: altLogotipo });
        pdf.font("negrito").fontSize(opts.tamanhoDaLinhaDigitavel).text("Recibo do Pagador", aX + margemLayout2 + 145, aY + segundaLinha3, { lineBreak: false, width: 400, align: "right" });
        pdf.font("negrito").fontSize(opts.tamanhoDaLinhaDigitavel).text(banco.getNumeroFormatadoComDigito(), aX + margemLayout2 + 131, aY + linha1 - 20.25, { lineBreak: false, width: 39.8, align: "center" });
        const primeiraLinha = linha1 + 9;
        const difTitVal = 10;
        const colunaLateralLinhaSupBloco1 = 440;
        const tamCelulasDir = 124.5;
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.localDoPagamento, aX + margem2, aY + primeiraLinha - 7, { lineBreak: false, width: 294, align: "left" });
        boleto.getLocaisDePagamento().forEach((local, idx) => {
          if (idx > 1) return;
          pdf.font("normal").fontSize(opts.tamanhoDaFonteDoTitulo + 2).text(local, aX + margem2, aY + primeiraLinha + 2, { lineBreak: false, width: 400, align: "left" });
        });
        const LinhaBaseBloco1 = linha2 - 20.25;
        const linhaSuperiorLayout1 = LinhaBaseBloco1 + 9;
        const colunaLateral = 440;
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text("Vencimento", aX + colunaLateralLinhaSupBloco1, aY + linhaSuperiorLayout1 - difTitVal, { lineBreak: false, width: tamCelulasDir, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(datas.getVencimentoFormatado(), aX + colunaLateralLinhaSupBloco1, aY + linhaSuperiorLayout1, { lineBreak: false, width: tamCelulasDir, align: "right" });
        const quartaLinha1 = LinhaBaseBloco1 + 30;
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text("Benefici\xE1rio", aX + margem2, aY + quartaLinha1 - difTitVal, { lineBreak: false, width: 294, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(beneficiario.getIdentificacao(), aX + margem2, aY + quartaLinha1, { lineBreak: false, width: 400, align: "left" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.agenciaECodigoDoBeneficiario, aX + colunaLateral, aY + quartaLinha1 - difTitVal, { lineBreak: false, width: tamCelulasDir, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(banco.getAgenciaECodigoBeneficiario(boleto), aX + colunaLateral, aY + quartaLinha1, { lineBreak: false, width: tamCelulasDir, align: "right" });
        const quintaLinha1 = quartaLinha1 + ESPACO;
        const tituloCip = margem2 + 68;
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.dataDocumento, aX + margem2, aY + quintaLinha1 - difTitVal, { lineBreak: false, width: 294, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(datas.getDocumentoFormatado(), aX + margem2, aY + quintaLinha1, { lineBreak: false, width: 61.5, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(boleto.getNumeroDoDocumentoFormatado(), aX + margem2 + 68, aY + quintaLinha1, { lineBreak: false, width: 84, align: "left" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.numeroDoDocumento, aX + margem2 + 68, aY + quintaLinha1 - difTitVal, { lineBreak: false, width: 294, align: "left" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.especieDoDocumento, aX + margem2 + 158, aY + quintaLinha1 - difTitVal, { lineBreak: false, width: 294, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(boleto.getEspecieDocumento(), aX + margem2 + 158, aY + quintaLinha1, { lineBreak: false, width: 81, align: "center" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text("Aceite", aX + margem2 + 244, aY + quintaLinha1 - difTitVal, { lineBreak: false, width: 294, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(boleto.getAceiteFormatado(), aX + margem2 + 244, aY + quintaLinha1, { lineBreak: false, width: 55, align: "center" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.dataDeProcessamento, aX + margem2 + 305, aY + quintaLinha1 - difTitVal, { lineBreak: false, width: 294, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(datas.getProcessamentoFormatado(), aX + margem2 + 305, aY + quintaLinha1, { lineBreak: false, width: 93.5, align: "left" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.nossoNumero, aX + colunaLateral, aY + quintaLinha1 - difTitVal, { lineBreak: false, width: 294, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(beneficiario._nossoNumero, aX + colunaLateral, aY + quintaLinha1, { lineBreak: false, width: tamCelulasDir, align: "right" });
        const sextaLinha1 = quintaLinha1 + ESPACO;
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text("Uso do Banco", aX + margem2, aY + sextaLinha1 - difTitVal, { lineBreak: false, width: 294, align: "left" });
        if (banco.exibirCampoCip()) {
          pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text("CIP", aX + tituloCip, aY + sextaLinha1 - difTitVal, { lineBreak: false, width: 31, align: "left" });
          pdf.font("normal").fontSize(opts.tamanhoDaFonte).text("", aX + tituloCip, aY + sextaLinha1, { lineBreak: false, width: 31, align: "center" });
        }
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.carteira, aX + margem2 + 105, aY + sextaLinha1 - difTitVal, { lineBreak: false, width: 294, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(banco.getCarteiraTexto(beneficiario), aX + margem2 + 104.5, aY + sextaLinha1, { lineBreak: false, width: 71, align: "center" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(boleto.getEspecieMoeda(), aX + margem2 + 181.5, aY + sextaLinha1, { lineBreak: false, width: 71, align: "center" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.especie, aX + margem2 + 182, aY + sextaLinha1 - difTitVal, { lineBreak: false, width: 294, align: "left" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.quantidade, aX + margem2 + 259, aY + sextaLinha1 - difTitVal, { lineBreak: false, width: 294, align: "left" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.valor, aX + margem2 + 351, aY + sextaLinha1 - difTitVal, { lineBreak: false, width: 294, align: "left" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.igualDoValorDoDocumento + TITULOS.valorDoDocumento, aX + colunaLateral, aY + sextaLinha1 - difTitVal, { lineBreak: false, width: tamCelulasDir, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(boleto.getValorFormatadoBRL(), aX + colunaLateral, aY + sextaLinha1, { lineBreak: false, width: tamCelulasDir, align: "right" });
        const setimaLinha1 = sextaLinha1 + ESPACO;
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.instrucoes, aX + margem2, aY + setimaLinha1 - difTitVal, { lineBreak: false, width: 294, align: "left" });
        const instrucaoY1 = setimaLinha1 - difTitVal + 12;
        boleto.getInstrucoes().forEach((instr, idx) => {
          pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(instr, aX + margem2, aY + instrucaoY1 + idx * opts.tamanhoDaFonte, { lineBreak: false, width: 400, align: "left" });
        });
        if (opts.exibirCampoUnidadeBeneficiaria) {
          pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text("Unidade Benefici\xE1ria", aX + 30, aY + setimaLinha1 - difTitVal + 70, { lineBreak: false, width: 294, align: "left" });
        }
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text("Pagador", aX + 30, aY + setimaLinha1 - difTitVal + 115, { lineBreak: false, width: 294, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(pagador.getIdentificacao(), aX + 30, aY + setimaLinha1 - difTitVal + 125, { lineBreak: false, width: 294, align: "left" });
        const enderecoPagador = pagador.getEndereco();
        if (enderecoPagador) {
          let esp = opts.tamanhoDaFonte;
          if (enderecoPagador.getPrimeiraLinha()) {
            pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(enderecoPagador.getPrimeiraLinha(), aX + 30, aY + setimaLinha1 - difTitVal + 125 + esp, { lineBreak: false, width: 535, align: "left" });
            esp += esp;
          }
          if (enderecoPagador.getSegundaLinha()) {
            pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(enderecoPagador.getSegundaLinha(), aX + 30, aY + setimaLinha1 - difTitVal + 125 + esp, { lineBreak: false, width: 535, align: "left" });
          }
        }
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text("C\xF3digo de Baixa", aX + 370, aY + setimaLinha1 - difTitVal + 150, { lineBreak: false, width: 294, align: "left" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text("Autentica\xE7\xE3o Mec\xE2nica", aX + 360, aY + setimaLinha1 - difTitVal + 165, { lineBreak: false, width: 294, align: "left" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo + 1).text("FICHA DE COMPENSA\xC7\xC3O", aX + 421, aY + setimaLinha1 - difTitVal + 165, { lineBreak: false, width: 150, align: "right" });
        const oitavaLinha1 = setimaLinha1 + ESPACO;
        const nonaLinha1 = oitavaLinha1 + ESPACO;
        const decimaLinha1 = nonaLinha1 + ESPACO;
        const decimaPrimLinha1 = decimaLinha1 + ESPACO;
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text("(-) Desconto / Abatimento", aX + colunaLateral, aY + setimaLinha1 - difTitVal, { lineBreak: false, width: tamCelulasDir, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(boleto.getValorDescontosFormatadoBRL(), aX + colunaLateral, aY + setimaLinha1, { lineBreak: false, width: tamCelulasDir, align: "right" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text("(-) Outras Dedu\xE7\xF5es", aX + colunaLateral, aY + oitavaLinha1 - difTitVal, { lineBreak: false, width: 294, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(boleto.getValorDeducoesFormatadoBRL(), aX + colunaLateral, aY + oitavaLinha1, { lineBreak: false, width: 294, align: "left" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.moraMulta, aX + colunaLateral, aY + nonaLinha1 - difTitVal, { lineBreak: false, width: 294, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(boleto.getValorMoraMultaJurosFormatadoBRL(), aX + colunaLateral, aY + nonaLinha1 - difTitVal + 7, { lineBreak: false, width: tamCelulasDir, align: "right" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text("(+) Outros Acr\xE9scimos", aX + colunaLateral, aY + decimaLinha1 - difTitVal, { lineBreak: false, width: 294, align: "left" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text("(=) Valor Cobrado", aX + colunaLateral, aY + decimaPrimLinha1 - difTitVal, { lineBreak: false, width: 294, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(boleto.getValorCobradoFormatadoBRL(), aX + colunaLateral, aY + decimaPrimLinha1 - difTitVal + 7, { lineBreak: false, width: tamCelulasDir, align: "right" });
        const codigoDeBarras = boleto._codigoBarras || banco.geraCodigoDeBarrasPara(boleto);
        const linhaDigitavel2 = boleto._linhaDigitavel ? gerarLinhaDigitavel(boleto._linhaDigitavel) : gerarLinhaDigitavel(codigoDeBarras, banco);
        const segundaLinha2 = linha21 - 20.25;
        pdf.image(banco.getImagem(), aX + margemLayout2, aY + segundaLinha2 - 5, { height: altLogotipo });
        if (banco.imprimirNome) {
          pdf.font("negrito").fontSize(opts.tamanhoDaLinhaDigitavel).text(banco.nome ?? "", aX + margemLayout2 + 26, aY + segundaLinha2, { lineBreak: false, width: 100, align: "left" });
        }
        pdf.font("negrito").fontSize(opts.tamanhoDaLinhaDigitavel).text(banco.getNumeroFormatadoComDigito(), aX + margemLayout2 + 131, aY + segundaLinha2, { lineBreak: false, width: 39.8, align: "center" });
        pdf.font("negrito").fontSize(opts.tamanhoDaLinhaDigitavel).text(linhaDigitavel2, aX + margemLayout2 + 145, aY + segundaLinha2, { lineBreak: false, width: 400, align: "right" });
        const terceiraLinha = segundaLinha2 + 38;
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.localDoPagamento, aX + margem2, aY + terceiraLinha - difTitVal - 7, { lineBreak: false, width: 294, align: "left" });
        boleto.getLocaisDePagamento().forEach((local, idx) => {
          if (idx > 1) return;
          pdf.font("normal").fontSize(opts.tamanhoDaFonteDoTitulo + 3).text(local, aX + margem2, aY + terceiraLinha + 2 - opts.tamanhoDaFonte + idx * opts.tamanhoDaFonte, { lineBreak: false, width: 400, align: "left" });
        });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text("Vencimento", aX + colunaLateral, aY + terceiraLinha - difTitVal - 7, { lineBreak: false, width: tamCelulasDir, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(datas.getVencimentoFormatado(), aX + colunaLateral, aY + terceiraLinha, { lineBreak: false, width: tamCelulasDir, align: "right" });
        const quartaLinha = terceiraLinha + 24;
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text("Benefici\xE1rio", aX + margem2, aY + quartaLinha - difTitVal, { lineBreak: false, width: 294, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(beneficiario.getIdentificacao(), aX + margem2, aY + quartaLinha, { lineBreak: false, width: 400, align: "left" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.agenciaECodigoDoBeneficiario, aX + colunaLateral, aY + quartaLinha - difTitVal, { lineBreak: false, width: tamCelulasDir, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(banco.getAgenciaECodigoBeneficiario(boleto), aX + colunaLateral, aY + quartaLinha, { lineBreak: false, width: tamCelulasDir, align: "right" });
        const quintaLinha = quartaLinha + ESPACO;
        const tituloCip2 = margem2 + 68;
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.dataDocumento, aX + margem2, aY + quintaLinha - difTitVal, { lineBreak: false, width: 294, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(datas.getDocumentoFormatado(), aX + margem2, aY + quintaLinha, { lineBreak: false, width: 61.5, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(boleto.getNumeroDoDocumentoFormatado(), aX + margem2 + 68, aY + quintaLinha, { lineBreak: false, width: 84, align: "left" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.numeroDoDocumento, aX + margem2 + 68, aY + quintaLinha - difTitVal, { lineBreak: false, width: 294, align: "left" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.especieDoDocumento, aX + margem2 + 158, aY + quintaLinha - difTitVal, { lineBreak: false, width: 294, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(boleto.getEspecieDocumento(), aX + margem2 + 158, aY + quintaLinha, { lineBreak: false, width: 81, align: "center" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text("Aceite", aX + margem2 + 244, aY + quintaLinha - difTitVal, { lineBreak: false, width: 294, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(boleto.getAceiteFormatado(), aX + margem2 + 244, aY + quintaLinha, { lineBreak: false, width: 55, align: "center" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.dataDeProcessamento, aX + margem2 + 305, aY + quintaLinha - difTitVal, { lineBreak: false, width: 294, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(datas.getProcessamentoFormatado(), aX + margem2 + 305, aY + quintaLinha, { lineBreak: false, width: 93.5, align: "left" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.nossoNumero, aX + colunaLateral, aY + quintaLinha - difTitVal, { lineBreak: false, width: 294, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(beneficiario._nossoNumero, aX + colunaLateral, aY + quintaLinha, { lineBreak: false, width: tamCelulasDir, align: "right" });
        const sextaLinha = quintaLinha + ESPACO;
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text("Uso do Banco", aX + margem2, aY + sextaLinha - difTitVal, { lineBreak: false, width: 294, align: "left" });
        if (banco.exibirCampoCip()) {
          pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text("CIP", aX + tituloCip2, aY + sextaLinha - difTitVal, { lineBreak: false, width: 31, align: "left" });
          pdf.font("normal").fontSize(opts.tamanhoDaFonte).text("", aX + tituloCip2, aY + sextaLinha, { lineBreak: false, width: 31, align: "center" });
        }
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.carteira, aX + margem2 + 105, aY + sextaLinha - difTitVal, { lineBreak: false, width: 294, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(banco.getCarteiraTexto(beneficiario), aX + margem2 + 104.5, aY + sextaLinha, { lineBreak: false, width: 71, align: "center" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(boleto.getEspecieMoeda(), aX + margem2 + 181.5, aY + sextaLinha, { lineBreak: false, width: 71, align: "center" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.especie, aX + margem2 + 182, aY + sextaLinha - difTitVal, { lineBreak: false, width: 294, align: "left" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.quantidade, aX + margem2 + 259, aY + sextaLinha - difTitVal, { lineBreak: false, width: 294, align: "left" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.valor, aX + margem2 + 351, aY + sextaLinha - difTitVal, { lineBreak: false, width: 294, align: "left" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.igualDoValorDoDocumento + TITULOS.valorDoDocumento, aX + colunaLateral, aY + sextaLinha - difTitVal, { lineBreak: false, width: tamCelulasDir, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(boleto.getValorFormatadoBRL(), aX + colunaLateral, aY + sextaLinha, { lineBreak: false, width: tamCelulasDir, align: "right" });
        const setimaLinha = sextaLinha + ESPACO;
        const larguraInstrucoes = pixEmvStr ? 240 : 400;
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.instrucoes, aX + margem2, aY + setimaLinha - difTitVal, { lineBreak: false, width: 294, align: "left" });
        const instrucaoY2 = setimaLinha - difTitVal + 12;
        boleto.getInstrucoes().forEach((instr, idx) => {
          pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(instr, aX + margem2, aY + instrucaoY2 + idx * opts.tamanhoDaFonte, { lineBreak: false, width: larguraInstrucoes, align: "left" });
        });
        if (pixEmvStr) {
          const pixRenderer = new PixRenderer(
            pdf,
            boleto,
            { ajusteX: aX, ajusteY: aY, corDoLayout: opts.corDoLayout, tamanhoDaFonte: opts.tamanhoDaFonte },
            { margemDoSegundoBloco: margem2, larguraInstrucoes, tituloDaSetimaLinha: setimaLinha - difTitVal }
          );
          await pixRenderer.render();
        }
        if (opts.exibirCampoUnidadeBeneficiaria) {
          pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text("Unidade Benefici\xE1ria", aX + 30, aY + setimaLinha - difTitVal + 70, { lineBreak: false, width: 294, align: "left" });
        }
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text("Pagador", aX + 30, aY + setimaLinha - difTitVal + 115, { lineBreak: false, width: 294, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(pagador.getIdentificacao(), aX + 30, aY + setimaLinha - difTitVal + 125, { lineBreak: false, width: 535, align: "left" });
        const endPagador2 = pagador.getEndereco();
        if (endPagador2) {
          let esp = opts.tamanhoDaFonte;
          if (endPagador2.getPrimeiraLinha()) {
            pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(endPagador2.getPrimeiraLinha(), aX + 30, aY + setimaLinha - difTitVal + 125 + esp, { lineBreak: false, width: 535, align: "left" });
            esp += esp;
          }
          if (endPagador2.getSegundaLinha()) {
            pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(endPagador2.getSegundaLinha(), aX + 30, aY + setimaLinha - difTitVal + 125 + esp, { lineBreak: false, width: 535, align: "left" });
          }
        }
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text("C\xF3digo de Baixa", aX + 370, aY + setimaLinha - difTitVal + 159, { lineBreak: false, width: 294, align: "left" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text("Autentica\xE7\xE3o Mec\xE2nica", aX + 360, aY + setimaLinha - difTitVal + 171.5, { lineBreak: false, width: 294, align: "left" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo + 1).text("FICHA DE COMPENSA\xC7\xC3O", aX + 421, aY + setimaLinha - difTitVal + 171.5, { lineBreak: false, width: 150, align: "right" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text("(-) Desconto / Abatimento", aX + colunaLateral, aY + setimaLinha - difTitVal, { lineBreak: false, width: tamCelulasDir, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(boleto.getValorDescontosFormatadoBRL(), aX + colunaLateral, aY + setimaLinha, { lineBreak: false, width: tamCelulasDir, align: "right" });
        const oitavaLinha = setimaLinha + ESPACO;
        const nonaLinha = oitavaLinha + ESPACO;
        const decimaLinha = nonaLinha + ESPACO;
        const decimaPrimLinha = decimaLinha + ESPACO;
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text("(-) Outras Dedu\xE7\xF5es", aX + colunaLateral, aY + oitavaLinha - difTitVal, { lineBreak: false, width: 294, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(boleto.getValorDeducoesFormatadoBRL(), aX + colunaLateral, aY + oitavaLinha, { lineBreak: false, width: 294, align: "left" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.moraMulta, aX + colunaLateral, aY + nonaLinha - difTitVal, { lineBreak: false, width: 294, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(boleto.getValorMoraMultaJurosFormatadoBRL(), aX + colunaLateral, aY + nonaLinha - difTitVal + 7, { lineBreak: false, width: tamCelulasDir, align: "right" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text("(+) Outros Acr\xE9scimos", aX + colunaLateral, aY + decimaLinha - difTitVal, { lineBreak: false, width: 294, align: "left" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text("(=) Valor Cobrado", aX + colunaLateral, aY + decimaPrimLinha - difTitVal, { lineBreak: false, width: 294, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(boleto.getValorCobradoFormatadoBRL(), aX + colunaLateral, aY + decimaPrimLinha - difTitVal + 7, { lineBreak: false, width: tamCelulasDir, align: "right" });
        pdf.font("codigoDeBarras").fontSize(opts.tamanhoDoCodigoDeBarras).text(i25(codigoDeBarras), aX + margemLayout2, aY + linha212 + 3.5, { lineBreak: false, width: 340, align: "left" });
        opts.informacoesPersonalizadas(pdf, aX + margemLayout2, aY + linha212 + opts.tamanhoDoCodigoDeBarras + 10);
        if (indice < boletos.length - 1) pdf.addPage();
      }
      if (opts.base64) {
        let finalString = "";
        const stream = pdf.pipe(new Base64Encode());
        pdf.end();
        stream.on("data", (chunk) => {
          finalString += chunk;
        });
        stream.on("end", () => resolve(finalString));
      } else {
        pdf.end();
        resolve(pdf);
      }
    });
  }
  gerarLinhaDigitavel() {
    return Promise.resolve(
      this._boletos.map((boleto) => {
        const banco = boleto.getBanco();
        const linha = gerarLinhaDigitavel(banco.geraCodigoDeBarrasPara(boleto), banco);
        return { linha, numeroDocumento: boleto.getNumeroDoDocumentoFormatado() };
      })
    );
  }
  async gerarPNG(args) {
    const { pdf: pdfToImg } = await import("pdf-to-img");
    const scale = args?.scale ?? 2;
    const chunks = [];
    const pdfDoc = await this.gerarPDF({ ...args, stream: void 0, base64: false });
    await new Promise((resolve, reject) => {
      pdfDoc.on("data", (chunk) => chunks.push(chunk));
      pdfDoc.on("end", resolve);
      pdfDoc.on("error", reject);
    });
    const pdfBuffer = Buffer.concat(chunks);
    const document = await pdfToImg(pdfBuffer, { scale });
    const images = [];
    let page = 1;
    for await (const image of document) {
      images.push({ page, buffer: image, mimeType: "image/png" });
      page++;
    }
    return images;
  }
};

// src/core/gerador-carne.ts
import path3 from "path";
import { Base64Encode as Base64Encode2 } from "base64-stream";
import QRCode2 from "qrcode";
var PDFDocument2 = __require("pdfkit");
var FONTES_DIR2 = path3.resolve(process.cwd(), "lib/boleto/fontes");
var TIMES2 = path3.join(FONTES_DIR2, "Times New Roman.ttf");
var TIMES_BOLD2 = path3.join(FONTES_DIR2, "Times New Roman Bold.ttf");
var TIMES_ITALIC2 = path3.join(FONTES_DIR2, "Times New Roman Italic.ttf");
var TIMES_BOLD_ITALIC2 = path3.join(FONTES_DIR2, "Times New Roman Bold Italic.ttf");
var CODE25I2 = path3.join(FONTES_DIR2, "Code25I.ttf");
var TESOURA2 = path3.resolve(process.cwd(), "lib/boleto/imagens/tesoura128.png");
var PDF_DEFAULTS2 = {
  ajusteY: -80,
  ajusteX: 0,
  autor: "",
  titulo: "",
  criador: "",
  tamanhoDaFonteDoTitulo: 6,
  tamanhoDaFontes: 10,
  tamanhoDaFonte: 8,
  tamanhoDaLinhaDigitavel: 10,
  tamanhoDoCodigoDeBarras: 25,
  corDoLayout: "black",
  alturaDaPagina: 600,
  larguraDaPagina: 844.68,
  exibirCampoUnidadeBeneficiaria: false,
  informacoesPersonalizadas: (_pdf, _x, _y) => {
  }
};
async function generateQRCode(text) {
  const dataUrl = await QRCode2.toDataURL(text);
  return Buffer.from(dataUrl.replace(/^data:image\/png;base64,/, ""), "base64");
}
function i252(text) {
  const start = String.fromCharCode(201);
  const stop = String.fromCharCode(202);
  return (text.match(/.{2}/g) ?? []).reduce((acc, part) => {
    const value = parseInt(part, 10);
    const ascii = value >= 0 && value <= 93 ? value + 33 : value + 101;
    return acc + String.fromCharCode(ascii);
  }, start) + stop;
}
var GeradorDeBoletoCarne = class {
  constructor(boletos) {
    this._boletos = Array.isArray(boletos) ? boletos : [boletos];
  }
  gerarPDF(args) {
    return new Promise(async (resolve) => {
      const opts = Object.assign({}, PDF_DEFAULTS2, args ?? {});
      const boletos = this._boletos;
      const ESPACO = 23;
      const ESPACAMENTO = 260;
      let boletosNaPagina = 0;
      const pdf = new PDFDocument2({
        size: [opts.alturaDaPagina, opts.larguraDaPagina],
        info: { Author: opts.autor, Title: opts.titulo, Creator: opts.criador }
      });
      if (opts.stream) {
        pdf.pipe(opts.stream);
      }
      pdf.registerFont("normal", TIMES2);
      pdf.registerFont("negrito", TIMES_BOLD2);
      pdf.registerFont("italico", TIMES_ITALIC2);
      pdf.registerFont("negrito-italico", TIMES_BOLD_ITALIC2);
      pdf.registerFont("codigoDeBarras", CODE25I2);
      for (const [indice, boleto] of boletos.entries()) {
        if (boletosNaPagina === 3) {
          pdf.addPage();
          boletosNaPagina = 0;
        }
        const offsetY = boletosNaPagina * ESPACAMENTO;
        const banco = boleto.getBanco();
        const pagador = boleto.getPagador();
        const beneficiario = boleto.getBeneficiario();
        const datas = boleto.getDatas();
        const aX = opts.ajusteX;
        const aY = opts.ajusteY + offsetY;
        const zeroLinha = boleto._qrCode ? 190 : 120;
        const linha1 = zeroLinha + 45;
        const linha2 = linha1 + ESPACO;
        const linha3 = linha2 + ESPACO;
        const linha4Opcional = linha3 + ESPACO;
        const linha5 = linha4Opcional + ESPACO;
        const linhaTeste = linha5 + ESPACO;
        const linha6 = linhaTeste + 90;
        const linha7 = linha6 + 50;
        const dH = (x1, y, x2) => pdf.moveTo(aX + x1, aY + y).lineTo(aX + x2, aY + y).stroke(opts.corDoLayout);
        const dV = (x, y1, y2) => pdf.moveTo(aX + x, aY + y1).lineTo(aX + x, aY + y2).stroke(opts.corDoLayout);
        dH(27, linha1, 572);
        dH(27, linha2, 572);
        dH(27, linha3, banco.exibirReciboDoPagadorCompleto() ? 572 : 329);
        if (banco.exibirReciboDoPagadorCompleto()) dH(27, linha4Opcional, 572);
        dH(27, linha5, banco.exibirReciboDoPagadorCompleto() ? 572 : 329);
        dH(434, linhaTeste, 572);
        dH(27, linha6, 572);
        dH(27, linha7, 572);
        dV(27, linha1, linha7);
        dV(572, linha1, linha7);
        dV(434, linha1, linha6);
        const margem = 30;
        const margemLayout = margem - 4;
        const altLogotipo = 20;
        const sepV = linha7 + 2 * 16 - 4;
        const linha21 = sepV + altLogotipo + 4;
        const linha22 = linha21 + ESPACO + 8;
        const linha23 = linha22 + ESPACO;
        const linha24 = linha23 + ESPACO;
        const linha25 = linha24 + ESPACO;
        const campos = 434;
        const linha26 = linha25 + ESPACO;
        const linha27 = linha26 + ESPACO;
        const linha28 = linha27 + ESPACO;
        const linha29 = linha28 + ESPACO;
        const linha211 = linha29 + ESPACO + 0.4;
        const linha212 = linha211 + 56.6;
        dH(margemLayout, linha21, 571);
        dH(margemLayout, linha22, 571);
        dH(margemLayout, linha23, 571);
        dH(margemLayout, linha24, 571);
        dH(margemLayout, linha25, 571);
        dH(campos, linha26, 571);
        dH(campos, linha27, 571);
        dH(campos, linha28, 571);
        dH(campos, linha29, 571);
        dH(margemLayout, linha211, 571);
        dH(margemLayout, linha212, 571);
        dV(margemLayout + 0.5, linha21, linha212);
        dV(570.5, linha21, linha212);
        dV(campos, linha21, linha211);
        const linhaSep = linha7 + 16;
        pdf.moveTo(aX + 27, aY + linhaSep).lineTo(aX + 572, aY + linhaSep).dash(3, { space: 5 }).stroke(opts.corDoLayout);
        pdf.image(TESOURA2, aX + margemLayout, aY + linhaSep - 3.2, { width: 10 });
        const TITULOS = Object.assign({
          instrucoes: "Instru\xE7\xF5es",
          informativo: "INFORMATIVO",
          dataDocumento: "Data Documento",
          nomeDoPagador: "Nome do Cliente",
          agenciaECodigoDoBeneficiario: "Ag\xEAncia / C\xF3digo do Benefici\xE1rio",
          nossoNumero: "Nosso N\xFAmero",
          especie: "Esp\xE9cie",
          especieDoDocumento: "Esp\xE9cie Doc.",
          quantidade: "Quantidade",
          numeroDoDocumento: "N\xBA do Documento",
          dataDeProcessamento: "Data Processamento",
          valorDoDocumento: "Valor do Documento",
          valor: "Valor",
          carteira: "Carteira",
          moraMulta: "(+) Mora / Multa / Juros",
          localDoPagamento: "Local do Pagamento",
          igualDoValorDoDocumento: "(=) "
        }, banco.getTitulos() ?? {});
        if (boleto._qrCode) {
          const pixLinha0 = 95;
          const qrBuffer = await generateQRCode(boleto._qrCode);
          pdf.image(qrBuffer, aX + 480, aY + pixLinha0, { width: 90 });
          boleto.getInformativo().forEach((info, idx) => {
            pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(info, aX + margem, aY + pixLinha0 + 12 + idx * opts.tamanhoDaFonte, { lineBreak: false, width: 400, align: "left" });
          });
          pdf.rect(aX + 27, aY + pixLinha0 + 88, 545, 23).fill("#DFDFDF");
          pdf.font("negrito").fontSize(6).fillColor("black").text(boleto._qrCode, aX + 32, aY + pixLinha0 + 90, { lineBreak: false, width: 500, align: "left" });
          pdf.rect(aX + 27, aY + pixLinha0 - 10, 545, 120).undash().stroke();
        }
        const codigoDeBarras = boleto._codigoBarras || banco.geraCodigoDeBarrasPara(boleto);
        const linhaDigitavel2 = boleto._linhaDigitavel ? gerarLinhaDigitavel(boleto._linhaDigitavel) : gerarLinhaDigitavel(codigoDeBarras, banco);
        const tamCel = 124.5;
        const colLat = 440;
        const dif = 10;
        const segundaLinha2 = linha21 - 20.25;
        pdf.image(banco.getImagem(), aX + margemLayout, aY + segundaLinha2 - 5, { height: altLogotipo });
        if (banco.imprimirNome) pdf.font("negrito").fontSize(opts.tamanhoDaLinhaDigitavel).text(banco.nome ?? "", aX + margemLayout + 26, aY + segundaLinha2, { lineBreak: false, width: 100, align: "left" });
        pdf.font("negrito").fontSize(opts.tamanhoDaLinhaDigitavel).text(banco.getNumeroFormatadoComDigito(), aX + margemLayout + 131, aY + segundaLinha2, { lineBreak: false, width: 39.8, align: "center" });
        pdf.font("negrito").fontSize(opts.tamanhoDaLinhaDigitavel).text(linhaDigitavel2, aX + margemLayout + 145, aY + segundaLinha2, { lineBreak: false, width: 400, align: "right" });
        const terceira = segundaLinha2 + 38;
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.localDoPagamento, aX + margem, aY + terceira - dif - 7, { lineBreak: false, width: 294, align: "left" });
        boleto.getLocaisDePagamento().forEach((l, i) => {
          if (i > 1) return;
          pdf.font("normal").fontSize(opts.tamanhoDaFonteDoTitulo + 3).text(l, aX + margem, aY + terceira + 2 - opts.tamanhoDaFonte + i * opts.tamanhoDaFonte, { lineBreak: false, width: 400, align: "left" });
        });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text("Vencimento", aX + colLat, aY + terceira - dif - 7, { lineBreak: false, width: tamCel, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(datas.getVencimentoFormatado(), aX + colLat, aY + terceira, { lineBreak: false, width: tamCel, align: "right" });
        const quarta = terceira + 24;
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text("Benefici\xE1rio", aX + margem, aY + quarta - dif, { lineBreak: false, width: 294, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(beneficiario.getIdentificacao(), aX + margem, aY + quarta, { lineBreak: false, width: 400, align: "left" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.agenciaECodigoDoBeneficiario, aX + colLat, aY + quarta - dif, { lineBreak: false, width: tamCel, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(banco.getAgenciaECodigoBeneficiario(boleto), aX + colLat, aY + quarta, { lineBreak: false, width: tamCel, align: "right" });
        const quinta = quarta + ESPACO;
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.dataDocumento, aX + margem, aY + quinta - dif, { lineBreak: false, width: 294, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(datas.getDocumentoFormatado(), aX + margem, aY + quinta, { lineBreak: false, width: 61.5, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(boleto.getNumeroDoDocumentoFormatado(), aX + margem + 68, aY + quinta, { lineBreak: false, width: 84, align: "left" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.numeroDoDocumento, aX + margem + 68, aY + quinta - dif, { lineBreak: false, width: 294, align: "left" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.especieDoDocumento, aX + margem + 158, aY + quinta - dif, { lineBreak: false, width: 294, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(boleto.getEspecieDocumento(), aX + margem + 158, aY + quinta, { lineBreak: false, width: 81, align: "center" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text("Aceite", aX + margem + 244, aY + quinta - dif, { lineBreak: false, width: 294, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(boleto.getAceiteFormatado(), aX + margem + 244, aY + quinta, { lineBreak: false, width: 55, align: "center" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.dataDeProcessamento, aX + margem + 305, aY + quinta - dif, { lineBreak: false, width: 294, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(datas.getProcessamentoFormatado(), aX + margem + 305, aY + quinta, { lineBreak: false, width: 93.5, align: "left" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.nossoNumero, aX + colLat, aY + quinta - dif, { lineBreak: false, width: 294, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(beneficiario._nossoNumero, aX + colLat, aY + quinta, { lineBreak: false, width: tamCel, align: "right" });
        const sexta = quinta + ESPACO;
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text("Uso do Banco", aX + margem, aY + sexta - dif, { lineBreak: false, width: 294, align: "left" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.carteira, aX + margem + 105, aY + sexta - dif, { lineBreak: false, width: 294, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(banco.getCarteiraTexto(beneficiario), aX + margem + 104.5, aY + sexta, { lineBreak: false, width: 71, align: "center" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(boleto.getEspecieMoeda(), aX + margem + 181.5, aY + sexta, { lineBreak: false, width: 71, align: "center" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.especie, aX + margem + 182, aY + sexta - dif, { lineBreak: false, width: 294, align: "left" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.quantidade, aX + margem + 259, aY + sexta - dif, { lineBreak: false, width: 294, align: "left" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.valor, aX + margem + 351, aY + sexta - dif, { lineBreak: false, width: 294, align: "left" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.igualDoValorDoDocumento + TITULOS.valorDoDocumento, aX + colLat, aY + sexta - dif, { lineBreak: false, width: tamCel, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(boleto.getValorFormatadoBRL(), aX + colLat, aY + sexta, { lineBreak: false, width: tamCel, align: "right" });
        const setima = sexta + ESPACO;
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.instrucoes, aX + margem, aY + setima - dif, { lineBreak: false, width: 294, align: "left" });
        const instrY = setima - dif + 12;
        boleto.getInstrucoes().forEach((instr, i) => {
          pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(instr, aX + margem, aY + instrY + i * opts.tamanhoDaFonte, { lineBreak: false, width: 400, align: "left" });
        });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text("Pagador", aX + 30, aY + setima - dif + 115, { lineBreak: false, width: 294, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(pagador.getIdentificacao(), aX + 30, aY + setima - dif + 125, { lineBreak: false, width: 535, align: "left" });
        const endP = pagador.getEndereco();
        if (endP) {
          let esp = opts.tamanhoDaFonte;
          if (endP.getPrimeiraLinha()) {
            pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(endP.getPrimeiraLinha(), aX + 30, aY + setima - dif + 125 + esp, { lineBreak: false, width: 535, align: "left" });
            esp += esp;
          }
          if (endP.getSegundaLinha()) {
            pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(endP.getSegundaLinha(), aX + 30, aY + setima - dif + 125 + esp, { lineBreak: false, width: 535, align: "left" });
          }
        }
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text("(-) Desconto / Abatimento", aX + colLat, aY + setima - dif, { lineBreak: false, width: tamCel, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(boleto.getValorDescontosFormatadoBRL(), aX + colLat, aY + setima, { lineBreak: false, width: tamCel, align: "right" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text("(-) Outras Dedu\xE7\xF5es", aX + colLat, aY + (setima + ESPACO) - dif, { lineBreak: false, width: 294, align: "left" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text(TITULOS.moraMulta, aX + colLat, aY + (setima + 2 * ESPACO) - dif, { lineBreak: false, width: 294, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(boleto.getValorMoraMultaJurosFormatadoBRL(), aX + colLat, aY + (setima + 2 * ESPACO) - dif + 7, { lineBreak: false, width: tamCel, align: "right" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text("(+) Outros Acr\xE9scimos", aX + colLat, aY + (setima + 3 * ESPACO) - dif, { lineBreak: false, width: 294, align: "left" });
        pdf.font("negrito").fontSize(opts.tamanhoDaFonteDoTitulo).text("(=) Valor Cobrado", aX + colLat, aY + (setima + 4 * ESPACO) - dif, { lineBreak: false, width: 294, align: "left" });
        pdf.font("normal").fontSize(opts.tamanhoDaFonte).text(boleto.getValorCobradoFormatadoBRL(), aX + colLat, aY + (setima + 4 * ESPACO) - dif + 7, { lineBreak: false, width: tamCel, align: "right" });
        pdf.font("codigoDeBarras").fontSize(opts.tamanhoDoCodigoDeBarras).text(i252(codigoDeBarras), aX + margemLayout, aY + linha212 + 3.5, { lineBreak: false, width: 340, align: "left" });
        opts.informacoesPersonalizadas(pdf, aX + margemLayout, aY + linha212 + opts.tamanhoDoCodigoDeBarras + 10);
        boletosNaPagina++;
      }
      if (opts.base64) {
        let finalString = "";
        const stream = pdf.pipe(new Base64Encode2());
        pdf.end();
        stream.on("data", (chunk) => {
          finalString += chunk;
        });
        stream.on("end", () => resolve(finalString));
      } else {
        pdf.end();
        resolve(pdf);
      }
    });
  }
};

// src/core/bancos/bradesco.ts
init_string();
import path4 from "path";

// src/core/codigo-de-barras-builder.ts
init_string();
var CodigoDeBarrasBuilder = class {
  constructor(boleto) {
    const banco = boleto.getBanco();
    const partes = [
      banco.getNumeroFormatado(),
      boleto.getCodigoEspecieMoeda(),
      boleto.getFatorVencimento(),
      boleto.getValorFormatado()
    ];
    this._codigoDeBarras = partes.join("");
  }
  comCampoLivre(campoLivre) {
    let codigo = this._codigoDeBarras;
    const campo = Array.isArray(campoLivre) ? campoLivre.join("") : campoLivre;
    if (!campo.length) throw new Error("Campo livre est\xE1 vazio");
    codigo += campo;
    const digito = mod11(codigo);
    codigo = insert(codigo, 4, String(digito));
    validar(codigo);
    return codigo;
  }
};

// src/core/bancos/bradesco.ts
var NUMERO = "237";
var DIGITO = "2";
var Bradesco = class {
  constructor() {
    this.imprimirNome = false;
    this.nome = "Banco Bradesco S.A.";
  }
  getTitulos() {
    return {
      instrucoes: "Informa\xE7\xF5es de responsabilidade do benefici\xE1rio",
      nomeDoPagador: "Nome do Pagador",
      especie: "Moeda",
      quantidade: "Quantidade",
      valor: "Valor",
      moraMulta: "(+) Juros / Multa"
    };
  }
  exibirReciboDoPagadorCompleto() {
    return true;
  }
  exibirCampoCip() {
    return true;
  }
  geraCodigoDeBarrasPara(boleto) {
    const beneficiario = boleto.getBeneficiario();
    const campoLivre = [
      beneficiario.getAgenciaFormatada(),
      this.getCarteiraFormatado(beneficiario),
      this.getNossoNumeroFormatado(beneficiario),
      this.getCodigoFormatado(beneficiario),
      "0"
    ];
    return new CodigoDeBarrasBuilder(boleto).comCampoLivre(campoLivre);
  }
  getNumeroFormatadoComDigito() {
    return `${NUMERO}-${DIGITO}`;
  }
  getNumeroFormatado() {
    return NUMERO;
  }
  getCarteiraFormatado(b) {
    return pad(b.getCarteira(), 2, "0");
  }
  getCarteiraTexto(b) {
    return pad(b.getCarteira(), 2, "0");
  }
  getCodigoFormatado(b) {
    return pad(b.getCodigoBeneficiario(), 7, "0");
  }
  getImagem() {
    return path4.resolve(process.cwd(), "lib/boleto/bancos/logotipos/bradesco.png");
  }
  getNossoNumeroFormatado(b) {
    return pad(b.getNossoNumero(), 11, "0");
  }
  getNome() {
    return this.nome;
  }
  getImprimirNome() {
    return this.imprimirNome;
  }
  getNossoNumeroECodigoDocumento(boleto) {
    const b = boleto.getBeneficiario();
    return `${this.getCarteiraFormatado(b)}/${this.getNossoNumeroFormatado(b)}-${b.getDigitoNossoNumero()}`;
  }
  getAgenciaECodigoBeneficiario(boleto) {
    const b = boleto.getBeneficiario();
    let codigo = this.getCodigoFormatado(b);
    const digito = b.getDigitoCodigoBeneficiario();
    if (digito) codigo += `-${digito}`;
    return `${b.getAgenciaFormatada()}/${codigo}`;
  }
};

// src/core/bancos/banco-do-brasil.ts
init_string();
import path5 from "path";
var NUMERO2 = "001";
var DIGITO2 = "9";
var BancoBrasil = class {
  constructor() {
    this.imprimirNome = false;
    this.nome = "Banco do Brasil S.A.";
  }
  getTitulos() {
    return {
      informativo: "",
      instrucoes: "Informa\xE7\xF5es de responsabilidade do benefici\xE1rio",
      nomeDoPagador: "Nome do Pagador",
      especie: "Moeda",
      quantidade: "Quantidade",
      valor: "Valor",
      moraMulta: "(+) Juros / Multa"
    };
  }
  exibirReciboDoPagadorCompleto() {
    return true;
  }
  exibirCampoCip() {
    return false;
  }
  geraCodigoDeBarrasPara(boleto) {
    const beneficiario = boleto.getBeneficiario();
    const campoLivre = [];
    if (beneficiario.getNossoNumero().length === 11) {
      campoLivre.push(beneficiario.getNossoNumero());
      campoLivre.push(beneficiario.getAgenciaFormatada());
      campoLivre.push(beneficiario.getCodigoBeneficiario());
      campoLivre.push(beneficiario.getCarteira().substring(0, 2));
    }
    if (beneficiario.getNossoNumero().length === 17) {
      campoLivre.push("000000");
      campoLivre.push(beneficiario.getNossoNumero());
      campoLivre.push(beneficiario.getCarteira().substring(0, 2));
    }
    return new CodigoDeBarrasBuilder(boleto).comCampoLivre(campoLivre);
  }
  getNumeroFormatadoComDigito() {
    return `${NUMERO2}-${DIGITO2}`;
  }
  getNumeroFormatado() {
    return NUMERO2;
  }
  getCarteiraFormatado(b) {
    return pad(b.getCarteira(), 2, "0");
  }
  getCarteiraTexto(b) {
    return pad(b.getCarteira(), 2, "0");
  }
  getCodigoFormatado(b) {
    return pad(b.getCodigoBeneficiario(), 7, "0");
  }
  getImagem() {
    return path5.resolve(process.cwd(), "lib/boleto/bancos/logotipos/banco-do-brasil.png");
  }
  getNossoNumeroFormatado(b) {
    return pad(b.getNossoNumero(), 17, "0");
  }
  getNome() {
    return this.nome;
  }
  getImprimirNome() {
    return this.imprimirNome;
  }
  getNossoNumeroECodigoDocumento(boleto) {
    return this.getNossoNumeroFormatado(boleto.getBeneficiario());
  }
  getAgenciaECodigoBeneficiario(boleto) {
    const b = boleto.getBeneficiario();
    let codigo = this.getCodigoFormatado(b);
    const digito = b.getDigitoCodigoBeneficiario();
    if (digito) codigo += `-${digito}`;
    return `${b.getAgenciaFormatada()}/${codigo}`;
  }
};

// src/core/bancos/banrisul.ts
init_string();
import path6 from "path";
var NUMERO3 = "041";
var DIGITO3 = "8";
var Banrisul = class {
  constructor() {
    this.imprimirNome = false;
    this.nome = "Banco do Estado do Rio Grande do Sul S.A.";
  }
  getTitulos() {
    return {
      informativo: "",
      instrucoes: "Informa\xE7\xF5es de responsabilidade do benefici\xE1rio",
      nomeDoPagador: "Nome do Pagador",
      localDePagamento: "Local de Pagamento",
      vencimento: "Vencimento",
      agenciaECodigoBeneficiario: "Ag\xEAncia/C\xF3digo do Benefici\xE1rio",
      nossoNumero: "Nosso N\xFAmero",
      especie: "Moeda",
      quantidade: "Quantidade",
      valor: "(x) Valor",
      valorDocumento: "(=) Valor do Documento",
      descontos: "(-) Desconto/Abatimento",
      outrasDeducoes: "(-) Outras Dedu\xE7\xF5es",
      moraMulta: "(+) Juros/Multa",
      outrosAcrescimos: "(+) Outros Acr\xE9scimos",
      valorCobrado: "(=) Valor Cobrado"
    };
  }
  exibirReciboDoPagadorCompleto() {
    return true;
  }
  exibirCampoCip() {
    return true;
  }
  geraCodigoDeBarrasPara(boleto) {
    const beneficiario = boleto.getBeneficiario();
    const campoLivre = [
      "1",
      beneficiario.getAgenciaFormatada(),
      this.getCodigoFormatado(beneficiario),
      this.getNossoNumeroFormatado(beneficiario),
      "00",
      this.calculaDuploDigito(beneficiario),
      "1"
    ];
    return new CodigoDeBarrasBuilder(boleto).comCampoLivre(campoLivre);
  }
  calculaDuploDigito(beneficiario) {
    return this.calcularDVNossoNumero(this.getNossoNumeroFormatado(beneficiario));
  }
  calcularDVNossoNumero(nossoNumero) {
    let digito1 = this.calcularModulo10(nossoNumero);
    let nossoNumeroComDV1 = nossoNumero + digito1;
    let digito2 = this.calcularModulo11(nossoNumeroComDV1);
    if (digito2 === -1) {
      digito1 = (digito1 + 1) % 10;
      nossoNumeroComDV1 = nossoNumero + digito1;
      digito2 = this.calcularModulo11(nossoNumeroComDV1);
    }
    return pad(String(digito1) + String(digito2), 2, "0");
  }
  calcularModulo10(campo) {
    let soma = 0;
    let peso = 2;
    for (let i = campo.length - 1; i >= 0; i--) {
      let resultado = parseInt(campo.charAt(i)) * peso;
      if (resultado > 9) resultado -= 9;
      soma += resultado;
      peso = peso === 2 ? 1 : 2;
    }
    const resto = soma % 10;
    return resto === 0 ? 0 : 10 - resto;
  }
  calcularModulo11(campo) {
    let soma = 0;
    let peso = 2;
    for (let i = campo.length - 1; i >= 0; i--) {
      soma += parseInt(campo.charAt(i)) * peso;
      peso++;
      if (peso > 7) peso = 2;
    }
    const resto = soma % 11;
    if (resto === 0) return 0;
    if (resto === 1) return -1;
    return 11 - resto;
  }
  getNumeroFormatadoComDigito() {
    return `${NUMERO3}-${DIGITO3}`;
  }
  getNumeroFormatado() {
    return NUMERO3;
  }
  getCarteiraFormatado(b) {
    return pad(b.getCarteira(), 2, "0");
  }
  getCarteiraTexto(b) {
    return pad(b.getCarteira(), 2, "0");
  }
  getCodigoFormatado(b) {
    return pad(b.getCodigoBeneficiario(), 7, "0");
  }
  getImagem() {
    return path6.resolve(process.cwd(), "lib/boleto/bancos/logotipos/banrisul.png");
  }
  getNossoNumeroFormatado(b) {
    return pad(b.getNossoNumero(), 8, "0");
  }
  getNome() {
    return this.nome;
  }
  getImprimirNome() {
    return this.imprimirNome;
  }
  getNossoNumeroECodigoDocumento(boleto) {
    const b = boleto.getBeneficiario();
    return this.getNossoNumeroFormatado(b) + this.calculaDuploDigito(b);
  }
  getAgenciaECodigoBeneficiario(boleto) {
    const b = boleto.getBeneficiario();
    let codigo = this.getCodigoFormatado(b);
    const digito = b.getDigitoCodigoBeneficiario();
    if (digito) codigo += `.${digito}`;
    return `${b.getAgenciaFormatada()}.${codigo}`;
  }
};

// src/core/bancos/caixa.ts
init_string();
import path7 from "path";
var NUMERO4 = "104";
var DIGITO4 = "0";
var Caixa = class {
  constructor() {
    this.imprimirNome = false;
    this.nome = "Caixa Econ\xF4mica Federal S/A";
  }
  getTitulos() {
    return {
      instrucoes: "Instru\xE7\xF5es (texto de responsabilidade do benefici\xE1rio)",
      nomeDoPagador: "Nome do Pagador",
      especie: "Esp\xE9cie Moeda",
      quantidade: "Quantidade Moeda",
      valor: "xValor"
    };
  }
  exibirReciboDoPagadorCompleto() {
    return true;
  }
  exibirCampoCip() {
    return false;
  }
  geraCodigoDeBarrasPara(boleto) {
    const beneficiario = boleto.getBeneficiario();
    const carteira = beneficiario.getCarteira();
    const contaCorrente = pad(beneficiario.getCodigoBeneficiario(), 6, "0");
    const nossoNumeroFormatado = this.getNossoNumeroFormatado(beneficiario);
    const campoLivre = [];
    if (carteira === "14" || carteira === "24") {
      campoLivre.push(contaCorrente);
      campoLivre.push(beneficiario.getDigitoCodigoBeneficiario());
      campoLivre.push(nossoNumeroFormatado.substring(2, 5));
      campoLivre.push(nossoNumeroFormatado.substring(0, 1));
      campoLivre.push(nossoNumeroFormatado.substring(5, 8));
      campoLivre.push(nossoNumeroFormatado.substring(1, 2));
      campoLivre.push(nossoNumeroFormatado.substring(8));
      const digito = mod11(campoLivre.join(""), { de: [0, 10, 11], para: 0 });
      campoLivre.push(digito);
    } else {
      throw new Error(`Carteira "${carteira}" n\xE3o implementada para o banco Caixa`);
    }
    return new CodigoDeBarrasBuilder(boleto).comCampoLivre(campoLivre.join(""));
  }
  getNumeroFormatadoComDigito() {
    return `${NUMERO4}-${DIGITO4}`;
  }
  getNumeroFormatado() {
    return NUMERO4;
  }
  getCarteiraFormatado(b) {
    return pad(b.getCarteira(), 2, "0");
  }
  getCarteiraTexto(b) {
    const map = { "1": "RG", "14": "RG", "2": "SR", "24": "SR" };
    return map[b.getCarteira()] ?? b.getCarteira();
  }
  getCodigoFormatado(b) {
    return pad(b.getCodigoBeneficiario(), 5, "0");
  }
  getImagem() {
    return path7.resolve(process.cwd(), "lib/boleto/bancos/logotipos/caixa-economica-federal.png");
  }
  getNossoNumeroFormatado(b) {
    return pad(b.getCarteira(), 2, "0") + pad(b.getNossoNumero(), 15, "0");
  }
  getNome() {
    return this.nome;
  }
  getImprimirNome() {
    return this.imprimirNome;
  }
  getNossoNumeroECodigoDocumento(boleto) {
    const b = boleto.getBeneficiario();
    return `${this.getNossoNumeroFormatado(b)}-${b.getDigitoNossoNumero()}`;
  }
  getAgenciaECodigoBeneficiario(boleto) {
    const b = boleto.getBeneficiario();
    let codigo = this.getCodigoFormatado(b);
    const digito = b.getDigitoCodigoBeneficiario();
    if (digito) codigo += `-${digito}`;
    return `${b.getAgenciaFormatada()}/${codigo}`;
  }
};

// src/core/bancos/cecred.ts
init_string();
import path8 from "path";
var NUMERO5 = "085";
var DIGITO5 = "1";
var Cecred = class {
  constructor() {
    this.imprimirNome = false;
    this.nome = "Ailos";
  }
  getTitulos() {
    return {
      instrucoes: "Instru\xE7\xF5es (texto de responsabilidade do benefici\xE1rio)",
      nomeDoPagador: "Pagador",
      especie: "Moeda",
      quantidade: "Quantidade",
      valor: "x Valor",
      moraMulta: "(+) Moras / Multa"
    };
  }
  exibirReciboDoPagadorCompleto() {
    return true;
  }
  exibirCampoCip() {
    return true;
  }
  geraCodigoDeBarrasPara(boleto) {
    const beneficiario = boleto.getBeneficiario();
    const errorMsg = "Erro ao gerar c\xF3digo de barras,";
    if (!beneficiario.getNumeroConvenio() || beneficiario.getNumeroConvenio().length !== 6)
      throw new Error(`${errorMsg} n\xFAmero conv\xEAnio da cooperativa n\xE3o possui 6 d\xEDgitos: ${beneficiario.getNumeroConvenio()}`);
    if (!beneficiario.getNossoNumero() || beneficiario.getNossoNumero().length !== 17)
      throw new Error(`${errorMsg} nosso n\xFAmero n\xE3o possui 17 d\xEDgitos: ${beneficiario.getNossoNumero()}`);
    if (!beneficiario.getCarteira() || beneficiario.getCarteira().length !== 2)
      throw new Error(`${errorMsg} c\xF3digo carteira n\xE3o possui 2 d\xEDgitos: ${beneficiario.getCarteira()}`);
    const campoLivre = [
      beneficiario.getNumeroConvenio(),
      beneficiario.getNossoNumero(),
      beneficiario.getCarteira().substring(0, 2)
    ];
    return new CodigoDeBarrasBuilder(boleto).comCampoLivre(campoLivre);
  }
  getNumeroFormatadoComDigito() {
    return `${NUMERO5}-${DIGITO5}`;
  }
  getNumeroFormatado() {
    return NUMERO5;
  }
  getCarteiraFormatado(b) {
    return pad(b.getCarteira(), 2, "0");
  }
  getCarteiraTexto(b) {
    return pad(b.getCarteira(), 2, "0");
  }
  getCodigoFormatado(b) {
    return pad(b.getCodigoBeneficiario(), 7, "0");
  }
  getImagem() {
    return path8.resolve(process.cwd(), "lib/boleto/bancos/logotipos/ailos.png");
  }
  getNossoNumeroFormatado(b) {
    return pad(b.getNossoNumero(), 11, "0");
  }
  getNome() {
    return this.nome;
  }
  getImprimirNome() {
    return this.imprimirNome;
  }
  getLocaisDePagamentoPadrao() {
    return [
      "PAGAVEL PREFERENCIALMENTE NAS COOPERATIVAS DO SISTEMA AILOS.",
      "APOS VENCIMENTO PAGAR SOMENTE NA COOPERATIVA "
    ];
  }
  getNossoNumeroECodigoDocumento(boleto) {
    const b = boleto.getBeneficiario();
    let nossoNumero = this.getNossoNumeroFormatado(b);
    if (b.getDigitoNossoNumero()) nossoNumero += `-${b.getDigitoNossoNumero()}`;
    return nossoNumero;
  }
  getAgenciaECodigoBeneficiario(boleto) {
    const b = boleto.getBeneficiario();
    let codigo = this.getCodigoFormatado(b);
    const digito = b.getDigitoCodigoBeneficiario();
    if (digito) codigo += `-${digito}`;
    const agenciaComDigito = `${b.getAgenciaFormatada()}-${b.getDigitoAgencia()}`;
    return `${agenciaComDigito}/${codigo}`;
  }
};

// src/core/bancos/itau.ts
init_string();
import path9 from "path";
var NUMERO6 = "341";
var DIGITO6 = "7";
var Itau = class {
  constructor() {
    this.imprimirNome = true;
    this.nome = "Banco Ita\xFA S/A";
  }
  getTitulos() {
    return {};
  }
  exibirReciboDoPagadorCompleto() {
    return false;
  }
  exibirCampoCip() {
    return false;
  }
  geraCodigoDeBarrasPara(boleto) {
    const beneficiario = boleto.getBeneficiario();
    let campoLivre = [
      this.getCarteiraFormatado(beneficiario),
      this.getNossoNumeroFormatado(beneficiario),
      beneficiario.getAgenciaFormatada(),
      this.getCodigoFormatado(beneficiario),
      "000"
    ].join("");
    const digito1 = mod10(campoLivre.substring(11, 20));
    campoLivre = insert(campoLivre, 20, String(digito1));
    const digito2 = mod10(campoLivre.substring(11, 20) + campoLivre.substring(0, 11));
    campoLivre = insert(campoLivre, 11, String(digito2));
    return new CodigoDeBarrasBuilder(boleto).comCampoLivre(campoLivre);
  }
  getNumeroFormatadoComDigito() {
    return `${NUMERO6}-${DIGITO6}`;
  }
  getNumeroFormatado() {
    return NUMERO6;
  }
  getCarteiraFormatado(b) {
    return pad(b.getCarteira(), 3, "0");
  }
  getCarteiraTexto(b) {
    return this.getCarteiraFormatado(b);
  }
  getCodigoFormatado(b) {
    return pad(b.getCodigoBeneficiario(), 5, "0");
  }
  getImagem() {
    return path9.resolve(process.cwd(), "lib/boleto/bancos/logotipos/itau.png");
  }
  getNossoNumeroFormatado(b) {
    return pad(b.getNossoNumero(), 8, "0");
  }
  getNome() {
    return this.nome;
  }
  getImprimirNome() {
    return this.imprimirNome;
  }
  getNossoNumeroECodigoDocumento(boleto) {
    const b = boleto.getBeneficiario();
    return `${b.getCarteira()}/${this.getNossoNumeroFormatado(b)}-${b.getDigitoNossoNumero()}`;
  }
  getAgenciaECodigoBeneficiario(boleto) {
    const b = boleto.getBeneficiario();
    let codigo = this.getCodigoFormatado(b);
    const digito = b.getDigitoCodigoBeneficiario();
    if (digito) codigo += `-${digito}`;
    return `${b.getAgenciaFormatada()}/${codigo}`;
  }
};

// src/core/bancos/santander.ts
init_string();
import path10 from "path";
var NUMERO7 = "033";
var DIGITO7 = "7";
var Santander = class {
  constructor() {
    this.imprimirNome = false;
    this.nome = "Banco Santander S.A.";
  }
  getTitulos() {
    return {
      instrucoes: "Informa\xE7\xF5es de responsabilidade do benefici\xE1rio",
      nomeDoPagador: "Nome do Pagador",
      especie: "Moeda",
      quantidade: "Quantidade",
      valor: "Valor",
      moraMulta: "(+) Juros / Multa"
    };
  }
  exibirReciboDoPagadorCompleto() {
    return true;
  }
  exibirCampoCip() {
    return false;
  }
  geraCodigoDeBarrasPara(boleto) {
    const beneficiario = boleto.getBeneficiario();
    const nosso = this.getNossoNumeroFormatado(beneficiario);
    const campoLivre = [
      "9",
      beneficiario.getCodigoBeneficiario().substring(0, 4),
      beneficiario.getCodigoBeneficiario().substring(4),
      nosso.substring(0, 7),
      nosso.substring(7),
      beneficiario.getDigitoNossoNumero(),
      "0",
      this.getCarteiraFormatado(beneficiario)
    ];
    return new CodigoDeBarrasBuilder(boleto).comCampoLivre(campoLivre);
  }
  getNumeroFormatadoComDigito() {
    return `${NUMERO7}-${DIGITO7}`;
  }
  getNumeroFormatado() {
    return NUMERO7;
  }
  getCarteiraFormatado(b) {
    return pad(b.getCarteira(), 2, "0");
  }
  getCarteiraTexto(b) {
    return pad(b.getCarteira(), 2, "0");
  }
  getCodigoFormatado(b) {
    return pad(b.getCodigoBeneficiario(), 7, "0");
  }
  getImagem() {
    return path10.resolve(process.cwd(), "lib/boleto/bancos/logotipos/santander.png");
  }
  getNossoNumeroFormatado(b) {
    return pad(b.getNossoNumero(), 12, "0");
  }
  getNome() {
    return this.nome;
  }
  getImprimirNome() {
    return this.imprimirNome;
  }
  getNossoNumeroECodigoDocumento(boleto) {
    const b = boleto.getBeneficiario();
    return `${this.getNossoNumeroFormatado(b)}-${b.getDigitoNossoNumero()}`;
  }
  getAgenciaECodigoBeneficiario(boleto) {
    const b = boleto.getBeneficiario();
    let codigo = this.getCodigoFormatado(b);
    const digito = b.getDigitoCodigoBeneficiario();
    if (digito) codigo += `-${digito}`;
    return `${b.getAgenciaFormatada()}/${codigo}`;
  }
};

// src/core/bancos/sicoob.ts
init_string();
import path11 from "path";
var NUMERO8 = "756";
var DIGITO8 = "0";
var Sicoob = class {
  constructor() {
    this.imprimirNome = true;
    this.nome = "";
  }
  getTitulos() {
    return {
      localDoPagamento: "Local de Pagamento",
      especieDoDocumento: "Esp\xE9cie",
      instrucoes: "Instru\xE7\xF5es (texto de responsabilidade do benefici\xE1rio)",
      agenciaECodigoDoBeneficiario: "Coop. contratante/C\xF3d. Benefici\xE1rio",
      valorDoDocumento: "Valor Documento",
      igualDoValorDoDocumento: "",
      nomeDoPagador: "Nome do Pagador"
    };
  }
  exibirReciboDoPagadorCompleto() {
    return false;
  }
  exibirCampoCip() {
    return false;
  }
  geraCodigoDeBarrasPara(boleto) {
    const beneficiario = boleto.getBeneficiario();
    const campoLivre = [
      this.getCarteiraFormatado(beneficiario),
      beneficiario.getAgenciaFormatada(),
      pad(beneficiario.getCarteira(), 2, "0"),
      this.getCodigoFormatado(beneficiario),
      this.getNossoNumeroFormatado(beneficiario),
      beneficiario.getDigitoNossoNumero(),
      "001"
    ].join("");
    return new CodigoDeBarrasBuilder(boleto).comCampoLivre(campoLivre);
  }
  getNumeroFormatadoComDigito() {
    return `${NUMERO8}-${DIGITO8}`;
  }
  getNumeroFormatado() {
    return NUMERO8;
  }
  getCarteiraFormatado(b) {
    return pad(b.getCarteira(), 1, "0");
  }
  getCarteiraTexto(b) {
    return this.getCarteiraFormatado(b);
  }
  getCodigoFormatado(b) {
    return pad(b.getCodigoBeneficiario(), 7, "0");
  }
  getImagem() {
    return path11.resolve(process.cwd(), "lib/boleto/bancos/logotipos/sicoob.png");
  }
  getNossoNumeroFormatado(b) {
    return pad(b.getNossoNumero(), 7, "0");
  }
  getNome() {
    return this.nome;
  }
  getImprimirNome() {
    return this.imprimirNome;
  }
  getNossoNumeroECodigoDocumento(boleto) {
    const b = boleto.getBeneficiario();
    return `${pad(b.getCarteira(), 2, "0")}/${this.getNossoNumeroFormatado(b)}-${b.getDigitoNossoNumero()}`;
  }
  getAgenciaECodigoBeneficiario(boleto) {
    const b = boleto.getBeneficiario();
    let codigo = this.getCodigoFormatado(b);
    const digito = b.getDigitoCodigoBeneficiario();
    if (digito) codigo += `-${digito}`;
    return `${b.getAgenciaFormatada()}/${codigo}`;
  }
};

// src/core/bancos/sicredi.ts
init_string();
import path12 from "path";
var NUMERO9 = "748";
var DIGITO9 = "X";
var Sicredi = class {
  constructor() {
    this.imprimirNome = false;
    this.nome = "Sicredi";
  }
  getTitulos() {
    return {
      instrucoes: "Informa\xE7\xF5es de responsabilidade do benefici\xE1rio",
      nomeDoPagador: "Nome do Pagador",
      especie: "Moeda",
      quantidade: "Quantidade",
      valor: "Valor",
      moraMulta: "(+) Juros / Multa"
    };
  }
  exibirReciboDoPagadorCompleto() {
    return true;
  }
  exibirCampoCip() {
    return false;
  }
  geraCodigoDeBarrasPara(boleto) {
    const beneficiario = boleto.getBeneficiario();
    const arrayDigito = ("1" + beneficiario.getCarteira() + beneficiario.getNossoNumero() + beneficiario.getDigitoNossoNumero() + beneficiario.getAgenciaFormatada() + beneficiario.getCodposto() + beneficiario.getCodigoBeneficiario() + "10").split("");
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
      "1",
      this.getCarteiraFormatado(beneficiario),
      nosso.substring(0, 3),
      nosso.substring(3, 8),
      beneficiario.getDigitoNossoNumero(),
      beneficiario.getAgenciaFormatada(),
      beneficiario.getCodposto(),
      beneficiario.getCodigoBeneficiario(),
      "1",
      "0",
      String(digCampoLivre)
    ];
    return new CodigoDeBarrasBuilder(boleto).comCampoLivre(campoLivre);
  }
  getNumeroFormatadoComDigito() {
    return `${NUMERO9}-${DIGITO9}`;
  }
  getNumeroFormatado() {
    return NUMERO9;
  }
  getCarteiraFormatado(b) {
    return pad(b.getCarteira(), 1, "0");
  }
  getCarteiraTexto(b) {
    return pad(b.getCarteira(), 2, "0");
  }
  getCodigoFormatado(b) {
    return pad(b.getCodigoBeneficiario(), 7, "0");
  }
  getImagem() {
    return path12.resolve(process.cwd(), "lib/boleto/bancos/logotipos/sicredi.png");
  }
  getNossoNumeroFormatado(b) {
    return pad(b.getNossoNumero(), 8, "0");
  }
  getNome() {
    return this.nome;
  }
  getImprimirNome() {
    return this.imprimirNome;
  }
  getNossoNumeroECodigoDocumento(boleto) {
    const b = boleto.getBeneficiario();
    const nosso = this.getNossoNumeroFormatado(b);
    return `${nosso.substring(0, 2)}/${nosso.substring(2)}-${b.getDigitoNossoNumero()}`;
  }
  getAgenciaECodigoBeneficiario(boleto) {
    const b = boleto.getBeneficiario();
    const codposto = b.getCodposto();
    let codigo = b.getCodigoBeneficiario();
    const digito = b.getDigitoCodigoBeneficiario();
    if (digito) codigo += `-${digito}`;
    return `${b.getAgenciaFormatada()}/${codposto ? codposto + "." : ""}${codigo}`;
  }
};

// src/core/bancos/index.ts
var Bancos = {
  Bradesco,
  BancoBrasil,
  Banrisul,
  Caixa,
  Cecred,
  Itau,
  Santander,
  Sicoob,
  Sicredi,
  "237": Bradesco,
  "001": BancoBrasil,
  "041": Banrisul,
  "104": Caixa,
  "085": Cecred,
  "341": Itau,
  "033": Santander,
  "756": Sicoob,
  "748": Sicredi
};

// src/core/index.ts
init_formatacoes();
init_validacoes();
function parseValor(v, fallback = 0) {
  const n = parseFloat(String(v ?? fallback));
  return isNaN(n) ? "0.00" : n.toFixed(2);
}
var GeradorDeBoletoEntrada = class {
  constructor(input) {
    this._boletosInfo = [];
    this._processado = false;
    this._inputs = Array.isArray(input) ? input : [input];
  }
  processar() {
    if (this._processado) return this;
    for (const input of this._inputs) {
      const { datas, valor, especieDocumento, numeroDocumento, valorCobrado, valorMoraMultaJuros } = input.boleto;
      const boletoInfo = Boleto.novoBoleto().comDatas(
        Datas.novasDatas().comVencimento(datas.vencimento).comProcessamento(datas.processamento).comDocumento(datas.documentos)
      ).comBeneficiario(BoletoStringify.createBeneficiario(input.beneficiario)).comPagador(BoletoStringify.createPagador(input.pagador)).comBanco(input.banco).comValorBoleto(parseValor(valor)).comNumeroDoDocumento(numeroDocumento).comEspecieDocumento(especieDocumento).comInstrucoes(BoletoStringify.createInstrucoes(input.instrucoes)).comInformativo(BoletoStringify.createInformativo(input.informativo)).comCodigoBarras(input.boleto.codigoBarras).comLinhaDigitavel(input.boleto.linhaDigitavel).comPixEmv(input.boleto.pixQrCode).comValorCobrado(parseValor(valorCobrado, valor)).comValorDescontos(parseValor(input.boleto.valorDescontos)).comValorMoraMultaJuros(parseValor(valorMoraMultaJuros)).comValorDeducoes(parseValor(input.boleto.valorDeducoes)).comLocaisDePagamento(input.locaisDePagamento ?? []).comIdUnico();
      this._boletosInfo.push(boletoInfo);
    }
    this._processado = true;
    return this;
  }
  /** Reseta o estado processado (útil para reutilizar a instância com novos dados). */
  resetar() {
    this._boletosInfo = [];
    this._processado = false;
    return this;
  }
  gerador() {
    this.processar();
    return new GeradorDeBoleto(this._boletosInfo);
  }
  async gerarBase64() {
    const gerador = this.gerador();
    const [base64, linhas] = await Promise.all([
      gerador.gerarPDF({ base64: true }),
      gerador.gerarLinhaDigitavel()
    ]);
    const codigoBarras = this._boletosInfo[0]?._codigoBarras ?? this._boletosInfo[0]?.getBanco().geraCodigoDeBarrasPara(this._boletosInfo[0]) ?? "";
    return { base64, linhaDigitavel: linhas[0]?.linha ?? "", codigoBarras };
  }
  async gerarLinhaDigitavel() {
    return this.gerador().gerarLinhaDigitavel();
  }
  async gerarStream(opts) {
    const pdf = await this.gerador().gerarPDF(opts);
    return pdf;
  }
  async gerarBuffer() {
    const base64 = await this.gerador().gerarPDF({ base64: true });
    return Buffer.from(base64, "base64");
  }
  async gerarPNG(args) {
    return this.gerador().gerarPNG(args);
  }
  async gerarArquivo(dir = "./tmp/boletos", filename = "boleto", modelo) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const stream = fs.createWriteStream(`${dir}/${filename}.pdf`);
    this.processar();
    const Gerador = modelo === "carne" ? GeradorDeBoletoCarne : GeradorDeBoleto;
    await new Gerador(this._boletosInfo).gerarPDF({ stream });
    return { stream };
  }
};
export {
  BancoBrasil,
  Bancos,
  Banrisul,
  Beneficiario,
  Boleto,
  BoletoStringify,
  Bradesco,
  Caixa,
  Cecred,
  Datas,
  Endereco,
  GeradorDeBoleto,
  GeradorDeBoletoCarne,
  GeradorDeBoletoEntrada,
  Itau,
  Pagador,
  Santander,
  Sicoob,
  Sicredi,
  especiesDeDocumento,
  formatacoes_exports as formatacoes,
  validacoes_exports as validacoes
};
//# sourceMappingURL=index.mjs.map