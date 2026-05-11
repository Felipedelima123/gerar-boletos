# @f3dev/gerar-boletos

Biblioteca TypeScript para geração de boletos bancários brasileiros em PDF. Funciona como **biblioteca npm** (importável diretamente no seu código) ou como **API REST** pronta para deploy.

Suporta PIX (QR Code + copia e cola), carnê de boletos e os principais bancos do Brasil.

---

## Bancos suportados

| Banco | Código |
|---|---|
| Banco do Brasil | 001 |
| Bradesco | 237 |
| Caixa Econômica Federal | 104 |
| Itaú | 341 |
| Santander | 033 |
| Banrisul | 041 |
| Sicoob | 756 |
| Sicredi | 748 |
| Ailos (Cecred) | 085 |

---

## Instalação

```bash
npm install @f3dev/gerar-boletos
```

**Requisitos:** Node.js >= 18

---

## Uso como biblioteca

### Boleto simples

```typescript
import { GeradorDeBoletoEntrada, Bancos } from '@f3dev/gerar-boletos';

const gerador = new GeradorDeBoletoEntrada({
  banco: new Bancos.Bradesco(),

  pagador: {
    nome: 'José da Silva',
    registroNacional: '123.456.789-00',
    endereco: {
      logradouro: 'Rua das Flores, 100',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estadoUF: 'SP',
      cep: '01310-100',
    },
  },

  beneficiario: {
    nome: 'Empresa Exemplo LTDA',
    cnpj: '12.345.678/0001-99',
    dadosBancarios: {
      carteira: '17',
      agencia: '4559',
      agenciaDigito: 'X',
      conta: '1157372',
      contaDigito: '8',
      nossoNumero: '00000000001',
      nossoNumeroDigito: '1',
    },
    endereco: {
      logradouro: 'Av. Paulista, 1000',
      cidade: 'São Paulo',
      estadoUF: 'SP',
      cep: '01310-100',
    },
  },

  instrucoes: [
    'Não receber após o vencimento.',
    'Cobrar multa de 2% após o vencimento.',
  ],

  locaisDePagamento: ['Pagável em qualquer banco até o vencimento.'],

  boleto: {
    numeroDocumento: '001',
    especieDocumento: 'DM',
    valor: 150.00,
    datas: {
      vencimento: '2026-06-01',
      processamento: '2026-05-01',
      documentos: '2026-05-01',
    },
  },
});

// Retorna { base64, linhaDigitavel, codigoBarras }
const resultado = await gerador.gerarBase64();

// Ou como Buffer
const buffer = await gerador.gerarBuffer();

// Ou salvar em arquivo
await gerador.gerarArquivo('./boletos', 'meu-boleto');
```

### Boleto com PIX

O campo `pixQrCode` aceita dois formatos:

```typescript
// Formato simples — apenas a string EMV (retrocompatível)
const gerador = new GeradorDeBoletoEntrada({
  boleto: {
    pixQrCode: '00020101021226900014br.gov.bcb.pix...',
  },
});

// Formato completo — EMV + instruções específicas para o bloco PIX
const gerador = new GeradorDeBoletoEntrada({
  boleto: {
    pixQrCode: {
      emv: '00020101021226900014br.gov.bcb.pix...',
      instrucoes: [
        'Escaneie o QR Code com o app do seu banco',
        'ou use o copia e cola abaixo',
      ],
    },
  },
});
```

O PDF gerado exibe automaticamente:
- **Ficha de compensação**: logo do PIX + QR Code lado a lado, com instruções abaixo
- **Recibo do pagador**: string copia e cola completa em caixa destacada

Quando `instrucoes` não são fornecidas no objeto PIX, o campo `informativo` do boleto é usado como fallback.

### Gerar imagem PNG

```typescript
const gerador = new GeradorDeBoletoEntrada({ ... });

// Retorna array de páginas (uma por boleto)
const paginas = await gerador.gerarPNG({ scale: 2.0 });

// paginas[0].page   — número da página (começa em 1)
// paginas[0].buffer — Buffer PNG pronto para salvar ou enviar
// paginas[0].mimeType — 'image/png'

// Salvar em disco
import fs from 'fs';
fs.writeFileSync('boleto.png', paginas[0].buffer);
```

O parâmetro `scale` controla a resolução: `2.0` gera imagem com o dobro da resolução base (recomendado para impressão).

### Obter linha digitável sem gerar PDF

```typescript
const gerador = new GeradorDeBoletoEntrada({ ... });
const linhas = await gerador.gerarLinhaDigitavel();
// linhas[0].linha          — ex: "23793.38128 60000.00001..."
// linhas[0].numeroDocumento — número do documento formatado
```

### Carnê de boletos

Passe um array de boletos e use o modelo `'carne'`:

```typescript
const gerador = new GeradorDeBoletoEntrada([boleto1, boleto2, boleto3]);
await gerador.gerarArquivo('./boletos', 'carne', 'carne');
```

### Usando as classes de domínio diretamente

Para casos que exigem mais controle sobre o objeto boleto:

