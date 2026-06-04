import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import Sidebar from './components/Sidebar.jsx';
import Login from './components/Login.jsx';

// Core content tabs components
import ClinicalInfoManagement from './components/ClinicalInfoManagement.jsx';
import DoctorManagement from './components/DoctorManagement.jsx';
import PatientManagement from './components/PatientManagement.jsx';
import RegistrationManagement from './components/RegistrationManagement.jsx';
import ReportManagement from './components/ReportManagement.jsx';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-450 dark:text-slate-400 font-sans">
        <div className="animate-spin inline-block w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full mb-3"></div>
        <p className="text-xs">Initializing CareTrack Security Clearance...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between py-4">
        <div className="flex-grow flex items-center justify-center">
          <Login />
        </div>
        <footer className="text-center text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-wider mt-4">
          CareSuite Digital Systems • Multi-Specialist Clinic Record Desk
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F9F8] dark:bg-[#0b141b] text-[#1e3a45] dark:text-slate-100 font-sans flex flex-col md:flex-row leading-normal">
      
      {/* Sidebar Navigation frame handles language, roles, profile, and theme switches */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Primary Workspace Panel Grid */}
      <div className="flex-grow flex flex-col min-h-screen min-w-0">
        <main className="flex-grow p-5 sm:p-7 md:p-9">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.16, ease: "easeInOut" }}
              className="h-full"
            >
              {activeTab === 'dashboard' && <ClinicalInfoManagement />}
              {activeTab === 'doctors' && <DoctorManagement />}
              {activeTab === 'patients' && <PatientManagement />}
              {activeTab === 'intake' && <RegistrationManagement />}
              {activeTab === 'reports' && <ReportManagement />}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="py-5 border-t border-slate-205 dark:border-slate-850 bg-white dark:bg-slate-900 text-center text-[10px] text-slate-400 dark:text-slate-500 font-mono tracking-wide">
          CareSuite Clinician Terminal • Verified Clinical Systems CT-2026
        </footer>
      </div>

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
