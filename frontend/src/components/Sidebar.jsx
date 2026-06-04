import React from 'react';
import { 
  Activity, 
  Stethoscope, 
  Users, 
  UserPlus, 
  FileBarChart2, 
  LogOut, 
  Sun, 
  Moon, 
  Globe,
  HeartPulse
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();
  const { locale, changeLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Administrator':
        return 'bg-rose-50 text-rose-750 border-rose-100 dark:bg-rose-950/30 dark:text-rose-450 dark:border-rose-900/40 uppercase';
      case 'Clinician':
        return 'bg-emerald-50 text-emerald-800 border-emerald-100 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-905/40';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-955/30 dark:text-amber-450 dark:border-amber-900/40';
    }
  };

  const navItems = [
    { id: 'dashboard', label: t('overviewDashboard'), icon: Activity, roles: ['Administrator', 'Clinician', 'Receptionist'] },
    { id: 'doctors', label: t('doctorsAndSchedulers'), icon: Stethoscope, roles: ['Administrator', 'Clinician', 'Receptionist'] },
    { id: 'patients', label: t('patientsDirectory'), icon: Users, roles: ['Administrator', 'Clinician'] },
    { id: 'intake', label: t('intakeForm'), icon: UserPlus, roles: ['Administrator', 'Receptionist'] },
    { id: 'reports', label: t('reportsTitle'), icon: FileBarChart2, roles: ['Administrator', 'Clinician'] }
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <aside id="medlink-sidebar" className="w-full md:w-72 bg-white dark:bg-[#14232c] border-b md:border-b-0 md:border-r border-med-border dark:border-slate-800 flex flex-col justify-between p-6 md:h-screen md:sticky md:top-0 shrink-0 z-40 transition-colors select-none">
      <div className="flex flex-col flex-grow">
        
        {/* Medlink Premium Branding Area */}
        <div className="flex items-center gap-3 mb-9">
          <div className="w-10 h-10 bg-gradient-to-tr from-med-mint to-med-teal rounded-xl flex items-center justify-center shadow-lg shadow-med-mint/10 shrink-0">
            <HeartPulse className="h-5.5 w-5.5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-med-teal dark:text-white leading-none font-sans uppercase">
              {t('appTitle') || "CareTrack"}
            </h1>
            {/* <span className="text-[10px] text-med-mint font-bold uppercase tracking-widest block mt-1">
              Medlink Dashboard
            </span> */}
          </div>
        </div>

        {/* Spacious Interactive Navigation Deck */}
        <nav className="space-y-2 flex-grow">
          {filteredNavItems.map((item) => {
            const IconComponent = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-4 py-3.5 rounded-2xl text-xs font-semibold tracking-wide transition-all selection:bg-transparent select-none cursor-pointer ${
                  isSelected 
                    ? 'bg-med-bg dark:bg-slate-800/80 text-med-teal dark:text-white border border-med-mint shadow-xs font-extrabold' 
                    : 'text-slate-550 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-med-teal dark:hover:text-slate-100 border border-transparent'
                }`}
              >
                <div className={`p-1.5 rounded-lg mr-3 transition ${isSelected ? 'bg-white dark:bg-slate-700 text-med-mint' : 'bg-slate-50 dark:bg-slate-800/20 text-slate-400'}`}>
                  <IconComponent className="w-4 h-4 shrink-0" />
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Control panel & User profile footer with clean premium auto-spacers */}
      <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
        
        {/* Localization & Visual Mode Toggle */}
        <div id="sidebar-controls" className="flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20 p-2 rounded-xl border border-med-border dark:border-slate-800">
          <div className="flex items-center gap-1">
            <Globe className="h-3.5 w-3.5 text-slate-400/85 ml-1" />
            <button
              onClick={() => changeLanguage('eng')}
              className={`px-1.5 py-1 text-[10px] rounded-lg font-bold transition select-none cursor-pointer ${
                locale === 'eng' ? 'bg-white dark:bg-slate-700 shadow-xs text-med-mint font-extrabold' : 'text-slate-450 dark:text-slate-500 hover:text-med-teal'
              }`}
            >
              ENG
            </button>
            <button
              onClick={() => changeLanguage('rus')}
              className={`px-1.5 py-1 text-[10px] rounded-lg font-bold transition select-none cursor-pointer ${
                locale === 'rus' ? 'bg-white dark:bg-slate-700 shadow-xs text-med-mint font-extrabold' : 'text-slate-450 dark:text-slate-500 hover:text-med-teal'
              }`}
            >
              RUS
            </button>
            <button
              onClick={() => changeLanguage('uzb')}
              className={`px-1.5 py-1 text-[10px] rounded-lg font-bold transition select-none cursor-pointer ${
                locale === 'uzb' ? 'bg-white dark:bg-slate-700 shadow-xs text-med-mint font-extrabold' : 'text-slate-450 dark:text-slate-500 hover:text-med-teal'
              }`}
            >
              UZB
            </button>
          </div>

          <button
            onClick={toggleTheme}
            className="p-1 px-[7px] py-[7px] rounded-lg bg-white dark:bg-slate-700 border border-med-border dark:border-slate-600 hover:bg-slate-50 text-slate-550 dark:text-slate-300 cursor-pointer shadow-xs transition"
            title={theme === 'light' ? t('dark') : t('light')}
          >
            {theme === 'light' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Clinician Profile Block info */}
        <div id="clinician-profile-widget" className="flex items-center justify-between gap-1.5 bg-slate-50/50 dark:bg-[#11202a] p-2.5 rounded-2xl border border-med-border dark:border-slate-800/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-med-mint/20 to-med-teal/20 text-med-teal dark:text-teal-400 border border-med-mint/20 flex items-center justify-center font-bold uppercase shrink-0 text-xs">
              {user?.username ? user.username.substring(0, 2).toUpperCase() : 'DR'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-med-teal dark:text-slate-100 truncate leading-tight">
                {user?.username}
              </p>
              <span className={`inline-block text-[8px] font-bold mt-1 px-1.5 py-0.25 rounded-md border ${getRoleBadgeColor(user?.role)}`}>
                {user?.role === 'Administrator' ? 'ADMIN' : user?.role}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition shrink-0 cursor-pointer"
            title={t('logout')}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

      </div>
    </aside>
  );
}
