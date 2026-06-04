import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Search,
  User,
  Mail,
  Phone,
  Calendar,
  Edit2,
  Trash2,
  X,
  Users,
  AlertCircle,
  Eye,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import PatientProfileModal from "./PatientProfileModal.jsx";

export default function PatientManagement() {
  const { user, authFetch } = useAuth();
  const { t } = useLanguage();

  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("");
  const [loading, setLoading] = useState(false);

  // Profile modal state
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  // Intake/Edit demographic form states
  const [showDemographicsModal, setShowDemographicsModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "Male",
    dob: "",
    assigned_doctor_id: "",
    status: "Active",
  });
  const [formError, setFormError] = useState("");

  // RBAC permissions checks
  const isAdmin = user && user.role === "Administrator";
  const isClinician = user && user.role === "Clinician";
  const isReceptionist = user && user.role === "Receptionist";

  const canRegister = isAdmin || isReceptionist;
  const canUpdate = isAdmin || isClinician;
  const canDelete = isAdmin;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [patsRes, docsRes] = await Promise.all([
        authFetch("/api/patients"),
        authFetch("/api/doctors"),
      ]);

      if (patsRes.ok) {
        const patsData = await patsRes.json();
        setPatients(patsData);
        setFilteredPatients(patsData);
      }
      if (docsRes.ok) {
        const docsData = await docsRes.json();
        setDoctors(docsData);
      }
    } catch (err) {
      console.error("Data loading failure inside patients directory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtering logics
  useEffect(() => {
    let result = [...patients];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          (p.name || "").toLowerCase().includes(q) ||
          (p.email || "").toLowerCase().includes(q) ||
          (p.phone || "").toLowerCase().includes(q),
      );
    }
    if (statusFilter) {
      result = result.filter((p) => p.status === statusFilter);
    }
    if (doctorFilter) {
      result = result.filter(
        (p) => p.assigned_doctor_id === parseInt(doctorFilter, 10),
      );
    }
    setFilteredPatients(result);
  }, [searchQuery, statusFilter, doctorFilter, patients]);

  const handleOpenRegisterMode = () => {
    if (!canRegister) return;
    setFormData({
      name: "",
      email: "",
      phone: "",
      gender: "Male",
      dob: "",
      assigned_doctor_id: doctors.length > 0 ? doctors[0].id.toString() : "",
      status: "Active",
    });
    setEditId(null);
    setFormError("");
    setShowDemographicsModal(true);
  };

  const handleOpenEditMode = (patient, e) => {
    e.stopPropagation();
    if (!canUpdate) return;
    setFormData({
      name: patient.name || "",
      email: patient.email || "",
      phone: patient.phone || "",
      gender: patient.gender || "Male",
      dob: patient.dob ? patient.dob.substring(0, 10) : "",
      assigned_doctor_id: patient.assigned_doctor_id
        ? patient.assigned_doctor_id.toString()
        : "",
      status: patient.status || "Active",
    });
    setEditId(patient.id);
    setFormError("");
    setShowDemographicsModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSavePatient = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.gender || !formData.dob) {
      setFormError("Patient Name, Gender, and DOB are mandatory fields.");
      return;
    }
    setFormError("");
    setLoading(true);

    try {
      let res;
      const submission = {
        ...formData,
        assigned_doctor_id: formData.assigned_doctor_id
          ? parseInt(formData.assigned_doctor_id, 10)
          : null,
      };

      if (editId) {
        res = await authFetch(`/api/patients/${editId}`, {
          method: "PUT",
          body: JSON.stringify(submission),
        });
      } else {
        res = await authFetch("/api/patients", {
          method: "POST",
          body: JSON.stringify(submission),
        });
      }

      if (res.ok) {
        setShowDemographicsModal(false);
        fetchData();
      } else {
        const errorRep = await res.json();
        setFormError(errorRep.error || "Failed to save patient details.");
      }
    } catch (err) {
      setFormError("Clinical server communications are currently offline.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePatient = async (id, name, e) => {
    e.stopPropagation();
    if (!canDelete) return;

    if (
      !window.confirm(
        `Are you absolutely sure you want to delete patient "${name}" and all historical diagnoses connected to them? This cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      const res = await authFetch(`/api/patients/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchData();
      } else {
        alert("Deletion rejected by server permissions control.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getDoctorName = (id) => {
    const d = doctors.find((doc) => doc.id === id);
    return d ? d.name : t("unassigned");
  };

  return (
    <div id="patients-management-canvas" className="space-y-6">
      {/* Module Title controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-6 bg-white dark:bg-[#14232c] rounded-2xl border border-med-border dark:border-slate-800 shadow-xs">
        <div>
          <span className="text-[10px] text-med-mint font-bold uppercase tracking-widest font-mono">
            Registry Directories
          </span>
          <h2 className="text-2xl font-black text-med-teal dark:text-white font-sans tracking-tight mt-0.5">
            {t("patientsDirectory") || "Patients Clinical Dossier"}
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-400 mt-1">
            {t("patientsSub") ||
              "Manage patient directories, assign primary doctors, and review active monitoring timeline."}
          </p>
        </div>

        {canRegister && (
          <button
            onClick={handleOpenRegisterMode}
            className="bg-med-mint hover:bg-med-mint-hover text-white font-bold py-3 px-5 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-med-mint/10 shrink-0 font-sans"
          >
            <Plus className="h-4.5 w-4.5" />{" "}
            {t("addPatientRecord") || "Register Intake Patient"}
          </button>
        )}
      </div>

      {/* Advanced filters segment */}
      <div className="flex flex-col md:flex-row items-stretch gap-4 bg-white dark:bg-[#14232c] border border-med-border dark:border-slate-800 p-4 rounded-2xl shadow-xs">
        <div className="relative flex-grow min-w-0">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#A0AEC0] pointer-events-none">
            <Search className="h-4.5 w-4.5" />
          </span>
          <input
            type="text"
            placeholder={
              t("searchPatients") || "Search patients by name, email, phone..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50/50 dark:bg-slate-850 text-[#1e3a45] dark:text-slate-100 text-xs pl-10 pr-4 py-2.5 border border-med-border dark:border-slate-800 rounded-xl focus:outline-none focus:border-med-mint focus:bg-white dark:focus:bg-slate-900 transition font-sans"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:flex shrink-0">
          <div className="relative min-w-[140px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50/50 dark:bg-slate-850 text-med-teal dark:text-slate-100 text-xs px-3.5 py-3 border border-med-border dark:border-slate-800 rounded-xl focus:outline-none focus:border-med-mint hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer font-sans"
            >
              <option value="">{t("allStatuses") || "All Statuses"}</option>
              <option value="Active">{t("activeStatus") || "Active"}</option>
              <option value="Inactive">
                {t("inactiveStatus") || "Inactive"}
              </option>
            </select>
          </div>

          <div className="relative min-w-[180px]">
            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="w-full bg-slate-50/50 dark:bg-slate-850 text-med-teal dark:text-slate-100 text-xs px-3.5 py-3 border border-med-border dark:border-slate-800 rounded-xl focus:outline-none focus:border-med-mint hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer font-sans"
            >
              <option value="">
                {t("appointedDoctor") || "Filter Primary Doctor"}
              </option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid Patient Directory List */}
      {loading && patients.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-med-border dark:border-slate-800">
          <div className="animate-spin inline-block w-6 h-6 border-3 border-med-mint border-t-transparent rounded-full mb-3"></div>
          <p className="text-xs text-slate-400 dark:text-slate-400 font-sans">
            {t("loadingRegistry")}
          </p>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-[#14232c] rounded-2xl border border-med-border dark:border-slate-800 shadow-xs">
          <Users className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3 animate-[pulse_2s_infinite]" />
          <h4 className="text-sm font-black text-med-teal dark:text-slate-300">
            {t("noPatientsFound") || "No patients match files directory"}
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Try resetting filter configurations or registering a new clinical
            index dossier.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <motion.div
              key={patient.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedPatientId(patient.id)}
              className="bento-card p-6 cursor-pointer flex flex-col justify-between group relative border border-med-border dark:border-slate-800 rounded-2xl bg-white dark:bg-[#14232c] shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 text-med-mint rounded-xl border border-med-border dark:border-slate-750">
                    <User className="h-5 w-5 hover:scale-105 transition" />
                  </div>

                  <div
                    className="flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setSelectedPatientId(patient.id)}
                      title={t("patientDetails")}
                      className="p-2 text-slate-400 hover:text-med-mint dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl transition cursor-pointer"
                    >
                      <Eye className="h-4.5 w-4.5" />
                    </button>
                    {canUpdate && (
                      <button
                        onClick={(e) => handleOpenEditMode(patient, e)}
                        title={t("edit")}
                        className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={(e) =>
                          handleDeletePatient(patient.id, patient.name, e)
                        }
                        title={t("delete")}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-med-teal dark:text-slate-100 group-hover:text-med-mint dark:group-hover:text-teal-450 transition truncate max-w-[140px] font-sans">
                      {patient.name}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[8px] font-bold tracking-wider uppercase border ${
                        patient.status === "Active"
                          ? "bg-emerald-50 text-[#0D9488] border-emerald-100 dark:bg-teal-950/20 dark:border-teal-900/50"
                          : "bg-zinc-50 text-zinc-500 border-zinc-200 dark:bg-slate-850 dark:border-slate-800"
                      }`}
                    >
                      {patient.status === "Active"
                        ? t("activeStatus")
                        : t("inactiveStatus")}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
                    ID: CT-{patient.id.toString().padStart(4, "0")} •{" "}
                    {patient.gender === "Male"
                      ? t("genderMale")
                      : patient.gender === "Female"
                        ? t("genderFemale")
                        : t("genderOther")}
                  </p>
                </div>

                <div className="mt-5 space-y-2 border-t border-slate-100 dark:border-slate-800/80 pt-4 text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2.5 font-sans">
                    <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>
                      DOB: {patient.dob ? patient.dob.substring(0, 10) : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 font-sans truncate">
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{patient.email || "None"}</span>
                  </div>
                  <div className="flex items-center gap-2.5 font-sans">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{patient.phone || "None"}</span>
                  </div>
                </div>
              </div>

              {/* Patient allocation footer info */}
              <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
                <span className="font-sans font-semibold">
                  Assigned Care Specialist:
                </span>
                <span className="font-bold text-med-mint dark:text-[#0D9488] truncate max-w-[140px] flex items-center gap-0.5">
                  {getDoctorName(patient.assigned_doctor_id)}
                  <ChevronRight className="h-3 w-3 shrink-0" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Comprehensive patient detailed slider modal panel for ICD disease timelines */}
      <AnimatePresence>
        {selectedPatientId && (
          <PatientProfileModal
            patientId={selectedPatientId}
            onClose={() => setSelectedPatientId(null)}
          />
        )}
      </AnimatePresence>

      {/* Demographics Registration/Modifying editor modal view */}
      <AnimatePresence>
        {showDemographicsModal && (
          <div
            id="demographics-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#14232c] border border-med-border dark:border-slate-800 rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-5 border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-black text-med-teal dark:text-white text-xs font-sans flex items-center gap-2 uppercase tracking-wide leading-none">
                  <User className="h-4.5 w-4.5 text-med-mint" />
                  {editId
                    ? "Update Patient Profile Dossier"
                    : "Register Intake Profile Index"}
                </h3>
                <button
                  onClick={() => setShowDemographicsModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-rose-950/20 border border-red-100 text-red-700 dark:text-red-400 rounded-xl text-[11px] flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form
                onSubmit={handleSavePatient}
                className="space-y-4 text-xs text-slate-600"
              >
                <div>
                  <label className="block font-bold mb-1.5 text-slate-600 dark:text-slate-400">
                    Patient Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="e.g. Martha Stewart"
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 border border-med-border dark:border-slate-800 rounded-xl focus:outline-none focus:border-med-mint focus:bg-white dark:focus:bg-slate-900 transition font-sans text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1.5 text-slate-600 dark:text-slate-400">
                      {t("genderLabel")}
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleFormChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50/50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 border border-med-border dark:border-slate-800 rounded-xl focus:outline-none focus:border-med-mint focus:bg-white dark:focus:bg-slate-900 transition font-sans text-xs cursor-pointer"
                    >
                      <option value="Male">{t("genderMale")}</option>
                      <option value="Female">{t("genderFemale")}</option>
                      <option value="Other">{t("genderOther")}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold mb-1.5 text-slate-600 dark:text-slate-400">
                      {t("dobLabel")}
                    </label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleFormChange}
                      className="w-full px-2 py-2.5 bg-slate-50/50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 border border-med-border dark:border-slate-800 rounded-xl focus:outline-none focus:border-med-mint focus:bg-white dark:focus:bg-slate-900 transition font-sans text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1.5 text-slate-600 dark:text-slate-400">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      placeholder="e.g. client@example.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50/50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 border border-med-border dark:border-slate-800 rounded-xl focus:outline-none focus:border-med-mint focus:bg-white dark:focus:bg-slate-900 transition font-sans text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1.5 text-slate-600 dark:text-slate-400">
                      {t("directContactPhone")}
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      placeholder="e.g. +1 (555) 0124"
                      className="w-full px-3.5 py-2.5 bg-slate-50/50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 border border-med-border dark:border-slate-800 rounded-xl focus:outline-none focus:border-med-mint focus:bg-white dark:focus:bg-slate-900 transition font-sans text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1.5 text-slate-600 dark:text-slate-400">
                      {t("assignedDoc")}
                    </label>
                    <select
                      name="assigned_doctor_id"
                      value={formData.assigned_doctor_id}
                      onChange={handleFormChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50/50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 border border-med-border dark:border-slate-800 rounded-xl focus:outline-none focus:border-med-mint focus:bg-white dark:focus:bg-slate-900 transition font-sans text-xs cursor-pointer"
                    >
                      <option value="">{t("unassigned")}</option>
                      {doctors.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold mb-1.5 text-slate-600 dark:text-slate-400">
                      Admissions Roster Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleFormChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50/50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 border border-med-border dark:border-slate-800 rounded-xl focus:outline-none focus:border-med-mint focus:bg-white dark:focus:bg-slate-900 transition font-sans text-xs cursor-pointer"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-850">
                  <button
                    type="button"
                    onClick={() => setShowDemographicsModal(false)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition font-sans font-bold cursor-pointer text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#1e3a45] dark:bg-med-mint hover:bg-slate-900 dark:hover:bg-med-mint-hover text-white font-bold rounded-xl transition shadow-xs text-xs cursor-pointer"
                  >
                    {editId ? "Update File" : "Register Intake"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
