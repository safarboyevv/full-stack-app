import { db } from "../config/db.js";

/**
 * Tizim bazasining holati va uning telemetriyasini qaytarish
 */
export const getDatabaseStatus = async (req, res) => {
  try {
    res.status(200).json({
      inMemory: false, // Endi doim false, chunki RAM rejimi o'chirilgan
      databaseType: "PostgreSQL Database Engine", // To'g'ridan-to'g'ri PostgreSQL ishlamoqda
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("Failed to resolve database operational status check:", err);
    res.status(500).json({
      error: "Failed to aggregate active relational subsystem telemetry.",
    });
  }
};

/**
 * Shifoxona umumiy statistikasini (shifokorlar, bemorlar, tashxislar soni) hisoblash
 */
export const getClinicalSummary = async (req, res) => {
  try {
    const docs = await db.query("SELECT COUNT(*) as count FROM doctors");
    const pats = await db.query("SELECT COUNT(*) as count FROM patients");
    const diags = await db.query("SELECT COUNT(*) as count FROM diagnoses");

    res.status(200).json({
      doctors: parseInt(docs.rows[0]?.count || "0", 10),
      patients: parseInt(pats.rows[0]?.count || "0", 10),
      diagnoses: parseInt(diags.rows[0]?.count || "0", 10),
      standaloneStandbyActive: true,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("Failed to compile clinical overview query:", err);
    res
      .status(500)
      .json({ error: "Clinical reporting metrics aggregation failure." });
  }
};
