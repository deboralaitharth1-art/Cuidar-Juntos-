import React, { useState, useMemo } from 'react';
import {
  User,
  Pill,
  Activity,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Share2,
  Printer,
  AlertCircle,
  Check,
  Calendar,
  Download,
  FileText,
  FileSpreadsheet,
  Stethoscope,
  TestTube2,
  RotateCcw,
  MapPin,
  CalendarDays,
  ExternalLink,
  ChevronRight,
  Bell,
  Volume2,
  VolumeX,
  Users
} from 'lucide-react';
import {
  PatientData,
  MedicationItem,
  HealthLogItem,
  MedicalAppointment,
  AppointmentType
} from '../types';
import { Modal } from './Modal';

interface HealthAgendaSectionProps {
  patient: PatientData;
  onUpdatePatient: (data: PatientData) => void;
  medications: MedicationItem[];
  onUpdateMedications: (meds: MedicationItem[]) => void;
  healthLogs: HealthLogItem[];
  onUpdateHealthLogs: (logs: HealthLogItem[]) => void;
  appointments: MedicalAppointment[];
  onUpdateAppointments: (appointments: MedicalAppointment[]) => void;
  onShowToast: (msg: string) => void;
  onGoToGoogleTab?: () => void;
  onOpenMedicalSummary?: () => void;
  onOpenPatientSwitch?: () => void;
  onTestAlarm?: () => void;
  isSoundMuted?: boolean;
  onToggleSoundMuted?: () => void;
}

