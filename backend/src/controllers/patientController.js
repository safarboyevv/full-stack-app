import { db } from "../config/db.js";

export const getPatients = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM patients");
    const sortedPatients = [...result.rows].sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    res.status(200).json(sortedPatients);
  } catch (err) {
    console.error("Fetch patients listing failure:", err);
    res.status(500).json({ error: "Database context listing patients error" });
  }
};

export const getPatientById = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const patientResult = await db.query(
      "SELECT * FROM patients WHERE id = $1",
      [id],
    );
    if (patientResult.rows.length === 0) {
      return res.status(404).json({ error: "Patient file index not found." });
    }
    const patient = patientResult.rows[0];

    // Shifokor ma'lumotlarini bog'lash
    let doctor = null;
    const doctorId = patient.assigned_doctor_id;
    if (doctorId) {
      const doctorResult = await db.query(
        "SELECT * FROM doctors WHERE id = $1",
        [doctorId],
      );
      if (doctorResult.rows.length > 0) {
        doctor = doctorResult.rows[0];
      }
    }

    const diagnosesResult = await db.query(
      "SELECT * FROM diagnoses WHERE patient_id = $1",
      [id],
    );

    const sortedDiagnoses = [...diagnosesResult.rows].sort(
      (a, b) => new Date(b.diagnosed_date) - new Date(a.diagnosed_date),
    );

    res.status(200).json({
      ...patient,
      doctor,
      diagnoses: sortedDiagnoses,
    });
  } catch (err) {
    console.error("Unified details profiling failure:", err);
    res.status(500).json({ error: "Database profiling queries error" });
  }
};

export const updatePatient = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { name, email, phone, gender, dob, assigned_doctor_id, status } =
    req.body;
  if (!name || !gender || !dob || !status) {
    return res
      .status(400)
      .json({
        error:
          "Patient Name, Gender, Date of Birth, and status state are required.",
      });
  }

  try {
    const result = await db.query(
      "UPDATE patients SET name = $1, email = $2, phone = $3, gender = $4, dob = $5, assigned_doctor_id = $6, status = $7 WHERE id = $8 RETURNING *",
      [
        name,
        email || "",
        phone || "",
        gender,
        dob,
        assigned_doctor_id ? parseInt(assigned_doctor_id, 10) : null,
        status,
        id,
      ],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Patient file index not found." });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Update patient profile failure:", err);
    res
      .status(500)
      .json({ error: "Database Patient update transaction error" });
  }
};

export const deletePatient = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const result = await db.query(
      "DELETE FROM patients WHERE id = $1 RETURNING *",
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Patient file index not found." });
    }
    res
      .status(200)
      .json({
        message: "Patient document entry deleted successfully.",
        patient: result.rows[0],
      });
  } catch (err) {
    console.error("Delete patient profile failure:", err);
    res
      .status(500)
      .json({ error: "Database Patient delete transaction error" });
  }
};
