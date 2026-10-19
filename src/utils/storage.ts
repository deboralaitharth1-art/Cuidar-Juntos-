import {
  PatientData,
  PatientProfile,
  UbsData,
  MedicationItem,
  HealthLogItem,
  MedicalAppointment,
  DecubitusRecord,
  DecubitusPosition
} from '../types';

const STORAGE_KEYS = {
  PATIENT: 'cuidabem_patient',
  PATIENT_LIST: 'cuidabem_patient_list',
  ACTIVE_PATIENT_ID: 'cuidabem_active_patient_id',
  UBS: 'cuidabem_ubs',
  MEDICATIONS: 'cuidabem_medications',
  HEALTH_LOGS: 'cuidabem_health_logs',
  APPOINTMENTS: 'cuidabem_appointments',
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

const DEFAULT_APPOINTMENTS: MedicalAppointment[] = [
  {
    id: 'app-1',
    tipo: 'consulta',
    titulo: 'Consulta com Cardiologista',
    medicoOuLocal: 'Dr. Roberto Alves — UBS Jardim das Flores (Sala 04)',
    data: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
    horario: '09:30',
    preparo: 'Levar cartão SUS, exames laboratoriais anteriores e receitas dos remédios de pressão.',
    status: 'agendado',
    observacoes: 'Avaliação de rotina pós-ajuste de Losartana.'
  },
  {
    id: 'app-2',
    tipo: 'exame_sangue',
    titulo: 'Exame de Sangue & Glicemia em Jejum',
    medicoOuLocal: 'Laboratório Municipal / Posto Central',
    data: new Date(Date.now() + 6 * 24 * 3600 * 1000).toISOString().split('T')[0],
    horario: '07:15',
    preparo: 'Jejum obrigatório de 10 a 12 horas. Ingestão de água em pequena quantidade permitida.',
    status: 'agendado',
    observacoes: 'Perfil lipídico, glicemia de jejum e hemoglobina glicada.'
  },
  {
    id: 'app-3',
    tipo: 'fisioterapia',
    titulo: 'Sessão de Fisioterapia Domiciliar',
    medicoOuLocal: 'Fisioterapeuta Juliana — Atendimento em Casa',
    data: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString().split('T')[0],
    horario: '15:00',
    preparo: 'Vestir roupas confortáveis e manter o ambiente arejado.',
    status: 'realizado',
    observacoes: 'Exercícios de mobilização passiva e fortalecimento muscular nos membros inferiores.'
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

export function getStoredPatientList(): PatientProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PATIENT_LIST);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) return list;
    }
  } catch (e) {
    console.error('Error reading patient list from storage', e);
  }
  const current = getStoredPatient();
  const initialList: PatientProfile[] = [
    {
      ...current,
      id: current.id || 'patient-1'
    }
  ];
  savePatientList(initialList);
  return initialList;
}

export function savePatientList(list: PatientProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PATIENT_LIST, JSON.stringify(list));
  } catch (e) {
    console.error('Error saving patient list', e);
  }
}

export function getActivePatientId(): string {
  try {
    const active = localStorage.getItem(STORAGE_KEYS.ACTIVE_PATIENT_ID);
    if (active) return active;
  } catch (e) {}
  return 'patient-1';
}

export function saveActivePatientId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PATIENT_ID, id);
  } catch (e) {}
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

export function getStoredAppointments(): MedicalAppointment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading appointments', e);
  }
  return DEFAULT_APPOINTMENTS;
}

export function saveAppointments(appointments: MedicalAppointment[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
  } catch (e) {
    console.error('Error saving appointments', e);
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