export const HealthAgendaSection: React.FC<HealthAgendaSectionProps> = ({
  patient,
  onUpdatePatient,
  medications,
  onUpdateMedications,
  healthLogs,
  onUpdateHealthLogs,
  appointments,
  onUpdateAppointments,
  onShowToast,
  onGoToGoogleTab,
  onOpenMedicalSummary,
  onOpenPatientSwitch,
  onTestAlarm,
  isSoundMuted,
  onToggleSoundMuted
}) => {
  // Modals state
  const [isEditingPatient, setIsEditingPatient] = useState(false);
  const [patientForm, setPatientForm] = useState<PatientData>(patient);

  const [isAddingMed, setIsAddingMed] = useState(false);
  const [medForm, setMedForm] = useState<{
    nome: string;
    dosagem: string;
    finalidade: string;
    horariosStr: string;
    observacoes: string;
  }>({
    nome: '',
    dosagem: '',
    finalidade: '',
    horariosStr: '08:00, 20:00',
    observacoes: ''
  });

  const [isAddingLog, setIsAddingLog] = useState(false);
  const [logForm, setLogForm] = useState<Partial<HealthLogItem>>({
    pressaoSistolica: 120,
    pressaoDiastolica: 80,
    glicemia: 110,
    glicemiaMomento: 'jejum',
    temperatura: 36.5,
    frequenciaCardiaca: 72,
    evacuacao: 'normal',
    diurese: 'normal',
    humorOuEstado: 'estavel',
    anotacoes: ''
  });

  // Appointment states
  const [isAddingAppointment, setIsAddingAppointment] = useState(false);
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);
  const [appointmentFilter, setAppointmentFilter] = useState<'todos' | 'proximos' | 'consulta' | 'exame' | 'realizado'>('proximos');
  const [appointmentForm, setAppointmentForm] = useState<{
    tipo: AppointmentType;
    titulo: string;
    medicoOuLocal: string;
    data: string;
    horario: string;
    preparo: string;
    status: 'agendado' | 'realizado' | 'cancelado';
    observacoes: string;
  }>({
    tipo: 'consulta',
    titulo: '',
    medicoOuLocal: '',
    data: new Date().toISOString().split('T')[0],
    horario: '09:00',
    preparo: '',
    status: 'agendado',
    observacoes: ''
  });

  // Download / Export report modal
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Patient handlers
  const handleSavePatient = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePatient(patientForm);
    setIsEditingPatient(false);
    onShowToast('✅ Dados do paciente atualizados com sucesso!');
  };

  // Medication handlers
  const handleToggleMedTaken = (medId: string, time: string) => {
    const updated = medications.map(med => {
      if (med.id !== medId) return med;
      const current = !!med.tomadoHoje?.[time];
      return {
        ...med,
        tomadoHoje: {
          ...(med.tomadoHoje || {}),
          [time]: !current
        }
      };
    });
    onUpdateMedications(updated);
  };

  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medForm.nome.trim()) return;

    const parsedTimes = medForm.horariosStr
      .split(',')
      .map(t => t.trim())
      .filter(t => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(t));

    const newMed: MedicationItem = {
      id: `med-${Date.now()}`,
      nome: medForm.nome.trim(),
      dosagem: medForm.dosagem.trim(),
      finalidade: medForm.finalidade.trim(),
      horarios: parsedTimes.length > 0 ? parsedTimes : ['08:00'],
      observacoes: medForm.observacoes.trim(),
      tomadoHoje: {}
    };

    onUpdateMedications([...medications, newMed]);
    setIsAddingMed(false);
    setMedForm({
      nome: '',
      dosagem: '',
      finalidade: '',
      horariosStr: '08:00, 20:00',
      observacoes: ''
    });
    onShowToast(`✅ Medicamento "${newMed.nome}" adicionado!`);
  };

  const handleDeleteMedication = (id: string) => {
    onUpdateMedications(medications.filter(m => m.id !== id));
    onShowToast('Medicamento removido.');
  };

  // Health log handlers
  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();

    const newLog: HealthLogItem = {
      id: `log-${Date.now()}`,
      dataHora: new Date().toISOString(),
      pressaoSistolica: logForm.pressaoSistolica ? Number(logForm.pressaoSistolica) : undefined,
      pressaoDiastolica: logForm.pressaoDiastolica ? Number(logForm.pressaoDiastolica) : undefined,
      glicemia: logForm.glicemia ? Number(logForm.glicemia) : undefined,
      glicemiaMomento: logForm.glicemiaMomento as any,
      temperatura: logForm.temperatura ? Number(logForm.temperatura) : undefined,
      frequenciaCardiaca: logForm.frequenciaCardiaca ? Number(logForm.frequenciaCardiaca) : undefined,
      evacuacao: logForm.evacuacao as any,
      diurese: logForm.diurese as any,
      humorOuEstado: logForm.humorOuEstado as any,
      anotacoes: (logForm.anotacoes || '').trim()
    };

    onUpdateHealthLogs([newLog, ...healthLogs]);
    setIsAddingLog(false);
    setLogForm({
      pressaoSistolica: 120,
      pressaoDiastolica: 80,
      glicemia: 110,
      glicemiaMomento: 'jejum',
      temperatura: 36.5,
      frequenciaCardiaca: 72,
      evacuacao: 'normal',
      diurese: 'normal',
      humorOuEstado: 'estavel',
      anotacoes: ''
    });
    onShowToast('✅ Sinais vitais registrados com sucesso!');
  };

  const handleDeleteLog = (id: string) => {
    onUpdateHealthLogs(healthLogs.filter(l => l.id !== id));
    onShowToast('Registro excluído.');
  };

  // Appointment handlers
  const handleOpenAddAppointment = () => {
    setEditingAppointmentId(null);
    setAppointmentForm({
      tipo: 'consulta',
      titulo: '',
      medicoOuLocal: '',
      data: new Date().toISOString().split('T')[0],
      horario: '09:00',
      preparo: '',
      status: 'agendado',
      observacoes: ''
    });
    setIsAddingAppointment(true);
  };

  const handleOpenEditAppointment = (app: MedicalAppointment) => {
    setEditingAppointmentId(app.id);
    setAppointmentForm({
      tipo: app.tipo,
      titulo: app.titulo,
      medicoOuLocal: app.medicoOuLocal,
      data: app.data,
      horario: app.horario,
      preparo: app.preparo || '',
      status: app.status,
      observacoes: app.observacoes || ''
    });
    setIsAddingAppointment(true);
  };

  const handleSaveAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentForm.titulo.trim() || !appointmentForm.data) {
      onShowToast('⚠️ Preencha o título e a data do agendamento.');
      return;
    }

    if (editingAppointmentId) {
      // Update existing
      const updated = appointments.map(app => {
        if (app.id !== editingAppointmentId) return app;
        return {
          ...app,
          tipo: appointmentForm.tipo,
          titulo: appointmentForm.titulo.trim(),
          medicoOuLocal: appointmentForm.medicoOuLocal.trim(),
          data: appointmentForm.data,
          horario: appointmentForm.horario,
          preparo: appointmentForm.preparo.trim(),
          status: appointmentForm.status,
          observacoes: appointmentForm.observacoes.trim()
        };
      });
      onUpdateAppointments(updated);
      onShowToast('✅ Agendamento atualizado com sucesso!');
    } else {
      // Create new
      const newApp: MedicalAppointment = {
        id: `app-${Date.now()}`,
        tipo: appointmentForm.tipo,
        titulo: appointmentForm.titulo.trim(),
        medicoOuLocal: appointmentForm.medicoOuLocal.trim(),
        data: appointmentForm.data,
        horario: appointmentForm.horario,
        preparo: appointmentForm.preparo.trim(),
        status: appointmentForm.status,
        observacoes: appointmentForm.observacoes.trim()
      };
      onUpdateAppointments([...appointments, newApp]);
      onShowToast(`✅ "${newApp.titulo}" adicionado à agenda médica!`);
    }

    setIsAddingAppointment(false);
  };

  const handleToggleAppointmentStatus = (id: string) => {
    const updated = appointments.map(app => {
      if (app.id !== id) return app;
      const nextStatus = app.status === 'realizado' ? 'agendado' : 'realizado';
      return { ...app, status: nextStatus as any };
    });
    onUpdateAppointments(updated);
    onShowToast('Status do agendamento atualizado.');
  };

  const handleDeleteAppointment = (id: string) => {
    onUpdateAppointments(appointments.filter(a => a.id !== id));
    onShowToast('Agendamento removido da agenda.');
  };

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    return [...appointments]
      .filter(app => {
        if (appointmentFilter === 'todos') return true;
        if (appointmentFilter === 'proximos') return app.status === 'agendado';
        if (appointmentFilter === 'realizado') return app.status === 'realizado';
        if (appointmentFilter === 'consulta') return app.tipo === 'consulta' || app.tipo === 'retorno';
        if (appointmentFilter === 'exame') return app.tipo === 'exame_sangue' || app.tipo === 'exame_imagem';
        return true;
      })
      .sort((a, b) => {
        const dateA = `${a.data}T${a.horario || '00:00'}`;
        const dateB = `${b.data}T${b.horario || '00:00'}`;
        return dateA.localeCompare(dateB);
      });
  }, [appointments, appointmentFilter]);

  // Appointment date badge helper
  const getAppointmentDateBadge = (dateStr: string, timeStr: string, status: string) => {
    if (status === 'realizado') {
      return { text: 'Realizado', className: 'text-slate-600 bg-slate-100 border-slate-200' };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [y, m, d] = dateStr.split('-').map(Number);
    const targetDate = new Date(y, m - 1, d);
    targetDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return { text: 'Hoje!', className: 'text-emerald-900 bg-emerald-100 border-emerald-300 font-black' };
    }
    if (diffDays === 1) {
      return { text: 'Amanhã', className: 'text-emerald-800 bg-emerald-50 border-emerald-200 font-bold' };
    }
    if (diffDays > 1 && diffDays <= 7) {
      return { text: `Em ${diffDays} dias`, className: 'text-emerald-800 bg-emerald-50 border-emerald-200' };
    }
    if (diffDays < 0) {
      return { text: 'Data anterior', className: 'text-slate-500 bg-slate-100 border-slate-200' };
    }
    return { text: `Em ${diffDays} dias`, className: 'text-slate-700 bg-slate-50 border-slate-200' };
  };

  // Helper for appointment type label & icon
  const getAppointmentTypeInfo = (tipo: AppointmentType) => {
    switch (tipo) {
      case 'consulta':
        return { label: 'Consulta Médica', icon: Stethoscope, badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'exame_sangue':
        return { label: 'Exame de Sangue', icon: TestTube2, badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'exame_imagem':
        return { label: 'Exame de Imagem', icon: Activity, badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'retorno':
        return { label: 'Retorno UBS', icon: RotateCcw, badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'fisioterapia':
        return { label: 'Fisioterapia', icon: Activity, badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      default:
        return { label: 'Procedimento / Outro', icon: CalendarDays, badgeColor: 'bg-slate-50 text-slate-800 border-slate-200' };
    }
  };

  // ==========================================
  // DOWNLOAD & EXPORT LOGIC FOR VITAL SIGNS
  // ==========================================

  // 1. Download formatted text report file (.txt)
  const handleDownloadTxtReport = () => {
    let content = `========================================================================\n`;
    content += `CUIDAR JUNTOS — RELATÓRIO CLÍNICO DE SINAIS VITAIS E CUIDADOS\n`;
    content += `Gerado em: ${new Date().toLocaleString('pt-BR')}\n`;
    content += `========================================================================\n\n`;

    content += `1. IDENTIFICAÇÃO DO PACIENTE\n`;
    content += `• Nome Completo: ${patient.nome || 'Não informado'}\n`;
    content += `• Nascimento / Idade: ${patient.nascimento || 'Não informada'}\n`;
    content += `• Cartão Nacional do SUS: ${patient.cartaoSus || 'Não informado'}\n`;
    content += `• Tipo Sanguíneo: ${patient.tipoSanguineo || 'Não informado'}\n`;
    content += `• Contato de Emergência: ${patient.contatoEmergenciaNome} (${patient.contatoEmergenciaTelefone})\n`;
    if (patient.contatoSecundarioNome) {
      content += `• Contato Secundário: ${patient.contatoSecundarioNome} (${patient.contatoSecundarioTelefone})\n`;
    }
    content += `• Alergias Graves / Restrições: ${patient.alergias || 'Nenhuma alergia relatada'}\n`;
    content += `• Diagnósticos e Histórico: ${patient.diagnosticos || 'Sem registros'}\n`;
    content += `• Observações Médicas / Cuidados: ${patient.observacoesMedicas || 'Nenhuma'}\n\n`;

    content += `2. MEDICAMENTOS EM USO DOMICILIAR\n`;
    if (medications.length === 0) {
      content += `Nenhum medicamento registrado.\n\n`;
    } else {
      medications.forEach((med, idx) => {
        content += `${idx + 1}. ${med.nome} (${med.dosagem})\n`;
        content += `   - Finalidade: ${med.finalidade}\n`;
        content += `   - Horários de tomada: ${med.horarios.join(', ')}\n`;
        if (med.observacoes) content += `   - Orientações: ${med.observacoes}\n`;
      });
      content += `\n`;
    }

    content += `3. HISTÓRICO COMPLETO DE MEDIÇÃO DE SINAIS VITAIS (${healthLogs.length} medições registradas)\n`;
    content += `------------------------------------------------------------------------\n`;
    if (healthLogs.length === 0) {
      content += `Nenhum sinal vital registrado até o momento.\n`;
    } else {
      healthLogs.forEach((log, index) => {
        const dt = new Date(log.dataHora).toLocaleString('pt-BR');
        content += `Registro #${index + 1} — Data/Hora: ${dt}\n`;
        if (log.pressaoSistolica && log.pressaoDiastolica) {
          const status = log.pressaoSistolica >= 140 || log.pressaoDiastolica >= 90 ? 'ALTA' : (log.pressaoSistolica < 90 ? 'BAIXA' : 'NORMAL');
          content += `  • Pressão Arterial: ${log.pressaoSistolica}x${log.pressaoDiastolica} mmHg (Classificação: ${status})\n`;
        }
        if (log.glicemia) {
          content += `  • Glicemia Capilar: ${log.glicemia} mg/dL (Momento: ${log.glicemiaMomento || 'aleatório'})\n`;
        }
        if (log.temperatura) {
          content += `  • Temperatura Axilar: ${log.temperatura} °C\n`;
        }
        if (log.frequenciaCardiaca) {
          content += `  • Frequência Cardíaca / Pulso: ${log.frequenciaCardiaca} bpm\n`;
        }
        if (log.evacuacao) {
          content += `  • Hábito Intestinal (Evacuação): ${log.evacuacao.replace('_', ' ')}\n`;
        }
        if (log.diurese) {
          content += `  • Diurese (Urina): ${log.diurese.replace('_', ' ')}\n`;
        }
        if (log.humorOuEstado) {
          content += `  • Estado Geral / Humor: ${log.humorOuEstado}\n`;
        }
        if (log.anotacoes) {
          content += `  • Anotações do Cuidador: "${log.anotacoes}"\n`;
        }
        content += `------------------------------------------------------------------------\n`;
      });
    }

    content += `\n4. PRÓXIMAS CONSULTAS E EXAMES AGENDADOS\n`;
    if (appointments.length === 0) {
      content += `Nenhuma consulta ou exame agendado.\n`;
    } else {
      appointments.forEach((app, idx) => {
        content += `${idx + 1}. [${app.tipo.toUpperCase()}] ${app.titulo} (${app.status.toUpperCase()})\n`;
        content += `   - Data e Horário: ${app.data} às ${app.horario}\n`;
        content += `   - Local / Profissional: ${app.medicoOuLocal}\n`;
        if (app.preparo) content += `   - Preparo necessário: ${app.preparo}\n`;
      });
    }

    content += `\n========================================================================\n`;
    content += `Documento emitido pelo Cuidar Juntos — Guia Familiar de Saúde\n`;
    content += `Armazenamento local seguro e offline. Apresente este relatório ao médico.\n`;

    // Trigger file download via Blob
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = (patient.nome || 'paciente').toLowerCase().replace(/[^a-z0-9]/g, '_');
    link.href = url;
    link.download = `relatorio_sinais_vitais_${safeName}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setIsDownloadModalOpen(false);
    onShowToast('📥 Relatório em texto (.txt) baixado com sucesso!');
  };

  // 2. Download spreadsheet CSV (.csv)
  const handleDownloadCsvReport = () => {
    // Add BOM for Microsoft Excel UTF-8 compatibility
    const BOM = '\uFEFF';
    const headers = [
      'Data e Hora',
      'Pressao Sistolica (mmHg)',
      'Pressao Diastolica (mmHg)',
      'Classificacao PA',
      'Glicemia (mg/dL)',
      'Momento Glicemia',
      'Temperatura (C)',
      'Frequencia Cardiaca (bpm)',
      'Evacuacao',
      'Diurese',
      'Estado Humor',
      'Anotacoes do Cuidador'
    ];

    const rows = healthLogs.map(log => {
      const dt = new Date(log.dataHora).toLocaleString('pt-BR');
      const sis = log.pressaoSistolica || '';
      const dia = log.pressaoDiastolica || '';
      let bpStatus = '';
      if (log.pressaoSistolica && log.pressaoDiastolica) {
        bpStatus = log.pressaoSistolica >= 140 || log.pressaoDiastolica >= 90 ? 'Pressao Alta' : (log.pressaoSistolica < 90 ? 'Pressao Baixa' : 'Normal');
      }

      return [
        `"${dt}"`,
        `"${sis}"`,
        `"${dia}"`,
        `"${bpStatus}"`,
        `"${log.glicemia || ''}"`,
        `"${log.glicemiaMomento || ''}"`,
        `"${log.temperatura || ''}"`,
        `"${log.frequenciaCardiaca || ''}"`,
        `"${log.evacuacao || ''}"`,
        `"${log.diurese || ''}"`,
        `"${log.humorOuEstado || ''}"`,
        `"${(log.anotacoes || '').replace(/"/g, '""')}"`
      ].join(';');
    });

    const csvContent = BOM + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = (patient.nome || 'paciente').toLowerCase().replace(/[^a-z0-9]/g, '_');
    link.href = url;
    link.download = `planilha_sinais_vitais_${safeName}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setIsDownloadModalOpen(false);
    onShowToast('📊 Planilha Excel (.csv) baixada com sucesso!');
  };

  // 3. Share summary to clipboard (WhatsApp)
  const handleShareSummary = () => {
    const latestLog = healthLogs[0];
    const medList = medications.map(m => `• ${m.nome} (${m.dosagem}) — Horários: ${m.horarios.join(', ')}`).join('\n');

    let text = `📋 FICHA DE SAÚDE — ${patient.nome}\n`;
    text += `👤 Nascimento/Idade: ${patient.nascimento}\n`;
    text += `🚨 Alergias: ${patient.alergias || 'Nenhuma declarada'}\n`;
    text += `🏥 Diagnósticos: ${patient.diagnosticos || 'Sem registros'}\n`;
    text += `📞 Contato de Emergência: ${patient.contatoEmergenciaNome} (${patient.contatoEmergenciaTelefone})\n\n`;

    text += `💊 MEDICAMENTOS EM USO:\n${medList || 'Nenhum medicamento cadastrado'}\n\n`;

    if (latestLog) {
      const dt = new Date(latestLog.dataHora).toLocaleString('pt-BR');
      text += `📊 ÚLTIMA MEDIÇÃO DE SINAIS VITAIS (${dt}):\n`;
      if (latestLog.pressaoSistolica) text += `• Pressão Arterial: ${latestLog.pressaoSistolica}x${latestLog.pressaoDiastolica} mmHg\n`;
      if (latestLog.glicemia) text += `• Glicemia: ${latestLog.glicemia} mg/dL (${latestLog.glicemiaMomento})\n`;
      if (latestLog.temperatura) text += `• Temperatura: ${latestLog.temperatura} °C\n`;
      if (latestLog.frequenciaCardiaca) text += `• Frequência Cardíaca: ${latestLog.frequenciaCardiaca} bpm\n`;
      if (latestLog.anotacoes) text += `• Anotações: ${latestLog.anotacoes}\n`;
    }

    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    onShowToast('📋 Resumo completo copiado para enviar no WhatsApp!');
    setTimeout(() => setCopiedShare(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper for blood pressure badge
  const getPressureStatus = (sis?: number, dia?: number) => {
    if (!sis || !dia) return null;
    if (sis >= 140 || dia >= 90) return { label: 'Pressão Alta', color: 'text-slate-800 bg-slate-100 border-slate-300' };
    if (sis < 90 || dia < 60) return { label: 'Pressão Baixa', color: 'text-slate-800 bg-slate-100 border-slate-300' };
    return { label: 'Normal', color: 'text-emerald-800 bg-emerald-50 border-emerald-200' };
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Patient Profile Card in Green & White */}
      <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
              <User className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                Ficha de Emergência do Paciente
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
                {patient.nome || 'Nome do Paciente Não Informado'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {patient.nascimento ? `Nascimento/Idade: ${patient.nascimento}` : 'Data de nascimento não cadastrada'}
                {patient.tipoSanguineo && ` · Tipo Sanguíneo: ${patient.tipoSanguineo}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              onClick={() => {
                setPatientForm(patient);
                setIsEditingPatient(true);
              }}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Editar Ficha</span>
            </button>
            {onOpenMedicalSummary && (
              <button
                onClick={onOpenMedicalSummary}
                className="px-3 py-1.5 text-xs font-semibold text-emerald-950 bg-emerald-100/80 hover:bg-emerald-200/80 border border-emerald-300 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
                title="Abrir prontuário e ficha clínica de bolso em PDF"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-800" />
                <span>Ficha Médica PDF</span>
              </button>
            )}
            {onOpenPatientSwitch && (
              <button
                onClick={onOpenPatientSwitch}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
                title="Alternar entre pacientes cadastrados"
              >
                <Users className="w-3.5 h-3.5 text-slate-600" />
                <span>Trocar Paciente</span>
              </button>
            )}
            <button
              onClick={() => setIsDownloadModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-1.5 transition-colors"
              title="Baixar relatório completo de sinais vitais"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>Baixar Relatório</span>
            </button>
            <button
              onClick={handleShareSummary}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
              title="Copiar texto para WhatsApp"
            >
              {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Share2 className="w-3.5 h-3.5 text-slate-600" />}
              <span>{copiedShare ? 'Copiado!' : 'Compartilhar'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="p-1.5 text-slate-500 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors no-print"
              title="Imprimir relatório"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Highlight Allergies in Clean Style */}
        <div className="p-3 bg-white border border-emerald-200 rounded-xl flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-slate-900 uppercase tracking-wider block">
              Alergias Importantes & Restrições:
            </span>
            <p className="text-slate-700 font-medium mt-0.5">
              {patient.alergias || 'Nenhuma alergia grave cadastrada.'}
            </p>
          </div>
        </div>

        {/* Quick Grid Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-slate-500 font-bold block text-[10px] uppercase">Cartão do SUS</span>
            <span className="font-mono text-slate-800 font-semibold">{patient.cartaoSus || 'Não informado'}</span>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-slate-500 font-bold block text-[10px] uppercase">Contato Emergência</span>
            <span className="text-slate-800 font-semibold">{patient.contatoEmergenciaNome || 'Não informado'}</span>
            <span className="text-slate-500 block text-[11px]">{patient.contatoEmergenciaTelefone}</span>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-slate-500 font-bold block text-[10px] uppercase">Diagnósticos / Doenças</span>
            <span className="text-slate-800 line-clamp-1">{patient.diagnosticos || 'Sem registros'}</span>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-slate-500 font-bold block text-[10px] uppercase">Cuidados Especiais</span>
            <span className="text-slate-800 line-clamp-1">{patient.observacoesMedicas || 'Nenhum'}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION: AGENDA MÉDICA - CONSULTAS E EXAMES (NEW FEATURE)                 */}
      {/* ========================================================================= */}
      <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100">
              <Calendar className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  Agenda Médica (Consultas & Exames)
                </h2>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  {appointments.filter(a => a.status === 'agendado').length} pendente(s)
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Registre consultas com especialistas, exames de sangue, exames de imagem e retornos na UBS.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {onGoToGoogleTab && (
              <button
                onClick={onGoToGoogleTab}
                className="px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors flex items-center gap-1.5"
                title="Sincronizar com Google Agenda"
              >
                <CalendarDays className="w-3.5 h-3.5 text-emerald-700" />
                <span className="hidden sm:inline">Google Calendar</span>
              </button>
            )}
            <button
              onClick={handleOpenAddAppointment}
              className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-95 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Agendamento</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'proximos', label: 'Próximos' },
            { id: 'todos', label: 'Todos' },
            { id: 'consulta', label: 'Consultas' },
            { id: 'exame', label: 'Exames' },
            { id: 'realizado', label: 'Realizados' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setAppointmentFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
                appointmentFilter === f.id
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Appointment Cards List */}
        {filteredAppointments.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <Calendar className="w-8 h-8 text-emerald-600/40 mx-auto" />
            <p className="text-sm font-bold text-slate-800">Nenhum agendamento encontrado neste filtro</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Adicione os próximos exames de laboratório, ultrassom ou consultas médicas de rotina para manter tudo organizado.
            </p>
            <button
              onClick={handleOpenAddAppointment}
              className="mt-2 text-xs font-bold text-emerald-700 hover:underline inline-block"
            >
              + Adicionar consulta ou exame agora
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAppointments.map(app => {
              const typeInfo = getAppointmentTypeInfo(app.tipo);
              const TypeIcon = typeInfo.icon;
              const dateBadge = getAppointmentDateBadge(app.data, app.horario, app.status);

              const [y, m, d] = app.data.split('-');
              const formattedDate = `${d}/${m}/${y}`;

              return (
                <div
                  key={app.id}
                  className={`p-4 bg-white border rounded-xl space-y-2.5 transition-all shadow-2xs ${
                    app.status === 'realizado'
                      ? 'border-slate-200 opacity-75 bg-slate-50/50'
                      : 'border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${typeInfo.badgeColor}`}>
                        <TypeIcon className="w-3 h-3" />
                        <span>{typeInfo.label}</span>
                      </span>
                      <h3 className={`text-sm font-bold ${app.status === 'realizado' ? 'line-through text-slate-600' : 'text-slate-900'}`}>
                        {app.titulo}
                      </h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${dateBadge.className}`}>
                        {dateBadge.text}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <button
                        onClick={() => handleToggleAppointmentStatus(app.id)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1 ${
                          app.status === 'realizado'
                            ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                        }`}
                        title={app.status === 'realizado' ? 'Marcar como não realizado' : 'Marcar como realizado'}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{app.status === 'realizado' ? 'Concluído' : 'Marcar Realizado'}</span>
                      </button>

                      <button
                        onClick={() => handleOpenEditAppointment(app)}
                        className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Editar agendamento"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteAppointment(app.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Excluir agendamento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span className="font-semibold text-slate-800">
                        {formattedDate} às {app.horario || 'Horário a definir'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="line-clamp-1">{app.medicoOuLocal || 'Local a definir'}</span>
                    </div>
                  </div>

                  {app.preparo && (
                    <div className="p-2.5 bg-emerald-50/60 border border-emerald-200/70 rounded-lg text-xs text-emerald-950 flex items-start gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold">Preparo & Documentos: </strong>
                        <span>{app.preparo}</span>
                      </div>
                    </div>
                  )}

                  {app.observacoes && (
                    <p className="text-xs text-slate-500 italic">
                      Obs: {app.observacoes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION: MEDICAMENTOS                                                     */}
      {/* ========================================================================= */}
      <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100">
              <Pill className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Medicamentos Contínuos & Horários
              </h2>
              <p className="text-xs text-slate-500">
                Controle diário de medicação. Toque no horário para registrar que a dose foi administrada.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {onTestAlarm && (
              <button
                onClick={onTestAlarm}
                className="px-2.5 py-1.5 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-1.5 transition-colors"
                title="Testar som do alarme de horário de medicação"
              >
                <Bell className="w-3.5 h-3.5 text-emerald-700" />
                <span className="hidden sm:inline">Testar Alarme</span>
              </button>
            )}
            {onToggleSoundMuted && (
              <button
                onClick={onToggleSoundMuted}
                className="p-2 text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 border border-slate-200 rounded-lg transition-colors"
                title={isSoundMuted ? "Alarme no mudo (clique para ativar som)" : "Alarme sonoro ativo (clique para silenciar)"}
              >
                {isSoundMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-700" />}
              </button>
            )}
            <button
              onClick={() => setIsAddingMed(true)}
              className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-95 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Remédio</span>
            </button>
          </div>
        </div>

        {medications.length === 0 ? (
          <div className="p-6 text-center bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-xs text-slate-500">Nenhum medicamento cadastrado ainda.</p>
            <button
              onClick={() => setIsAddingMed(true)}
              className="mt-2 text-xs font-bold text-emerald-700 hover:underline"
            >
              Cadastrar primeiro medicamento
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {medications.map(med => (
              <div
                key={med.id}
                className="p-4 bg-white border border-slate-200 hover:border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{med.nome}</h3>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      {med.dosagem}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    {med.finalidade}
                  </p>
                  {med.observacoes && (
                    <p className="text-xs text-slate-400 italic">
                      {med.observacoes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {med.horarios.map(time => {
                    const isTaken = !!med.tomadoHoje?.[time];
                    return (
                      <button
                        key={time}
                        onClick={() => handleToggleMedTaken(med.id, time)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          isTaken
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-white border border-slate-300 text-slate-700 hover:border-emerald-600'
                        }`}
                        title={isTaken ? 'Desmarcar' : 'Marcar como tomado'}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{time}</span>
                        {isTaken && <CheckCircle2 className="w-3.5 h-3.5 ml-0.5 text-white" />}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handleDeleteMedication(med.id)}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors ml-1"
                    title="Remover medicamento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION: DIÁRIO DE SINAIS VITAIS COM OPÇÃO DE BAIXAR RELATÓRIO            */}
      {/* ========================================================================= */}
      <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100">
              <Activity className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  Diário de Sinais Vitais & Evolução
                </h2>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  {healthLogs.length} registro(s)
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Acompanhamento de pressão arterial, glicemia, temperatura e sintomas para levar ao médico da família.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              onClick={() => setIsDownloadModalOpen(true)}
              className="px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all flex items-center gap-1.5"
              title="Baixar histórico em arquivo ou planilha"
            >
              <Download className="w-4 h-4 text-emerald-700" />
              <span>Baixar Relatório</span>
            </button>
            <button
              onClick={() => setIsAddingLog(true)}
              className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-95 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Sinais Hoje</span>
            </button>
          </div>
        </div>

        {healthLogs.length === 0 ? (
          <div className="p-6 text-center bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-xs text-slate-500">Nenhum registro de sinais vitais ainda.</p>
            <button
              onClick={() => setIsAddingLog(true)}
              className="mt-2 text-xs font-bold text-emerald-700 hover:underline"
            >
              Fazer a primeira medição
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {healthLogs.map(log => {
              const dateStr = new Date(log.dataHora).toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
              const bpStatus = getPressureStatus(log.pressaoSistolica, log.pressaoDiastolica);

              return (
                <div
                  key={log.id}
                  className="p-4 bg-white border border-slate-200 rounded-xl space-y-2.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      📅 {dateStr}
                    </span>
                    <button
                      onClick={() => handleDeleteLog(log.id)}
                      className="text-slate-400 hover:text-slate-700 p-1"
                      title="Excluir medição"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    {/* Blood Pressure */}
                    {log.pressaoSistolica && log.pressaoDiastolica && (
                      <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
                        <span className="text-slate-500 font-bold">PA:</span>
                        <strong className="text-slate-900 font-mono text-sm">
                          {log.pressaoSistolica}x{log.pressaoDiastolica} mmHg
                        </strong>
                        {bpStatus && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${bpStatus.color}`}>
                            {bpStatus.label}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Glucose */}
                    {log.glicemia && (
                      <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
                        <span className="text-slate-500 font-bold">Glicemia:</span>
                        <strong className="text-slate-900 font-mono text-sm">
                          {log.glicemia} mg/dL
                        </strong>
                        <span className="text-[10px] text-slate-500 capitalize">
                          ({log.glicemiaMomento})
                        </span>
                      </div>
                    )}

                    {/* Temp */}
                    {log.temperatura && (
                      <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
                        <span className="text-slate-500 font-bold">Temp:</span>
                        <strong className="text-slate-900 font-mono">
                          {log.temperatura} °C
                        </strong>
                      </div>
                    )}

                    {/* Heart rate */}
                    {log.frequenciaCardiaca && (
                      <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
                        <span className="text-slate-500 font-bold">Pulso:</span>
                        <strong className="text-slate-900 font-mono">
                          {log.frequenciaCardiaca} bpm
                        </strong>
                      </div>
                    )}

                    {/* Bowel movement */}
                    {log.evacuacao && (
                      <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
                        <span className="text-slate-500 font-bold">Intestino:</span>
                        <span className="text-slate-700 capitalize">
                          {log.evacuacao.replace('_', ' ')}
                        </span>
                      </div>
                    )}
                  </div>

                  {log.anotacoes && (
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
                      <strong>Anotações do Cuidador:</strong> {log.anotacoes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: BAIXAR RELATÓRIO DE SINAIS VITAIS (TXT / CSV / PDF)                */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        title="Baixar Relatório de Sinais Vitais & Cuidados"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            Escolha o formato que preferir para salvar no celular, imprimir para levar à consulta médica ou enviar por e-mail/WhatsApp:
          </p>

          <div className="space-y-3">
            {/* Option 1: Formatted TXT document */}
            <div
              onClick={handleDownloadTxtReport}
              className="p-4 bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 rounded-xl flex items-center justify-between cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-900">
                    Baixar Arquivo de Texto (.txt)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Prontuário clínico organizado com identificação, medicamentos, histórico completo de medições e consultas.
                  </p>
                </div>
              </div>
              <Download className="w-4 h-4 text-emerald-700 shrink-0 ml-2" />
            </div>

            {/* Option 2: Excel / CSV table */}
            <div
              onClick={handleDownloadCsvReport}
              className="p-4 bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 rounded-xl flex items-center justify-between cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-900">
                    Baixar Planilha Excel (.csv)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Tabela com colunas separadas de pressão, glicemia, temperatura e notas. Ideal para médicos e gráficos.
                  </p>
                </div>
              </div>
              <Download className="w-4 h-4 text-emerald-700 shrink-0 ml-2" />
            </div>

            {/* Option 3: Print / PDF */}
            <div
              onClick={() => {
                setIsDownloadModalOpen(false);
                setTimeout(() => window.print(), 300);
              }}
              className="p-4 bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 rounded-xl flex items-center justify-between cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Printer className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-900">
                    Imprimir / Salvar em PDF
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Gera a visualização para impressão limpa sem botões da tela, pronta para salvar em arquivo PDF.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setIsDownloadModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: NOVO / EDITAR AGENDAMENTO MÉDICO (CONSULTA OU EXAME)               */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isAddingAppointment}
        onClose={() => setIsAddingAppointment(false)}
        title={editingAppointmentId ? 'Editar Agendamento Médico' : 'Novo Agendamento (Consulta ou Exame)'}
      >
        <form onSubmit={handleSaveAppointment} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Tipo de Agendamento
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'consulta', label: 'Consulta' },
                { id: 'exame_sangue', label: 'Exame Sangue' },
                { id: 'exame_imagem', label: 'Exame Imagem' },
                { id: 'retorno', label: 'Retorno UBS' },
                { id: 'fisioterapia', label: 'Fisioterapia' },
                { id: 'outro', label: 'Outro' }
              ].map(opt => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setAppointmentForm({ ...appointmentForm, tipo: opt.id as any })}
                  className={`p-2 rounded-lg border text-xs font-semibold transition-colors ${
                    appointmentForm.tipo === opt.id
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Título da Consulta / Procedimento
            </label>
            <input
              type="text"
              required
              value={appointmentForm.titulo}
              onChange={e => setAppointmentForm({ ...appointmentForm, titulo: e.target.value })}
              placeholder="Ex: Consulta Cardiologista, Ecocardiograma, Hemograma..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Local e Profissional
            </label>
            <input
              type="text"
              value={appointmentForm.medicoOuLocal}
              onChange={e => setAppointmentForm({ ...appointmentForm, medicoOuLocal: e.target.value })}
              placeholder="Ex: Dr. Roberto / UBS Jardim das Flores (Sala 04)"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Data
              </label>
              <input
                type="date"
                required
                value={appointmentForm.data}
                onChange={e => setAppointmentForm({ ...appointmentForm, data: e.target.value })}
                className="w-full px-2 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Horário
              </label>
              <input
                type="time"
                required
                value={appointmentForm.horario}
                onChange={e => setAppointmentForm({ ...appointmentForm, horario: e.target.value })}
                className="w-full px-2 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Preparo Necessário & Documentos a Levar
            </label>
            <input
              type="text"
              value={appointmentForm.preparo}
              onChange={e => setAppointmentForm({ ...appointmentForm, preparo: e.target.value })}
              placeholder="Ex: Jejum de 12 horas, levar cartão SUS e exames antigos"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Observações Adicionais
            </label>
            <textarea
              rows={2}
              value={appointmentForm.observacoes}
              onChange={e => setAppointmentForm({ ...appointmentForm, observacoes: e.target.value })}
              placeholder="Ex: Acompanhante Carlos irá buscar o carro..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Status
            </label>
            <select
              value={appointmentForm.status}
              onChange={e => setAppointmentForm({ ...appointmentForm, status: e.target.value as any })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white"
            >
              <option value="agendado">Agendado (Pendente)</option>
              <option value="realizado">Realizado (Concluído)</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingAppointment(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs"
            >
              {editingAppointmentId ? 'Salvar Alterações' : 'Salvar Agendamento'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: EDIT PATIENT */}
      <Modal
        isOpen={isEditingPatient}
        onClose={() => setIsEditingPatient(false)}
        title="Editar Ficha de Emergência do Paciente"
      >
        <form onSubmit={handleSavePatient} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Nome Completo do Paciente
            </label>
            <input
              type="text"
              required
              value={patientForm.nome}
              onChange={e => setPatientForm({ ...patientForm, nome: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Data Nasc. / Idade
              </label>
              <input
                type="text"
                value={patientForm.nascimento}
                onChange={e => setPatientForm({ ...patientForm, nascimento: e.target.value })}
                placeholder="Ex: 14/08/1946 (78 anos)"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Tipo Sanguíneo
              </label>
              <input
                type="text"
                value={patientForm.tipoSanguineo}
                onChange={e => setPatientForm({ ...patientForm, tipoSanguineo: e.target.value })}
                placeholder="Ex: O+, A+, B-"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Número do Cartão Nacional do SUS
            </label>
            <input
              type="text"
              value={patientForm.cartaoSus}
              onChange={e => setPatientForm({ ...patientForm, cartaoSus: e.target.value })}
              placeholder="000 0000 0000 0000"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Contato Emergência (Nome)
              </label>
              <input
                type="text"
                value={patientForm.contatoEmergenciaNome}
                onChange={e => setPatientForm({ ...patientForm, contatoEmergenciaNome: e.target.value })}
                placeholder="Ex: Carlos (Filho)"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Telefone Emergência
              </label>
              <input
                type="tel"
                value={patientForm.contatoEmergenciaTelefone}
                onChange={e => setPatientForm({ ...patientForm, contatoEmergenciaTelefone: e.target.value })}
                placeholder="(00) 00000-0000"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1 text-slate-900">
              Alergias Importantes & Intolerâncias
            </label>
            <textarea
              rows={2}
              value={patientForm.alergias}
              onChange={e => setPatientForm({ ...patientForm, alergias: e.target.value })}
              placeholder="Ex: Alergia a Dipirona, Penicilina, Iodo, Látex..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Diagnósticos Clínicos e Doenças Crônicas
            </label>
            <textarea
              rows={2}
              value={patientForm.diagnosticos}
              onChange={e => setPatientForm({ ...patientForm, diagnosticos: e.target.value })}
              placeholder="Ex: Hipertensão, Diabetes Tipo 2, Sequela de AVC..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Observações Médicas e Cuidados Especiais
            </label>
            <textarea
              rows={2}
              value={patientForm.observacoesMedicas}
              onChange={e => setPatientForm({ ...patientForm, observacoesMedicas: e.target.value })}
              placeholder="Ex: Usa prótese dental superior, dieta com espessante..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditingPatient(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ADD MEDICATION */}
      <Modal
        isOpen={isAddingMed}
        onClose={() => setIsAddingMed(false)}
        title="Cadastrar Medicamento Contínuo"
      >
        <form onSubmit={handleAddMedication} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Nome do Medicamento
            </label>
            <input
              type="text"
              required
              value={medForm.nome}
              onChange={e => setMedForm({ ...medForm, nome: e.target.value })}
              placeholder="Ex: Losartana Potássica"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Dosagem / Apresentação
              </label>
              <input
                type="text"
                required
                value={medForm.dosagem}
                onChange={e => setMedForm({ ...medForm, dosagem: e.target.value })}
                placeholder="Ex: 50 mg — 1 comp"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Finalidade
              </label>
              <input
                type="text"
                value={medForm.finalidade}
                onChange={e => setMedForm({ ...medForm, finalidade: e.target.value })}
                placeholder="Ex: Pressão alta, diabetes"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Horários de Tomada (separados por vírgula)
            </label>
            <input
              type="text"
              required
              value={medForm.horariosStr}
              onChange={e => setMedForm({ ...medForm, horariosStr: e.target.value })}
              placeholder="08:00, 14:00, 20:00"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1">Exemplo: 07:00, 19:00</p>
          </div>

          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Orientações de Administração (opcional)
            </label>
            <input
              type="text"
              value={medForm.observacoes}
              onChange={e => setMedForm({ ...medForm, observacoes: e.target.value })}
              placeholder="Ex: Tomar após as refeições, em jejum, etc."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingMed(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs"
            >
              Cadastrar Medicamento
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ADD HEALTH LOG */}
      <Modal
        isOpen={isAddingLog}
        onClose={() => setIsAddingLog(false)}
        title="Registrar Sinais Vitais & Observações"
      >
        <form onSubmit={handleAddLog} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Pressão Arterial (Sistólica x Diastólica)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="50"
                max="260"
                value={logForm.pressaoSistolica || ''}
                onChange={e => setLogForm({ ...logForm, pressaoSistolica: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="120"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
              />
              <span className="text-slate-400 font-bold text-base">X</span>
              <input
                type="number"
                min="30"
                max="180"
                value={logForm.pressaoDiastolica || ''}
                onChange={e => setLogForm({ ...logForm, pressaoDiastolica: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="80"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
              />
              <span className="text-slate-500 font-medium shrink-0">mmHg</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Glicemia Capilar (mg/dL)
              </label>
              <input
                type="number"
                min="20"
                max="600"
                value={logForm.glicemia || ''}
                onChange={e => setLogForm({ ...logForm, glicemia: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="Ex: 98"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Momento da Glicemia
              </label>
              <select
                value={logForm.glicemiaMomento}
                onChange={e => setLogForm({ ...logForm, glicemiaMomento: e.target.value as any })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white"
              >
                <option value="jejum">Em Jejum</option>
                <option value="pos-prandial">Pós-refeição (2h)</option>
                <option value="aleatorio">Aleatório / Antes dormir</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Temperatura (°C)
              </label>
              <input
                type="number"
                step="0.1"
                min="34"
                max="43"
                value={logForm.temperatura || ''}
                onChange={e => setLogForm({ ...logForm, temperatura: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="36.5"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Frequência Cardíaca (bpm)
              </label>
              <input
                type="number"
                min="30"
                max="220"
                value={logForm.frequenciaCardiaca || ''}
                onChange={e => setLogForm({ ...logForm, frequenciaCardiaca: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="75"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Hábito Intestinal
              </label>
              <select
                value={logForm.evacuacao}
                onChange={e => setLogForm({ ...logForm, evacuacao: e.target.value as any })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white"
              >
                <option value="normal">Normal / Fezes pastosas</option>
                <option value="ausente_mais_2_dias">Sem evacuar (+2 dias)</option>
                <option value="diarreia">Líquidas / Diarreia</option>
                <option value="outro">Outro aspecto</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Estado Geral / Humor
              </label>
              <select
                value={logForm.humorOuEstado}
                onChange={e => setLogForm({ ...logForm, humorOuEstado: e.target.value as any })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white"
              >
                <option value="alerta">Ativo / Bem disposto</option>
                <option value="estavel">Estável / Calmo</option>
                <option value="sonolento">Sonolento / Apático</option>
                <option value="agitado">Agitado / Irritado</option>
                <option value="confuso">Confuso / Desorientado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Anotações do Cuidador (alimentação, dores, sintomas)
            </label>
            <textarea
              rows={2}
              value={logForm.anotacoes}
              onChange={e => setLogForm({ ...logForm, anotacoes: e.target.value })}
              placeholder="Ex: Aceitou bem a refeição, queixou-se de leve dor lombar à tarde..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingLog(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs"
            >
              Salvar Medição
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
