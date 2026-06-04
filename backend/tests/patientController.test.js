import {
  getPatientById,
  getPatients,
} from "../src/controllers/patientController.js";
import { db } from "../src/config/db.js";

jest.mock("../src/config/db.js", () => ({
  db: { query: jest.fn() },
}));

describe("Patient Controller Tests", () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("getPatientById", () => {
    it("bemor, shifokor va tashxislarni bitta obyektga birlashtirib qaytarishi kerak", async () => {
      req.params.id = "1";

      const mockPatient = { id: 1, name: "Asal", assigned_doctor_id: 10 };
      const mockDoctor = { id: 10, name: "Dr. Karimov" };
      const mockDiagnoses = [
        { id: 101, icd_code: "A00", diagnosed_date: "2026-01-01" },
      ];

      // Ketma-ket keladigan db.query chaqiriqlariga javoblar
      db.query.mockResolvedValueOnce({ rows: [mockPatient] });
      db.query.mockResolvedValueOnce({ rows: [mockDoctor] });
      db.query.mockResolvedValueOnce({ rows: mockDiagnoses });

      await getPatientById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        ...mockPatient,
        doctor: mockDoctor,
        diagnoses: mockDiagnoses,
      });
    });

    it("bemor fayli mavjud boʻlmasa, 404 xatolik qaytarishi kerak", async () => {
      req.params.id = "99";
      db.query.mockResolvedValueOnce({ rows: [] });

      await getPatientById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Patient file index not found.",
      });
    });
  });
});
