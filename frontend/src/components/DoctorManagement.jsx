import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Search,
  Filter,
  Phone,
  Calendar,
  Edit2,
  Trash2,
  X,
  Stethoscope,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";

export default function DoctorManagement() {
  const { user, authFetch } = useAuth();
  const { t } = useLanguage();

  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal Form State
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    specialty: "Cardiology",
    department: "Cardiology Dept",
    phone: "",
    schedule: "",
  });
  const [formError, setFormError] = useState("");

  const isAdmin = user && user.role === "Administrator";

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/doctors");
      if (res.ok) {
        const data = await res.json();
        setDoctors(data);
        setFilteredDoctors(data);
      }
    } catch (err) {
      console.error("Error fetching clinician records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Search and Filter updates
  useEffect(() => {
    let result = [...doctors];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          (d.name || "").toLowerCase().includes(query) ||
          (d.specialty || "").toLowerCase().includes(query) ||
          (d.department || "").toLowerCase().includes(query),
      );
    }
    if (selectedSpecialty) {
      result = result.filter(
        (d) =>
          (d.specialty || "").toLowerCase() === selectedSpecialty.toLowerCase(),
      );
    }
    setFilteredDoctors(result);
  }, [searchQuery, selectedSpecialty, doctors]);

  // Unique list of specialties
  const specialtiesList = [
    ...new Set(doctors.map((d) => d.specialty).filter(Boolean)),
  ];

  const handleOpenCreateMode = () => {
    setFormData({
      name: "",
      specialty: "Cardiology",
      department: "Cardiology Dept",
      phone: "",
      schedule: "",
    });
    setEditId(null);
    setFormError("");
    setShowModal(true);
  };

  const handleOpenEditMode = (doctor) => {
    setFormData({
      name: doctor.name || "",
      specialty: doctor.specialty || "Cardiology",
      department: doctor.department || "",
      phone: doctor.phone || "",
      schedule: doctor.schedule || "",
    });
    setEditId(doctor.id);
    setFormError("");
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveDoctor = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.specialty || !formData.department) {
      setFormError(
        "Clinical Name, Specialty, and Department fields are mandatory.",
      );
      return;
    }
    setFormError("");

    try {
      let res;
      if (editId) {
        res = await authFetch(`/api/doctors/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        res = await authFetch("/api/doctors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      if (res.ok) {
        setShowModal(false);
        fetchDoctors();
      } else {
        const errData = await res.json();
        setFormError(errData.error || "Failed to persist doctor record.");
      }
    } catch (err) {
      setFormError("Clinical server communication failed.");
    }
  };

  const handleDeleteDoctor = async (id) => {
    if (
      !window.confirm(
        "Are you absolutely sure you want to delete this clinician profile from the system? The change cannot be undone.",
      )
    ) {
      return;
    }
    try {
      const res = await authFetch(`/api/doctors/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchDoctors();
      } else {
        alert("Could not complete deletion due to active role constraints.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div id="doctors-mgmt-container" className="space-y-6">
      {/* Top Banner Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-6 bg-white dark:bg-[#14232c] rounded-2xl border border-med-border dark:border-slate-800 shadow-xs">
        <div>
          <span className="text-[10px] text-med-mint font-bold uppercase tracking-widest font-mono">
            Medical Resources
          </span>
          <h2 className="text-2xl font-black text-med-teal dark:text-white font-sans tracking-tight mt-0.5">
            {t("medicalClinicians") || "Clinical Staff Directory"}
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-400 mt-1">
            {t("clinicianSub") ||
              "Manage practitioner credentials, room allocations, and weekly duty schedules."}{" "}
            {isAdmin && `(${t("adminOnly") || "Admin Authorized"})`}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenCreateMode}
            className="bg-med-mint hover:bg-med-mint-hover text-white font-bold py-3 px-5 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-med-mint/10 shrink-0 font-sans"
          >
            <Plus className="h-4.5 w-4.5" />{" "}
            {t("addSpecialist") || "Add Care Practitioner"}
          </button>
        )}
      </div>

      {/* Searching & Filtering controls */}
      <div className="flex flex-col sm:flex-row items-stretch gap-4 bg-white dark:bg-[#14232c] border border-med-border dark:border-slate-800 p-4 rounded-2xl shadow-xs">
        <div className="relative flex-grow min-w-0">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#A0AEC0] pointer-events-none">
            <Search className="h-4.5 w-4.5" />
          </span>
          <input
            type="text"
            placeholder={
              t("searchDoctors") ||
              "Search doctors by name, specialty, or room..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50/50 dark:bg-slate-850 text-[#1e3a45] dark:text-slate-100 text-xs pl-10 pr-4 py-2.5 border border-med-border dark:border-slate-800 rounded-xl focus:outline-none focus:border-med-mint focus:bg-white dark:focus:bg-slate-900 transition font-sans"
          />
        </div>

        <div className="relative min-w-[200px] shrink-0">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#A0AEC0] pointer-events-none">
            <Filter className="h-4 w-4" />
          </span>
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="w-full bg-slate-50/50 dark:bg-slate-850 text-med-teal dark:text-slate-100 text-xs pl-10 pr-8 py-3 border border-med-border dark:border-slate-800 rounded-xl appearance-none focus:outline-none focus:border-med-mint focus:bg-white dark:focus:bg-slate-900 transition cursor-pointer font-sans"
          >
            <option value="">
              {t("allSpecialties") || "Filter Specialty"}
            </option>
            {specialtiesList.map((spec, idx) => (
              <option key={idx} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid View */}
      {loading && doctors.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-med-border dark:border-slate-800">
          <div className="animate-spin inline-block w-6 h-6 border-3 border-med-mint border-t-transparent rounded-full mb-3"></div>
          <p className="text-xs text-slate-400 dark:text-slate-400 font-sans">
            {t("loadingRegistry")}
          </p>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-[#14232c] rounded-2xl border border-med-border dark:border-slate-800 shadow-xs">
          <Stethoscope className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h4 className="text-sm font-black text-med-teal dark:text-slate-300">
            {t("noCliniciansFound") || "No medical clinicians match listing"}
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Verify filters or invite professional care units.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDoctors.map((doctor) => (
            <motion.div
              key={doctor.id}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              withExitAnimation={false}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-[#14232c] border border-med-border dark:border-slate-800 p-6 flex flex-col justify-between group relative rounded-2xl shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex bg-slate-50 dark:bg-slate-800 border border-med-border dark:border-slate-750 rounded-xl p-3 text-med-mint">
                    <Stethoscope className="h-5 w-5" />
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditMode(doctor)}
                        title={t("edit")}
                        className="p-2 text-slate-400 hover:text-med-teal hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteDoctor(doctor.id)}
                        title={t("delete")}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-black text-med-teal dark:text-slate-100 group-hover:text-med-mint transition tracking-tight font-sans">
                    {doctor.name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                    <span className="px-2 py-0.5 bg-teal-50 dark:bg-teal-950/20 text-[#0D9488] border border-teal-100/35 rounded-md text-[10px] font-bold">
                      {doctor.specialty}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60 rounded-md text-[10px] font-medium font-sans">
                      {doctor.department}
                    </span>
                  </div>
                </div>

                <div className="mt-5 space-y-2 border-t border-slate-100 dark:border-slate-800/80 pt-4 text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2.5 font-sans">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="font-medium">
                      {doctor.phone || "No direct phone recorded"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 font-sans">
                    <Calendar className="h-3.5 w-3.5 shrink-0 text-med-mint" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {doctor.schedule || "Schedules unspecified"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add / Edit Doctor Pop-up Modal Panel */}
      <AnimatePresence>
        {showModal && (
          <div
            id="doctor-modal-backdrop"
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
            style={{ zIndex: 9999 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="bg-white dark:bg-[#14232c] border border-med-border dark:border-slate-800 rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto shadow-2xl relative z-50"
            >
              <div className="flex items-center justify-between mb-5 border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-med-teal dark:text-white text-xs font-sans flex items-center gap-2 uppercase tracking-wide">
                  <Stethoscope className="h-4.5 w-4.5 text-med-mint" />
                  {editId
                    ? "Update Staff Profile"
                    : "Register Clinician Practitioner"}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-rose-950/20 border border-red-100 text-red-750 dark:text-red-400 rounded-xl text-[11px] flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form
                onSubmit={handleSaveDoctor}
                className="space-y-4 text-xs text-slate-600"
              >
                <div>
                  <label className="block font-bold mb-1.5 text-slate-600 dark:text-slate-400">
                    Practitioner Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleFormChange}
                    placeholder="e.g. Dr. Arthur Pendelton"
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 border border-med-border dark:border-slate-800 rounded-xl focus:outline-none focus:border-med-mint focus:bg-white dark:focus:bg-slate-900 transition font-sans text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1.5 text-slate-600 dark:text-slate-400">
                      Discipline
                    </label>
                    <select
                      name="specialty"
                      value={formData.specialty || "Cardiology"}
                      onChange={handleFormChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50/50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 border border-med-border dark:border-slate-800 rounded-xl focus:outline-none focus:border-med-mint focus:bg-white dark:focus:bg-slate-900 transition font-sans text-xs cursor-pointer"
                    >
                      <option value="Cardiology">Cardiology</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Dermatology">Dermatology</option>
                      <option value="Orthopaedics">Orthopaedics</option>
                      <option value="General Practice">General Practice</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold mb-1.5 text-slate-600 dark:text-slate-400">
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department || ""}
                      onChange={handleFormChange}
                      placeholder="e.g. Neurology Wing"
                      className="w-full px-3.5 py-2.5 bg-slate-50/50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 border border-med-border dark:border-slate-800 rounded-xl focus:outline-none focus:border-med-mint focus:bg-white dark:focus:bg-slate-900 transition font-sans text-xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-1.5 text-slate-600 dark:text-slate-400">
                    Direct Contact Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleFormChange}
                    placeholder="e.g. +1 (555) 0184"
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 border border-med-border dark:border-slate-800 rounded-xl focus:outline-none focus:border-med-mint focus:bg-white dark:focus:bg-slate-900 transition font-sans text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1.5 text-slate-600 dark:text-slate-400">
                    Duty Shift Schedule
                  </label>
                  <input
                    type="text"
                    name="schedule"
                    value={formData.schedule || ""}
                    onChange={handleFormChange}
                    placeholder="e.g. Tue-Thu, 8:00 AM - 3:00 PM"
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 border border-med-border dark:border-slate-800 rounded-xl focus:outline-none focus:border-med-mint focus:bg-white dark:focus:bg-slate-900 transition font-sans text-xs"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-850">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition font-sans font-bold cursor-pointer text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-slate-800 dark:bg-med-mint hover:bg-slate-900 dark:hover:bg-med-mint-hover text-white font-bold rounded-xl transition shadow-xs cursor-pointer text-xs"
                  >
                    {editId ? "Update File" : "Register Clinician"}
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
