import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  UserPlus, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Heart, 
  AlertCircle,
  CheckCircle,
  Stethoscope
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function RegistrationManagement() {
  const { authFetch } = useAuth();
  const { t } = useLanguage();

  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'Male',
    dob: '',
    assigned_doctor_id: '',
    status: 'Active'
  });

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);
  const [lastRegisteredName, setLastRegisteredName] = useState('');

  useEffect(() => {
    const fetchDoctorsList = async () => {
      try {
        const res = await authFetch('/api/doctors');
        if (res.ok) {
          const data = await res.json();
          setDoctors(data);
          if (data.length > 0) {
            setFormData(prev => ({ ...prev, assigned_doctor_id: data[0].id.toString() }));
          }
        }
      } catch (err) {
        console.error('Error fetching doctors for boarding allocation:', err);
      }
    };
    fetchDoctorsList();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.gender || !formData.dob) {
      setFormError('Patient Name, Gender, and DOB are mandatory fields.');
      return;
    }
    
    setFormError('');
    setFormLoading(true);

    try {
      const submission = {
        ...formData,
        assigned_doctor_id: formData.assigned_doctor_id ? parseInt(formData.assigned_doctor_id, 10) : null
      };

      const res = await authFetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission)
      });

      if (res.ok) {
        setSuccess(true);
        setLastRegisteredName(formData.name);
        setFormData({
          name: '',
          email: '',
          phone: '',
          gender: 'Male',
          dob: '',
          assigned_doctor_id: doctors.length > 0 ? doctors[0].id.toString() : '',
          status: 'Active'
        });
      } else {
        const errData = await res.json();
        setFormError(errData.error || 'Onboarding failed.');
      }
    } catch (err) {
      setFormError('Clinical server is offline or unreachable.');
    } finally {
      setFormLoading(false);
    }
  };

  const getSelectedDoctorDetails = () => {
    const doc = doctors.find(d => d.id.toString() === formData.assigned_doctor_id);
    return doc ? `${doc.name} (${doc.specialty} - Room ${doc.department || 'N/A'})` : null;
  };

  return (
    <div id="registration-intake-canvas" className="space-y-6 max-w-3xl mx-auto">
      
      {/* Module Title controls */}
      <div className="border-b border-slate-200/50 dark:border-slate-805 pb-4">
        <h2 className="text-2xl font-black text-slate-800 dark:text-white font-sans tracking-tight flex items-center gap-2">
          <UserPlus className="h-6 w-6 text-teal-605" />
          {t('intakeForm')}
        </h2>
        <p className="text-xs text-slate-450 dark:text-slate-400 mt-1">
          {t('intakeSub')}
        </p>
      </div>

      {success ? (
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-150 dark:border-emerald-900/60 p-6 rounded-2xl text-center space-y-4"
        >
          <CheckCircle className="h-12 w-12 text-emerald-504 dark:text-emerald-400 mx-auto animate-bounce" />
          <h3 className="text-lg font-extrabold text-slate-800 dark:text-white font-sans">
            Onboarding Completed Successfully!
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-350 max-w-md mx-auto">
            Patient <strong>{lastRegisteredName}</strong> has been assigned to primary clinician care, and a secure medical record file has been created.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="px-5 py-2.5 bg-slate-800 dark:bg-teal-650 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition select-none cursor-pointer"
          >
            Board Another Patient
          </button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-2xl shadow-2xs space-y-6">
          
          {formError && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 text-red-755 dark:text-red-400 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Patient Demographics block */}
          <div className="space-y-4 text-xs text-slate-655 dark:text-slate-400">
            <h3 className="font-extrabold text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">1. Patient Demographics</h3>
            
            <div>
              <label className="block font-bold mb-1.5 text-slate-605 dark:text-slate-400">{t('fullName')}</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-405">
                  <User className="h-4.5 w-4.5" />
                </span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:border-teal-500 dark:focus:border-teal-400 focus:bg-white dark:focus:bg-slate-900 transition font-sans text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold mb-1.5 text-slate-605 dark:text-slate-400">{t('genderLabel')}</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 dark:bg-slate-850 text-slate-850 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:border-teal-500 dark:focus:border-teal-400 focus:bg-white dark:focus:bg-slate-900 transition font-sans cursor-pointer text-xs"
                >
                  <option value="Male">{t('genderMale')}</option>
                  <option value="Female">{t('genderFemale')}</option>
                  <option value="Other">{t('genderOther')}</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1.5 text-slate-605 dark:text-slate-400">{t('dobLabel')}</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-405 pointer-events-none">
                    <Calendar className="h-4 w-4" />
                  </span>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 dark:bg-slate-850 text-slate-850 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:border-teal-500 dark:focus:border-teal-400 focus:bg-white dark:focus:bg-slate-900 transition font-sans text-xs"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold mb-1.5 text-slate-605 dark:text-slate-400">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-405">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g. eleanor@vance-house.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:border-teal-500 dark:focus:border-teal-400 focus:bg-white dark:focus:bg-slate-900 transition font-sans text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1.5 text-slate-605 dark:text-slate-400">{t('directContactPhone')}</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-455">
                    <Phone className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. +1 (555) 7592"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:border-teal-500 dark:focus:border-teal-400 focus:bg-white dark:focus:bg-slate-900 transition font-sans text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Allocation block */}
          <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-5 text-xs">
            <h3 className="font-extrabold text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">2. Clinical Assignment</h3>
            
            {doctors.length === 0 ? (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 rounded-xl font-bold flex items-center gap-2">
                <AlertCircle className="h-4.5 w-4.5 text-amber-600" />
                <span>{t('noDoctorsAvailable')}</span>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block font-bold mb-1 text-slate-655 dark:text-slate-400">{t('assignedDoc')}</label>
                <select
                  name="assigned_doctor_id"
                  value={formData.assigned_doctor_id}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 dark:bg-slate-850 text-slate-850 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:border-teal-500 dark:focus:border-teal-400 focus:bg-white dark:focus:bg-slate-900 transition font-sans cursor-pointer text-xs"
                >
                  {doctors.map(doc => (
                    <option key={doc.id} value={doc.id}>{doc.name} ({doc.specialty})</option>
                  ))}
                </select>

                <div className="p-3.5 bg-slate-50/80 dark:bg-slate-850/60 rounded-xl border border-slate-150/40 dark:border-slate-800 flex items-center gap-2 mt-2 text-slate-500 dark:text-slate-350 leading-relaxed font-sans font-medium text-[11px]">
                  <Stethoscope className="h-4 w-4 text-teal-605" />
                  <div>
                    <span className="font-bold text-slate-700 dark:text-white uppercase text-[10px] block mb-0.5">Primary Clinician Allocation</span>
                    <span>{getSelectedDoctorDetails()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={formLoading || doctors.length === 0}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-900 dark:bg-teal-650 dark:hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer text-center select-none"
            >
              {formLoading ? 'Processing Registrations...' : t('submitIntake')}
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
