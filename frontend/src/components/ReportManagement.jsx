import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Search, 
  Printer, 
  Activity, 
  TrendingUp, 
  BarChart, 
  Clipboard, 
  Download,
  AlertCircle,
  FileSpreadsheet,
  Stethoscope,
  Heart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function ReportManagement() {
  const { authFetch } = useAuth();
  const { t } = useLanguage();

  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientReportData, setPatientReportData] = useState(null);
  
  const [diagnoses, setDiagnoses] = useState([]);
  const [icdFrequencies, setIcdFrequencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGeneralReportingData = async () => {
      setLoading(true);
      try {
        const [patsRes, diagsRes] = await Promise.all([
          authFetch('/api/patients'),
          authFetch('/api/diagnoses').catch(() => null)
        ]);

        if (patsRes.ok) {
          const patsData = await patsRes.json();
          setPatients(patsData);
          if (patsData.length > 0) {
            setSelectedPatientId(patsData[0].id.toString());
          }
        }

        if (diagsRes && diagsRes.ok) {
          const diagsData = await diagsRes.json();
          setDiagnoses(diagsData);
          computeIcdFrequencies(diagsData);
        }
      } catch (err) {
        console.error('Failed to load clinic reporting registers:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGeneralReportingData();
  }, []);

  const computeIcdFrequencies = (diags) => {
    if (!diags || diags.length === 0) return;
    const frequencies = {};
    diags.forEach(diag => {
      const code = diag.icd_code || 'Unspecified';
      frequencies[code] = (frequencies[code] || 0) + 1;
    });

    const frequencyList = Object.keys(frequencies).map(code => ({
      code,
      count: frequencies[code],
      percentage: Math.round((frequencies[code] / diags.length) * 100)
    })).sort((a, b) => b.count - a.count).slice(0, 5);

    setIcdFrequencies(frequencyList);
  };

  const handleGenerateReport = async () => {
    if (!selectedPatientId) return;
    setReportLoading(true);
    setError('');
    setPatientReportData(null);
    try {
      const res = await authFetch(`/api/patients/${selectedPatientId}`);
      if (res.ok) {
        const data = await res.json();
        setPatientReportData(data);
      } else {
        setError('Could not retrieve cohesive demographics for compiling data.');
      }
    } catch (err) {
      setError('Clinical reports server is unreachable.');
    } finally {
      setReportLoading(false);
    }
  };

  const handlePrintDossier = () => {
    window.print();
  };

  return (
    <div id="reports-generator-canvas" className="space-y-6">
      
      {/* Module Title controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-slate-805 pb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white font-sans tracking-tight">
            {t('reportsTab')}
          </h2>
          <p className="text-xs text-slate-450 dark:text-slate-400 mt-1">
            {t('reportsSub')}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="animate-spin inline-block w-6 h-6 border-3 border-teal-505 border-t-transparent rounded-full mb-3"></div>
          <p className="text-xs text-slate-450 dark:text-slate-400 font-sans">{t('loadingRegistry')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Form setup panel to compile patient statistics (col-span-4) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bento-card p-5 space-y-4">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 font-sans uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="h-4.5 w-4.5 text-teal-605" />
                Report Compiler
              </h3>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold mb-1.5 text-slate-600 dark:text-slate-400">Select Patient File</label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:border-teal-500 dark:focus:border-teal-400 focus:bg-white dark:focus:bg-slate-900 transition font-sans cursor-pointer"
                  >
                    <option value="">-- Choose patient --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (CT-{p.id.toString().padStart(4, '0')})</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateReport}
                  disabled={!selectedPatientId || reportLoading}
                  className="w-full bg-slate-800 hover:bg-slate-900 dark:bg-teal-650 dark:hover:bg-teal-700 text-white font-bold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-1.5 shadow-2xs select-none cursor-pointer disabled:opacity-50"
                >
                  {reportLoading ? 'Compiling Dossier...' : t('generateOfficialReport')}
                </button>
              </div>
            </div>

            {/* ICD-10 Classification distribution visual (CSS bar graphics) */}
            <div className="bento-card p-5 space-y-4">
              <h3 className="text-sm font-extrabold text-slate-80s dark:text-slate-200 font-sans uppercase tracking-wider flex items-center gap-1.5">
                <BarChart className="h-4.5 w-4.5 text-indigo-505" />
                {t('diagnosesDistribution')}
              </h3>

              {icdFrequencies.length === 0 ? (
                <div className="text-center py-6 text-slate-400">No diagnostic logs found yet.</div>
              ) : (
                <div className="space-y-3.5">
                  {icdFrequencies.map((icd, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-700 dark:text-slate-300 font-mono">ICD Class: {icd.code}</span>
                        <span className="text-indigo-650 dark:text-indigo-400 font-mono">{icd.count} logs ({icd.percentage}%)</span>
                      </div>
                      
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-teal-500 to-indigo-600 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${icd.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Formatted printable dossier report card (col-span-8) */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 text-red-750 dark:text-red-400 rounded-2xl text-xs flex items-center gap-2">
                  <AlertCircle className="h-4.5 w-4.5" />
                  <span>{error}</span>
                </div>
              )}

              {patientReportData ? (
                <motion.div
                  key={patientReportData.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  id="clinical-report-sheet"
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm space-y-6 print:border-0 print:shadow-none print:p-0"
                >
                  {/* Report Header Logo Section */}
                  <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-5 flex-wrap gap-4">
                    <div>
                      <h2 className="text-xl font-black text-slate-850 dark:text-white font-sans uppercase">CareTrack Clinic Inc.</h2>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-1 tracking-widest font-sans">Official Clinical Registry Report</p>
                    </div>

                    <div className="flex gap-2 print:hidden" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={handlePrintDossier}
                        className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700 rounded-xl text-xs flex items-center gap-1.5 transition select-none cursor-pointer"
                        title="Print Report Sheet"
                      >
                        <Printer className="h-4 w-4" />
                        <span>Print Dossier</span>
                      </button>
                    </div>
                  </div>

                  {/* Demographics Area */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-850/50 p-4 rounded-xl text-xs text-slate-500 dark:text-slate-400 border border-slate-150/40 dark:border-slate-800">
                    <div>
                      <span className="block text-[9px] text-slate-400 uppercase font-black font-sans">Patient Nominee</span>
                      <strong className="block text-slate-805 dark:text-slate-200 text-[12px] mt-0.5">{patientReportData.name}</strong>
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-400 uppercase font-black font-sans">Index Doc ID</span>
                      <strong className="block text-slate-805 dark:text-slate-200 text-[12px] mt-0.5 font-mono">CT-{patientReportData.id.toString().padStart(4, '0')}</strong>
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-400 uppercase font-black font-sans">Date of Birth</span>
                      <strong className="block text-slate-805 dark:text-slate-200 text-[11px] mt-0.5 font-sans">{patientReportData.dob ? patientReportData.dob.substring(0, 10) : 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-400 uppercase font-black font-sans">Gender Label</span>
                      <strong className="block text-slate-805 dark:text-slate-200 text-[11px] mt-0.5">{patientReportData.gender}</strong>
                    </div>
                  </div>

                  {/* Allocated Doctor */}
                  <div className="flex items-center gap-3 p-4 bg-indigo-50/20 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-900/30 rounded-xl text-xs">
                    <Stethoscope className="h-4.5 w-4.5 text-indigo-501 dark:text-indigo-400 shrink-0" />
                    <div>
                      <span className="block text-[9px] text-slate-400 uppercase font-bold">Assigned Specialist In Charge</span>
                      <p className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
                        {patientReportData.doctor ? patientReportData.doctor.name : 'No specialist allocated.'}
                      </p>
                    </div>
                  </div>

                  {/* Diseases Chronological Logs Timeline */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#64748B] border-b border-slate-100 dark:border-slate-800 pb-2 font-mono">Diseases & Clinical Diagnoses History</h4>
                    
                    {!patientReportData.diagnoses || patientReportData.diagnoses.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-xs">No active diagnoses logged for this patient file.</div>
                    ) : (
                      <div className="space-y-4">
                        {patientReportData.diagnoses.map((diag, index) => (
                          <div key={index} className="p-4 bg-slate-50/40 dark:bg-slate-850/20 border border-slate-100 dark:border-slate-800 rounded-xl text-xs space-y-2">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-855 dark:text-white capitalize text-[13px]">{diag.description}</span>
                                <span className="font-mono text-[9px] text-indigo-650 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-100/30 dark:border-indigo-950/80">ICD: {diag.icd_code}</span>
                              </div>
                              <span className="px-2 py-0.5 text-[8px] font-bold border border-slate-200 text-slate-400 dark:border-slate-800 rounded-lg">{diag.severity}</span>
                            </div>

                            <p className="text-[10px] text-slate-400 font-sans">{t('diagnosedDate')}: {diag.diagnosed_date ? diag.diagnosed_date.substring(0, 10) : ''}</p>
                            
                            {diag.notes && (
                              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg text-[11px] leading-relaxed text-slate-550 dark:text-slate-400 font-sans">
                                <span className="block font-bold text-[9px] text-slate-400 uppercase tracking-widest mb-1">Clinical Evaluation Notes</span>
                                <p>{diag.notes}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Official Verification signatures placeholder */}
                  <div className="pt-8 border-t border-slate-100 dark:border-slate-800/80 flex justify-between text-[10px] text-slate-450 dark:text-slate-500 font-sans">
                    <div className="space-y-1">
                      <span>CareSuite Digital Signature:</span>
                      <strong className="block text-slate-600 dark:text-slate-400 font-mono">CT-#{(patientReportData.id || 0).toString().padStart(4, '0')}-VERIFIED</strong>
                    </div>
                    <div className="text-right space-y-1">
                      <span>Compiled Date:</span>
                      <strong className="block text-slate-600 dark:text-slate-400 font-sans">{new Date().toLocaleDateString()}</strong>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="bento-card p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-3 dark:text-slate-500">
                  <Clipboard className="h-10 w-10 text-slate-300 dark:text-slate-700 animate-pulse" />
                  <p>Choose an onboarding patient from the side selector panel, then click Compiling to generate report sheets.</p>
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>
      )}
    </div>
  );
}
