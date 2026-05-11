export function validar(codigoDeBarras: string): void {
  if (codigoDeBarras.length !== 44) {
    throw new Error(
      [
        'Erro na geração do código de barras.',
        'Número de dígitos diferente de 44.',
        'Verifique se todos os dados foram preenchidos corretamente.',
        `Tamanho encontrado: ${codigoDeBarras.length}`,
        `Valor encontrado: ${codigoDeBarras}`,
      ].join(' ')
    );
  }
}
