import React, { useState, useMemo } from 'react';
import { Search, Volume2, VolumeX, ChevronDown, ChevronUp, AlertCircle, CheckCircle, XCircle, PhoneCall, BookOpen, ShieldCheck, ExternalLink } from 'lucide-react';
import { FIRST_AID_ITEMS } from '../data/firstAidData';
import { FirstAidItem } from '../types';
import { speakText, stopSpeaking } from '../utils/speech';
import { Modal } from './Modal';

interface FirstAidSectionProps {
  isSpeaking: boolean;
  setIsSpeaking: (speaking: boolean) => void;
  onShowToast: (msg: string) => void;
}

export const FirstAidSection: React.FC<FirstAidSectionProps> = ({
  isSpeaking,
  setIsSpeaking,
  onShowToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [expandedId, setExpandedId] = useState<string>('engasgo');
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(null);
  const [isSourcesModalOpen, setIsSourcesModalOpen] = useState<boolean>(false);

  const filteredItems = useMemo(() => {
    return FIRST_AID_ITEMS.filter(item => {
      const matchesSearch =
        item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.resumo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.fazer.some(f => f.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.naoFazer.some(nf => nf.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.fonte.instituicao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.fonte.documento.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === 'todos' || item.categoria === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const toggleAccordion = (id: string) => {
    setExpandedId(prev => (prev === id ? '' : id));
  };

  const handleReadAloud = (item: FirstAidItem) => {
    if (activeSpeechId === item.id && isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      setActiveSpeechId(null);
      return;
    }

    const narration = `Primeiros socorros para ${item.titulo}. Baseado no protocolo de ${item.fonte.instituicao}. O que fazer: ${item.passos.map(p => `Passo ${p.numero}: ${p.titulo}. ${p.descricao}`).join('. ')}. O que nunca fazer: ${item.naoFazer.join('. ')}. ${item.quandoLigar192}`;

    setIsSpeaking(true);
    setActiveSpeechId(item.id);
    onShowToast(`🔊 Lendo orientações de ${item.titulo}...`);

    speakText(narration, () => {
      setIsSpeaking(false);
      setActiveSpeechId(null);
    });
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Intro card in Green and White */}
      <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              🩹 Primeiros Socorros — Guia Prático de Bolso
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Orientações baseadas nos protocolos oficiais do <strong>Ministério da Saúde (SAMU 192)</strong>, <strong>Cruz Vermelha Brasileira</strong> e sociedades médicas nacionais.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              onClick={() => setIsSourcesModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
              <span>Fontes Oficiais</span>
            </button>
            <a
              href="tel:192"
              className="flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors shadow-xs"
            >
              <PhoneCall className="w-4 h-4" />
              <span>SAMU 192</span>
            </a>
          </div>
        </div>

        {/* Scientific Basis Badge */}
        <div className="mt-3.5 p-2.5 bg-emerald-50/60 border border-emerald-200/80 rounded-xl flex items-center gap-2 text-xs text-emerald-950">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            <strong>Informações Verificadas:</strong> Cada conduta possui indicação da instituição médica reguladora e manual técnico de referência.
          </span>
        </div>

        {/* Search input */}
        <div className="mt-4 relative">
          <Search className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Pesquisar situação ou fonte (ex: engasgo, queimadura, SAMU, Cruz Vermelha, AVC)..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 focus:outline-none transition-all placeholder:text-slate-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-1 py-0.5"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Filter categories */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'respiratorio', label: 'Respiratório (Engasgo)' },
            { id: 'trauma', label: 'Traumas (Cortes/Quedas)' },
            { id: 'neurologico', label: 'Neurológico (AVC/Convulsão)' },
            { id: 'clinico', label: 'Clínico (Febre/Glicose)' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-medium border ${
                selectedCategory === cat.id
                  ? 'bg-emerald-700 text-white font-bold border-emerald-700'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion / Cards List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center bg-white border border-emerald-100 rounded-2xl">
            <p className="text-sm font-semibold text-slate-600">Nenhum protocolo encontrado para "{searchTerm}"</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedCategory('todos'); }}
              className="mt-2 text-xs font-bold text-emerald-700 hover:underline"
            >
              Ver todos os primeiros socorros
            </button>
          </div>
        ) : (
          filteredItems.map(item => {
            const isExpanded = expandedId === item.id;
            const isItemSpeaking = activeSpeechId === item.id && isSpeaking;

            return (
              <div
                key={item.id}
                className={`bg-white border rounded-2xl transition-all overflow-hidden ${
                  isExpanded ? 'border-emerald-300 shadow-xs' : 'border-slate-200 hover:border-emerald-200'
                }`}
              >
                {/* Accordion Header */}
                <button
                  type="button"
                  onClick={() => toggleAccordion(item.id)}
                  className="w-full text-left p-4 sm:p-5 flex items-start sm:items-center justify-between gap-3 focus:outline-none"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl sm:text-3xl shrink-0 p-2 bg-emerald-50 rounded-xl border border-emerald-100">
                      {item.icone}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900">
                          {item.titulo}
                        </h3>
                        {item.urgencia === 'imediata' && (
                          <span className="text-[11px] font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                            Urgência
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-1 sm:line-clamp-none">
                        {item.resumo}
                      </p>
                      {/* Short source reference tag in header */}
                      <p className="text-[11px] text-emerald-800 font-medium mt-1">
                        📚 Fonte: {item.fonte.instituicao}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReadAloud(item);
                      }}
                      className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                        isItemSpeaking
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : 'bg-white hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 border-slate-200'
                      }`}
                      title={isItemSpeaking ? 'Parar leitura de voz' : 'Ouvir instruções em voz alta'}
                    >
                      {isItemSpeaking ? <VolumeX className="w-4 h-4 text-emerald-700" /> : <Volume2 className="w-4 h-4 text-emerald-700" />}
                      <span className="hidden sm:inline">{isItemSpeaking ? 'Parar' : 'Ouvir'}</span>
                    </button>

                    <div className="p-2 text-slate-400 hover:text-emerald-700">
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-emerald-700" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </button>

                {/* Accordion Expanded Body */}
                {isExpanded && (
                  <div className="px-4 pb-5 sm:px-6 pt-1 border-t border-emerald-50 space-y-5 animate-fade-in">
                    {/* Numbered Steps */}
                    <div>
                      <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block mb-2">
                        Passo a Passo de Ação Imediata
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {item.passos.map(step => (
                          <div
                            key={step.numero}
                            className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl flex items-start gap-3"
                          >
                            <span className="w-7 h-7 rounded-full bg-emerald-700 text-white font-black text-xs flex items-center justify-center shrink-0">
                              {step.numero}
                            </span>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900">
                                {step.titulo}
                              </h4>
                              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                {step.descricao}
                              </p>
                              {step.detalhe && (
                                <p className="text-[11px] font-medium text-emerald-900 bg-emerald-50 p-1.5 rounded-md mt-2 border border-emerald-100">
                                  💡 {step.detalhe}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* DOs and DON'Ts side by side in Clean Green & Neutral White */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* FAÇA */}
                      <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl">
                        <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs uppercase tracking-wider mb-2">
                          <CheckCircle className="w-4 h-4 text-emerald-700" />
                          <span>FAÇA (Recomendado)</span>
                        </div>
                        <ul className="space-y-2 text-xs text-emerald-950">
                          {item.fazer.map((f, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-emerald-700 font-bold">✓</span>
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* NÃO FAÇA */}
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs uppercase tracking-wider mb-2">
                          <XCircle className="w-4 h-4 text-slate-600" />
                          <span>NÃO FAÇA (Evite agravar)</span>
                        </div>
                        <ul className="space-y-2 text-xs text-slate-700">
                          {item.naoFazer.map((nf, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-slate-500 font-bold">✕</span>
                              <span>{nf}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* When to call SAMU */}
                    <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                          Quando ligar imediatamente para o 192:
                        </h4>
                        <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                          {item.quandoLigar192}
                        </p>
                      </div>
                      <a
                        href="tel:192"
                        className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs"
                      >
                        Ligar 192
                      </a>
                    </div>

                    {/* Official Medical Source Card */}
                    <div className="p-3 bg-white border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs shadow-2xs">
                      <div className="p-1.5 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-100 shrink-0 mt-0.5">
                        <BookOpen className="w-4 h-4 text-emerald-700" />
                      </div>
                      <div>
                        <span className="font-bold text-emerald-950 uppercase tracking-wider block text-[10px]">
                          Fonte e Protocolo Oficial de Referência:
                        </span>
                        <p className="text-slate-900 font-bold mt-0.5">
                          {item.fonte.instituicao}
                        </p>
                        <p className="text-slate-600 mt-0.5 leading-relaxed">
                          {item.fonte.documento}
                        </p>
                        {item.fonte.detalhe && (
                          <p className="text-[11px] text-slate-500 italic mt-0.5">
                            {item.fonte.detalhe}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Full Directory of Medical Sources */}
      <Modal
        isOpen={isSourcesModalOpen}
        onClose={() => setIsSourcesModalOpen(false)}
        title="Bases Científicas e Fontes Oficiais"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            Todas as orientações do <strong>Cuidar Juntos</strong> seguem rigorosamente os protocolos clínicos e manuais técnicos aprovados pelos principais órgãos de saúde pública e sociedades médicas do Brasil e do mundo:
          </p>

          <div className="space-y-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <h4 className="font-bold text-slate-900 text-sm">Ministério da Saúde do Brasil / SAMU 192</h4>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                Protocolos de Intervenção para o SAMU 192 e Suporte Básico de Vida (SBV) para asfixia por engasgo (OVACE), atendimento inicial a traumas, febre e triagem de gravidade.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <h4 className="font-bold text-slate-900 text-sm">Cruz Vermelha Brasileira & IFRC</h4>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                Diretrizes Internacionais de Primeiros Socorros, Ressuscitação e Educação (Federação Internacional das Sociedades da Cruz Vermelha e do Crescente Vermelho).
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <h4 className="font-bold text-slate-900 text-sm">Sociedade Brasileira de Cardiologia (SBC)</h4>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                Diretriz de Ressuscitação Cardiopulmonar e Cuidados Cardiovasculares de Emergência; Diretriz de Avaliação e Tratamento de Pacientes com Síncope.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <h4 className="font-bold text-slate-900 text-sm">Rede Brasil AVC & World Stroke Organization (WSO)</h4>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                Protocolo de Reconhecimento Rápido do AVC no Atendimento Pré-Hospitalar (Escala SAMU / Cincinnati - Sorriso, Abraço, Música, Urgência).
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <h4 className="font-bold text-slate-900 text-sm">Sociedade Brasileira de Queimaduras (SBQ)</h4>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                Cartilha de Tratamento de Emergência das Queimaduras Térmicas, resfriamento com água corrente e contraindicação absoluta de produtos caseiros.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <h4 className="font-bold text-slate-900 text-sm">Sociedade Brasileira de Diabetes (SBD)</h4>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                Diretrizes Oficiais da SBD para Manejo de Emergência da Hipoglicemia (Regra dos 15g de carboidratos simples de rápida absorção).
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <h4 className="font-bold text-slate-900 text-sm">Liga Brasileira de Epilepsia (LBE) & ABE</h4>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                Recomendações Nacionais de Segurança para Crises Epilépticas e Convulsões: proteção craniana, lateralização das vias aéreas e mito de prender a língua.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <h4 className="font-bold text-slate-900 text-sm">Sociedade Brasileira de Geriatria e Gerontologia (SBGG)</h4>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                Caderno de Atenção Básica nº 19 (Envelhecimento e Saúde da Pessoa Idosa) — condutas em quedas acidentais e suspeitas de fratura de colo de fêmur.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setIsSourcesModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs"
            >
              Entendido
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
