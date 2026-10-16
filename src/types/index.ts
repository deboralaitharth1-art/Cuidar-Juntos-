export interface PatientData {
  nome: string;
  nascimento: string;
  cartaoSus: string;
  tipoSanguineo: string;
  contatoEmergenciaNome: string;
  contatoEmergenciaTelefone: string;
  contatoSecundarioNome: string;
  contatoSecundarioTelefone: string;
  alergias: string;
  diagnosticos: string;
  observacoesMedicas: string;
}

export interface UbsData {
  nome: string;
  telefone: string;
  endereco: string;
  horario: string;
}

export interface MedicationItem {
  id: string;
  nome: string;
  dosagem: string;
  finalidade: string;
  horarios: string[];
  observacoes: string;
  tomadoHoje: Record<string, boolean>; // key is time string e.g. "08:00"
}

export interface HealthLogItem {
  id: string;
  dataHora: string; // ISO string
  pressaoSistolica?: number;
  pressaoDiastolica?: number;
  glicemia?: number;
  glicemiaMomento?: 'jejum' | 'pos-prandial' | 'aleatorio';
  temperatura?: number;
  frequenciaCardiaca?: number;
  evacuacao?: 'normal' | 'ausente_mais_2_dias' | 'diarreia' | 'outro';
  diurese?: 'normal' | 'escura_pouca' | 'abundante';
  humorOuEstado?: 'alerta' | 'sonolento' | 'agitado' | 'confuso' | 'estavel';
  anotacoes: string;
}

export type DecubitusPosition = 'costas' | 'direito' | 'esquerdo' | 'sentado';

export interface DecubitusRecord {
  id: string;
  posicao: DecubitusPosition;
  horario: string;
  observacao?: string;
}

export interface FirstAidStep {
  numero: number;
  titulo: string;
  descricao: string;
  detalhe?: string;
}

export interface FirstAidItem {
  id: string;
  titulo: string;
  icone: string;
  categoria: 'respiratorio' | 'trauma' | 'neurologico' | 'clinico';
  resumo: string;
  urgencia: 'imediata' | 'alta' | 'moderada';
  passos: FirstAidStep[];
  fazer: string[];
  naoFazer: string[];
  quandoLigar192: string;
  fonte: {
    instituicao: string;
    documento: string;
    detalhe?: string;
  };
}
