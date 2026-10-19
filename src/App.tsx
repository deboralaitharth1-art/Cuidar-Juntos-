import React, { useState, useEffect } from 'react';
import { Phone, ShieldAlert, HeartPulse, Home, CalendarDays, AlertTriangle, X } from 'lucide-react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { EmergencySection } from './components/EmergencySection';
import { FirstAidSection } from './components/FirstAidSection';
import { HomeCareSection } from './components/HomeCareSection';
import { HealthAgendaSection } from './components/HealthAgendaSection';
import { GoogleWorkspaceSection } from './components/GoogleWorkspaceSection';
import { AuthModal } from './components/AuthModal';
import { Toast } from './components/Toast';
import { Modal } from './components/Modal';
import { AppLogo } from './components/AppLogo';
import {
  AppUserProfile,
  getLocalUserProfile,
  subscribeToAuthChanges,
  initAuth
} from './services/firebaseAuth';
import {
  saveUserDataToFirestore,
  loadUserDataFromFirestore
} from './services/firestoreSync';
import {
  PatientData,
  PatientProfile,
  UbsData,
  MedicationItem,
  HealthLogItem,
  MedicalAppointment
} from './types';
import {
  getStoredPatient,
  savePatient,
  getStoredPatientList,
  savePatientList,
  getActivePatientId,
  saveActivePatientId,
  getStoredUbs,
  saveUbs,
  getStoredMedications,
  saveMedications,
  getStoredHealthLogs,
  saveHealthLogs,
  getStoredAppointments,
  saveAppointments,
  getStoredTextSize,
  saveTextSize,
  TextSizeOption
} from './utils/storage';
import { stopSpeaking } from './utils/speech';
import { MedicalSummaryPrintModal } from './components/MedicalSummaryPrintModal';
import { MedicationAlarmModal } from './components/MedicationAlarmModal';
import { PatientSwitchModal } from './components/PatientSwitchModal';
import { useMedicationAlarm } from './hooks/useMedicationAlarm';

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('emergencia');
  const [textSize, setTextSize] = useState<TextSizeOption>(getStoredTextSize);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Authentication & Profile States
  const [currentUser, setCurrentUser] = useState<AppUserProfile | null>(getLocalUserProfile);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Persistent States
  const [patientList, setPatientList] = useState<PatientProfile[]>(getStoredPatientList);
  const [activePatientId, setActivePatientId] = useState<string>(getActivePatientId);
  const [patient, setPatient] = useState<PatientData>(() => {
    const list = getStoredPatientList();
    const activeId = getActivePatientId();
    const found = list.find(p => p.id === activeId);
    return found || getStoredPatient();
  });
  const [ubs, setUbs] = useState<UbsData>(getStoredUbs);
  const [medications, setMedications] = useState<MedicationItem[]>(getStoredMedications);
  const [healthLogs, setHealthLogs] = useState<HealthLogItem[]>(getStoredHealthLogs);
  const [appointments, setAppointments] = useState<MedicalAppointment[]>(getStoredAppointments);

  // Modals state
  const [isSosModalOpen, setIsSosModalOpen] = useState<boolean>(false);
  const [isMedicalSummaryOpen, setIsMedicalSummaryOpen] = useState<boolean>(false);
  const [isPatientSwitchOpen, setIsPatientSwitchOpen] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3500);
  };

  // Medication schedule background alarm & chime
  const handleAlarmMarkTaken = (medId: string, time: string) => {
    const updated = medications.map(m => {
      if (m.id !== medId) return m;
      return {
        ...m,
        tomadoHoje: {
          ...(m.tomadoHoje || {}),
          [time]: true
        }
      };
    });
    setMedications(updated);
    saveMedications(updated);
    if (currentUser?.uid) {
      saveUserDataToFirestore(currentUser.uid, { medications: updated });
    }
    showToast('✅ Dose de medicamento registrada com sucesso!');
  };

  const {
    activeAlarm,
    closeAlarm,
    snoozeAlarm,
    isSoundMuted,
    toggleSoundMuted,
    testAlarm
  } = useMedicationAlarm(medications, handleAlarmMarkTaken, showToast);

  useEffect(() => {
    const unsubscribeFirebase = initAuth();
    const unsubscribeChanges = subscribeToAuthChanges((profile) => {
      setCurrentUser(profile);
    });
    return () => {
      unsubscribeFirebase();
      unsubscribeChanges();
    };
  }, []);

  // Cloud Synchronization when user logs in with Google or changes account
  useEffect(() => {
    if (!currentUser?.uid) return;

    let isCancelled = false;
    const syncUserCloudData = async () => {
      try {
        const cloudData = await loadUserDataFromFirestore(currentUser.uid);
        if (isCancelled) return;

        if (cloudData && (cloudData.patient || cloudData.medications || cloudData.healthLogs || cloudData.appointments || cloudData.patientList)) {
          if (cloudData.patientList && cloudData.patientList.length > 0) {
            setPatientList(cloudData.patientList);
            savePatientList(cloudData.patientList);
          }
          if (cloudData.activePatientId) {
            setActivePatientId(cloudData.activePatientId);
            saveActivePatientId(cloudData.activePatientId);
          }
          if (cloudData.patient) {
            setPatient(cloudData.patient);
            savePatient(cloudData.patient);
          }
          if (cloudData.ubs) {
            setUbs(cloudData.ubs);
            saveUbs(cloudData.ubs);
          }
          if (cloudData.medications && cloudData.medications.length > 0) {
            setMedications(cloudData.medications);
            saveMedications(cloudData.medications);
          }
          if (cloudData.healthLogs && cloudData.healthLogs.length > 0) {
            setHealthLogs(cloudData.healthLogs);
            saveHealthLogs(cloudData.healthLogs);
          }
          if (cloudData.appointments && cloudData.appointments.length > 0) {
            setAppointments(cloudData.appointments);
            saveAppointments(cloudData.appointments);
          }
          showToast('☁️ Suas informações salvas no Google foram restauradas com sucesso!');
        } else {
          // No cloud data yet for this account -> backup current local data to Firestore
          await saveUserDataToFirestore(currentUser.uid, {
            patient,
            patientList,
            activePatientId,
            ubs,
            medications,
            healthLogs,
            appointments
          });
          showToast('☁️ Seus dados foram salvos com segurança na sua conta Google!');
        }
      } catch (err) {
        console.error('Error during cloud sync:', err);
      }
    };

    syncUserCloudData();

    return () => {
      isCancelled = true;
    };
  }, [currentUser?.uid]);

  // Handle Text Size changes
  const handleTextSizeChange = (newSize: TextSizeOption) => {
    setTextSize(newSize);
    saveTextSize(newSize);
  };

  // Multi-patient management handlers
  const handleSelectPatient = (id: string) => {
    const found = patientList.find(p => p.id === id);
    if (!found) return;
    setActivePatientId(id);
    saveActivePatientId(id);
    setPatient(found);
    savePatient(found);
    if (currentUser?.uid) {
      saveUserDataToFirestore(currentUser.uid, {
        patient: found,
        activePatientId: id
      });
    }
    showToast(`👤 Paciente alterado para ${found.nome}`);
  };

  const handleAddPatient = (newP: PatientData) => {
    const newProfile: PatientProfile = {
      ...newP,
      id: `patient-${Date.now()}`
    };
    const updatedList = [...patientList, newProfile];
    setPatientList(updatedList);
    savePatientList(updatedList);
    setActivePatientId(newProfile.id);
    saveActivePatientId(newProfile.id);
    setPatient(newProfile);
    savePatient(newProfile);
    if (currentUser?.uid) {
      saveUserDataToFirestore(currentUser.uid, {
        patient: newProfile,
        patientList: updatedList,
        activePatientId: newProfile.id
      });
    }
  };

  const handleDeletePatient = (id: string) => {
    if (patientList.length <= 1) {
      showToast('⚠️ É necessário manter ao menos 1 paciente cadastrado.');
      return;
    }
    const updatedList = patientList.filter(p => p.id !== id);
    setPatientList(updatedList);
    savePatientList(updatedList);
    if (activePatientId === id) {
      const nextActive = updatedList[0];
      setActivePatientId(nextActive.id);
      saveActivePatientId(nextActive.id);
      setPatient(nextActive);
      savePatient(nextActive);
    }
    if (currentUser?.uid) {
      saveUserDataToFirestore(currentUser.uid, {
        patientList: updatedList
      });
    }
    showToast('🗑️ Paciente removido.');
  };

  const handleUpdatePatient = (updated: PatientData) => {
    setPatient(updated);
    savePatient(updated);
    const updatedList = patientList.map(p => {
      if (p.id === (updated.id || activePatientId)) {
        return { ...updated, id: p.id };
      }
      return p;
    });
    setPatientList(updatedList);
    savePatientList(updatedList);
    if (currentUser?.uid) {
      saveUserDataToFirestore(currentUser.uid, {
        patient: updated,
        patientList: updatedList
      });
    }
  };

  const handleUpdateUbs = (updated: UbsData) => {
    setUbs(updated);
    saveUbs(updated);
    if (currentUser?.uid) {
      saveUserDataToFirestore(currentUser.uid, { ubs: updated });
    }
  };

  const handleUpdateMedications = (updated: MedicationItem[]) => {
    setMedications(updated);
    saveMedications(updated);
    if (currentUser?.uid) {
      saveUserDataToFirestore(currentUser.uid, { medications: updated });
    }
  };

  const handleUpdateHealthLogs = (updated: HealthLogItem[]) => {
    setHealthLogs(updated);
    saveHealthLogs(updated);
    if (currentUser?.uid) {
      saveUserDataToFirestore(currentUser.uid, { healthLogs: updated });
    }
  };

  const handleUpdateAppointments = (updated: MedicalAppointment[]) => {
    setAppointments(updated);
    saveAppointments(updated);
    if (currentUser?.uid) {
      saveUserDataToFirestore(currentUser.uid, { appointments: updated });
    }
  };

  const handleStopSpeaking = () => {
    stopSpeaking();
    setIsSpeaking(false);
  };

  const getTextSizeClass = () => {
    if (textSize === 'grande') return 'text-[1.08rem] leading-relaxed';
    if (textSize === 'extragrande') return 'text-[1.2rem] leading-loose';
    return 'text-base';
  };

  return (
    <div className={`min-h-screen bg-[#f8faf9] flex flex-col ${getTextSizeClass()}`}>
      {/* Toast notifications */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      {/* Header bar */}
      <Header
        textSize={textSize}
        onTextSizeChange={handleTextSizeChange}
        isSpeaking={isSpeaking}
        onStopSpeaking={handleStopSpeaking}
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        onQuickEmergency={() => setIsSosModalOpen(true)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        activePatientName={patient.nome}
        onOpenPatientSwitch={() => setIsPatientSwitchOpen(true)}
        onOpenMedicalSummary={() => setIsMedicalSummaryOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-5 pb-24 md:pb-12">
        {/* Section 1: Emergência */}
        {activeSection === 'emergencia' && (
          <EmergencySection
            ubs={ubs}
            onUpdateUbs={handleUpdateUbs}
            patientAddress={patient.observacoesMedicas}
            onShowToast={showToast}
          />
        )}

        {/* Section 2: Primeiros Socorros */}
        {activeSection === 'socorros' && (
          <FirstAidSection
            isSpeaking={isSpeaking}
            setIsSpeaking={setIsSpeaking}
            onShowToast={showToast}
          />
        )}

        {/* Section 3: Cuidar em Casa */}
        {activeSection === 'casa' && (
          <HomeCareSection onShowToast={showToast} />
        )}

        {/* Section 4: Agenda & Saúde (Consultas, Exames, Remédios e Sinais Vitais) */}
        {activeSection === 'agenda' && (
          <HealthAgendaSection
            patient={patient}
            onUpdatePatient={handleUpdatePatient}
            medications={medications}
            onUpdateMedications={handleUpdateMedications}
            healthLogs={healthLogs}
            onUpdateHealthLogs={handleUpdateHealthLogs}
            appointments={appointments}
            onUpdateAppointments={handleUpdateAppointments}
            onShowToast={showToast}
            onGoToGoogleTab={() => setActiveSection('google')}
            onOpenMedicalSummary={() => setIsMedicalSummaryOpen(true)}
            onOpenPatientSwitch={() => setIsPatientSwitchOpen(true)}
            onTestAlarm={testAlarm}
            isSoundMuted={isSoundMuted}
            onToggleSoundMuted={toggleSoundMuted}
          />
        )}

        {/* Section 5: Google Calendar & Gmail */}
        {activeSection === 'google' && (
          <GoogleWorkspaceSection
            patient={patient}
            medications={medications}
            healthLogs={healthLogs}
            onShowToast={showToast}
          />
        )}

        {/* Trust & Safe offline footer */}
        <footer className="mt-8 pt-6 border-t border-emerald-100 text-center text-xs text-slate-500 space-y-2 no-print">
          <div className="flex items-center justify-center gap-2">
            <AppLogo size={28} className="shadow-2xs" />
            <p className="font-semibold text-emerald-950 text-sm">
              Cuidar Juntos — Guia Familiar de Saúde
            </p>
          </div>
          <p className="text-slate-500 max-w-lg mx-auto">
            🔒 Seus dados e anotações ficam salvos diretamente no seu aparelho. O aplicativo funciona mesmo sem sinal de internet.
          </p>
          <p className="text-[11px] text-slate-400">
            Em casos de perigo à vida, priorize sempre ligar imediatamente para o SAMU 192 ou Bombeiros 193.
          </p>
        </footer>
      </main>

      {/* Fixed bottom navigation for mobile */}
      <Navigation
        activeSection={activeSection}
        onSelectSection={setActiveSection}
      />

      {/* Quick SOS Emergency Modal in Green & White */}
      <Modal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
        title="Central de Emergência Rápida"
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 pb-2 border-b border-emerald-50">
            <AppLogo size={36} />
            <div>
              <p className="text-xs font-bold text-slate-900">Cuidar Juntos · Discagem Direta</p>
              <p className="text-[11px] text-slate-500">Toque no serviço para ligar imediatamente:</p>
            </div>
          </div>

          <a
            href="tel:192"
            className="p-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl flex items-center justify-between font-bold shadow-xs transition-all"
          >
            <div className="flex items-center gap-2.5">
              <Phone className="w-5 h-5 text-white" />
              <div>
                <span className="block text-sm">SAMU — Urgência Médica</span>
                <span className="text-[11px] opacity-85 font-normal">Desmaios, dor no peito, falta de ar, engasgos, AVC</span>
              </div>
            </div>
            <span className="text-2xl font-black">192</span>
          </a>

          <a
            href="tel:193"
            className="p-3.5 bg-white hover:bg-emerald-50 text-slate-900 border border-emerald-200 rounded-xl flex items-center justify-between font-bold shadow-2xs transition-all"
          >
            <div className="flex items-center gap-2.5">
              <Phone className="w-5 h-5 text-emerald-700" />
              <div>
                <span className="block text-sm">Bombeiros — Resgate & Traumas</span>
                <span className="text-[11px] text-slate-600 font-normal">Acidentes graves, quedas graves, incêndio</span>
              </div>
            </div>
            <span className="text-2xl font-black text-emerald-700">193</span>
          </a>

          <a
            href="tel:190"
            className="p-3.5 bg-white hover:bg-emerald-50 text-slate-900 border border-emerald-200 rounded-xl flex items-center justify-between font-bold shadow-2xs transition-all"
          >
            <div className="flex items-center gap-2.5">
              <Phone className="w-5 h-5 text-emerald-700" />
              <div>
                <span className="block text-sm">Polícia Militar</span>
                <span className="text-[11px] text-slate-600 font-normal">Violência, ocorrências ou suporte na rua</span>
              </div>
            </div>
            <span className="text-2xl font-black text-emerald-700">190</span>
          </a>

          {ubs.telefone && (
            <a
              href={`tel:${ubs.telefone.replace(/\D/g, '')}`}
              className="p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-950 rounded-xl flex items-center justify-between font-bold shadow-2xs transition-all text-xs"
            >
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-700" />
                <span>{ubs.nome || 'Posto de Saúde (UBS)'}</span>
              </div>
              <span className="text-sm font-black text-emerald-800">{ubs.telefone}</span>
            </a>
          )}

          <div className="pt-2">
            <button
              onClick={() => {
                setIsSosModalOpen(false);
                setActiveSection('emergencia');
              }}
              className="w-full py-2.5 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
            >
              Ver Guia Completo de Emergência & Roteiro
            </button>
          </div>
        </div>
      </Modal>

      {/* Authentication and Account Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onShowToast={showToast}
        onSelectSection={setActiveSection}
      />

      {/* Medical Summary Print & PDF Modal */}
      <MedicalSummaryPrintModal
        isOpen={isMedicalSummaryOpen}
        onClose={() => setIsMedicalSummaryOpen(false)}
        patient={patient}
        ubs={ubs}
        medications={medications}
        healthLogs={healthLogs}
        appointments={appointments}
        onShowToast={showToast}
      />

      {/* Medication Alarm Alert Modal */}
      <MedicationAlarmModal
        isOpen={!!activeAlarm}
        onClose={closeAlarm}
        activeAlert={activeAlarm}
        onMarkTaken={handleAlarmMarkTaken}
        onSnooze={snoozeAlarm}
      />

      {/* Multi-Patient Profile Switching Modal */}
      <PatientSwitchModal
        isOpen={isPatientSwitchOpen}
        onClose={() => setIsPatientSwitchOpen(false)}
        patients={patientList}
        activePatientId={activePatientId}
        onSelectPatient={handleSelectPatient}
        onAddPatient={handleAddPatient}
        onDeletePatient={handleDeletePatient}
        onShowToast={showToast}
      />
    </div>
  );
}
