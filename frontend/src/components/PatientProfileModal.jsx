import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  Activity,
  Heart,
  Clipboard,
  AlertCircle,
  Plus,
  Trash2,
  Edit3,
  Sparkle,
  Sparkles,
  Award,
  BookOpen,
  CalendarDays
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function PatientProfileModal({ patientId, onClose }) {
  const { user, authFetch } = useAuth();
  const { t } = useLanguage();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Diagnosis Modal Form Panel
  const [showForm, setShowForm] = useState(false);
  const [diagnosisEditId, setDiagnosisEditId] = useState(null);
  const [diagnosisForm, setDiagnosisForm] = useState({
    description: '',
    icd_code: '',
    severity: 'Mild',
    diagnosed_date: '',
    notes: ''
  });
  const [diagnosisFormError, setDiagnosisFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const canManageDiagnosis = user && (user.role === 'Administrator' || user.role === 'Clinician');

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authFetch(`/api/patients/${patientId}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      } else {
        setError('Failed to fetch the patient clinical record.');
      }
    } catch (err) {
      setError('Clinical server connection failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchProfile();
    }
  }, [patientId]);

  const handleOpenAddDiagnosis = () => {
    setDiagnosisForm({
      description: '',
      icd_code: '',
      severity: 'Mild',
      diagnosed_date: new Date().toISOString().substring(0, 10),
      notes: ''
    });
    setDiagnosisEditId(null);
    setDiagnosisFormError('');
    setShowForm(true);
  };

  const handleOpenEditDiagnosis = (diag) => {
    setDiagnosisForm({
      description: diag.description || '',
      icd_code: diag.icd_code || '',
      severity: diag.severity || 'Mild',
      diagnosed_date: diag.diagnosed_date ? diag.diagnosed_date.substring(0, 10) : '',
      notes: diag.notes || ''
    });
    setDiagnosisEditId(diag.id);
    setDiagnosisFormError('');
    setShowForm(true);
  };

  const handleDiagnosisFormSubmit = async (e) => {
    e.preventDefault();
    if (!diagnosisForm.description || !diagnosisForm.icd_code || !diagnosisForm.diagnosed_date) {
      setDiagnosisFormError('Description, ICD-10 Code and diagnosed Date are mandatory fields.');
      return;
    }
    setDiagnosisFormError('');
    setFormLoading(true);

    try {
      let res;
      if (diagnosisEditId) {
        res = await authFetch(`/api/diagnoses/${diagnosisEditId}`, {
          method: 'PUT',
          body: JSON.stringify({
            ...diagnosisForm,
            patient_id: patientId
          })
        });
      } else {
        res = await authFetch('/api/diagnoses', {
          method: 'POST',
          body: JSON.stringify({
            ...diagnosisForm,
            patient_id: patientId
          })
        });
      }

      if (res.ok) {
        setShowForm(false);
        fetchProfile();
      } else {
        const errData = await res.json();
        setDiagnosisFormError(errData.error || 'Failed to submit clinical diagnosis.');
      }
    } catch (err) {
      setDiagnosisFormError('Database transaction failed.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteDiagnosis = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to remove this diagnosis entry from the patient dossier?')) {
      return;
    }
    try {
      const res = await authFetch(`/api/diagnoses/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchProfile();
      } else {
        alert('Could not complete deletion due to active role constraints.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getSeverityBadgeColor = (sev) => {
    switch ((sev || '').toLowerCase()) {
      case 'severe':
        return 'bg-red-50 text-red-750 border-red-100 dark:bg-red-950/20 dark:text-red-400';
      case 'moderate':
        return 'bg-amber-50 text-amber-705 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400';
      default:
        return 'bg-emerald-50 text-[#0D9488] border-emerald-100 dark:bg-teal-950/20 dark:text-teal-400';
    }
  };

  return (
    <div id="patient-profile-dossier-backdrop" className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-sm select-none">
      <motion.div
        initial={{ x: '100%', opacity: 0.9 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0.9 }}
        transition={{ type: 'spring', damping: 26, stiffness: 220 }}
        className="bg-white dark:bg-[#14232c] border-l border-med-border dark:border-slate-800 w-full max-w-xl h-full shadow-2xl flex flex-col justify-between"
      >
        {/* Modal Slide-over Header */}
        <div className="flex items-center justify-between p-6 border-b border-med-border dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-med-bg dark:bg-slate-800 text-med-mint rounded-xl border border-med-border">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-med-teal dark:text-white text-sm font-sans uppercase tracking-wider leading-none">
                {t('patientDetails') || "Patient Clinical File"}
              </h3>
              <p className="text-[10px] text-zinc-400 dark:text-slate-500 font-mono mt-1">Dossier Reference ID: CT-{patientId.toString().padStart(4, '0')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Clinical Profile Body Content */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {loading && !profile ? (
            <div className="text-center py-24 dark:text-slate-350">
              <div className="animate-spin inline-block w-8 h-8 border-3 border-med-mint border-t-transparent rounded-full mb-3" role="status"></div>
              <p className="text-xs text-slate-400 font-sans">{t('loadingRegistry')}</p>
            </div>
          ) : error || !profile ? (
            <div className="text-center py-16 p-6">
              <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3 animate-bounce" />
              <h4 className="text-sm font-black text-slate-700 dark:text-slate-350">Error Retrieving Registry</h4>
              <p className="text-xs text-slate-400 mt-1">{error || 'Record does not exist'}</p>
            </div>
          ) : (
            <div className="space-y-6">

              {/* Profile Demographics segment */}
              <div className="p-5 rounded-2xl bg-gradient-to-tr from-[#FAFDFD] to-white dark:from-slate-800/10 dark:to-transparent border border-med-border dark:border-slate-800">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="block text-[9px] text-[#A0AEC0] dark:text-slate-500 uppercase font-bold tracking-widest mb-1">Full Name</span>
                    <strong className="block text-med-teal dark:text-slate-100 text-sm font-extrabold">{profile.name}</strong>
                    <span className={`inline-flex px-2 py-0.5 mt-2 rounded-full text-[8px] font-bold tracking-wider uppercase border ${
                      profile.status === 'Active'
                        ? 'bg-emerald-50 text-[#0D9488] border-emerald-100 dark:bg-emerald-950/20'
                        : 'bg-zinc-50 text-zinc-500 border-zinc-200 dark:bg-slate-800 dark:border-slate-700'
                    }`}>
                      {profile.status === 'Active' ? t('activeStatus') : t('inactiveStatus')}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[9px] text-[#A0AEC0] dark:text-slate-500 uppercase font-bold tracking-widest mb-1">{t('dobLabel')}</span>
                    <strong className="block text-slate-700 dark:text-slate-300 font-sans text-xs">{profile.dob ? profile.dob.substring(0, 10) : 'N/A'}</strong>
                    <span className="block text-[10px] text-slate-450 dark:text-slate-400 mt-1">Gender: {profile.gender || 'Other'}</span>
                  </div>

                  <div className="col-span-2 pt-3 border-t border-slate-100 dark:border-slate-800/60 grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[9px] text-[#A0AEC0] dark:text-slate-505 uppercase font-bold tracking-widest mb-1">Email Dossier</span>
                      <strong className="block text-slate-750 dark:text-slate-300 font-mono truncate text-[11px] select-text">{profile.email || 'None'}</strong>
                    </div>
                    <div>
                      <span className="block text-[9px] text-[#A0AEC0] dark:text-slate-505 uppercase font-bold tracking-widest mb-1">Contact Phone</span>
                      <strong className="block text-slate-755 dark:text-slate-300 font-mono text-[11px] select-text">{profile.phone || 'None'}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Specialist Card Block (Allocated Care Specialist) */}
              <div className="p-4 bg-med-bg/40 dark:bg-slate-800/20 border border-med-border dark:border-slate-805 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white dark:bg-slate-800 text-med-mint rounded-xl border border-med-border">
                    <Heart className="h-5 w-5 animate-pulse" />
                  </div>
                  <div>
                    <span className="block text-[8px] text-[#A0AEC0] dark:text-slate-500 uppercase font-bold tracking-widest mb-0.5">Primary Care Specialist</span>
                    <h4 className="text-xs font-bold text-med-teal dark:text-slate-200">
                      {profile.doctor ? profile.doctor.name : 'Unallocated Specialists'}
                    </h4>
                    {profile.doctor && (
                      <p className="text-[10px] text-[#0D9488] font-medium leading-none mt-1">Wing Room: {profile.doctor.department} • Room {profile.doctor.department_room || 'G1'}</p>
                    )}
                  </div>
                </div>

                {profile.doctor && (
                  <div className="p-2 px-2.5 bg-white dark:bg-slate-800 border border-med-border dark:border-slate-700 rounded-xl text-center">
                    <span className="block text-[8px] text-slate-400 uppercase font-mono tracking-wider">SPECIALTY</span>
                    <strong className="text-[10px] text-med-teal dark:text-slate-100 font-bold font-sans">{profile.doctor.specialty}</strong>
                  </div>
                )}
              </div>

              {/* Timeline Histology Registry */}
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="text-xs font-extrabold text-med-teal dark:text-slate-205 uppercase tracking-wider font-mono">Clinical Disease Timeline</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Chronology of recorded ICD disease classifications</p>
                  </div>

                  {canManageDiagnosis && (
                    <button
                      onClick={handleOpenAddDiagnosis}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] bg-med-mint hover:bg-med-mint-hover text-white font-extrabold rounded-lg cursor-pointer transition select-none shadow-xs"
                    >
                      <Plus className="h-3.5 w-3.5" /> ADD LOG
                    </button>
                  )}
                </div>

                {/* Timeline rendering with ICD badges */}
                {user.role === 'Receptionist' ? (
                  <div className="p-5 bg-slate-50 dark:bg-slate-850 text-slate-500 border border-slate-200 dark:border-slate-800 rounded-xl text-center text-xs">
                    <p className="font-bold text-slate-700 dark:text-slate-300">Authorized Access Only</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Receptionists are not authorized to audit clinical timeline logs.
                    </p>
                  </div>
                ) : !profile.diagnoses || profile.diagnoses.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50/50 dark:bg-slate-850 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    <Clipboard className="h-5 w-5 text-slate-400 dark:text-slate-550 mx-auto mb-1.5" />
                    <p className="text-[11px] text-slate-505 dark:text-slate-400 font-medium">No recorded diagnoses logged on clinical timeline.</p>
                  </div>
                ) : (
                  <div className="relative pl-6 border-l-2 border-med-border dark:border-slate-800 space-y-6">
                    {profile.diagnoses.map((diag, idx) => (
                      <div key={diag.id || idx} className="relative group">

                        {/* Timeline visual marker */}
                        <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white dark:bg-[#14232c] border-2 border-med-mint flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-med-mint"></span>
                        </span>

                        <div className="p-4 bg-white dark:bg-[#11202a] rounded-2xl border border-med-border dark:border-slate-800 hover:border-med-mint transition-colors">
                          <div className="flex justify-between items-start gap-3 flex-wrap">
                            <div>
                              <strong className="block text-xs font-black text-med-teal dark:text-slate-100 capitalize">{diag.description}</strong>

                              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                <span className="font-mono text-[9px] text-[#0D9488] bg-teal-50/65 dark:bg-teal-950/20 border border-med-mint/20 px-1.5 py-0.5 rounded-md font-bold uppercase select-all">
                                  Code: {diag.icd_code}
                                </span>
                                <span className={`px-2 py-0.25 border rounded-md text-[8px] font-bold uppercase shadow-3xs ${getSeverityBadgeColor(diag.severity)}`}>
                                  {diag.severity}
                                </span>
                              </div>
                            </div>

                            {canManageDiagnosis && (
                              <div className="flex items-center gap-1.5 self-center" onClick={e => e.stopPropagation()}>
                                <button
                                  onClick={() => handleOpenEditDiagnosis(diag)}
                                  className="p-1 px-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-med-teal transition shrink-0 cursor-pointer"
                                  title="Edit entry"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteDiagnosis(diag.id)}
                                  className="p-1 px-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded text-slate-405 hover:text-red-500 transition shrink-0 cursor-pointer"
                                  title="Delete entry"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}
                          </div>

                          <span className="block text-[9px] text-[#A0AEC0] dark:text-slate-500 font-semibold font-mono mt-2 flex items-center gap-1">
                            <CalendarDays className="h-3 w-3 shrink-0 text-slate-400" />
                            Diagnosed Date: {diag.diagnosed_date ? diag.diagnosed_date.substring(0, 10) : ''}
                          </span>

                          {diag.notes && (
                            <div className="mt-3 p-3 bg-slate-50/70 dark:bg-[#070d11] rounded-xl text-[11px] leading-relaxed text-zinc-650 dark:text-slate-400 border border-slate-100 dark:border-slate-800/60 font-sans">
                              <span className="block font-bold text-[9px] text-slate-400 dark:text-slate-650 uppercase tracking-widest mb-1">Clinical Directives:</span>
                              <p className="select-text">{diag.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* Slide-over Footer controls */}
        <div className="p-6 border-t border-med-border dark:border-slate-800 shrink-0 bg-slate-50/30 dark:bg-[#11202a]">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer"
          >
            DISMISS DOSSIER REVIEW
          </button>
        </div>

        {/* Floating diagnosis form editor */}
        <AnimatePresence>
          {showForm && (
            <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-3xs select-none">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-[#14232c] border border-med-border dark:border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl scale-1"
              >
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h4 className="font-extrabold text-med-teal dark:text-slate-100 text-xs font-sans flex items-center gap-2 uppercase tracking-wide">
                    <Activity className="h-4.5 w-4.5 text-med-mint" />
                    {diagnosisEditId ? "Modify Diagnosis Log" : "New Diagnosis entry"}
                  </h4>
                  <button
                    onClick={() => setShowForm(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-100 rounded-lg transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {diagnosisFormError && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-rose-950/20 border border-red-100 text-red-700 dark:text-red-400 rounded-xl text-[11px] flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{diagnosisFormError}</span>
                  </div>
                )}

                <form onSubmit={handleDiagnosisFormSubmit} className="space-y-4 text-xs text-slate-600">
                  <div>
                    <label className="block font-bold mb-1.5 text-slate-600 dark:text-slate-400">ICD-10 Disease Code</label>
                    <input
                      type="text"
                      value={diagnosisForm.icd_code}
                      onChange={(e) => setDiagnosisForm(prev => ({ ...prev, icd_code: e.target.value.toUpperCase() }))}
                      placeholder="e.g. I10"
                      className="w-full px-3.5 py-2.5 bg-slate-50/50 dark:bg-slate-850 text-slate-850 dark:text-slate-100 border border-med-border dark:border-slate-800 rounded-xl focus:outline-hidden focus:border-med-mint focus:bg-white dark:focus:bg-slate-900 transition font-sans"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1.5 text-slate-600 dark:text-slate-400">Diagnosis Description</label>
                    <input
                      type="text"
                      value={diagnosisForm.description}
                      onChange={(e) => setDiagnosisForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="e.g. Essential hypertension"
                      className="w-full px-3.5 py-2.5 bg-slate-50/50 dark:bg-slate-850 text-slate-855 dark:text-slate-100 border border-med-border dark:border-slate-805 rounded-xl focus:outline-hidden focus:border-med-mint focus:bg-white dark:focus:bg-slate-900 transition font-sans"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold mb-1.5 text-slate-600 dark:text-slate-400">Severity</label>
                      <select
                        value={diagnosisForm.severity}
                        onChange={(e) => setDiagnosisForm(prev => ({ ...prev, severity: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-slate-50/50 dark:bg-slate-853 text-slate-850 dark:text-slate-100 border border-med-border dark:border-slate-800 rounded-xl focus:outline-hidden focus:border-med-mint focus:bg-white dark:focus:bg-slate-900 transition font-sans cursor-pointer"
                      >
                        <option value="Mild">Mild</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Severe">Severe</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold mb-1.5 text-slate-600 dark:text-slate-400">Diagnosed Date</label>
                      <input
                        type="date"
                        value={diagnosisForm.diagnosed_date}
                        onChange={(e) => setDiagnosisForm(prev => ({ ...prev, diagnosed_date: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-slate-50/50 dark:bg-slate-850 text-slate-855 dark:text-slate-100 border border-med-border dark:border-slate-800 rounded-xl focus:outline-hidden focus:border-med-mint focus:bg-white dark:focus:bg-slate-900 transition font-sans"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-1.5 text-slate-600 dark:text-slate-400">Clinical Notes</label>
                    <textarea
                      value={diagnosisForm.notes}
                      onChange={(e) => setDiagnosisForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="e.g. Started medicine treatment directives QD."
                      rows={3}
                      className="w-full px-3.5 py-2.5 bg-slate-50/50 dark:bg-slate-850 text-slate-850 dark:text-slate-100 border border-med-border dark:border-slate-800 rounded-xl focus:outline-hidden focus:border-med-mint focus:bg-white dark:focus:bg-slate-900 transition font-sans resize-none"
                    ></textarea>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-850">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-755 text-slate-600 dark:text-slate-350 rounded-xl hover:bg-slate-50 transition font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="px-5 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-med-mint dark:hover:bg-med-mint-hover text-white font-bold rounded-xl transition cursor-pointer"
                    >
                      {formLoading ? 'Submitting...' : diagnosisEditId ? 'Update' : 'Register'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}

