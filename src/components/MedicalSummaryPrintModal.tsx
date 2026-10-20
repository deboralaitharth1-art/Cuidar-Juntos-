import React, { useState, useEffect } from 'react';
import {
  Printer,
  Copy,
  Check,
  X,
  AlertTriangle,
  HeartPulse,
  Pill,
  User,
  Phone,
  Calendar,
  FileText,
  ShieldAlert,
  Share2
} from 'lucide-react';
import { PatientData, MedicationItem, HealthLogItem, MedicalAppointment, UbsData } from '../types';

interface MedicalSummaryPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientData;
  ubs: UbsData;
  medications: MedicationItem[];
  healthLogs: HealthLogItem[];
  appointments: MedicalAppointment[];
  onShowToast: (msg: string) => void;
}

export const MedicalSummaryPrintModal: React.FC<MedicalSummaryPrintModalProps> = ({
  isOpen,
  onClose,
  patient,
  ubs,
  medications,
  healthLogs,
  appointments,
  onShowToast
}) => {
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const latestLog = healthLogs[0];
  const currentDateFormatted = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    let text = `=================================================\n`;
    text += `🏥 FICHA CLÍNICA & PRONTUÁRIO DE EMERGÊNCIA\n`;
    text += `Aplicativo Cuidar Juntos — Emissão: ${currentDateFormatted}\n`;
    text += `=================================================\n\n`;

    text += `👤 DADOS DO PACIENTE:\n`;
    text += `• Nome: ${patient.nome}\n`;
    text += `• Nascimento/Idade: ${patient.nascimento}\n`;
    text += `• Cartão SUS: ${patient.cartaoSus || 'Não informado'}\n`;
    text += `• Tipo Sanguíneo: ${patient.tipoSanguineo || 'Não informado'}\n\n`;

    text += `⚠️ ALERGIAS GRAVES:\n`;
    text += `${patient.alergias || 'Nenhuma alergia conhecida relatada'}\n\n`;

    text += `🩺 DIAGNÓSTICOS & CONDIÇÕES CLÍNICAS:\n`;
    text += `${patient.diagnosticos || 'Sem diagnósticos registrados'}\n\n`;

    if (patient.observacoesMedicas) {
      text += `📌 OBSERVAÇÕES MÉDICAS / CUIDADOS ESPECIAIS:\n`;
      text += `${patient.observacoesMedicas}\n\n`;
    }

    text += `📞 CONTATOS DE EMERGÊNCIA:\n`;
    text += `• Principal: ${patient.contatoEmergenciaNome} - ${patient.contatoEmergenciaTelefone}\n`;
    if (patient.contatoSecundarioNome) {
      text += `• Secundário / Médico: ${patient.contatoSecundarioNome} - ${patient.contatoSecundarioTelefone}\n`;
    }
    if (ubs.nome) {
      text += `• Posto de Saúde (UBS): ${ubs.nome} - Tel: ${ubs.telefone || 'N/A'}\n`;
      if (ubs.endereco) text += `  Endereço UBS: ${ubs.endereco}\n`;
    }
    text += `\n`;

    text += `💊 MEDICAMENTOS DE USO CONTÍNUO:\n`;
    if (medications.length === 0) {
      text += `Nenhum medicamento registrado.\n`;
    } else {
      medications.forEach((m, idx) => {
        text += `${idx + 1}. ${m.nome} — ${m.dosagem}\n`;
        text += `   Horários: ${m.horarios.join(', ')}\n`;
        if (m.finalidade) text += `   Finalidade: ${m.finalidade}\n`;
        if (m.observacoes) text += `   Instruções: ${m.observacoes}\n`;
      });
    }
    text += `\n`;

    if (latestLog) {
      text += `📊 ÚLTIMA AVALIAÇÃO DE SINAIS VITAIS (${new Date(latestLog.dataHora).toLocaleString('pt-BR')}):\n`;
      if (latestLog.pressaoSistolica) text += `• Pressão Arterial: ${latestLog.pressaoSistolica}x${latestLog.pressaoDiastolica} mmHg\n`;
      if (latestLog.glicemia) text += `• Glicemia: ${latestLog.glicemia} mg/dL (${latestLog.glicemiaMomento})\n`;
      if (latestLog.temperatura) text += `• Temperatura: ${latestLog.temperatura} °C\n`;
      if (latestLog.frequenciaCardiaca) text += `• Frequência Cardíaca: ${latestLog.frequenciaCardiaca} bpm\n`;
      if (latestLog.anotacoes) text += `• Notas do Cuidador: ${latestLog.anotacoes}\n`;
      text += `\n`;
    }

    const upcomingApps = appointments.filter(a => a.status === 'agendado');
    if (upcomingApps.length > 0) {
      text += `📅 PRÓXIMAS CONSULTAS / EXAMES:\n`;
      upcomingApps.forEach(a => {
        text += `• ${a.data} às ${a.horario}: ${a.titulo} (${a.medicoOuLocal})\n`;
      });
      text += `\n`;
    }

    text += `=================================================\n`;
    text += `Documento emitido para consultas, atendimentos de emergência ou SAMU 192.\n`;

    navigator.clipboard.writeText(text);
    setHasCopied(true);
    onShowToast('📋 Ficha médica completa copiada para o WhatsApp ou e-mail!');
    setTimeout(() => setHasCopied(false), 3000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="print-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto print:static print:p-0 print:bg-white print:overflow-visible"
    >
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-emerald-100 flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in zoom-in-95 duration-200 print:max-w-full print:max-h-full print:shadow-none print:border-none print:rounded-none">
        {/* Modal Controls Header (Hidden on print) */}
        <div className="bg-emerald-800 text-white p-4 flex items-center justify-between no-print shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/10 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 id="print-modal-title" className="text-base font-bold">
                Ficha Médica & Prontuário de Emergência
              </h2>
              <p className="text-xs text-emerald-100">
                Resumo clínico pronto para imprimir, salvar em PDF ou levar ao médico
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Copiar texto para compartilhar"
            >
              {hasCopied ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{hasCopied ? 'Copiado!' : 'Copiar Texto'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4 text-emerald-700" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors ml-1"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 overflow-y-auto print:p-0 print:overflow-visible text-slate-800 space-y-5 text-xs sm:text-sm">
          {/* Official Document Banner */}
          <div className="border-b-2 border-emerald-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-emerald-700 text-white text-[11px] font-bold rounded uppercase tracking-wider">
                  Cuidar Juntos
                </span>
                <span className="text-xs text-slate-500 font-medium">Atenção Domiciliar & Familiar</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                FICHA CLÍNICA & PRONTUÁRIO DE EMERGÊNCIA
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Documento de Identificação Médica, Medicamentos Contínuos e Cuidados Especiais
              </p>
            </div>
            <div className="text-right sm:self-end">
              <span className="text-[11px] text-slate-400 block">Data de Emissão:</span>
              <span className="font-bold text-slate-700 text-xs">{currentDateFormatted}</span>
            </div>
          </div>

          {/* Section 1: Dados Pessoais & Alergias */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <User className="w-3.5 h-3.5 text-emerald-700" />
                <span>Identificação do Paciente</span>
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Nome Completo:</span>
                  <strong className="text-slate-900 text-sm">{patient.nome}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Data de Nascimento / Idade:</span>
                  <strong className="text-slate-800">{patient.nascimento}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Cartão Nacional do SUS:</span>
                  <strong className="text-slate-800 font-mono">{patient.cartaoSus || 'Não informado'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Tipo Sanguíneo:</span>
                  <strong className="text-emerald-800 font-bold">{patient.tipoSanguineo || 'Não informado'}</strong>
                </div>
              </div>
            </div>

            {/* Critical Allergy Box */}
            <div className="p-3.5 bg-rose-50 rounded-xl border-2 border-rose-300">
              <h3 className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1 mb-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>ALERGIAS GRAVES</span>
              </h3>
              <p className="text-xs font-bold text-rose-800 leading-snug">
                {patient.alergias || 'Nenhuma alergia grave relatada'}
              </p>
              <span className="text-[10px] text-rose-600/80 block mt-2">
                * Informar à equipe médica antes de administrar qualquer medicação.
              </span>
            </div>
          </div>

          {/* Section 2: Diagnósticos & Observações */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Diagnósticos Médicos & Comorbidades:
              </span>
              <p className="text-xs text-slate-800 font-medium mt-0.5">
                {patient.diagnosticos || 'Sem diagnósticos registrados.'}
              </p>
            </div>
            {patient.observacoesMedicas && (
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Recomendações e Cuidados Especiais:
                </span>
                <p className="text-xs text-slate-700 mt-0.5">
                  {patient.observacoesMedicas}
                </p>
              </div>
            )}
          </div>

          {/* Section 3: Medicamentos de Uso Contínuo */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-emerald-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-emerald-700" />
                <span>Medicamentos de Uso Contínuo ({medications.length})</span>
              </h3>
              <span className="text-[11px] text-emerald-800 font-medium">Uso Diário</span>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 text-[11px] font-bold border-b border-slate-200">
                    <th className="p-2.5">Medicamento</th>
                    <th className="p-2.5">Dosagem</th>
                    <th className="p-2.5">Horários</th>
                    <th className="p-2.5">Finalidade / Indicação</th>
                    <th className="p-2.5">Orientações do Cuidador</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {medications.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-400 italic">
                        Nenhum medicamento registrado.
                      </td>
                    </tr>
                  ) : (
                    medications.map(med => (
                      <tr key={med.id} className="hover:bg-slate-50/50">
                        <td className="p-2.5 font-bold text-slate-900">{med.nome}</td>
                        <td className="p-2.5 text-slate-700 font-medium">{med.dosagem}</td>
                        <td className="p-2.5 font-mono text-emerald-800 font-bold">
                          {med.horarios.join(' · ')}
                        </td>
                        <td className="p-2.5 text-slate-600">{med.finalidade || '—'}</td>
                        <td className="p-2.5 text-slate-500 italic">{med.observacoes || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Últimos Sinais Vitais & Contatos de Emergência */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Vital Signs Snapshot */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <HeartPulse className="w-3.5 h-3.5 text-emerald-700" />
                <span>Últimos Sinais Vitais Aferidos</span>
              </h3>
              {latestLog ? (
                <div className="space-y-1.5 text-xs">
                  <div className="text-[11px] text-slate-400">
                    Aferido em: <strong>{new Date(latestLog.dataHora).toLocaleString('pt-BR')}</strong>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 font-medium">
                    {latestLog.pressaoSistolica && (
                      <div>
                        Pressão: <strong className="text-slate-900">{latestLog.pressaoSistolica}x{latestLog.pressaoDiastolica} mmHg</strong>
                      </div>
                    )}
                    {latestLog.glicemia && (
                      <div>
                        Glicemia: <strong className="text-slate-900">{latestLog.glicemia} mg/dL</strong> ({latestLog.glicemiaMomento})
                      </div>
                    )}
                    {latestLog.temperatura && (
                      <div>
                        Temperatura: <strong className="text-slate-900">{latestLog.temperatura} °C</strong>
                      </div>
                    )}
                    {latestLog.frequenciaCardiaca && (
                      <div>
                        Freq. Cardíaca: <strong className="text-slate-900">{latestLog.frequenciaCardiaca} bpm</strong>
                      </div>
                    )}
                  </div>
                  {latestLog.anotacoes && (
                    <p className="text-[11px] text-slate-600 pt-1 border-t border-slate-200 italic">
                      Nota: {latestLog.anotacoes}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Nenhuma medição registrada ainda.</p>
              )}
            </div>

            {/* Emergency Contacts */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Phone className="w-3.5 h-3.5 text-emerald-700" />
                <span>Contatos Imediatos</span>
              </h3>
              <div className="space-y-1.5 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Familiar / Cuidador:</span>
                  <strong className="text-slate-900">{patient.contatoEmergenciaNome}</strong> —{' '}
                  <span className="font-bold text-emerald-800">{patient.contatoEmergenciaTelefone}</span>
                </div>
                {patient.contatoSecundarioNome && (
                  <div>
                    <span className="text-slate-500 block text-[11px]">Médico / Segundo Contato:</span>
                    <strong className="text-slate-900">{patient.contatoSecundarioNome}</strong> —{' '}
                    <span className="font-bold text-emerald-800">{patient.contatoSecundarioTelefone}</span>
                  </div>
                )}
                {ubs.nome && (
                  <div className="pt-1 border-t border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Unidade Básica de Saúde (UBS):</span>
                    <strong className="text-slate-900">{ubs.nome}</strong> — {ubs.telefone}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer note and signatures for print */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>
              <p>📍 Cuidar Juntos · Aplicativo de Atenção Domiciliar e Familiar</p>
              <p>Em caso de parada, asfixia ou perda de consciência, disque imediatamente <strong>192 (SAMU)</strong>.</p>
            </div>

            <div className="text-center sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto">
              <div className="w-48 border-b border-slate-400 mx-auto sm:ml-auto mb-1"></div>
              <span>Assinatura do Cuidador / Responsável</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
