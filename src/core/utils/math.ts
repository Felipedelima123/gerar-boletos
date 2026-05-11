import { series } from './array.js';

interface ModOptions {
  value: string;
  factors?: number[];
  divider?: number;
  direction?: 'leftToRight' | 'rightToLeft';
  reduceSummationTerms?: boolean;
  cumplimentaryToDivider?: boolean;
}

export function mod(
  valueOrOptions: string | ModOptions,
  factors?: number[],
  divider?: number,
  direction?: 'leftToRight' | 'rightToLeft'
): number {
  let value: string;
  let reduceSummationTerms = false;
  let cumplimentaryToDivider = false;

  if (typeof valueOrOptions === 'object') {
    value = valueOrOptions.value;
    factors = valueOrOptions.factors;
    divider = valueOrOptions.divider;
    direction = valueOrOptions.direction;
    reduceSummationTerms = valueOrOptions.reduceSummationTerms ?? false;
    cumplimentaryToDivider = valueOrOptions.cumplimentaryToDivider ?? false;
  } else {
    value = valueOrOptions;
  }

  if (divider === undefined) divider = 11;
  if (factors === undefined) factors = series(2, 9);
  if (direction === undefined) direction = 'rightToLeft';

  const reduceMethod = direction === 'leftToRight' ? 'reduce' : 'reduceRight';

  let i = 0;
  const facs = factors;
  let result = (value.split('') as string[])[reduceMethod]((last: number, current: string) => {
    if (i > facs.length - 1) i = 0;
    let total = facs[i++] * parseInt(current, 10);

    if (reduceSummationTerms) {
      total = total.toString().split('').map(Number).reduce((a, b) => a + b, 0);
    }

    return total + last;
  }, 0) % divider;

  if (cumplimentaryToDivider) {
    result = divider - result;
  }

  return result;
}
