-- ====================================================================
-- CARETRACK CLINIC MEDICAL RECORD MANAGEMENT SYSTEM (MRMS)
-- DATABASE SCHEMA DEFINITION (PostgreSQL Compatible DDL)
-- ====================================================================

-- DROP TABLES IF EXISTS (Avoid collision on script execution)
DROP TABLE IF EXISTS diagnoses CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. USERS TABLE: Active clinical roles (Administrator, Clinician, Receptionist)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Administrator', 'Clinician', 'Receptionist')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. CLINICAL DOCTORS TABLE: Directory of specialists and general practitioners
CREATE TABLE doctors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    specialty VARCHAR(150) NOT NULL,
    department VARCHAR(150) NOT NULL,
    phone VARCHAR(50) DEFAULT '',
    schedule VARCHAR(255) DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. CLINICAL PATIENTS TABLE: Core medical indexes
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) DEFAULT '',
    phone VARCHAR(50) DEFAULT '',
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    dob DATE NOT NULL,
    assigned_doctor_id INTEGER REFERENCES doctors(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. DIAGNOSES TABLE: Detailed clinical diagnosis mapping ICD categorizations
CREATE TABLE diagnoses (
    id SERIAL PRIMARY KEY,
    icd_code VARCHAR(30) NOT NULL,
    description VARCHAR(255) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('Mild', 'Moderate', 'Severe')),
    diagnosed_date DATE NOT NULL,
    notes TEXT DEFAULT '',
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- INDEX OPTIMIZATIONS FOR HIGH-SPEED CLINICAL LOOKUPS
-- ====================================================================
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_doctors_specialty ON doctors(specialty);
CREATE INDEX idx_patients_assigned_doctor_id ON patients(assigned_doctor_id);
CREATE INDEX idx_diagnoses_patient_id ON diagnoses(patient_id);
CREATE INDEX idx_diagnoses_icd_code ON diagnoses(icd_code);

-- ====================================================================
-- SEED INITIAL CLINICAL STAFF & DOCKING DIRECTORIES
-- ====================================================================

-- Seeding Default Users (Default password is "password" pre-hashed)
INSERT INTO users (username, password, role) VALUES
('admin', '$2a$10$U6U.9W.n.2NptvJmG.0vWeSgZRE5JInLCO2O3R/g6Zsc0T4pS1Oia', 'Administrator'),
('clinician', '$2a$10$U6U.9W.n.2NptvJmG.0vWeSgZRE5JInLCO2O3R/g6Zsc0T4pS1Oia', 'Clinician'),
('receptionist', '$2a$10$U6U.9W.n.2NptvJmG.0vWeSgZRE5JInLCO2O3R/g6Zsc0T4pS1Oia', 'Receptionist');

-- Seeding Doctor Profiles
INSERT INTO doctors (id, name, specialty, department, phone, schedule) VALUES
(1, 'Dr. Sarah Jenkins', 'Cardiology', 'Cardiology Dept', '+1 (555) 0192', 'Mon-Wed, 9:00 AM - 4:00 PM'),
(2, 'Dr. Robert Chen', 'Neurology', 'Neurology Dept', '+1 (555) 0148', 'Tue-Thu, 10:00 AM - 5:00 PM'),
(3, 'Dr. Elena Rostova', 'Dermatology', 'Dermatology Dept', '+1 (555) 0173', 'Mon, Fri, 8:00 AM - 12:00 PM'),
(4, 'Dr. Marcus Vance', 'Orthopaedics', 'Surgical Ortho', '+1 (555) 0129', 'Wed-Fri, 1:00 PM - 5:00 PM');

-- Seeding Patient Files
INSERT INTO patients (id, name, email, phone, gender, dob, assigned_doctor_id, status) VALUES
(1, 'John Doe', 'john.doe@example.com', '+1 (555) 0214', 'Male', '1985-05-12', 1, 'Active'),
(2, 'Alice Smith', 'alice.smith@example.com', '+1 (555) 0394', 'Female', '1992-11-23', 2, 'Active'),
(3, 'Robert Taylor', 'robert.taylor@example.com', '+1 (555) 0487', 'Male', '1960-02-28', 4, 'Inactive');

-- Seeding Patient Diagnoses
INSERT INTO diagnoses (id, icd_code, description, severity, diagnosed_date, notes, patient_id) VALUES
(1, 'I10', 'Essential (primary) hypertension', 'Moderate', '2026-01-15', 'Patient reported recurring headaches. Blood pressure consistently elevated.', 1),
(2, 'G43.9', 'Migraine, unspecified', 'Severe', '2026-02-10', 'Prescribed sumatriptan. Advised lifestyle modifications.', 2),
(3, 'M17.9', 'Osteoarthritis of knee, unspecified', 'Mild', '2026-03-05', 'Early stage wear and tear of right knee. Suggested physical therapy.', 3);

-- Synchronize serial sequence keys for clean auto-increment behavior
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('doctors_id_seq', (SELECT MAX(id) FROM doctors));
SELECT setval('patients_id_seq', (SELECT MAX(id) FROM patients));
SELECT setval('diagnoses_id_seq', (SELECT MAX(id) FROM diagnoses));
