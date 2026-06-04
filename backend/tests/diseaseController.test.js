import { getDiagnoses, createDiagnosis, updateDiagnosis, deleteDiagnosis } from '../src/controllers/diseaseController.js';
import { db } from '../src/config/db.js';

jest.mock("../src/config/db.js", () => ({
   db: { query: jest.fn() },
}));

describe("Disease Controller Tests", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("getDiagnoses", () => {
    it("barcha tashxislarni sanasi boʻyicha tartiblangan holda qaytarishi kerak", async () => {
      const mockRows = [{ id: 1, icd_code: "U07.1", description: "COVID-19" }];
      db.query.mockResolvedValueOnce({ rows: mockRows });

      await getDiagnoses(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRows);
    });
  });

  describe("createDiagnosis", () => {
    it("bemor mavjud boʻlmasa, 404 xatolik qaytarishi kerak", async () => {
      req.body = {
        icd_code: "J11",
        description: "Gripp",
        severity: "Oʻrtacha",
        diagnosed_date: "2026-06-04",
        patient_id: 999,
      };

      db.query.mockResolvedValueOnce({ rows: [] }); // Bemor topilmadi ssenariysi

      await createDiagnosis(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error:
          "Patient link context index does not reference any active patient.",
      });
    });
  });
});
