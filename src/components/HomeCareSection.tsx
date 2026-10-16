import React, { useState, useEffect } from 'react';
import { Clock, RotateCcw, Bath, Utensils, AlertCircle, Heart, CheckCircle2, Volume2, PhoneCall } from 'lucide-react';
import { DecubitusPosition, DecubitusRecord } from '../types';
import { DecubitusState, getStoredDecubitus, saveDecubitus, getStoredDecubitusHistory, saveDecubitusHistory } from '../utils/storage';
import { playChimeTone } from '../utils/audio';

interface HomeCareSectionProps {
  onShowToast: (msg: string) => void;
}

export const HomeCareSection: React.FC<HomeCareSectionProps> = ({ onShowToast }) => {
  const [decubitus, setDecubitus] = useState<DecubitusState>(getStoredDecubitus);
  const [history, setHistory] = useState<DecubitusRecord[]>(getStoredDecubitusHistory);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [isTimerFinished, setIsTimerFinished] = useState(false);

  // Self-care checklist
  const [caregiverChecks, setCaregiverChecks] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('cuidabem_caregiver_checks');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Calculate remaining time
  useEffect(() => {
    const updateCountdown = () => {
      const lastChange = new Date(decubitus.ultimaMudanca).getTime();
      const targetTime = lastChange + decubitus.intervaloMinutos * 60 * 1000;
      const now = Date.now();
      const diff = Math.max(0, Math.floor((targetTime - now) / 1000));
      
      setSecondsRemaining(diff);
      if (diff === 0 && !isTimerFinished) {
        setIsTimerFinished(true);
        playChimeTone();
      } else if (diff > 0 && isTimerFinished) {
        setIsTimerFinished(false);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [decubitus, isTimerFinished]);

  const handlePositionChange = (novaPosicao: DecubitusPosition) => {
    const now = new Date();
    const newState: DecubitusState = {
      posicao: novaPosicao,
      ultimaMudanca: now.toISOString(),
      intervaloMinutos: 120 // 2 hours
    };

    const newRecord: DecubitusRecord = {
      id: 'rec-' + Date.now(),
      posicao: novaPosicao,
      horario: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + ' (' + now.toLocaleDateString('pt-BR') + ')'
    };

    setDecubitus(newState);
    saveDecubitus(newState);

    const updatedHistory = [newRecord, ...history].slice(0, 20);
    setHistory(updatedHistory);
    saveDecubitusHistory(updatedHistory);

    setIsTimerFinished(false);
    playChimeTone();
    onShowToast(`✅ Posição atualizada para "${getPositionLabel(novaPosicao)}"`);
  };

  const getPositionLabel = (pos: DecubitusPosition): string => {
    switch (pos) {
      case 'costas': return 'De Costas (Dorsal)';
      case 'direito': return 'Lado Direito (Lateral)';
      case 'esquerdo': return 'Lado Esquerdo (Lateral)';
      case 'sentado': return 'Semi-Sentado / Poltrona';
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleCaregiverCheck = (key: string) => {
    const next = { ...caregiverChecks, [key]: !caregiverChecks[key] };
    setCaregiverChecks(next);
    localStorage.setItem('cuidabem_caregiver_checks', JSON.stringify(next));
  };

  return (
    <div className="space-y-5 pb-6">
      {/* 2-Hour Decubitus Rotation Card in Green & White */}
      <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100">
              <Clock className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Mudança de Decúbito (A cada 2 horas)
              </h2>
              <p className="text-xs text-slate-500">
                Fundamental para evitar lesões por pressão (úlceras / escaras) na pele de quem fica acamado.
              </p>
            </div>
          </div>

          <button
            onClick={() => playChimeTone()}
            className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-1.5 self-start sm:self-auto transition-colors"
            title="Testar som do alarme"
          >
            <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Testar Som</span>
          </button>
        </div>

        {/* Timer Banner in Green & White */}
        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-all ${
          isTimerFinished
            ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300 text-emerald-950 animate-pulse'
            : 'bg-emerald-50/50 border-emerald-200 text-slate-900'
        }`}>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider block text-emerald-900">
              {isTimerFinished ? '⚠️ Hora de virar o paciente!' : 'Tempo restante para a próxima virada'}
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums text-slate-900">
                {formatTimer(secondsRemaining)}
              </span>
              <span className="text-xs font-medium text-slate-600">
                (Posição atual: <strong>{getPositionLabel(decubitus.posicao)}</strong>)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                const order: DecubitusPosition[] = ['costas', 'direito', 'costas', 'esquerdo', 'sentado'];
                const curIdx = order.indexOf(decubitus.posicao);
                const nextPos = order[(curIdx + 1) % order.length];
                handlePositionChange(nextPos);
              }}
              className="w-full sm:w-auto px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Registrar Virada Agora</span>
            </button>
          </div>
        </div>

        {/* Quick Position Selectors */}
        <div>
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
            Escolher nova posição:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'costas', title: 'De Costas', desc: 'Dorsal (Travesseiro sob calcanhares)' },
              { id: 'direito', title: 'Lado Direito', desc: 'Lateral (Travesseiro entre pernas)' },
              { id: 'esquerdo', title: 'Lado Esquerdo', desc: 'Lateral (Apoio atrás das costas)' },
              { id: 'sentado', title: 'Semi-Sentado', desc: 'Fowler 30°-45° ou na Poltrona' }
            ].map(p => {
              const isCurrent = decubitus.posicao === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handlePositionChange(p.id as DecubitusPosition)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isCurrent
                      ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                      : 'bg-white hover:bg-emerald-50/50 border-slate-200 text-slate-800 hover:border-emerald-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold block">{p.title}</span>
                    {isCurrent && <span className="text-[10px] bg-white text-emerald-800 px-1.5 py-0.5 rounded-full font-bold">Atual</span>}
                  </div>
                  <span className={`text-[11px] block mt-1 leading-tight ${isCurrent ? 'text-emerald-100' : 'text-slate-500'}`}>
                    {p.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pillow Positioning Guide */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-1.5">
          <span className="font-bold text-slate-900 block">💡 Dicas de ouro para não machucar a pele:</span>
          <ul className="list-disc pl-4 space-y-1 leading-relaxed">
            <li><strong>Entre os joelhos:</strong> Sempre coloque um travesseiro macio entre as pernas ao virar de lado, para que os ossos dos joelhos não encostem um no outro.</li>
            <li><strong>Sob os calcanhares:</strong> Coloque uma almofada sob a batata da perna para que os calcanhares fiquem flutuando, sem apoiar diretamente no colchão.</li>
            <li><strong>Nunca arraste a pessoa:</strong> Ao movimentar na cama, peça ajuda e utilize um lençol móvel por baixo do corpo. O atrito de arrastar arranca a pele frágil.</li>
          </ul>
        </div>

        {/* Recent History */}
        {history.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Últimas viradas registradas hoje:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {history.slice(0, 4).map(h => (
                <span
                  key={h.id}
                  className="px-2.5 py-1 bg-emerald-50 text-emerald-900 text-xs rounded-lg border border-emerald-100 font-medium"
                >
                  🕒 {h.horario} — {getPositionLabel(h.posicao)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hygiene & Bed Bath */}
      <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100">
            <Bath className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Higiene e Banho no Leito com Dignidade
            </h2>
            <p className="text-xs text-slate-500">
              Roteiro para manter a pessoa limpa, aquecida e confortável sem expô-la ao frio.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 bg-emerald-50/40 border border-emerald-200 rounded-xl space-y-2">
            <h3 className="font-bold text-emerald-950 text-sm">Sequência Correta do Banho:</h3>
            <ol className="list-decimal pl-4 space-y-1.5 text-slate-700 leading-relaxed">
              <li><strong>Rosto e Olhos:</strong> Água limpa morna sem sabão, do canto interno do olho para fora.</li>
              <li><strong>Braços, Peito e Abdome:</strong> Lave, enxágue e seque imediatamente antes de cobrir com toalha seca.</li>
              <li><strong>Pernas e Pés:</strong> Lave com carinho e seque muito bem entre os dedos dos pés.</li>
              <li><strong>Partes Íntimas:</strong> Da frente para trás (evita levar bactérias do ânus para a uretra).</li>
              <li><strong>Costas e Glúteos:</strong> Vire a pessoa de lado, higienize, seque bem e examine a pele.</li>
            </ol>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">Inspeção da Pele (O Teste do Ponto Vermelho):</h3>
            <p className="text-slate-600 leading-relaxed">
              A cada troca de fralda ou banho, observe os locais onde os ossos pressionam a cama: <strong>sacro (fim da coluna), calcanhares, cotovelos e quadris</strong>.
            </p>
            <div className="p-2.5 bg-white rounded-lg border border-emerald-200 font-medium text-emerald-950">
              ⚠️ <strong>Teste:</strong> Aperte o ponto vermelho com o dedo. Se soltar e a vermelhidão continuar sem clarear, trata-se do estágio inicial de uma lesão por pressão! Não massageie e mude a posição imediatamente.
            </div>
          </div>
        </div>
      </div>

      {/* Safe Feeding Card */}
      <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100">
            <Utensils className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Alimentação Segura (Evitar Broncoaspiração)
            </h2>
            <p className="text-xs text-slate-500">
              Em idosos e acamados, o alimento ou saliva pode ir para o pulmão e causar pneumonia grave.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <h4 className="font-bold text-slate-900">1. Posição Correta</h4>
            <p className="text-slate-600 leading-relaxed">
              <strong>NUNCA alimente ninguém deitado.</strong> Mantenha a pessoa sentada ou semi-sentada (pelo menos 45° a 90°) apoiada com travesseiros.
            </p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <h4 className="font-bold text-slate-900">2. Consistência e Ritmo</h4>
            <p className="text-slate-600 leading-relaxed">
              Dê colheradas pequenas, com calma. Espere a pessoa engolir totalmente antes de oferecer a próxima. Se engasga com água, pergunte na UBS sobre espessante.
            </p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <h4 className="font-bold text-slate-900">3. Repouso Pós-Refeição</h4>
            <p className="text-slate-600 leading-relaxed">
              Mantenha o paciente sentado ou com a cabeceira elevada por <strong>30 a 40 minutos após terminar de comer</strong> para evitar refluxo.
            </p>
          </div>
        </div>
      </div>

      {/* Red flags for home care */}
      <div className="bg-white border border-emerald-200 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold">
          <AlertCircle className="w-5 h-5 text-emerald-700" />
          <h2 className="text-base sm:text-lg">Sinais de Alerta: Quando Avisar a Equipe da UBS</h2>
        </div>
        <p className="text-xs text-slate-600">
          Se notar qualquer uma destas alterações no dia a dia, procure o Posto de Saúde ou a enfermeira da família:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-800">
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
            • <strong>Mais de 6 horas sem urinar</strong> ou urina muito escura, turva e com cheiro muito forte.
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
            • <strong>Mais de 3 dias sem evacuar</strong> com barriga dura e dor ao apalpar.
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
            • <strong>Recusa total de água e comida</strong> por mais de 24 horas consecutivas.
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
            • <strong>Tosse com secreção amarelada/esverdeada</strong> e sonolência excessiva.
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
            • <strong>Pele com bolha, ferida aberta ou pus</strong> na região do bumbum ou calcanhar.
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
            • <strong>Confusão mental súbita</strong> (não reconhecer pessoas conhecidas de repente).
          </div>
        </div>
      </div>

      {/* Caregiver Self-care ("Cuide de Você Também") in Green & White */}
      <div className="bg-white border border-emerald-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100">
            <Heart className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              💛 Cuide de Quem Cuida (Apoio ao Cuidador Familiar)
            </h2>
            <p className="text-xs text-slate-600">
              Cuidar de um ente querido é um ato de amor, mas a sobrecarga adoece. Você só cuida bem se estiver bem!
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">
            Checklist Diário do Cuidador — Marque o que você já fez hoje:
          </span>

          {[
            { id: 'agua', label: 'Bebi pelo menos 4 a 6 copos de água hoje' },
            { id: 'refeicao', label: 'Fiz minhas refeições sentado com calma e sem pressa' },
            { id: 'pausa', label: 'Tirei pelo menos 15 minutos de silêncio para respirar e descansar' },
            { id: 'revezamento', label: 'Pedi ajuda ou dividi uma tarefa com outro familiar ou vizinho' },
            { id: 'limites', label: 'Reconheci meus limites e não me culpei pelo que não deu tempo' }
          ].map(chk => {
            const isChecked = !!caregiverChecks[chk.id];
            return (
              <div
                key={chk.id}
                onClick={() => toggleCaregiverCheck(chk.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs select-none ${
                  isChecked
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950 font-medium'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-200'
                }`}
              >
                <span>{chk.label}</span>
                <CheckCircle2 className={`w-4 h-4 shrink-0 ${isChecked ? 'text-emerald-700' : 'text-slate-300'}`} />
              </div>
            );
          })}
        </div>

        {/* Emotional Support Callout in Green & White */}
        <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <h4 className="font-bold text-slate-900">Sentindo angústia, cansaço extremo ou solidão?</h4>
            <p className="text-slate-600 mt-0.5">
              O CVV (Centro de Valorização da Vida) oferece escuta gratuita, sigilosa e sem julgamentos, 24 horas por dia.
            </p>
          </div>
          <a
            href="tel:188"
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 shrink-0 transition-colors shadow-xs"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Ligar 188 (Gratuito)</span>
          </a>
        </div>
      </div>
    </div>
  );
};
