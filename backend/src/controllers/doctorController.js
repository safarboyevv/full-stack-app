import { db } from "../config/db.js";

export const getDoctors = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM doctors");
    const sortedDoctors = [...result.rows].sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    res.status(200).json(sortedDoctors);
  } catch (err) {
    console.error("Fetch doctors listing failure:", err);
    res.status(500).json({ error: "Database context listing query error" });
  }
};

export const createDoctor = async (req, res) => {
  const { name, specialty, department, phone, schedule } = req.body;
  if (!name || !specialty || !department) {
    return res
      .status(400)
      .json({
        error: "Must specify doctor Name, specialty, and clinic department.",
      });
  }

  try {
    const result = await db.query(
      "INSERT INTO doctors (name, specialty, department, phone, schedule) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, specialty, department, phone || "", schedule || ""],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Insert doctor record failure:", err);
    res
      .status(500)
      .json({ error: "Database transaction inserting doctor error" });
  }
};

export const updateDoctor = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { name, specialty, department, phone, schedule } = req.body;
  if (!name || !specialty || !department) {
    return res
      .status(400)
      .json({
        error: "Must specify doctor Name, specialty, and clinic department.",
      });
  }

  try {
    const result = await db.query(
      "UPDATE doctors SET name = $1, specialty = $2, department = $3, phone = $4, schedule = $5 WHERE id = $6 RETURNING *",
      [name, specialty, department, phone || "", schedule || "", id],
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Clinician index does not match any doctor." });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Update doctor record failure:", err);
    res
      .status(500)
      .json({ error: "Database transaction updating doctor error" });
  }
};

export const deleteDoctor = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const result = await db.query(
      "DELETE FROM doctors WHERE id = $1 RETURNING *",
      [id],
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Clinician index does not match any doctor." });
    }
    res
      .status(200)
      .json({
        message: "Clinician directory entry deleted successfully.",
        doctor: result.rows[0],
      });
  } catch (err) {
    console.error("Delete doctor record failure:", err);
    res
      .status(500)
      .json({ error: "Database transaction deleting doctor error" });
  }
};
