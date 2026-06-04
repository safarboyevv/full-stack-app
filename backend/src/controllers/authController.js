import { db } from "../config/db.js";
import { comparePassword, hashPassword } from "../utils/helpers.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../middleware/auth.js";

export const registerUser = async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res
      .status(400)
      .json({ error: "Username, password and role are required" });
  }
  const validRoles = ["Administrator", "Clinician", "Receptionist"];
  if (!validRoles.includes(role)) {
    return res.status(400).json({
      error:
        "Selection choice not supported. Admin, Clinician, Receptionist only.",
    });
  }

  try {
    const checkUser = await db.query(
      "SELECT * FROM users WHERE username = $1",
      [username],
    );
    if (checkUser.rows.length > 0) {
      return res.status(409).json({
        error: "Username already registered to another clinician/staff.",
      });
    }

    const hash = await hashPassword(password);
    const result = await db.query(
      "INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role, created_at",
      [username, hash, role],
    );
    res.status(201).json({
      message: "Account registered successfully.",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("Registration processing error:", err);
    res.status(500).json({ error: "Failed to process account registration." });
  }
};


export const loginUser = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Credentials username and password required." });
  }

  try {
    const result = await db.query(
      "SELECT * FROM users WHERE LOWER(username) = LOWER($1)",
      [username.trim()],
    );

    if (result.rows.length === 0) {
      console.log(`❌ LOG: Bazada bunday username topilmadi: ${username}`);
      return res.status(401).json({ error: "Invalid username credentials." });
    }

    const user = result.rows[0];

    // ==========================================
    // 🔍 DIK-DIK KO'Z BILAN TEKSHIRAMIZ (LOGS)
    // ==========================================
    console.log("\n====== 🚨 CARETRACK AUTH DEBUG ENGINE 🚨 ======");
    console.log("➡️ FRONTENDDAN KELGAN PAROL:  ", `"${password}"`);
    console.log("➡️ BAZADAN CHIQAN HASH:       ", `"${user.password}"`);

    // Parollarni solishtiramiz
    const isMatch = await comparePassword(password, user.password.trim());

    console.log("➡️ BCRYPT MATCH NATIJASI:     ", isMatch);
    console.log("===============================================\n");
    // ==========================================

    if (!isMatch) {
      return res
        .status(401)
        .json({ error: "Incorrect credentials password match." });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login processing error:", err);
    return res
      .status(500)
      .json({ error: "Internal system credentials processing error." });
  }
};

export const refreshToken = (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res
      .status(400)
      .json({ error: "Refresh token mandatory requirement missing." });
  }

  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) {
    return res
      .status(403)
      .json({ error: "Expired or tampered token validation credentials." });
  }

  const newAccessToken = generateAccessToken({
    id: decoded.id,
    username: decoded.username,
    role: decoded.role,
  });

  res.status(200).json({ accessToken: newAccessToken });
};

export const getProfile = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, username, role, created_at FROM users WHERE id = $1",
      [req.user.id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User does not exist." });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Verify context retrieve failure:", err);
    res
      .status(500)
      .json({ error: "Could not fetch session credentials context." });
  }
};
