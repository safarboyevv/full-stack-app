import { db } from '../config/db.js';

export const getDiagnoses = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM diagnoses ORDER BY diagnosed_date DESC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Fetch diagnoses directory failure:', err);
    res.status(500).json({ error: 'Database context listing diagnoses error' });
  }
};

export const createDiagnosis = async (req, res) => {
  const { icd_code, description, severity, diagnosed_date, notes, patient_id } = req.body;
  if (!icd_code || !description || !severity || !diagnosed_date || !patient_id) {
    return res.status(400).json({ error: 'ICD Code, disease description, complexity state, diagnosis date, and Patient target required.' });
  }

  try {
    const patientCheck = await db.query('SELECT id FROM patients WHERE id = $1', [patient_id]);
    if (patientCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Patient link context index does not reference any active patient.' });
    }

    const result = await db.query(
      'INSERT INTO diagnoses (icd_code, description, severity, diagnosed_date, notes, patient_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [icd_code, description, severity, diagnosed_date, notes || '', parseInt(patient_id, 10)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Insert diagnosis entry failure:', err);
    res.status(500).json({ error: 'Database Diagnosis insert transaction error' });
  }
};

export const updateDiagnosis = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { icd_code, description, severity, diagnosed_date, notes, patient_id } = req.body;
  if (!icd_code || !description || !severity || !diagnosed_date || !patient_id) {
    return res.status(400).json({ error: 'ICD Code, disease description, complexity state, diagnosis date, and Patient target required.' });
  }

  try {
    const patientCheck = await db.query('SELECT id FROM patients WHERE id = $1', [patient_id]);
    if (patientCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Patient link context index does not reference any active patient.' });
    }

    const result = await db.query(
      'UPDATE diagnoses SET icd_code = $1, description = $2, severity = $3, diagnosed_date = $4, notes = $5, patient_id = $6 WHERE id = $7 RETURNING *',
      [icd_code, description, severity, diagnosed_date, notes || '', parseInt(patient_id, 10), id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Diagnosis log item not found.' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Update diagnosis entry failure:', err);
    res.status(500).json({ error: 'Database Diagnosis update transaction error' });
  }
};

export const deleteDiagnosis = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const result = await db.query('DELETE FROM diagnoses WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Diagnosis log item not found.' });
    }
    res.status(200).json({ message: 'Diagnosis report records deleted successfully.', diagnosis: result.rows[0] });
  } catch (err) {
    console.error('Delete diagnosis entry failure:', err);
    res.status(500).json({ error: 'Database Diagnosis delete transaction error' });
  }
};
