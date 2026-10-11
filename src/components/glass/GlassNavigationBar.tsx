import React from 'react';
import { ShieldAlert, Compass, UserCheck, Users, Settings2, Terminal } from 'lucide-react';
import { ScreenId } from '../../types';

interface GlassNavigationBarProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  incomingAlertCount?: number;
}

export const GlassNavigationBar: React.FC<GlassNavigationBarProps> = ({
  currentScreen,
  onNavigate,
  incomingAlertCount = 0,
}) => {
  const tabs = [
    {
      id: 'home' as ScreenId,
      label: 'SOS Alert',
      icon: ShieldAlert,
      activeColor: 'text-pink-400',
      activeGlow: 'shadow-pink-500/30',
    },
    {
      id: 'safe_havens' as ScreenId,
      label: 'Safe Havens',
      icon: Compass,
      activeColor: 'text-blue-400',
      activeGlow: 'shadow-blue-500/30',
    },
    {
      id: 'helper_dashboard' as ScreenId,
      label: 'Helper Desk',
      icon: UserCheck,
      activeColor: 'text-rose-400',
      activeGlow: 'shadow-rose-500/30',
      badgeCount: incomingAlertCount,
    },
    {
      id: 'contacts' as ScreenId,
      label: 'Contacts',
      icon: Users,
      activeColor: 'text-indigo-400',
      activeGlow: 'shadow-indigo-500/30',
    },
    {
      id: 'settings' as ScreenId,
      label: 'Security',
      icon: Settings2,
      activeColor: 'text-pink-300',
      activeGlow: 'shadow-pink-500/30',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto sm:max-w-xl md:max-w-2xl px-3 pb-3">
      <div className="backdrop-blur-2xl bg-slate-950/85 border border-pink-500/20 shadow-2xl shadow-pink-950/40 rounded-3xl p-1.5 flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive =
            currentScreen === tab.id ||
            (tab.id === 'safe_havens' && (currentScreen === 'map' || currentScreen === 'safe_haven_detail')) ||
            (tab.id === 'home' && (currentScreen === 'countdown' || currentScreen === 'active_sos'));

          const IconComponent = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl min-h-[48px] min-w-[56px] transition-all duration-200 select-none active:scale-95 ${
                isActive
                  ? 'bg-gradient-to-b from-white/15 to-white/5 border border-white/20 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <div className="relative">
                <IconComponent
                  className={`w-5 h-5 transition-transform ${
                    isActive ? `${tab.activeColor} scale-110` : 'text-slate-400'
                  }`}
                />
                {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {tab.badgeCount}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-semibold mt-1 tracking-tight truncate max-w-[58px] ${
                  isActive ? 'text-white' : 'text-slate-400'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-pink-400 to-blue-400 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
