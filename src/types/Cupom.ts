export enum CategoriaDespesa {
  ALIMENTACAO = 'alimentação',
  TRANSPORTE = 'transporte',
  LAZER = 'lazer',
  SAUDE = 'saúde',
  EDUCACAO = 'educação',
  MORADIA = 'moradia',
  OUTROS = 'outros',
}

export interface CupomFiscal {
  id?: string;
  valorTotal: number;
  data: string; // ISO date string
  hora?: string;
  estabelecimento: string;
  categoria: CategoriaDespesa;
  imagemUri?: string;
  dadosExtras?: {
    items?: string[];
    cnpj?: string;
    endereco?: string;
  };
  createdAt: Date;
  updatedAt?: Date;
}

export interface CupomExtracao {
  valorTotal: number;
  data: string;
  hora?: string;
  estabelecimento: string;
  categoria: CategoriaDespesa;
  dadosExtras?: {
    items?: string[];
    cnpj?: string;
    endereco?: string;
  };
}

