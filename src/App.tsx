import React, { useState, useEffect } from 'react';
import { Phone, ShieldAlert, HeartPulse, Home, CalendarDays, AlertTriangle, X } from 'lucide-react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { EmergencySection } from './components/EmergencySection';
import { FirstAidSection } from './components/FirstAidSection';
import { HomeCareSection } from './components/HomeCareSection';
import { HealthAgendaSection } from './components/HealthAgendaSection';
import { Toast } from './components/Toast';
import { Modal } from './components/Modal';
import { AppLogo } from './components/AppLogo';
import {
  PatientData,
  UbsData,
  MedicationItem,
  HealthLogItem
} from './types';
import {
  getStoredPatient,
  savePatient,
  getStoredUbs,
  saveUbs,
  getStoredMedications,
  saveMedications,
  getStoredHealthLogs,
  saveHealthLogs,
  getStoredTextSize,
  saveTextSize,
  TextSizeOption
} from './utils/storage';
import { stopSpeaking } from './utils/speech';

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('emergencia');
  const [textSize, setTextSize] = useState<TextSizeOption>(getStoredTextSize);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persistent States
  const [patient, setPatient] = useState<PatientData>(getStoredPatient);
  const [ubs, setUbs] = useState<UbsData>(getStoredUbs);
  const [medications, setMedications] = useState<MedicationItem[]>(getStoredMedications);
  const [healthLogs, setHealthLogs] = useState<HealthLogItem[]>(getStoredHealthLogs);

  // Quick SOS Modal
  const [isSosModalOpen, setIsSosModalOpen] = useState<boolean>(false);

  // Handle Text Size changes
  const handleTextSizeChange = (newSize: TextSizeOption) => {
    setTextSize(newSize);
    saveTextSize(newSize);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3500);
  };

  const handleUpdatePatient = (updated: PatientData) => {
    setPatient(updated);
    savePatient(updated);
  };

  const handleUpdateUbs = (updated: UbsData) => {
    setUbs(updated);
    saveUbs(updated);
  };

  const handleUpdateMedications = (updated: MedicationItem[]) => {
    setMedications(updated);
    saveMedications(updated);
  };

  const handleUpdateHealthLogs = (updated: HealthLogItem[]) => {
    setHealthLogs(updated);
    saveHealthLogs(updated);
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

        {/* Section 4: Agenda & Saúde */}
        {activeSection === 'agenda' && (
          <HealthAgendaSection
            patient={patient}
            onUpdatePatient={handleUpdatePatient}
            medications={medications}
            onUpdateMedications={handleUpdateMedications}
            healthLogs={healthLogs}
            onUpdateHealthLogs={handleUpdateHealthLogs}
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
    </div>
  );
}
