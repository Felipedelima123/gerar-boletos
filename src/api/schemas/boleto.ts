import { z } from 'zod';

const EnderecoSchema = z.object({
  logradouro: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estadoUF: z.string().max(2).optional(),
  cep: z.string().optional(),
});

const DadosBancariosSchema = z.object({
  carteira: z.string(),
  agencia: z.string(),
  agenciaDigito: z.string().optional(),
  conta: z.string(),
  contaDigito: z.string().optional(),
  nossoNumero: z.string(),
  nossoNumeroDigito: z.string().optional(),
  convenio: z.string().optional(),
  posto: z.string().optional(),
});

const PagadorSchema = z.object({
  nome: z.string(),
  registroNacional: z.string(),
  endereco: EnderecoSchema.optional(),
});

const BeneficiarioSchema = z.object({
  nome: z.string(),
  cnpj: z.string().optional(),
  cpf: z.string().optional(),
  registroNacional: z.string().optional(),
  dadosBancarios: DadosBancariosSchema,
  endereco: EnderecoSchema.optional(),
});

const DatasSchema = z.object({
  vencimento: z.string(),
  processamento: z.string(),
  documentos: z.string(),
});

const BANCOS_VALIDOS = ['bradesco', '237', 'banco-do-brasil', 'bancodobrasil', '001', 'banrisul', '041', 'caixa', '104', 'cecred', '085', 'itau', '341', 'santander', '033', 'sicoob', '756', 'sicredi', '748'] as const;

const PixEmvSchema = z.union([
  z.string(),
  z.object({
    emv: z.string(),
    instrucoes: z.array(z.string()).optional(),
  }),
]);

const BoletoDocumentoSchema = z.object({
  numeroDocumento: z.string(),
  especieDocumento: z.string().default('DM'),
  valor: z.number().positive(),
  datas: DatasSchema,
  codigoBarras: z.string().optional(),
  linhaDigitavel: z.string().optional(),
  /** String EMV ou objeto {emv, instrucoes} */
  pixQrCode: PixEmvSchema.optional(),
  valorCobrado: z.number().optional(),
  valorDescontos: z.number().optional(),
  valorMoraMultaJuros: z.number().optional(),
  valorDeducoes: z.number().optional(),
  valorAcrescimos: z.number().optional(),
});

export const BoletoRequestSchema = z.object({
  banco: z.string(),
  pagador: PagadorSchema,
  beneficiario: BeneficiarioSchema,
  instrucoes: z.union([z.string(), z.array(z.string())]).optional(),
  informativo: z.union([z.string(), z.array(z.string())]).optional(),
  locaisDePagamento: z.array(z.string()).optional(),
  boleto: BoletoDocumentoSchema,
});

export const LoteRequestSchema = z.object({
  boletos: z.array(BoletoRequestSchema).min(1).max(50),
});

export type BoletoRequest = z.infer<typeof BoletoRequestSchema>;
export type LoteRequest = z.infer<typeof LoteRequestSchema>;
