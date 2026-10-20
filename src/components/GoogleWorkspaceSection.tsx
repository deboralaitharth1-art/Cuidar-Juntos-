import React, { useState, useEffect } from 'react';
import { Calendar, Mail, Plus, Trash2, Send, RefreshCw, UserCheck, AlertCircle, Clock, MapPin, CheckCircle2, Check, ExternalLink } from 'lucide-react';
import { User } from 'firebase/auth';
import { initAuth, googleSignIn, logout } from '../services/firebaseAuth';
import { listCalendarEvents, createCalendarEvent, deleteCalendarEvent, CalendarEventItem } from '../services/calendarService';
import { sendEmailViaGmail, listRecentGmailMessages, GmailMessageSummary } from '../services/gmailService';
import { PatientData, MedicationItem, HealthLogItem } from '../types';
import { Modal } from './Modal';

interface GoogleWorkspaceSectionProps {
  patient: PatientData;
  medications: MedicationItem[];
  healthLogs: HealthLogItem[];
  onShowToast: (msg: string) => void;
}

export const GoogleWorkspaceSection: React.FC<GoogleWorkspaceSectionProps> = ({
  patient,
  medications,
  healthLogs,
  onShowToast
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'calendar' | 'gmail'>('calendar');

  // Calendar State
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(false);
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState<boolean>(false);
  const [eventToDelete, setEventToDelete] = useState<CalendarEventItem | null>(null);

  const [newEventForm, setNewEventForm] = useState({
    summary: 'Consulta Médica de Rotina',
    location: 'UBS / Posto de Saúde',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    description: `Acompanhamento de saúde de ${patient.nome}. Levar cartão do SUS e exames recentes.`
  });

  // Gmail State
  const [recentEmails, setRecentEmails] = useState<GmailMessageSummary[]>([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState<boolean>(false);
  const [isSendEmailModalOpen, setIsSendEmailModalOpen] = useState<boolean>(false);
  const [isEmailConfirmOpen, setIsEmailConfirmOpen] = useState<boolean>(false);

  const [emailForm, setEmailForm] = useState({
    to: '',
    subject: `Relatório de Saúde — ${patient.nome || 'Paciente'} (${new Date().toLocaleDateString('pt-BR')})`,
    bodyText: ''
  });

  // Prepare default health report text
  const generateReportText = () => {
    const latestLog = healthLogs[0];
    const medList = medications.map(m => `• ${m.nome} (${m.dosagem}) — Horários: ${m.horarios.join(', ')}`).join('\n');

    let text = `RELATÓRIO DE CUIDADOS E SINAIS VITAIS\nAplicativo: Cuidar Juntos\nData: ${new Date().toLocaleDateString('pt-BR')}\n\n`;
    text += `IDENTIFICAÇÃO DO PACIENTE:\n• Nome: ${patient.nome}\n• Idade/Nascimento: ${patient.nascimento}\n• Alergias: ${patient.alergias || 'Nenhuma informada'}\n• Diagnósticos: ${patient.diagnosticos || 'Sem registros'}\n• Contato de Emergência: ${patient.contatoEmergenciaNome} (${patient.contatoEmergenciaTelefone})\n\n`;
    text += `MEDICAMENTOS EM USO:\n${medList || 'Nenhum medicamento registrado'}\n\n`;

    if (latestLog) {
      const dt = new Date(latestLog.dataHora).toLocaleString('pt-BR');
      text += `ÚLTIMA AVALIAÇÃO DE SINAIS VITAIS (${dt}):\n`;
      if (latestLog.pressaoSistolica) text += `• Pressão Arterial: ${latestLog.pressaoSistolica}x${latestLog.pressaoDiastolica} mmHg\n`;
      if (latestLog.glicemia) text += `• Glicemia: ${latestLog.glicemia} mg/dL (${latestLog.glicemiaMomento})\n`;
      if (latestLog.temperatura) text += `• Temperatura: ${latestLog.temperatura} °C\n`;
      if (latestLog.frequenciaCardiaca) text += `• Frequência Cardíaca: ${latestLog.frequenciaCardiaca} bpm\n`;
      if (latestLog.anotacoes) text += `• Observações do Cuidador: ${latestLog.anotacoes}\n`;
    }

    return text;
  };

  // Init auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
        setIsLoadingAuth(false);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
        setIsLoadingAuth(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch data when authenticated
  useEffect(() => {
    if (accessToken) {
      loadCalendarData();
      loadGmailData();
    }
  }, [accessToken]);

  // Helper to extract error message safely
  const getErrorMessage = (err: unknown): string => {
    if (err instanceof Error) return err.message;
    if (typeof err === 'object' && err !== null && 'message' in err) {
      return String((err as { message: unknown }).message);
    }
    return 'Erro desconhecido';
  };

  const loadCalendarData = async () => {
    if (!accessToken) return;
    setIsLoadingEvents(true);
    try {
      const items = await listCalendarEvents(accessToken);
      setEvents(items);
    } catch (err: unknown) {
      onShowToast(`⚠️ ${getErrorMessage(err) || 'Erro ao carregar eventos da agenda'}`);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const loadGmailData = async () => {
    if (!accessToken) return;
    setIsLoadingEmails(true);
    try {
      const messages = await listRecentGmailMessages(accessToken, 5);
      setRecentEmails(messages);
    } catch {
      // quiet fail for non-critical listing
    } finally {
      setIsLoadingEmails(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setIsLoadingAuth(true);
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setAccessToken(res.accessToken);
        onShowToast('✅ Conectado com sucesso à conta Google!');
      }
    } catch (err: unknown) {
      onShowToast(`❌ Falha no login Google: ${getErrorMessage(err) || 'Tente novamente'}`);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setCurrentUser(null);
    setAccessToken(null);
    setEvents([]);
    setRecentEmails([]);
    onShowToast('Desconectado da conta Google.');
  };

  // Create Event with Confirmation
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    try {
      const startDateTime = new Date(`${newEventForm.date}T${newEventForm.startTime}:00`).toISOString();
      const endDateTime = new Date(`${newEventForm.date}T${newEventForm.endTime}:00`).toISOString();

      await createCalendarEvent(accessToken, {
        summary: newEventForm.summary,
        location: newEventForm.location,
        description: newEventForm.description,
        startDateTime,
        endDateTime
      });

      setIsNewEventModalOpen(false);
      onShowToast('✅ Agendamento adicionado ao Google Calendar!');
      loadCalendarData();
    } catch (err: unknown) {
      onShowToast(`❌ Erro ao criar agendamento: ${getErrorMessage(err)}`);
    }
  };

  // Delete Event with Confirmation
  const confirmDeleteEvent = async () => {
    if (!eventToDelete || !accessToken) return;
    try {
      await deleteCalendarEvent(accessToken, eventToDelete.id);
      setEvents(prev => prev.filter(e => e.id !== eventToDelete.id));
      onShowToast('🗑️ Agendamento removido do Google Calendar.');
    } catch (err: unknown) {
      onShowToast(`❌ Erro ao excluir: ${getErrorMessage(err)}`);
    } finally {
      setEventToDelete(null);
    }
  };

  // Open send email modal
  const handleOpenSendEmail = () => {
    setEmailForm({
      to: '',
      subject: `Relatório de Saúde — ${patient.nome || 'Paciente'} (${new Date().toLocaleDateString('pt-BR')})`,
      bodyText: generateReportText()
    });
    setIsSendEmailModalOpen(true);
  };

  // Confirm sending email
  const executeSendEmail = async () => {
    if (!accessToken) return;
    try {
      await sendEmailViaGmail(accessToken, {
        to: emailForm.to,
        subject: emailForm.subject,
        bodyText: emailForm.bodyText
      });

      setIsEmailConfirmOpen(false);
      setIsSendEmailModalOpen(false);
      onShowToast(`✉️ Relatório enviado com sucesso para ${emailForm.to}!`);
      loadGmailData();
    } catch (err: unknown) {
      onShowToast(`❌ Erro ao enviar pelo Gmail: ${getErrorMessage(err)}`);
    }
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Google Workspace Header Banner */}
      <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-50 rounded-lg text-emerald-700 border border-emerald-100">
                <Calendar className="w-4 h-4" />
              </span>
              <span className="p-1.5 bg-emerald-50 rounded-lg text-emerald-700 border border-emerald-100">
                <Mail className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Google Calendar & Gmail
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Sincronize consultas médicas com a Google Agenda e envie relatórios de saúde diretamente pelo Gmail.
            </p>
          </div>

          {/* Auth Button or User Profile */}
          <div className="shrink-0">
            {isLoadingAuth ? (
              <div className="text-xs text-slate-500 flex items-center gap-1.5 py-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                <span>Verificando conexão...</span>
              </div>
            ) : currentUser && accessToken ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'Google User'}
                      className="w-8 h-8 rounded-full border border-emerald-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                      {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                    </div>
                  )}
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold text-slate-900 line-clamp-1">
                      {currentUser.displayName || 'Conectado ao Google'}
                    </p>
                    <p className="text-[10px] text-slate-500 line-clamp-1">{currentUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Sair
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                className="flex items-center gap-2.5 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs transition-all text-xs font-bold text-slate-700 active:scale-95"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span>Conectar com Google</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab switchers */}
        <div className="mt-4 flex items-center gap-2 border-b border-emerald-50 pb-2">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'calendar'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-emerald-800 hover:bg-emerald-50'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Google Calendar (Agenda)</span>
          </button>
          <button
            onClick={() => setActiveTab('gmail')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'gmail'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-emerald-800 hover:bg-emerald-50'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Gmail (Relatórios)</span>
          </button>
        </div>
      </div>

      {/* When not logged in alert */}
      {!accessToken && (
        <div className="p-6 bg-white border border-emerald-100 rounded-2xl text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-100">
            <UserCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Conecte sua Conta Google
          </h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            Faça login com a sua conta Google para sincronizar as consultas de saúde com a Google Agenda e enviar relatórios médicos formatados pelo Gmail com permissão segura.
          </p>
          <button
            onClick={handleSignIn}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs transition-all text-xs inline-flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            <span>Fazer Login com Google</span>
          </button>
        </div>
      )}

      {/* TAB 1: Google Calendar */}
      {accessToken && activeTab === 'calendar' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Consultas e Cuidados no Google Calendar
              </h3>
              <p className="text-xs text-slate-500">
                Seus agendamentos sincronizados em tempo real com o aplicativo Google Agenda no seu celular.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadCalendarData}
                disabled={isLoadingEvents}
                className="p-2 text-slate-500 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors border border-slate-200"
                title="Atualizar agenda"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingEvents ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setIsNewEventModalOpen(true)}
                className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-95 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Agendar no Google</span>
              </button>
            </div>
          </div>

          {isLoadingEvents ? (
            <div className="p-8 text-center bg-white border border-emerald-100 rounded-2xl">
              <RefreshCw className="w-5 h-5 text-emerald-700 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">Carregando seus agendamentos...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="p-8 text-center bg-white border border-emerald-100 rounded-2xl space-y-2">
              <Calendar className="w-8 h-8 text-emerald-600/50 mx-auto" />
              <p className="text-sm font-bold text-slate-800">Nenhum agendamento futuro encontrado</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Agende consultas médicas, visitas da UBS ou sessões de fisioterapia para receber lembretes no celular.
              </p>
              <button
                onClick={() => setIsNewEventModalOpen(true)}
                className="mt-2 text-xs font-bold text-emerald-700 hover:underline"
              >
                + Criar primeiro agendamento
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map(ev => {
                const startStr = ev.start.dateTime || ev.start.date;
                const dateObj = startStr ? new Date(startStr) : null;
                const formattedDate = dateObj
                  ? dateObj.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })
                  : '';
                const formattedTime = ev.start.dateTime
                  ? new Date(ev.start.dateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                  : 'Dia inteiro';

                return (
                  <div
                    key={ev.id}
                    className="p-4 bg-white border border-slate-200 hover:border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{ev.summary}</h4>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          Google Calendar
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5 text-emerald-700" />
                          {formattedDate} às {formattedTime}
                        </span>
                        {ev.location && (
                          <span className="flex items-center gap-1 text-slate-500">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {ev.location}
                          </span>
                        )}
                      </div>
                      {ev.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {ev.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {ev.htmlLink && (
                        <a
                          href={ev.htmlLink}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Abrir no Google Calendar"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => setEventToDelete(ev)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Excluir agendamento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Gmail */}
      {accessToken && activeTab === 'gmail' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Envio de Relatórios & Prontuário por Gmail
              </h3>
              <p className="text-xs text-slate-500">
                Envie o resumo atualizado dos sinais vitais, remédios e anotações para o médico ou familiares com 1 clique.
              </p>
            </div>
            <button
              onClick={handleOpenSendEmail}
              className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-95 rounded-xl shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Send className="w-4 h-4" />
              <span>Novo E-mail de Relatório</span>
            </button>
          </div>

          {/* Quick Preview Card */}
          <div className="p-4 bg-white border border-emerald-100 rounded-xl space-y-3 shadow-xs">
            <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider block">
              Pré-visualização do Relatório Automático:
            </span>
            <pre className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 whitespace-pre-wrap font-sans max-h-48 overflow-y-auto">
              {generateReportText()}
            </pre>
            <div className="flex justify-end">
              <button
                onClick={handleOpenSendEmail}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Enviar este Relatório por E-mail</span>
              </button>
            </div>
          </div>

          {/* Recent Gmail Messages list */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Mensagens Recentes da Caixa do Gmail
              </h4>
              <button
                onClick={loadGmailData}
                disabled={isLoadingEmails}
                className="text-slate-400 hover:text-emerald-700 p-1"
                title="Atualizar e-mails"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingEmails ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {isLoadingEmails ? (
              <p className="text-xs text-slate-400 py-2">Carregando mensagens...</p>
            ) : recentEmails.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">Nenhum e-mail recente listado.</p>
            ) : (
              <div className="space-y-2">
                {recentEmails.map(em => (
                  <div
                    key={em.id}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900 line-clamp-1">{em.subject}</strong>
                      <span className="text-[10px] text-slate-400">{em.date ? new Date(em.date).toLocaleDateString('pt-BR') : ''}</span>
                    </div>
                    {em.from && <p className="text-[11px] text-slate-500">De: {em.from}</p>}
                    <p className="text-slate-600 line-clamp-1 italic">{em.snippet}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: New Calendar Event */}
      <Modal
        isOpen={isNewEventModalOpen}
        onClose={() => setIsNewEventModalOpen(false)}
        title="Agendar Consulta no Google Calendar"
      >
        <form onSubmit={handleSaveEvent} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Título do Agendamento
            </label>
            <input
              type="text"
              required
              value={newEventForm.summary}
              onChange={e => setNewEventForm({ ...newEventForm, summary: e.target.value })}
              placeholder="Ex: Consulta com Cardiologista"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Local (Clínica, UBS ou Domicílio)
            </label>
            <input
              type="text"
              value={newEventForm.location}
              onChange={e => setNewEventForm({ ...newEventForm, location: e.target.value })}
              placeholder="Ex: UBS Jardim das Flores / Sala 3"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Data
              </label>
              <input
                type="date"
                required
                value={newEventForm.date}
                onChange={e => setNewEventForm({ ...newEventForm, date: e.target.value })}
                className="w-full px-2 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Hora Início
              </label>
              <input
                type="time"
                required
                value={newEventForm.startTime}
                onChange={e => setNewEventForm({ ...newEventForm, startTime: e.target.value })}
                className="w-full px-2 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Hora Término
              </label>
              <input
                type="time"
                required
                value={newEventForm.endTime}
                onChange={e => setNewEventForm({ ...newEventForm, endTime: e.target.value })}
                className="w-full px-2 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Instruções e Observações
            </label>
            <textarea
              rows={3}
              value={newEventForm.description}
              onChange={e => setNewEventForm({ ...newEventForm, description: e.target.value })}
              placeholder="Ex: Jejum de 8 horas para exame de sangue..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsNewEventModalOpen(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs"
            >
              Confirmar Agendamento no Google
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Mandatory Confirmation to Delete Calendar Event */}
      <Modal
        isOpen={!!eventToDelete}
        onClose={() => setEventToDelete(null)}
        title="Excluir Agendamento do Google Calendar?"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-950 flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Atenção: Ação de exclusão</p>
              <p className="mt-1 leading-relaxed">
                Você tem certeza de que deseja remover permanentemente o agendamento{' '}
                <strong>"{eventToDelete?.summary}"</strong> da sua Google Agenda? Esta ação não pode ser desfeita.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEventToDelete(null)}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmDeleteEvent}
              className="px-4 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs"
            >
              Sim, Excluir do Google Calendar
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Compose Gmail */}
      <Modal
        isOpen={isSendEmailModalOpen}
        onClose={() => setIsSendEmailModalOpen(false)}
        title="Enviar Relatório de Cuidados por Gmail"
      >
        <form
          onSubmit={e => {
            e.preventDefault();
            setIsEmailConfirmOpen(true);
          }}
          className="space-y-3.5 text-xs"
        >
          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
              E-mail do Destinatário (Médico, Clínica ou Familiar)
            </label>
            <input
              type="email"
              required
              value={emailForm.to}
              onChange={e => setEmailForm({ ...emailForm, to: e.target.value })}
              placeholder="exemplo@medico.com.br"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Assunto
            </label>
            <input
              type="text"
              required
              value={emailForm.subject}
              onChange={e => setEmailForm({ ...emailForm, subject: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Corpo do Relatório de Saúde
            </label>
            <textarea
              rows={8}
              required
              value={emailForm.bodyText}
              onChange={e => setEmailForm({ ...emailForm, bodyText: e.target.value })}
              className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsSendEmailModalOpen(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Avançar para Envio</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Mandatory Confirmation before sending email on user's behalf */}
      <Modal
        isOpen={isEmailConfirmOpen}
        onClose={() => setIsEmailConfirmOpen(false)}
        title="Confirmar Envio pelo Gmail"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Confirmação de envio de e-mail</p>
              <p className="mt-1 leading-relaxed">
                Você confirma o envio do e-mail de saúde para <strong>{emailForm.to}</strong> através da sua conta Google conectada?
              </p>
              <p className="mt-1 text-slate-600">
                Assunto: <em>{emailForm.subject}</em>
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEmailConfirmOpen(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Voltar e Editar
            </button>
            <button
              type="button"
              onClick={executeSendEmail}
              className="px-4 py-2 text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Confirmar e Enviar Agora</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
