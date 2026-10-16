import React from 'react';
import { PhoneCall, Type, Volume2, VolumeX } from 'lucide-react';
import { AppLogo } from './AppLogo';
import { TextSizeOption } from '../utils/storage';

interface HeaderProps {
  textSize: TextSizeOption;
  onTextSizeChange: (size: TextSizeOption) => void;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
  activeSection: string;
  onSelectSection: (section: string) => void;
  onQuickEmergency: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  textSize,
  onTextSizeChange,
  isSpeaking,
  onStopSpeaking,
  activeSection,
  onSelectSection,
  onQuickEmergency
}) => {
  const cycleTextSize = () => {
    if (textSize === 'normal') onTextSizeChange('grande');
    else if (textSize === 'grande') onTextSizeChange('extragrande');
    else onTextSizeChange('normal');
  };

  const textSizeLabel = {
    normal: 'A',
    grande: 'A+',
    extragrande: 'A++'
  }[textSize];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Zone 1: Brand wordmark in green & white with App Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onSelectSection('emergencia')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <AppLogo size={42} className="shadow-xs border border-emerald-100 transition-transform group-hover:scale-105" />
            <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors whitespace-nowrap">
              Cuidar Juntos
            </span>
          </button>
        </div>

        {/* Zone 2: Desktop Nav Links (Clean green text and underlines) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
          <button
            onClick={() => onSelectSection('emergencia')}
            className={`transition-colors whitespace-nowrap py-1 ${
              activeSection === 'emergencia' ? 'text-emerald-700 border-b-2 border-emerald-700' : 'hover:text-emerald-800'
            }`}
          >
            Emergência
          </button>
          <button
            onClick={() => onSelectSection('socorros')}
            className={`transition-colors whitespace-nowrap py-1 ${
              activeSection === 'socorros' ? 'text-emerald-700 border-b-2 border-emerald-700' : 'hover:text-emerald-800'
            }`}
          >
            Primeiros Socorros
          </button>
          <button
            onClick={() => onSelectSection('casa')}
            className={`transition-colors whitespace-nowrap py-1 ${
              activeSection === 'casa' ? 'text-emerald-700 border-b-2 border-emerald-700' : 'hover:text-emerald-800'
            }`}
          >
            Cuidar em Casa
          </button>
          <button
            onClick={() => onSelectSection('agenda')}
            className={`transition-colors whitespace-nowrap py-1 ${
              activeSection === 'agenda' ? 'text-emerald-700 border-b-2 border-emerald-700' : 'hover:text-emerald-800'
            }`}
          >
            Agenda & Saúde
          </button>
        </nav>

        {/* Zone 3: Actions (Text size, voice control, SOS button) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Voice Stop button if speaking */}
          {isSpeaking && (
            <button
              onClick={onStopSpeaking}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors animate-pulse"
              title="Parar leitura de voz"
            >
              <VolumeX className="w-4 h-4 text-emerald-700" />
              <span className="hidden sm:inline">Parar Voz</span>
            </button>
          )}

          {/* Text Size Accessibility Toggle */}
          <button
            onClick={cycleTextSize}
            className="flex items-center justify-center min-w-[38px] h-[38px] px-2 text-xs font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
            title="Ajustar tamanho do texto para facilitar a leitura"
            aria-label="Tamanho da fonte"
          >
            <Type className="w-3.5 h-3.5 mr-0.5 text-emerald-700" />
            <span>{textSizeLabel}</span>
          </button>

          {/* Quick SOS Call (Green and White theme) */}
          <button
            onClick={onQuickEmergency}
            className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-95 rounded-lg shadow-xs transition-all whitespace-nowrap shrink-0"
          >
            <PhoneCall className="w-4 h-4 animate-bounce" />
            <span>S.O.S 192</span>
          </button>
        </div>
      </div>
    </header>
  );
};
