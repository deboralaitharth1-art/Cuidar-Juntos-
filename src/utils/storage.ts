import { PatientData, UbsData, MedicationItem, HealthLogItem, DecubitusRecord, DecubitusPosition } from '../types';

const STORAGE_KEYS = {
  PATIENT: 'cuidabem_patient',
  UBS: 'cuidabem_ubs',
  MEDICATIONS: 'cuidabem_medications',
  HEALTH_LOGS: 'cuidabem_health_logs',
  DECUBITUS: 'cuidabem_decubitus_state',
  DECUBITUS_HISTORY: 'cuidabem_decubitus_history',
  TEXT_SIZE: 'cuidabem_text_size',
  // Legacy keys from the initial prototype
  LEGACY_NOME: 'nome',
  LEGACY_NASC: 'nascimento',
  LEGACY_CONTATO: 'contato-emergencia',
  LEGACY_ALERGIAS: 'alergias',
  LEGACY_MEDICAMENTOS: 'medicamentos',
  LEGACY_REGISTRO: 'registro',
  LEGACY_UBS: 'ubs'
};

const DEFAULT_PATIENT: PatientData = {
  nome: 'Dona Helena Silveira',
  nascimento: '14/08/1946 (78 anos)',
  cartaoSus: '723 8812 0041 9012',
  tipoSanguineo: 'O+',
  contatoEmergenciaNome: 'Carlos Silveira (Filho)',
  contatoEmergenciaTelefone: '(11) 98765-4321',
  contatoSecundarioNome: 'Dra. Márcia (Médica de Família)',
  contatoSecundarioTelefone: '(11) 99123-4567',
  alergias: 'Alergia grave a Penicilina e Dipirona',
  diagnosticos: 'Hipertensão arterial, Sequela motora leve de AVC, Diabetes Tipo 2',
  observacoesMedicas: 'Usa prótese dentária superior. Dificuldade de deglutição com líquidos finos (necessita espessante alimentar).'
};

const DEFAULT_UBS: UbsData = {
  nome: 'UBS Jardim das Flores / ESF 03',
  telefone: '(11) 3214-5500',
  endereco: 'Rua das Camélias, 120 — Jd. Flores',
  horario: 'Segunda a Sexta, das 07:00 às 17:00'
};

const DEFAULT_MEDICATIONS: MedicationItem[] = [
  {
    id: 'med-1',
    nome: 'Losartana Potássica',
    dosagem: '50 mg — 1 comprimido',
    finalidade: 'Controle da Pressão Arterial',
    horarios: ['08:00', '20:00'],
    observacoes: 'Tomar com água logo após a refeição.',
    tomadoHoje: { '08:00': true, '20:00': false }
  },
  {
    id: 'med-2',
    nome: 'Metformina',
    dosagem: '850 mg — 1 comprimido',
    finalidade: 'Controle de Diabetes (Glicose)',
    horarios: ['12:00'],
    observacoes: 'Tomar junto com o almoço para evitar azia.',
    tomadoHoje: { '12:00': false }
  },
  {
    id: 'med-3',
    nome: 'Sinvastatina',
    dosagem: '20 mg — 1 comprimido',
    finalidade: 'Controle do Colesterol',
    horarios: ['21:00'],
    observacoes: 'Tomar sempre à noite antes de dormir.',
    tomadoHoje: { '21:00': false }
  }
];

const DEFAULT_HEALTH_LOGS: HealthLogItem[] = [
  {
    id: 'log-1',
    dataHora: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    pressaoSistolica: 125,
    pressaoDiastolica: 82,
    glicemia: 112,
    glicemiaMomento: 'jejum',
    temperatura: 36.4,
    frequenciaCardiaca: 74,
    evacuacao: 'normal',
    diurese: 'normal',
    humorOuEstado: 'alerta',
    anotacoes: 'Acordou bem disposta. Aceitou todo o café da manhã com leite espessado e mamão amassado.'
  },
  {
    id: 'log-2',
    dataHora: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    pressaoSistolica: 130,
    pressaoDiastolica: 85,
    glicemia: 138,
    glicemiaMomento: 'pos-prandial',
    temperatura: 36.6,
    frequenciaCardiaca: 76,
    evacuacao: 'normal',
    diurese: 'normal',
    humorOuEstado: 'estavel',
    anotacoes: 'Fisioterapia motora realizada à tarde. Dormiu sem queixas.'
  }
];