```typescript
import { Boleto, Datas, Pagador, Beneficiario, Bancos, GeradorDeBoleto } from '@f3dev/gerar-boletos';

const datas = Datas.novasDatas()
  .comVencimento('2026-06-01')
  .comProcessamento('2026-05-01')
  .comDocumento('2026-05-01');

const beneficiario = Beneficiario.novoBeneficiario()
  .comNome('Empresa LTDA')
  .comCNPJ('12345678000199')
  .comAgencia('1234')
  .comCodigoBeneficiario('567890')
  .comCarteira('17')
  .comNossoNumero('00000000001');

const pagador = Pagador.novoPagador()
  .comNome('João da Silva')
  .comCPF('12345678901');

const boleto = Boleto.novoBoleto()
  .comBanco(new Bancos.Bradesco())
  .comBeneficiario(beneficiario)
  .comPagador(pagador)
  .comDatas(datas)
  .comValorBoleto(250.00)
  .comNumeroDoDocumento('0001')
  .comEspecieDocumento('DM');

const base64 = await new GeradorDeBoleto(boleto).gerarPDF({ base64: true });
```

---

## Uso como API REST

### Iniciando o servidor

```bash
# Desenvolvimento (com hot reload)
API_KEY=sua-chave-secreta npm run dev

# Produção
npm run build
API_KEY=sua-chave-secreta npm start
```

Variáveis de ambiente:

| Variável | Padrão | Descrição |
|---|---|---|
| `API_KEY` | — | Chave de autenticação. Se não definida, a autenticação é desabilitada |
| `PORT` | `3000` | Porta do servidor |
| `HOST` | `0.0.0.0` | Host do servidor |

### Autenticação

Todas as rotas `/api/*` exigem o header `X-API-Key`:

```
X-API-Key: sua-chave-secreta
```

Sem autenticação válida a API retorna `401`:
```json
{ "error": "API key inválida ou ausente" }
```

---

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/health` | Verificação de saúde (sem autenticação) |
| `POST` | `/api/v1/boletos` | Gerar boleto — retorna base64 + metadados |
| `POST` | `/api/v1/boletos/pdf` | Gerar boleto — retorna PDF binário |
| `POST` | `/api/v1/boletos/png` | Gerar boleto — retorna PNG binário |
| `POST` | `/api/v1/boletos/carne` | Gerar carnê (múltiplos boletos) — retorna base64 |

---

### `GET /health`

Verifica se o servidor está no ar. Não requer autenticação.

```bash
curl http://localhost:3000/health
```

```json
{ "status": "ok", "timestamp": "2026-05-08T12:00:00.000Z" }
```

---

### `POST /api/v1/boletos`

Gera um boleto e retorna em base64 junto com a linha digitável e o código de barras.

```bash
curl -X POST http://localhost:3000/api/v1/boletos \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sua-chave-secreta" \
  -d '{
    "banco": "bradesco",
    "pagador": {
      "nome": "José da Silva",
      "registroNacional": "12345678901",
      "endereco": {
        "logradouro": "Rua das Flores, 100",
        "bairro": "Centro",
        "cidade": "São Paulo",
        "estadoUF": "SP",
        "cep": "01310-100"
      }
    },
    "beneficiario": {
      "nome": "Empresa Exemplo LTDA",
      "cnpj": "12345678000199",
      "dadosBancarios": {
        "carteira": "17",
        "agencia": "4559",
        "agenciaDigito": "X",
        "conta": "1157372",
        "contaDigito": "8",
        "nossoNumero": "00000000001",
        "nossoNumeroDigito": "1"
      }
    },
    "instrucoes": ["Não receber após o vencimento."],
    "boleto": {
      "numeroDocumento": "001",
      "especieDocumento": "DM",
      "valor": 150.00,
      "datas": {
        "vencimento": "2026-06-01",
        "processamento": "2026-05-01",
        "documentos": "2026-05-01"
      }
    }
  }'
```

**Resposta `200`:**
```json
{
  "base64": "JVBERi0xLjMK...",
  "linhaDigitavel": "23793.38128 60000.000018 00000.010177 8 00000000015000",
  "codigoBarras": "23798000000001500033812860000000010000000001017"
}
```

---

### `POST /api/v1/boletos/pdf`

Gera um boleto e retorna o PDF diretamente como arquivo binário.

```bash
curl -X POST http://localhost:3000/api/v1/boletos/pdf \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sua-chave-secreta" \
  -d '{ ...mesmo body do endpoint acima... }' \
  --output boleto.pdf
```

Retorna `Content-Type: application/pdf` com `Content-Disposition: attachment; filename="boleto.pdf"`.

---

### `POST /api/v1/boletos/png`

Gera o boleto como imagem PNG. Aceita o parâmetro `?scale=2.0` na query string para ajustar a resolução.

```bash
curl -X POST "http://localhost:3000/api/v1/boletos/png?scale=2.0" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sua-chave-secreta" \
  -d '{ ...mesmo body de /api/v1/boletos... }' \
  --output boleto.png
