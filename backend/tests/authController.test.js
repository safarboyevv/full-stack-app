// Eski noto'g'ri kodlar:
// import { registerUser... } from './authController.js';
// jest.mock("../config/db.js", ...);

// YANGI TO'G'RI KODLAR:
import {
  registerUser,
  loginUser,
  refreshToken,
  getProfile,
} from "../src/controllers/authController.js";
import { db } from "../src/config/db.js";
import { comparePassword, hashPassword } from "../src/utils/helpers.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../src/middleware/auth.js";

jest.mock("../src/config/db.js", () => ({
  db: { query: jest.fn() },
}));

jest.mock("../src/utils/helpers.js");
jest.mock("../src/middleware/auth.js");

describe("Auth Controller Tests", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, user: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("registerUser", () => {
    it("barcha maydonlar toʻliq boʻlsa va rol toʻgʻri boʻlsa, foydalanuvchini roʻyxatdan oʻtkazishi kerak", async () => {
      req.body = {
        username: "testuser",
        password: "password123",
        role: "Clinician",
      };

      db.query.mockResolvedValueOnce({ rows: [] }); // checkUser uchun bo'sh joy qaytadi
      hashPassword.mockResolvedValueOnce("hashed_password");
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            username: "testuser",
            role: "Clinician",
            created_at: "2026-06-04",
          },
        ],
      }); // INSERT natijasi

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Account registered successfully.",
        }),
      );
    });

    it("agar mos kelmaydigan rol yuborilsa, 400 xatolik qaytarishi kerak", async () => {
      req.body = {
        username: "testuser",
        password: "password123",
        role: "FakeRole",
      };

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error:
          "Selection choice not supported. Admin, Clinician, Receptionist only.",
      });
    });
  });

  describe("loginUser", () => {
    it("toʻgʻri maʻlumotlar kiritilganda login boʻlishi va tokenlar qaytarishi kerak", async () => {
      req.body = { username: "testuser", password: "password123" };

      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            username: "testuser",
            password: " hashed_password ",
            role: "Clinician",
          },
        ],
      });
      comparePassword.mockResolvedValueOnce(true);
      generateAccessToken.mockReturnValueOnce("access_token");
      generateRefreshToken.mockReturnValueOnce("refresh_token");

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        accessToken: "access_token",
        refreshToken: "refresh_token",
        user: { id: 1, username: "testuser", role: "Clinician" },
      });
    });
  });
});
