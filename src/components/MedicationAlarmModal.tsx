import React from 'react';
import { Bell, CheckCircle2, Clock, Volume2, Pill, AlertCircle, X } from 'lucide-react';
import { MedicationItem } from '../types';
import { playMedicationChime } from '../utils/soundAlert';

interface MedicationAlarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeAlert: {
    medication: MedicationItem;
    time: string;
  } | null;
  onMarkTaken: (medId: string, time: string) => void;
  onSnooze: (medId: string, time: string, minutes: number) => void;
}

export const MedicationAlarmModal: React.FC<MedicationAlarmModalProps> = ({
  isOpen,
  onClose,
  activeAlert,
  onMarkTaken,
  onSnooze
}) => {
  React.useEffect(() => {
    if (!isOpen || !activeAlert) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeAlert, onClose]);

  if (!isOpen || !activeAlert) return null;

  const { medication, time } = activeAlert;

  const handleTaken = () => {
    onMarkTaken(medication.id, time);
    onClose();
  };

  const handleSnooze = () => {
    onSnooze(medication.id, time, 10);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="alarm-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border-2 border-emerald-500 overflow-hidden transform animate-in zoom-in-95 duration-200">
        {/* Header alert banner */}
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-800 text-white p-5 text-center relative">
          <div className="mx-auto w-14 h-14 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center mb-2 animate-bounce">
            <Bell className="w-7 h-7 text-white" />
          </div>
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-xs rounded-full text-xs font-semibold tracking-wider uppercase mb-1">
            ⏰ Lembrete de Medicamento
          </span>
          <h2 id="alarm-modal-title" className="text-2xl font-black tracking-tight">
            Horário do Remédio: {time}
          </h2>
          <p className="text-xs text-emerald-100 mt-1">
            Hora programada para administração do medicamento
          </p>

          <button
            onClick={() => playMedicationChime()}
            title="Tocar som novamente"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Content Card */}
        <div className="p-5 space-y-4">
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-700 text-white shrink-0">
                <Pill className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900">
                  {medication.nome}
                </h3>
                <p className="text-sm font-semibold text-emerald-800 mt-0.5">
                  Dose: {medication.dosagem}
                </p>
                {medication.finalidade && (
                  <p className="text-xs text-slate-600 mt-1">
                    🎯 <strong>Indicação:</strong> {medication.finalidade}
                  </p>
                )}
                {medication.observacoes && (
                  <div className="mt-2.5 p-2 bg-white rounded-lg border border-emerald-100 text-xs text-slate-700 flex items-start gap-1.5">
                    <AlertCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>{medication.observacoes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 pt-2">
            <button
              onClick={handleTaken}
              className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all text-sm"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Marcar como Tomado Agora</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleSnooze}
                className="py-2.5 px-3 bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors text-xs"
              >
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>Adiar 10 minutos</span>
              </button>

              <button
                onClick={onClose}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl flex items-center justify-center gap-1 transition-colors text-xs"
              >
                <X className="w-4 h-4" />
                <span>Fechar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
