import React, { useState } from 'react';
import { User, Pill, Activity, Plus, Edit2, Trash2, CheckCircle2, Clock, Share2, Printer, AlertCircle, Check } from 'lucide-react';
import { PatientData, MedicationItem, HealthLogItem } from '../types';
import { Modal } from './Modal';

interface HealthAgendaSectionProps {
  patient: PatientData;
  onUpdatePatient: (data: PatientData) => void;
  medications: MedicationItem[];
  onUpdateMedications: (meds: MedicationItem[]) => void;
  healthLogs: HealthLogItem[];
  onUpdateHealthLogs: (logs: HealthLogItem[]) => void;
  onShowToast: (msg: string) => void;
}

export const HealthAgendaSection: React.FC<HealthAgendaSectionProps> = ({
  patient,
  onUpdatePatient,
  medications,
  onUpdateMedications,
  healthLogs,
  onUpdateHealthLogs,
  onShowToast
}) => {
  // Modals
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
    onShowToast('✅ Horário de medicamento atualizado!');
  };

  const handleSaveMedication = (e: React.FormEvent) => {
    e.preventDefault();
    const hours = medForm.horariosStr
      .split(/[,;]+/)
      .map(s => s.trim())
      .filter(Boolean);

    const newMed: MedicationItem = {
      id: 'med-' + Date.now(),
      nome: medForm.nome,
      dosagem: medForm.dosagem,
      finalidade: medForm.finalidade,
      horarios: hours.length > 0 ? hours : ['08:00'],
      observacoes: medForm.observacoes,
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
    onShowToast('✅ Medicamento cadastrado na lista!');
  };

  const handleDeleteMedication = (id: string) => {
    onUpdateMedications(medications.filter(m => m.id !== id));
    onShowToast('🗑️ Medicamento removido.');
  };

  // Health Log handlers
  const handleSaveHealthLog = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: HealthLogItem = {
      id: 'log-' + Date.now(),
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
      anotacoes: logForm.anotacoes || ''
    };

    onUpdateHealthLogs([newEntry, ...healthLogs]);
    setIsAddingLog(false);
    onShowToast('✅ Sinais vitais registrados com sucesso!');
  };

  const handleDeleteLog = (id: string) => {
    onUpdateHealthLogs(healthLogs.filter(l => l.id !== id));
    onShowToast('🗑️ Registro apagado.');
  };

  // Share & Export
  const handleShareSummary = () => {
    const latestLog = healthLogs[0];
    const medList = medications.map(m => `• ${m.nome} (${m.dosagem}) — Horários: ${m.horarios.join(', ')}`).join('\n');

    let text = `📋 FICHA DE SAÚDE — ${patient.nome}\n`;
    text += `👤 Idade: ${patient.nascimento}\n`;
    text += `🚨 Alergias: ${patient.alergias || 'Nenhuma declarada'}\n`;
    text += `🏥 Diagnósticos: ${patient.diagnosticos || 'Sem registros'}\n`;
    text += `📞 Contato de Emergência: ${patient.contatoEmergenciaNome} (${patient.contatoEmergenciaTelefone})\n\n`;

    text += `💊 MEDICAMENTOS EM USO:\n${medList || 'Nenhum medicamento cadastrado'}\n\n`;

    if (latestLog) {
      const dt = new Date(latestLog.dataHora).toLocaleString('pt-BR');
      text += `📊 ÚLTIMA MEDIÇÃO (${dt}):\n`;
      if (latestLog.pressaoSistolica) text += `• Pressão Arterial: ${latestLog.pressaoSistolica}x${latestLog.pressaoDiastolica} mmHg\n`;
      if (latestLog.glicemia) text += `• Glicemia: ${latestLog.glicemia} mg/dL (${latestLog.glicemiaMomento})\n`;
      if (latestLog.temperatura) text += `• Temperatura: ${latestLog.temperatura} °C\n`;
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
    <div className="space-y-5 pb-6">
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

          <div className="flex items-center gap-2 self-start sm:self-auto">
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

        {/* Emergency Contacts & Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">
              Contato Principal de Emergência:
            </span>
            <p className="font-bold text-slate-900 mt-1">
              {patient.contatoEmergenciaNome || 'Familiar'}
            </p>
            <a
              href={`tel:${patient.contatoEmergenciaTelefone.replace(/\D/g, '')}`}
              className="text-emerald-800 font-semibold hover:underline block mt-0.5"
            >
              📞 {patient.contatoEmergenciaTelefone || 'Sem telefone'}
            </a>
          </div>

          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">
              Diagnósticos & Doenças Crônicas:
            </span>
            <p className="font-medium text-slate-800 mt-1 leading-relaxed">
              {patient.diagnosticos || 'Nenhum diagnóstico registrado.'}
            </p>
          </div>
        </div>

        {patient.observacoesMedicas && (
          <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-100 text-xs text-slate-800">
            <span className="font-bold block text-emerald-950">Observações de Cuidados:</span>
            <p className="mt-0.5 leading-relaxed text-slate-700">{patient.observacoesMedicas}</p>
          </div>
        )}
      </div>

      {/* Medication Manager in Green & White */}
      <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100">
              <Pill className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Controle de Medicamentos
              </h2>
              <p className="text-xs text-slate-500">
                Horários, dosagens e marcação de remédios já tomados no dia.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddingMed(true)}
            className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-95 rounded-xl shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Remédio</span>
          </button>
        </div>

        {medications.length === 0 ? (
          <div className="p-6 text-center bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-xs text-slate-500">Nenhum medicamento cadastrado ainda.</p>
            <button
              onClick={() => setIsAddingMed(true)}
              className="mt-2 text-xs font-bold text-emerald-700 hover:underline"
            >
              Cadastrar o primeiro remédio
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {medications.map(med => (
              <div
                key={med.id}
                className="p-4 bg-white border border-slate-200 hover:border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors shadow-2xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{med.nome}</h3>
                    <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-md font-medium">
                      {med.dosagem}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Finalidade: <strong className="text-slate-800">{med.finalidade}</strong>
                  </p>
                  {med.observacoes && (
                    <p className="text-[11px] text-slate-500 italic">
                      Nota: {med.observacoes}
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

      {/* Vitals Log and Health Diary in Green & White */}
      <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100">
              <Activity className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Diário de Sinais Vitais & Evolução
              </h2>
              <p className="text-xs text-slate-500">
                Acompanhamento de pressão arterial, glicemia, temperatura e sintomas para levar ao médico da família.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddingLog(true)}
            className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-95 rounded-xl shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Sinais Hoje</span>
          </button>
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
                      <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
                        <span className="text-slate-500 font-semibold">Pressão:</span>
                        <strong className="text-slate-900 font-bold">
                          {log.pressaoSistolica}x{log.pressaoDiastolica} mmHg
                        </strong>
                        {bpStatus && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${bpStatus.color}`}>
                            {bpStatus.label}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Blood Glucose */}
                    {log.glicemia && (
                      <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
                        <span className="text-slate-500 font-semibold">Glicemia:</span>
                        <strong className="text-slate-900 font-bold">
                          {log.glicemia} mg/dL
                        </strong>
                        <span className="text-[10px] text-slate-500">
                          ({log.glicemiaMomento === 'jejum' ? 'Jejum' : log.glicemiaMomento === 'pos-prandial' ? 'Pós-refeição' : 'Aleatório'})
                        </span>
                      </div>
                    )}

                    {/* Temperature */}
                    {log.temperatura && (
                      <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
                        <span className="text-slate-500 font-semibold">Temp:</span>
                        <strong className="font-bold text-slate-900">
                          {log.temperatura} °C
                        </strong>
                      </div>
                    )}

                    {/* Heart Rate */}
                    {log.frequenciaCardiaca && (
                      <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
                        <span className="text-slate-500 font-semibold">Pulso:</span>
                        <strong className="text-slate-900 font-bold">{log.frequenciaCardiaca} bpm</strong>
                      </div>
                    )}
                  </div>

                  {log.anotacoes && (
                    <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 leading-relaxed">
                      📝 {log.anotacoes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Edit Patient */}
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
                Data de Nasc. / Idade
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
                placeholder="Ex: O+, A-, etc."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Contato de Emergência (Nome)
              </label>
              <input
                type="text"
                value={patientForm.contatoEmergenciaNome}
                onChange={e => setPatientForm({ ...patientForm, contatoEmergenciaNome: e.target.value })}
                placeholder="Ex: Maria (Filha)"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Telefone de Emergência
              </label>
              <input
                type="text"
                value={patientForm.contatoEmergenciaTelefone}
                onChange={e => setPatientForm({ ...patientForm, contatoEmergenciaTelefone: e.target.value })}
                placeholder="Ex: (11) 98765-4321"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-800 uppercase tracking-wider block mb-1">
              Alergias Importantes (Medicamentos, alimentos, látex)
            </label>
            <input
              type="text"
              value={patientForm.alergias}
              onChange={e => setPatientForm({ ...patientForm, alergias: e.target.value })}
              placeholder="Ex: Alergia grave a Dipirona e Penicilina"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Diagnósticos e Doenças Crônicas
            </label>
            <textarea
              rows={2}
              value={patientForm.diagnosticos}
              onChange={e => setPatientForm({ ...patientForm, diagnosticos: e.target.value })}
              placeholder="Ex: Hipertensão, Diabetes Tipo 2, AVC em 2021..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Observações Médicas Adicionais
            </label>
            <textarea
              rows={2}
              value={patientForm.observacoesMedicas}
              onChange={e => setPatientForm({ ...patientForm, observacoesMedicas: e.target.value })}
              placeholder="Ex: Dificuldade para engolir líquidos finos, usa prótese dentária..."
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
              Salvar Ficha
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Medication */}
      <Modal
        isOpen={isAddingMed}
        onClose={() => setIsAddingMed(false)}
        title="Cadastrar Medicamento"
      >
        <form onSubmit={handleSaveMedication} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Nome do Remédio
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
                Dosagem
              </label>
              <input
                type="text"
                required
                value={medForm.dosagem}
                onChange={e => setMedForm({ ...medForm, dosagem: e.target.value })}
                placeholder="Ex: 50mg — 1 comp."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Para que serve
              </label>
              <input
                type="text"
                required
                value={medForm.finalidade}
                onChange={e => setMedForm({ ...medForm, finalidade: e.target.value })}
                placeholder="Ex: Pressão alta"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Horários (separe por vírgula)
            </label>
            <input
              type="text"
              required
              value={medForm.horariosStr}
              onChange={e => setMedForm({ ...medForm, horariosStr: e.target.value })}
              placeholder="Ex: 08:00, 14:00, 20:00"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Instruções de Tomada (opcional)
            </label>
            <input
              type="text"
              value={medForm.observacoes}
              onChange={e => setMedForm({ ...medForm, observacoes: e.target.value })}
              placeholder="Ex: Tomar após o almoço com bastante água"
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
              Salvar Medicamento
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Vitals Log */}
      <Modal
        isOpen={isAddingLog}
        onClose={() => setIsAddingLog(false)}
        title="Registrar Sinais Vitais & Sintomas"
      >
        <form onSubmit={handleSaveHealthLog} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                PA Sistólica (Máx)
              </label>
              <input
                type="number"
                value={logForm.pressaoSistolica || ''}
                onChange={e => setLogForm({ ...logForm, pressaoSistolica: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="Ex: 120"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                PA Diastólica (Mín)
              </label>
              <input
                type="number"
                value={logForm.pressaoDiastolica || ''}
                onChange={e => setLogForm({ ...logForm, pressaoDiastolica: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="Ex: 80"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Glicemia (mg/dL)
              </label>
              <input
                type="number"
                value={logForm.glicemia || ''}
                onChange={e => setLogForm({ ...logForm, glicemia: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="Ex: 110"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Momento da Glicemia
              </label>
              <select
                value={logForm.glicemiaMomento}
                onChange={e => setLogForm({ ...logForm, glicemiaMomento: e.target.value as any })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white"
              >
                <option value="jejum">Em jejum</option>
                <option value="pos-prandial">2h após refeição</option>
                <option value="aleatorio">Aleatório / Antes de dormir</option>
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
                value={logForm.temperatura || ''}
                onChange={e => setLogForm({ ...logForm, temperatura: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="Ex: 36.5"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Frequência Cardíaca (bpm)
              </label>
              <input
                type="number"
                value={logForm.frequenciaCardiaca || ''}
                onChange={e => setLogForm({ ...logForm, frequenciaCardiaca: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="Ex: 72"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Anotações do Dia (comportamento, apetite, queixas)
            </label>
            <textarea
              rows={3}
              value={logForm.anotacoes}
              onChange={e => setLogForm({ ...logForm, anotacoes: e.target.value })}
              placeholder="Ex: Almoçou bem, sem tosse. Queixou-se de leve dor no joelho à tarde..."
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
