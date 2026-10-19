import React from 'react';
import { ShieldAlert, HeartPulse, Home, CalendarDays, Calendar } from 'lucide-react';

interface NavigationProps {
  activeSection: string;
  onSelectSection: (section: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeSection,
  onSelectSection
}) => {
  const tabs = [
    {
      id: 'emergencia',
      label: 'Emergência',
      icon: ShieldAlert
    },
    {
      id: 'socorros',
      label: 'Socorros',
      icon: HeartPulse
    },
    {
      id: 'casa',
      label: 'Casa',
      icon: Home
    },
    {
      id: 'agenda',
      label: 'Agenda',
      icon: CalendarDays
    },
    {
      id: 'google',
      label: 'Google',
      icon: Calendar
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-emerald-100 md:hidden no-print shadow-lg">
      <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                onSelectSection(tab.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
                isActive
                  ? 'text-emerald-800 font-bold'
                  : 'text-slate-500 hover:text-emerald-700'
              }`}
            >
              <div className={`p-1 rounded-lg transition-colors ${isActive ? 'bg-emerald-50 text-emerald-700' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
              </div>
              <span className={`text-[11px] tracking-tight mt-0.5 leading-none ${isActive ? 'text-emerald-800 font-bold' : 'text-slate-500'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
