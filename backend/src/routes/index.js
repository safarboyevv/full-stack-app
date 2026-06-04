import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';

// Controller imports
import * as authController from '../controllers/authController.js';
import * as clinicalController from '../controllers/clinicalController.js';
import * as diseaseController from '../controllers/diseaseController.js';
import * as doctorController from '../controllers/doctorController.js';
import * as patientController from '../controllers/patientController.js';
import * as registrationController from '../controllers/registrationController.js';
import * as reportController from '../controllers/reportController.js';

const router = express.Router();

// ==========================================
// SYSTEM TELEMETRY & REPORTING ROUTES
// ==========================================
router.get('/db-status', clinicalController.getDatabaseStatus);
router.get('/clinical/summary', authenticateToken, clinicalController.getClinicalSummary);
router.get('/reports/patient/:id', authenticateToken, reportController.getPatientClinicalReport);
router.get('/reports/diagnoses', authenticateToken, reportController.getDiagnosisReportMetrics);

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================
router.post('/auth/register', authController.registerUser);
router.post('/auth/login', authController.loginUser);
router.post('/auth/refresh', authController.refreshToken);
router.get('/auth/me', authenticateToken, authController.getProfile);

// ==========================================
// CLINICAL DOCTORS CRUD
// ==========================================
router.get('/doctors', authenticateToken, doctorController.getDoctors);
router.post('/doctors', authenticateToken, requireRole(['Administrator']), doctorController.createDoctor);
router.put('/doctors/:id', authenticateToken, requireRole(['Administrator']), doctorController.updateDoctor);
router.delete('/doctors/:id', authenticateToken, requireRole(['Administrator']), doctorController.deleteDoctor);

// ==========================================
// CLINICAL PATIENTS CRUD & ONBOARDING
// ==========================================
router.get('/patients', authenticateToken, patientController.getPatients);
router.get('/patients/:id', authenticateToken, patientController.getPatientById);
router.post('/patients', authenticateToken, requireRole(['Administrator', 'Receptionist']), registrationController.registerPatient);
router.put('/patients/:id', authenticateToken, requireRole(['Administrator', 'Clinician']), patientController.updatePatient);
router.delete('/patients/:id', authenticateToken, requireRole(['Administrator']), patientController.deletePatient);

// ==========================================
// CLINICAL DIAGNOSES / DISEASES CRUD
// ==========================================
router.get('/diagnoses', authenticateToken, requireRole(['Administrator', 'Clinician']), diseaseController.getDiagnoses);
router.post('/diagnoses', authenticateToken, requireRole(['Administrator', 'Clinician']), diseaseController.createDiagnosis);
router.put('/diagnoses/:id', authenticateToken, requireRole(['Administrator', 'Clinician']), diseaseController.updateDiagnosis);
router.delete('/diagnoses/:id', authenticateToken, requireRole(['Administrator']), diseaseController.deleteDiagnosis);

export default router;
