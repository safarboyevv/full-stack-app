import { db } from '../config/db.js';
import { formatPatientId } from '../utils/helpers.js';

/**
 * Compiles a structured, comprehensive clinical record report for a patient.
 */
export const getPatientClinicalReport = async (req, res) => {
  const patientId = parseInt(req.params.id, 10);
  try {
    const patientResult = await db.query('SELECT * FROM patients WHERE id = $1', [patientId]);
    if (patientResult.rows.length === 0) {
      return res.status(404).json({ error: 'Patient file index not found.' });
    }
    const patient = patientResult.rows[0];

    // Fetch primary doctor's profile
    let doctor = null;
    if (patient.assigned_doctor_id) {
      const doctorResult = await db.query('SELECT * FROM doctors WHERE id = $1', [patient.assigned_doctor_id]);
      if (doctorResult.rows.length > 0) {
        doctor = doctorResult.rows[0];
      }
    }

    // Fetch diagnoses
    const diagnosesResult = await db.query(
      'SELECT * FROM diagnoses WHERE patient_id = $1 ORDER BY diagnosed_date DESC',
      [patientId]
    );

    // Calculations & metrics for professional insights
    const severityDistribution = diagnosesResult.rows.reduce((acc, diag) => {
      acc[diag.severity] = (acc[diag.severity] || 0) + 1;
      return acc;
    }, {});

    const report = {
      generatedAt: new Date(),
      status: "Official Record Summary",
      metadata: {
        recordCode: formatPatientId(patient.id),
        patientName: patient.name,
        gender: patient.gender,
        dob: patient.dob,
        status: patient.status
      },
      assignedPhysician: doctor ? {
        name: doctor.name,
        specialty: doctor.specialty,
        department: doctor.department
      } : "No Primary Physician Allocated",
      diagnosesSummarized: diagnosesResult.rows.map(d => ({
        id: d.id,
        icd: d.icd_code,
        diagnosis: d.description,
        complexity: d.severity,
        diagnosed: d.diagnosed_date,
        clinicalNotes: d.notes
      })),
      telemetryInsights: {
        totalDiagnosesCount: diagnosesResult.rows.length,
        severityDistribution,
        suggestedObservationFrequency: diagnosesResult.rows.some(d => d.severity === 'Severe') 
          ? 'Weekly High-Priority Follow-up Required' 
          : 'Standard Standard Intake Follow-up'
      }
    };

    res.status(200).json(report);
  } catch (err) {
    console.error('Failed to generate patient clinical report summary:', err);
    res.status(500).json({ error: 'Server error compiling automated clinical progress report.' });
  }
};

/**
 * Returns generic clinic-wide diagnosis stats distribution.
 */
export const getDiagnosisReportMetrics = async (req, res) => {
  try {
    const diagnosesResult = await db.query('SELECT icd_code, description, COUNT(*) as occurs FROM diagnoses GROUP BY icd_code, description ORDER BY occurs DESC');
    res.status(200).json({
      timestamp: new Date(),
      distribution: diagnosesResult.rows.map(row => ({
        icd: row.icd_code,
        diseaseName: row.description,
        frequency: parseInt(row.occurs || '0', 10)
      }))
    });
  } catch (err) {
    console.error('Failed to resolve clinic-wide diagnostics distribution report:', err);
    res.status(500).json({ error: 'Failed to compile analytical clinic-wide reports.' });
  }
};
