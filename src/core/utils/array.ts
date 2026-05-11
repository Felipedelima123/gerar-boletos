export function series(from: number, to: number): number[] {
  let params: [number, number] = [from, to];
  if (from > to) params = [to, from];

  const result: number[] = [];
  while (params[0] <= params[1]) {
    result.push(params[0]++);
  }

  return from > to ? result.reverse() : result;
}
