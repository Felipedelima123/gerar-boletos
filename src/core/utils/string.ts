export function pad(
  str: string | number | null | undefined,
  length: number,
  padStr?: string,
  type?: 'left' | 'right' | 'both'
): string {
  const s = str == null ? '' : String(str);
  const len = ~~length;
  let padlen = 0;

  let p = padStr || ' ';
  if (p.length > 1) p = p.charAt(0);

  function strRepeat(c: string, qty: number): string {
    if (qty < 1) return '';
    let result = '';
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
    case 'right':
      padlen = len - s.length;
      return s + strRepeat(p, padlen);
    case 'both':
      padlen = len - s.length;
      return strRepeat(p, Math.ceil(padlen / 2)) + s + strRepeat(p, Math.floor(padlen / 2));
    default:
      padlen = len - s.length;
      return strRepeat(p, padlen) + s;
  }
}

export function insert(string: string, index: number, value: string): string {
  return [string.substring(0, index), value, string.substring(index)].join('');
}

export function capitalize(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  return value.substr(0, 1).toUpperCase() + value.substr(1);
}
