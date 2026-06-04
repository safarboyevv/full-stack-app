import { db } from "../config/db.js";

export const registerPatient = async (req, res) => {
  const { name, email, phone, gender, dob, assigned_doctor_id, status } =
    req.body;

  if (!name || !gender || !dob || !status) {
    return res.status(400).json({
      error:
        "Patient Name, Gender, Date of Birth, and status state are required.",
    });
  }

  try {
    const result = await db.query(
      "INSERT INTO patients (name, email, phone, gender, dob, assigned_doctor_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [
        name,
        email || "",
        phone || "",
        gender,
        dob,
        assigned_doctor_id ? parseInt(assigned_doctor_id, 10) : null,
        status,
      ],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Insert patient profile failure:", err);
    res
      .status(500)
      .json({ error: "Database Patient insertion transaction error" });
  }
};