export function getStoredPatient(): PatientData {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PATIENT);
    if (raw) return JSON.parse(raw);

    // Check if legacy keys exist from user's earlier test
    const legacyNome = localStorage.getItem(STORAGE_KEYS.LEGACY_NOME);
    const legacyNasc = localStorage.getItem(STORAGE_KEYS.LEGACY_NASC);
    const legacyContato = localStorage.getItem(STORAGE_KEYS.LEGACY_CONTATO);
    const legacyAlergias = localStorage.getItem(STORAGE_KEYS.LEGACY_ALERGIAS);

    if (legacyNome || legacyNasc || legacyContato || legacyAlergias) {
      return {
        ...DEFAULT_PATIENT,
        nome: legacyNome || DEFAULT_PATIENT.nome,
        nascimento: legacyNasc || DEFAULT_PATIENT.nascimento,
        contatoEmergenciaTelefone: legacyContato || DEFAULT_PATIENT.contatoEmergenciaTelefone,
        alergias: legacyAlergias || DEFAULT_PATIENT.alergias
      };
    }
  } catch (e) {
    console.error('Error reading patient data from storage', e);
  }
  return DEFAULT_PATIENT;
}

export function savePatient(data: PatientData): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PATIENT, JSON.stringify(data));
    // Keep legacy keys synced for full backwards compatibility
    localStorage.setItem(STORAGE_KEYS.LEGACY_NOME, data.nome);
    localStorage.setItem(STORAGE_KEYS.LEGACY_NASC, data.nascimento);
    localStorage.setItem(STORAGE_KEYS.LEGACY_CONTATO, data.contatoEmergenciaTelefone);
    localStorage.setItem(STORAGE_KEYS.LEGACY_ALERGIAS, data.alergias);
  } catch (e) {
    console.error('Error saving patient data', e);
  }
}

export function getStoredUbs(): UbsData {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.UBS);
    if (raw) return JSON.parse(raw);
    const legacyUbs = localStorage.getItem(STORAGE_KEYS.LEGACY_UBS);
    if (legacyUbs) {
      return { ...DEFAULT_UBS, telefone: legacyUbs };
    }
  } catch (e) {
    console.error('Error reading UBS data', e);
  }
  return DEFAULT_UBS;
}

export function saveUbs(data: UbsData): void {
  try {
    localStorage.setItem(STORAGE_KEYS.UBS, JSON.stringify(data));
    localStorage.setItem(STORAGE_KEYS.LEGACY_UBS, data.telefone);
  } catch (e) {
    console.error('Error saving UBS data', e);
  }
}

export function getStoredMedications(): MedicationItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEDICATIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading medications', e);
  }
  return DEFAULT_MEDICATIONS;
}

export function saveMedications(list: MedicationItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(list));
    // Also format a readable legacy summary string
    const summary = list.map(m => `${m.nome} (${m.dosagem}) | ${m.finalidade} | ${m.horarios.join(', ')}`).join('\n');
    localStorage.setItem(STORAGE_KEYS.LEGACY_MEDICAMENTOS, summary);
  } catch (e) {
    console.error('Error saving medications', e);
  }
}

export function getStoredHealthLogs(): HealthLogItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HEALTH_LOGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading health logs', e);
  }
  return DEFAULT_HEALTH_LOGS;
}

export function saveHealthLogs(logs: HealthLogItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HEALTH_LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Error saving health logs', e);
  }
}

export interface DecubitusState {
  posicao: DecubitusPosition;
  ultimaMudanca: string;
  intervaloMinutos: number;
}

export function getStoredDecubitus(): DecubitusState {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DECUBITUS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading decubitus state', e);
  }
  return {
    posicao: 'costas',
    ultimaMudanca: new Date().toISOString(),
    intervaloMinutos: 120 // 2 hours standard
  };
}

export function saveDecubitus(state: DecubitusState): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DECUBITUS, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving decubitus state', e);
  }
}

export function getStoredDecubitusHistory(): DecubitusRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DECUBITUS_HISTORY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading decubitus history', e);
  }
  return [];
}

export function saveDecubitusHistory(history: DecubitusRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DECUBITUS_HISTORY, JSON.stringify(history.slice(0, 30)));
  } catch (e) {
    console.error('Error saving decubitus history', e);
  }
}

export type TextSizeOption = 'normal' | 'grande' | 'extragrande';

export function getStoredTextSize(): TextSizeOption {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEXT_SIZE);
    if (raw === 'grande' || raw === 'extragrande') return raw;
  } catch {
    // ignore
  }
  return 'normal';
}

export function saveTextSize(size: TextSizeOption): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TEXT_SIZE, size);
  } catch {
    // ignore
  }
}
