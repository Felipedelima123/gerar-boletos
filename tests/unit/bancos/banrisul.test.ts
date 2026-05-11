import { describe, it, expect, beforeEach } from 'vitest';
import { Banrisul } from '../../../src/core/bancos/banrisul.js';
import { Boleto, Datas, Beneficiario, Pagador, Endereco } from '../../../src/core/boleto.js';
import { gerarLinhaDigitavel } from '../../../src/core/gerador-linha-digitavel.js';

describe('Banrisul', () => {
  let banco: Banrisul;
  let boleto: Boleto;

  beforeEach(() => {
    banco = new Banrisul();

    const datas = Datas.novasDatas()
      .comDocumento('2020-04-02')
      .comProcessamento('2020-04-02')
      .comVencimento('2020-04-02');

    const beneficiario = Beneficiario.novoBeneficiario()
      .comNome('Empresa Exemplo LTDA')
      .comRegistroNacional('12345678000199')
      .comAgencia('1234')
      .comDigitoAgencia('0')
      .comCodigoBeneficiario('0012345')
      .comDigitoCodigoBeneficiario('6')
      .comCarteira('1')
      .comNossoNumero('00000001')
      .comEndereco(
        Endereco.novoEndereco()
          .comLogradouro('Av. Borges de Medeiros, 123')
          .comBairro('Centro').comCep('90020020').comCidade('Porto Alegre').comUf('RS')
      );

    const pagador = Pagador.novoPagador()
      .comNome('José da Silva')
      .comRegistroNacional('12345678901')
      .comEndereco(
        Endereco.novoEndereco()
          .comLogradouro('Rua dos Andradas, 1234')
          .comBairro('Centro Histórico').comCep('90020000').comCidade('Porto Alegre').comUf('RS')
      );

    boleto = Boleto.novoBoleto()
      .comDatas(datas).comBeneficiario(beneficiario).comBanco(banco).comPagador(pagador)
      .comValorBoleto(150).comNumeroDoDocumento('1001')
      .comLocaisDePagamento(['Pagável preferencialmente na rede Banrisul ou em qualquer banco até o vencimento']);
  });

  it('nosso número formatado deve ter 8 dígitos', () => {
    const nossoNumero = banco.getNossoNumeroFormatado(boleto.getBeneficiario());
    expect(nossoNumero.length).toBe(8);
    expect(nossoNumero).toBe('00000001');
  });

  it('carteira formatada deve ter dois dígitos', () => {
    const carteira = banco.getCarteiraFormatado(boleto.getBeneficiario());
    expect(carteira.length).toBe(2);
    expect(carteira).toBe('01');
  });

  it('conta corrente formatada deve ter sete dígitos', () => {
    const codigo = banco.getCodigoFormatado(boleto.getBeneficiario());
    expect(codigo.length).toBe(7);
    expect(codigo).toBe('0012345');
  });

  it('deve gerar linha digitável válida', () => {
    const codigoDeBarras = banco.geraCodigoDeBarrasPara(boleto);
    const linhaDigitavel = gerarLinhaDigitavel(codigoDeBarras, banco);
    expect(linhaDigitavel).toBeTruthy();
    const digitosApenas = linhaDigitavel.replace(/[\s.]/g, '');
    expect(digitosApenas.length).toBe(47);
  });

  it('deve gerar código de barras com 44 dígitos', () => {
    const codigoDeBarras = banco.geraCodigoDeBarrasPara(boleto);
    expect(codigoDeBarras).toBeTruthy();
    expect(codigoDeBarras.length).toBe(44);
  });

  it('deve retornar o nome do banco', () => {
    expect(banco.getNome()).toBe('Banco do Estado do Rio Grande do Sul S.A.');
  });

  it('deve retornar número formatado com dígito', () => {
    expect(banco.getNumeroFormatadoComDigito()).toBe('041-8');
  });

  it('deve retornar número do banco', () => {
    expect(banco.getNumeroFormatado()).toBe('041');
  });

  it('deve retornar agência e código do beneficiário formatados', () => {
    const agenciaECodigo = banco.getAgenciaECodigoBeneficiario(boleto);
    expect(agenciaECodigo).toBe('1234.0012345.6');
  });

  it('deve calcular duplo dígito com dois caracteres', () => {
    const duploDigito = banco.calculaDuploDigito(boleto.getBeneficiario());
    expect(duploDigito.length).toBe(2);
    expect(duploDigito).toBeTruthy();
  });

  it('deve calcular duplo dígito conforme documentação (00189274 → 46)', () => {
    expect(banco.calcularDVNossoNumero('00189274')).toBe('46');
  });

  it('deve calcular módulo 10 corretamente (00189274 → 4)', () => {
    expect(banco.calcularModulo10('00189274')).toBe(4);
  });

  it('deve calcular módulo 11 corretamente (001892744 → 6)', () => {
    expect(banco.calcularModulo11('001892744')).toBe(6);
  });
});