```

- **Boleto simples (1 página):** retorna `Content-Type: image/png` com o PNG binário diretamente.
- **Múltiplas páginas:** retorna JSON com array de base64 por página:

```json
{
  "paginas": [
    { "pagina": 1, "base64": "iVBORw0KGgo...", "mimeType": "image/png" },
    { "pagina": 2, "base64": "iVBORw0KGgo...", "mimeType": "image/png" }
  ]
}
```

---

### `POST /api/v1/boletos/carne`

Gera um carnê com múltiplos boletos (até 50) em um único PDF, com até 3 boletos por página.

```bash
curl -X POST http://localhost:3000/api/v1/boletos/carne \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sua-chave-secreta" \
  -d '{
    "boletos": [
      { "banco": "bradesco", "pagador": { ... }, "beneficiario": { ... }, "boleto": { ... } },
      { "banco": "bradesco", "pagador": { ... }, "beneficiario": { ... }, "boleto": { ... } }
    ]
  }'
```

**Resposta `200`:**
```json
{ "base64": "JVBERi0xLjMK..." }
```

---

## Referência: campos opcionais do boleto

Além dos campos obrigatórios, o objeto `boleto` aceita:

| Campo | Tipo | Descrição |
|---|---|---|
| `pixQrCode` | `string \| { emv: string; instrucoes?: string[] }` | PIX — string EMV simples ou objeto com instruções customizadas |
| `valorCobrado` | `number` | Valor total a cobrar (após juros/descontos) |
| `valorDescontos` | `number` | Valor de descontos a abater |
| `valorMoraMultaJuros` | `number` | Valor de mora, multa e juros |
| `valorDeducoes` | `number` | Outras deduções |
| `codigoBarras` | `string` | Código de barras pré-calculado (44 dígitos) |
| `linhaDigitavel` | `string` | Linha digitável pré-calculada (47 dígitos) |

## Referência: nomes de banco aceitos na API

Você pode usar o nome por extenso ou o código FEBRABAN:

| Nome | Código |
|---|---|
| `bradesco` | `237` |
| `banco-do-brasil` | `001` |
| `banrisul` | `041` |
| `caixa` | `104` |
| `cecred` | `085` |
| `itau` | `341` |
| `santander` | `033` |
| `sicoob` | `756` |
| `sicredi` | `748` |

## Referência: espécies de documento

| Código | Descrição |
|---|---|
| `DM` | Duplicata de Venda Mercantil |
| `NP` | Nota Promissória |
| `DS` | Duplicata de Prestação de Serviços |
| `ME` | Mensalidade Escolar |
| `EC` | Encargos Condominiais |
| `FS` | Fatura de Serviço |
| `CC` | Contrato de Câmbio |
| `CH` | Cheque |
| `DV` | Diversos |
| `DMI` | Duplicata de Venda Mercantil por Indicação |
| `DSI` | Duplicata de Prestação de Serviços por Indicação |

---

## Estrutura do projeto

```
src/
├── core/                # Biblioteca pura (sem dependência HTTP)
│   ├── types/           # Interfaces TypeScript
│   ├── bancos/          # Implementação dos 9 bancos
│   ├── utils/           # Formatações, validações, utilitários
│   ├── boleto.ts        # Classes Boleto, Pagador, Beneficiario, Datas, Endereco
│   ├── gerador.ts       # Gerador de PDF (boleto único)
│   ├── gerador-carne.ts # Gerador de PDF (carnê)
│   └── index.ts         # Entry point da biblioteca
└── api/                 # Camada HTTP (Fastify)
    ├── routes/          # Rotas da API
    ├── schemas/         # Validação de entrada (Zod)
    └── server.ts        # Servidor Fastify
```

---

## Scripts

```bash
npm run build       # Compila para dist/ (CJS + ESM + tipos .d.ts)
npm run dev         # Sobe a API com hot reload
npm start           # Sobe a API em produção (requer build antes)
npm test            # Roda os testes (Vitest)
npm run test:watch  # Testes em modo watch
```

---

## Tecnologias

- **TypeScript 5** — tipagem estática completa
- **tsup** — build duplo (CJS + ESM) com declarações de tipo
- **Fastify 4** — framework HTTP de alta performance
- **Zod** — validação de schema nos endpoints
- **date-fns** — manipulação de datas
- **PDFKit** — geração de PDFs
- **Vitest** — testes unitários

---

## Inspiração

Este projeto é um fork modernizado do [gerar-boletos-pdfkit](https://github.com/romulosanttos/gerar-boletos-pdfkit), criado originalmente por [Rômulo Cabral Santos](https://github.com/romulosanttos). O projeto original, por sua vez, se inspirou no [Stella-Boletos](https://github.com/caelum/caelum-stella) da Caelum.

A lógica bancária — cálculo de dígitos verificadores, montagem do campo livre, layout dos boletos e suporte a cada banco — foi desenvolvida a partir desse trabalho. A contribuição deste fork é a migração completa para TypeScript, a nova interface de API unificada e a camada REST com Fastify.

---

## Licença

MIT © 2026 Francisco Lima
