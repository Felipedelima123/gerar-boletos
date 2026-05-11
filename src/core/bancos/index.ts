export { Bradesco } from './bradesco.js';
export { BancoBrasil } from './banco-do-brasil.js';
export { Banrisul } from './banrisul.js';
export { Caixa } from './caixa.js';
export { Cecred } from './cecred.js';
export { Itau } from './itau.js';
export { Santander } from './santander.js';
export { Sicoob } from './sicoob.js';
export { Sicredi } from './sicredi.js';

import { Bradesco } from './bradesco.js';
import { BancoBrasil } from './banco-do-brasil.js';
import { Banrisul } from './banrisul.js';
import { Caixa } from './caixa.js';
import { Cecred } from './cecred.js';
import { Itau } from './itau.js';
import { Santander } from './santander.js';
import { Sicoob } from './sicoob.js';
import { Sicredi } from './sicredi.js';

export const Bancos = {
  Bradesco,
  BancoBrasil,
  Banrisul,
  Caixa,
  Cecred,
  Itau,
  Santander,
  Sicoob,
  Sicredi,
  '237': Bradesco,
  '001': BancoBrasil,
  '041': Banrisul,
  '104': Caixa,
  '085': Cecred,
  '341': Itau,
  '033': Santander,
  '756': Sicoob,
  '748': Sicredi,
} as const;

export type BancoNome = keyof typeof Bancos;
