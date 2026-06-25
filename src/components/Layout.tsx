import React from 'react';
import { BookOpen, Headphones, Brain, Compass, BookOpenCheck, Settings, Home, Sun, Moon, Flame } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  streak: number;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  darkMode,
  toggleDarkMode,
  streak,
}) => {
  const menuItems = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'quran', label: 'المصحف', icon: BookOpen },
    { id: 'listen', label: 'الاستماع', icon: Headphones },
    { id: 'memorize', label: 'الحفظ', icon: Brain },
    { id: 'journal', label: 'الخواطر', icon: BookOpenCheck },
    { id: 'search', label: 'البحث', icon: Compass },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col islamic-pattern font-sans pb-20 md:pb-0 md:pl-0">
      {/* Top Header Bar with embedded Navigation */}
      <header className="sticky top-0 z-40 w-full glass-effect shadow-xs border-b border-warm-border dark:border-dark-border py-2 px-4 sm:px-8 flex justify-between items-center">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="w-10 h-10 drop-shadow-md">
              <defs>
                <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFE259" />
                  <stop offset="30%" stopColor="#FFA751" />
                  <stop offset="70%" stopColor="#FF8C00" />
                  <stop offset="100%" stopColor="#D97706" />
                </linearGradient>
                <linearGradient id="emerald-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="50%" stopColor="#059669" />
                  <stop offset="100%" stopColor="#047857" />
                </linearGradient>
              </defs>

              {/* Rub el Hizb 8-pointed star background (Square 1 rotated) */}
              <rect x="12" y="12" width="40" height="40" rx="6" transform="rotate(0 32 32)" fill="url(#emerald-grad)" stroke="url(#gold-grad)" strokeWidth="1.8" />
              {/* Rub el Hizb 8-pointed star background (Square 2 rotated) */}
              <rect x="12" y="12" width="40" height="40" rx="6" transform="rotate(45 32 32)" fill="url(#emerald-grad)" stroke="url(#gold-grad)" strokeWidth="1.8" />

              {/* Gold inner ring */}
              <circle cx="32" cy="32" r="16.5" fill="#047857" stroke="url(#gold-grad)" strokeWidth="1.2" />

              {/* Rehal Book Stand */}
              <path d="M22.5 38.5 L32 33 L41.5 38.5" stroke="url(#gold-grad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M41.5 38.5 L32 33 L22.5 38.5" stroke="url(#gold-grad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

              {/* Holy Quran Pages */}
              <path d="M32 23.5 C28.5 21 24 21 21 21 V32 C24 32 28.5 32 32 34.5 C35.5 32 40 32 43 32 V21 C40 21 35.5 21 32 23.5 Z" fill="#FFFDF9" stroke="url(#gold-grad)" strokeWidth="1" />
              
              {/* Center Spine Line */}
              <line x1="32" y1="23.5" x2="32" y2="34.5" stroke="url(#gold-grad)" strokeWidth="1" />

              {/* Calligraphy lines */}
              <path d="M23 24 h6 M23 26.5 h6 M23 29 h4 M35 24 h6 M35 26.5 h6 M35 29 h4" stroke="#D97706" strokeWidth="0.8" strokeLinecap="round" />

              {/* Central Star */}
              <polygon points="32,26.5 32.4,27.3 33.3,27.3 32.7,27.9 32.9,28.8 32,28.2 31.1,28.8 31.3,27.9 30.7,27.3 31.6,27.3" fill="url(#gold-grad)" />
            </svg>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-right">
            <span className="text-sm font-extrabold font-arabic text-primary dark:text-primary-light leading-none">
              القرآن الميسر
            </span>
            <span className="text-gray-300 dark:text-slate-700 text-xs">|</span>
            <span className="text-sm font-bold font-arabic text-slate-500 dark:text-slate-400 leading-none">
              تطوير أبو يحيى
            </span>
            <span className="text-gray-300 dark:text-slate-700 text-xs">|</span>
            <a href="mailto:saida.mash@gmail.com" className="font-sans text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-primary transition-colors leading-none">
              saida.mash@gmail.com
            </a>
          </div>
        </div>

        {/* Desktop Horizontal Navigation in Header */}
        <nav className="hidden md:flex flex-row items-center justify-center gap-1 bg-transparent">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-right transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/20 scale-102'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-primary/5 dark:hover:bg-primary-dark/10 hover:text-primary dark:hover:text-primary-light'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-4 shrink-0">
          {/* Daily Streak Indicator */}
          <div className="flex items-center gap-1.5 bg-accent/10 border border-accent/20 rounded-full px-3 py-1 text-accent font-semibold text-sm">
            <Flame className="w-4 h-4 fill-accent animate-pulse" />
            <span className="font-sans leading-none">{streak}</span>
            <span className="text-xs mr-0.5">يوم</span>
          </div>

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleDarkMode}
            className="w-9 h-9 rounded-xl border border-warm-border dark:border-dark-border flex items-center justify-center text-warm-text dark:text-dark-text hover:bg-primary/5 dark:hover:bg-primary-dark/10 transition-colors"
            title="تبديل المظهر"
          >
            {darkMode ? <Sun className="w-4.5 h-4.5 text-accent" /> : <Moon className="w-4.5 h-4.5 text-primary" />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto relative">
        {/* Content Body */}
        <main className="flex-1 p-2 sm:p-3 md:p-4 overflow-y-auto w-full">
          {children}
        </main>
      </div>

      {/* Mobile Navigation Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-effect border-t border-warm-border dark:border-dark-border px-2 py-1 flex justify-around items-center">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all ${
                isActive ? 'text-primary dark:text-primary-light font-bold' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-all ${isActive ? 'bg-primary/10 text-primary dark:text-primary-light' : ''}`}>
                <Icon className="w-5 h-5 shrink-0" />
              </div>
              <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
