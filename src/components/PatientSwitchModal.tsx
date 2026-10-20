import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Check,
  User,
  AlertCircle,
  Phone,
  Trash2,
  HeartPulse,
  X
} from 'lucide-react';
import { PatientData, PatientProfile } from '../types';

interface PatientSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: PatientProfile[];
  activePatientId: string;
  onSelectPatient: (patientId: string) => void;
  onAddPatient: (newPatient: PatientData) => void;
  onDeletePatient?: (patientId: string) => void;
  onShowToast: (msg: string) => void;
}

export const PatientSwitchModal: React.FC<PatientSwitchModalProps> = ({
  isOpen,
  onClose,
  patients,
  activePatientId,
  onSelectPatient,
  onAddPatient,
  onDeletePatient,
  onShowToast
}) => {
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newPatientForm, setNewPatientForm] = useState<PatientData>({
    nome: '',
    nascimento: '',
    cartaoSus: '',
    tipoSanguineo: '',
    contatoEmergenciaNome: '',
    contatoEmergenciaTelefone: '',
    contatoSecundarioNome: '',
    contatoSecundarioTelefone: '',
    alergias: '',
    diagnosticos: '',
    observacoesMedicas: ''
  });

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

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientForm.nome.trim()) {
      onShowToast('⚠️ Por favor, informe ao menos o nome do paciente.');
      return;
    }

    onAddPatient(newPatientForm);
    setIsCreatingNew(false);
    setNewPatientForm({
      nome: '',
      nascimento: '',
      cartaoSus: '',
      tipoSanguineo: '',
      contatoEmergenciaNome: '',
      contatoEmergenciaTelefone: '',
      contatoSecundarioNome: '',
      contatoSecundarioTelefone: '',
      alergias: '',
      diagnosticos: '',
      observacoesMedicas: ''
    });
    onShowToast(`✅ Novo paciente "${newPatientForm.nome}" cadastrado com sucesso!`);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="patient-switch-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-emerald-100 overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-emerald-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 id="patient-switch-title" className="text-base font-bold">
                Gerenciar Pacientes & Familiares
              </h2>
              <p className="text-xs text-emerald-100">
                Alterne entre pessoas cuidadas ou cadastre um novo membro
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[80vh] overflow-y-auto space-y-4">
          {!isCreatingNew ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Pacientes Cadastrados ({patients.length})
                </span>
                <button
                  onClick={() => setIsCreatingNew(true)}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Cadastrar Novo</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {patients.map(p => {
                  const isActive = p.id === activePatientId;
                  return (
                    <div
                      key={p.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isActive
                          ? 'bg-emerald-50/80 border-emerald-500 shadow-xs ring-1 ring-emerald-500'
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div
                          onClick={() => {
                            onSelectPatient(p.id);
                            onClose();
                          }}
                          className="flex-1 cursor-pointer flex items-center gap-3"
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                              isActive
                                ? 'bg-emerald-700 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {p.nome.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-slate-900 text-sm">{p.nome}</h3>
                              {isActive && (
                                <span className="px-2 py-0.5 bg-emerald-700 text-white text-[10px] font-bold rounded-full">
                                  Ativo no App
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {p.nascimento || 'Idade não informada'} · SUS: {p.cartaoSus || 'N/A'}
                            </p>
                            {p.alergias && (
                              <p className="text-[11px] text-rose-700 font-semibold mt-0.5 truncate max-w-xs">
                                ⚠️ {p.alergias}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {!isActive && (
                            <button
                              onClick={() => {
                                onSelectPatient(p.id);
                                onClose();
                              }}
                              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
                            >
                              Selecionar
                            </button>
                          )}
                          {patients.length > 1 && !isActive && onDeletePatient && (
                            <button
                              onClick={() => onDeletePatient(p.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                              title="Remover paciente"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Create new patient form */
            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-emerald-700" />
                  <span>Novo Paciente / Familiar</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Voltar para lista
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Seu Antenor Silveira"
                  value={newPatientForm.nome}
                  onChange={e => setNewPatientForm({ ...newPatientForm, nome: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nascimento / Idade
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 10/05/1950 (74 anos)"
                    value={newPatientForm.nascimento}
                    onChange={e => setNewPatientForm({ ...newPatientForm, nascimento: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tipo Sanguíneo
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: O+, A-, B+"
                    value={newPatientForm.tipoSanguineo}
                    onChange={e => setNewPatientForm({ ...newPatientForm, tipoSanguineo: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cartão do SUS
                </label>
                <input
                  type="text"
                  placeholder="Ex: 723 0000 0000 0000"
                  value={newPatientForm.cartaoSus}
                  onChange={e => setNewPatientForm({ ...newPatientForm, cartaoSus: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 text-rose-700">
                  ⚠️ Alergias Graves (Destaque)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Alergia a Penicilina, Dipirona, Frutos do mar"
                  value={newPatientForm.alergias}
                  onChange={e => setNewPatientForm({ ...newPatientForm, alergias: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-rose-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden bg-rose-50/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Diagnósticos & Doenças Crônicas
                </label>
                <input
                  type="text"
                  placeholder="Ex: Hipertensão, Diabetes, Parkinson"
                  value={newPatientForm.diagnosticos}
                  onChange={e => setNewPatientForm({ ...newPatientForm, diagnosticos: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contato de Emergência
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Maria (Filha)"
                    value={newPatientForm.contatoEmergenciaNome}
                    onChange={e => setNewPatientForm({ ...newPatientForm, contatoEmergenciaNome: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Telefone de Emergência
                  </label>
                  <input
                    type="tel"
                    placeholder="Ex: (11) 98888-7777"
                    value={newPatientForm.contatoEmergenciaTelefone}
                    onChange={e => setNewPatientForm({ ...newPatientForm, contatoEmergenciaTelefone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
                >
                  Salvar Paciente
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
