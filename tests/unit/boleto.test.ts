import { describe, it, expect } from 'vitest';
import { Boleto, Datas, Endereco, especiesDeDocumento } from '../../src/core/boleto.js';
import { Bancos } from '../../src/core/bancos/index.js';

describe('especiesDeDocumento', () => {
  it('deve conter o número correto de espécies', () => {
    expect(Object.keys(especiesDeDocumento).length).toBe(21);
  });
});

describe('Bancos', () => {
  it('todos os bancos estão disponíveis', () => {
    expect(new Bancos.Itau()).toBeTruthy();
    expect(new Bancos['341']()).toBeTruthy();
    expect(new Bancos.Caixa()).toBeTruthy();
    expect(new Bancos['104']()).toBeTruthy();
    expect(new Bancos.Bradesco()).toBeTruthy();
    expect(new Bancos['237']()).toBeTruthy();
    expect(new Bancos.Sicoob()).toBeTruthy();
    expect(new Bancos['756']()).toBeTruthy();
    expect(new Bancos.Cecred()).toBeTruthy();
    expect(new Bancos['085']()).toBeTruthy();
  });
});

describe('Datas', () => {
  it('é possível instanciar', () => {
    expect(Datas.novasDatas()).toBeTruthy();
  });

  it('deve lançar exceção para datas muito antigas', () => {
    expect(() => {
      Datas.novasDatas().comDocumento(new Date(1996, 0, 1));
    }).toThrow();
  });

  it('deve lançar exceção para datas além de 2999', () => {
    expect(() => {
      Datas.novasDatas().comDocumento(new Date(2999, 11, 31));
    }).toThrow();
  });
});

describe('Endereco', () => {
  it('deve imprimir endereço completo', () => {
    const endereco = Endereco.novoEndereco()
      .comLogradouro('RODOVIA SC 401, KM 1 - EDIFÍCIO CELTA')
      .comBairro('PARQTEC ALFA')
      .comCep('88030000')
      .comCidade('FLORIANÓPOLIS')
      .comUf('SC');

    expect(endereco.getEnderecoCompleto()).toBe(
      'RODOVIA SC 401, KM 1 - EDIFÍCIO CELTA PARQTEC ALFA 88.030-000 FLORIANÓPOLIS SC'
    );
  });

  it('deve imprimir vazio se endereço não preenchido', () => {
    expect(Endereco.novoEndereco().getEnderecoCompleto()).toBe('');
  });
});

describe('Boleto', () => {
  it('é possível instanciar', () => {
    expect(Boleto.novoBoleto()).toBeTruthy();
  });

  it('novo boleto deve ter valores padrão', () => {
    const b = Boleto.novoBoleto();
    expect(b.getEspecieMoeda()).toBe('R$');
    expect(b.getCodigoEspecieMoeda()).toBe('9');
    expect(b.getAceiteFormatado()).toBe('S');
    expect(b.getEspecieDocumento()).toBe('DV');
  });

  it('calcula corretamente o fator de vencimento', () => {
    const datas = Datas.novasDatas().comVencimento(new Date(2015, 2, 21));
    const b = Boleto.novoBoleto().comDatas(datas);
    expect(b.getFatorVencimento()).toBe('6374');
  });

  it('calcula fator de vencimento ignorando horas - 1', () => {
    const datas = Datas.novasDatas().comVencimento(new Date(2008, 4, 2, 0, 0, 0, 0));
    expect(Boleto.novoBoleto().comDatas(datas).getFatorVencimento()).toBe('3860');
  });

  it('calcula fator de vencimento ignorando horas - 2', () => {
    const datas = Datas.novasDatas().comVencimento(new Date(2008, 4, 2, 23, 59, 59, 999));
    expect(Boleto.novoBoleto().comDatas(datas).getFatorVencimento()).toBe('3860');
  });

  it('lança exceção para valor negativo', () => {
    expect(() => Boleto.novoBoleto().comValorBoleto(-5)).toThrow();
  });

  it('lança exceção para valor acima do limite', () => {
    expect(() => Boleto.novoBoleto().comValorBoleto(100000000)).toThrow();
  });

  it('valor formatado deve ter 10 dígitos - 3', () => {
    expect(Boleto.novoBoleto().comValorBoleto(3).getValorFormatado()).toBe('0000000300');
    expect(Boleto.novoBoleto().comValorBoleto(3.1).getValorFormatado()).toBe('0000000310');
    expect(Boleto.novoBoleto().comValorBoleto(3.18).getValorFormatado()).toBe('0000000318');
    expect(Boleto.novoBoleto().comValorBoleto(300).getValorFormatado()).toBe('0000030000');
    expect(Boleto.novoBoleto().comValorBoleto(3.189).getValorFormatado()).toBe('0000000318');
  });

  it('número do documento formatado deve ter 4 dígitos', () => {
    const b = Boleto.novoBoleto().comNumeroDoDocumento('232');
    expect(b.getNumeroDoDocumentoFormatado()).toBe('0232');
  });

  it('não deve aceitar mais de cinco instruções', () => {
    expect(() => Boleto.novoBoleto().comInstrucoes(['', '', '', '', '', ''])).toThrow();
  });

  it('não deve aceitar mais de dois locais de pagamento', () => {
    expect(() => Boleto.novoBoleto().comLocaisDePagamento(['', '', ''])).toThrow();
  });

  it('formatação BRL deve estar correta', () => {
    expect(Boleto.novoBoleto().comValorBoleto(0).getValorFormatadoBRL()).toBe('R$ 0,00');
    expect(Boleto.novoBoleto().comValorBoleto(1).getValorFormatadoBRL()).toBe('R$ 1,00');
    expect(Boleto.novoBoleto().comValorBoleto(1.23).getValorFormatadoBRL()).toBe('R$ 1,23');
    expect(Boleto.novoBoleto().comValorBoleto(1000.23).getValorFormatadoBRL()).toBe('R$ 1.000,23');
    expect(Boleto.novoBoleto().comValorBoleto(99999999.99).getValorFormatadoBRL()).toBe('R$ 99.999.999,99');
  });
});
