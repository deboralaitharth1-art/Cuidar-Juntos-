import React, { useState } from 'react';
import { Phone, MapPin, AlertCircle, CheckSquare, Square, Copy, Check, Edit2, ShieldAlert } from 'lucide-react';
import { UbsData } from '../types';
import { Modal } from './Modal';

interface EmergencySectionProps {
  ubs: UbsData;
  onUpdateUbs: (data: UbsData) => void;
  patientAddress?: string;
  onShowToast: (msg: string) => void;
}

export const EmergencySection: React.FC<EmergencySectionProps> = ({
  ubs,
  onUpdateUbs,
  patientAddress = '',
  onShowToast
}) => {
  const [isEditingUbs, setIsEditingUbs] = useState(false);
  const [ubsForm, setUbsForm] = useState<UbsData>(ubs);

  const [homeAddress, setHomeAddress] = useState(() => {
    return localStorage.getItem('cuidabem_home_address') || 'Rua das Palmeiras, 340 — Apto 42 (Perto da Padaria Central)';
  });
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [tempAddress, setTempAddress] = useState(homeAddress);

  // Call checklist states
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [hasCopied, setHasCopied] = useState(false);

  const toggleCheck = (idx: number) => {
    setCheckedSteps(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleSaveUbs = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUbs(ubsForm);
    setIsEditingUbs(false);
    onShowToast('✅ Posto de Saúde (UBS) atualizado com sucesso!');
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setHomeAddress(tempAddress);
    localStorage.setItem('cuidabem_home_address', tempAddress);
    setIsEditingAddress(false);
    onShowToast('✅ Endereço de emergência salvo!');
  };

  const copyEmergencyInfo = () => {
    const text = `🚨 PEDIDO DE SOCORRO URGENTE:\n📍 Local: ${homeAddress}\n📞 UBS de Referência: ${ubs.nome} (${ubs.telefone})\n⚠️ Favor ligar para o SAMU 192 ou Bombeiros 193!`;
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    onShowToast('📋 Informações de socorro copiadas para a área de transferência!');
    setTimeout(() => setHasCopied(false), 3000);
  };

  const callList = [
    {
      title: 'Onde está exatamente',
      desc: homeAddress ? homeAddress : 'Rua, número, complemento, bairro e ponto de referência.'
    },
    {
      title: 'O que acabou de acontecer',
      desc: 'Ex: "Caiu da cama e bateu a cabeça", "Está engasgado com alimento", "Desmaiou e não acorda".'
    },
    {
      title: 'Como está a vítima agora',
      desc: 'Está respirando? Responde quando chamada? Está sangrando ou tendo convulsão?'
    },
    {
      title: 'Idade aproximada e doenças',
      desc: 'Informe a idade, se é diabético, hipertenso, se toma remédios ou tem alergias.'
    },
    {
      title: 'Seu nome e número de telefone',
      desc: 'Mantenha a linha desocupada para a equipe médica poder retornar a ligação se necessário.'
    }
  ];

  return (
    <div className="space-y-5 pb-6">
      {/* Home Address Banner - Green and White Clean Style */}
      <div className="bg-white border border-emerald-200 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl shrink-0 mt-0.5 border border-emerald-100">
              <MapPin className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                Seu endereço para falar ao atendente do socorro
              </span>
              <p className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                {homeAddress || 'Clique em "Editar" para cadastrar seu endereço residencial'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Mantenha visível para ler com calma se precisar chamar o SAMU ou Bombeiros.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setTempAddress(homeAddress);
              setIsEditingAddress(true);
            }}
            className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors shrink-0 flex items-center gap-1"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Editar</span>
          </button>
        </div>
      </div>

      {/* Emergency Dialers Grid - Unified Green and White */}
      <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-xs space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg font-bold text-slate-900">Números que Salvam Vidas</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Toque nos botões para discar diretamente do celular ou compartilhe com os familiares
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* SAMU */}
          <div className="p-4 rounded-xl bg-white border border-emerald-200 hover:border-emerald-300 flex flex-col justify-between shadow-2xs transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                  Urgência Médica
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">SAMU</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Desmaios, dor no peito, falta de ar, engasgos, convulsão e suspeita de AVC.
                </p>
              </div>
              <span className="text-3xl font-black text-emerald-700 tracking-tight ml-2">192</span>
            </div>
            <a
              href="tel:192"
              className="mt-4 w-full h-11 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-xs transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>Ligar 192</span>
            </a>
          </div>

          {/* Bombeiros */}
          <div className="p-4 rounded-xl bg-white border border-emerald-200 hover:border-emerald-300 flex flex-col justify-between shadow-2xs transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                  Resgate & Traumas
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">Bombeiros</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Quedas graves, acidentes de trânsito, desabamento ou incêndios.
                </p>
              </div>
              <span className="text-3xl font-black text-emerald-700 tracking-tight ml-2">193</span>
            </div>
            <a
              href="tel:193"
              className="mt-4 w-full h-11 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-xs transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>Ligar 193</span>
            </a>
          </div>

          {/* Polícia Militar */}
          <div className="p-4 rounded-xl bg-white border border-emerald-200 hover:border-emerald-300 flex flex-col justify-between shadow-2xs transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                  Segurança Pública
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">Polícia Militar</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Violência doméstica, ocorrências e apoio imediato na rua.
                </p>
              </div>
              <span className="text-3xl font-black text-emerald-700 tracking-tight ml-2">190</span>
            </div>
            <a
              href="tel:190"
              className="mt-4 w-full h-11 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-xs transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>Ligar 190</span>
            </a>
          </div>

          {/* Intoxicação Anvisa */}
          <div className="p-4 rounded-xl bg-white border border-emerald-200 hover:border-emerald-300 flex flex-col justify-between shadow-2xs transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                  Plantão Toxicológico
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">Disque-Intoxicação</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Ingestão acidental de remédios, venenos, produtos químicos ou picada de animais.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                0800
              </span>
            </div>
            <a
              href="tel:08007226001"
              className="mt-4 w-full h-11 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white font-bold text-xs sm:text-sm rounded-lg flex items-center justify-center gap-2 shadow-xs transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>0800 722 6001</span>
            </a>
          </div>

          {/* Local Health Center (UBS) */}
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 flex flex-col justify-between sm:col-span-2 shadow-2xs">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                  Atenção Primária / Saúde da Família
                </span>
                <h3 className="text-lg font-bold text-emerald-950 mt-0.5">{ubs.nome || 'Posto de Saúde (UBS)'}</h3>
                <p className="text-xs text-slate-600 mt-1">
                  {ubs.endereco ? `Endereço: ${ubs.endereco}` : 'Cadastre o endereço e telefone da sua UBS de referência.'}
                </p>
                <p className="text-xs text-emerald-800 font-medium mt-0.5">
                  Telefone: <strong className="text-emerald-950">{ubs.telefone || 'Não cadastrado'}</strong>
                </p>
              </div>
              <button
                onClick={() => {
                  setUbsForm(ubs);
                  setIsEditingUbs(true);
                }}
                className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-white hover:bg-emerald-50 border border-emerald-200 rounded-md transition-colors flex items-center gap-1 shrink-0"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Configurar</span>
              </button>
            </div>
            <div className="mt-4 flex gap-2">
              {ubs.telefone ? (
                <a
                  href={`tel:${ubs.telefone.replace(/\D/g, '')}`}
                  className="flex-1 h-11 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-xs transition-all"
                >
                  <Phone className="w-4 h-4" />
                  <span>Ligar para a UBS</span>
                </a>
              ) : (
                <button
                  onClick={() => {
                    setUbsForm(ubs);
                    setIsEditingUbs(true);
                  }}
                  className="flex-1 h-11 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>Cadastrar Telefone da UBS</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* How to Call Correctly - Interactive Checklist */}
      <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Como Falar na Ligação de Emergência</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Mantenha a calma, fale pausadamente e marque os itens conforme for informando ao atendente:
            </p>
          </div>
          <button
            onClick={copyEmergencyInfo}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors shrink-0"
          >
            {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copiar Dados de Socorro</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {callList.map((step, idx) => {
            const isChecked = !!checkedSteps[idx];
            return (
              <div
                key={idx}
                onClick={() => toggleCheck(idx)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                  isChecked
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                    : 'bg-white border-slate-200 hover:border-emerald-200 text-slate-900'
                }`}
              >
                <button
                  type="button"
                  className="mt-0.5 text-emerald-700 shrink-0"
                  aria-label={isChecked ? 'Concluído' : 'Pendente'}
                >
                  {isChecked ? (
                    <CheckSquare className="w-5 h-5 text-emerald-700" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-300" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Passo {idx + 1}
                    </span>
                    <h4 className={`text-sm font-bold ${isChecked ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {step.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <strong>Regra Importante:</strong> Nunca desligue a chamada primeiro! Aguarde a atendente médica do SAMU confirmar todas as informações e passar as primeiras orientações antes de encerrar.
          </div>
        </div>
      </div>

      {/* When to Call Right Now (Clear green & white card) */}
      <div className="bg-white border border-emerald-200 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-900">
          <AlertCircle className="w-5 h-5 text-emerald-700" />
          <h2 className="text-base sm:text-lg font-bold">Quando Ligar Imediatamente (Sinais de Gravidade)</h2>
        </div>
        <p className="text-xs text-slate-600">
          Não hesite nem espere "ver se melhora". Disque 192 se observar:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-800">
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2">
            <span className="text-emerald-700 font-bold">⚠️</span>
            <span><strong>Inconsciência:</strong> A pessoa não acorda, não fala e não reage a estímulos.</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2">
            <span className="text-emerald-700 font-bold">⚠️</span>
            <span><strong>Falta de ar aguda:</strong> Lábios arroxeados, respiração ruidosa ou sufocamento.</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2">
            <span className="text-emerald-700 font-bold">⚠️</span>
            <span><strong>Dor no peito tipo aperto:</strong> Que irradia para o braço esquerdo, costas ou queixo.</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2">
            <span className="text-emerald-700 font-bold">⚠️</span>
            <span><strong>Sinais de AVC:</strong> Boca torta, fala arrastada ou perda de força súbita no braço.</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2">
            <span className="text-emerald-700 font-bold">⚠️</span>
            <span><strong>Convulsão ativa:</strong> Corpo tremendo sem controle ou olhar fixo com salivação.</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2">
            <span className="text-emerald-700 font-bold">⚠️</span>
            <span><strong>Hemorragia severa:</strong> Sangramento abundante que não cede com compressão direta.</span>
          </div>
        </div>
      </div>

      {/* Modal: Edit UBS */}
      <Modal
        isOpen={isEditingUbs}
        onClose={() => setIsEditingUbs(false)}
        title="Cadastrar Posto de Saúde (UBS)"
      >
        <form onSubmit={handleSaveUbs} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nome da Unidade Básica de Saúde
            </label>
            <input
              type="text"
              required
              value={ubsForm.nome}
              onChange={e => setUbsForm({ ...ubsForm, nome: e.target.value })}
              placeholder="Ex: UBS Vila Nova / ESF 02"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Telefone de Contato da UBS
            </label>
            <input
              type="text"
              required
              value={ubsForm.telefone}
              onChange={e => setUbsForm({ ...ubsForm, telefone: e.target.value })}
              placeholder="Ex: (11) 3456-7890"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Endereço da UBS
            </label>
            <input
              type="text"
              value={ubsForm.endereco}
              onChange={e => setUbsForm({ ...ubsForm, endereco: e.target.value })}
              placeholder="Rua, número e bairro"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Horário de Atendimento
            </label>
            <input
              type="text"
              value={ubsForm.horario}
              onChange={e => setUbsForm({ ...ubsForm, horario: e.target.value })}
              placeholder="Ex: Seg a Sex das 07h às 17h"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditingUbs(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs"
            >
              Salvar UBS
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Address */}
      <Modal
        isOpen={isEditingAddress}
        onClose={() => setIsEditingAddress(false)}
        title="Editar Endereço Residencial"
      >
        <form onSubmit={handleSaveAddress} className="space-y-4">
          <p className="text-xs text-slate-500">
            Cadastre o endereço onde o paciente ou familiar reside. Ele ficará em destaque no topo da tela de emergência.
          </p>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Endereço Completo com Ponto de Referência
            </label>
            <textarea
              required
              rows={3}
              value={tempAddress}
              onChange={e => setTempAddress(e.target.value)}
              placeholder="Ex: Rua das Flores, 120, Apto 31 — Bairro Primavera (Próximo à Igreja Matriz)"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditingAddress(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs"
            >
              Salvar Endereço
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
