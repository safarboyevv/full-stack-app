import {
  getDoctors,
  createDoctor,
  deleteDoctor,
} from "../src/controllers/doctorController.js"; // `doctorController` qilindi
import { db } from "../src/config/db.js";

jest.mock("../src/config/db.js", () => ({
  db: { query: jest.fn() },
}));

describe("Doctors Controller Tests", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("getDoctors", () => {
    it("shifokorlar roʻyxatini ismlari boʻyicha alifbo tartibida saralab qaytarishi kerak", async () => {
      const mockDoctors = [{ name: "Zokirov" }, { name: "Abduvaliyev" }];
      db.query.mockResolvedValueOnce({ rows: mockDoctors });

      await getDoctors(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      // Abduvaliyev birinchi turishi kerak
      expect(res.json).toHaveBeenCalledWith([
        { name: "Abduvaliyev" },
        { name: "Zokirov" },
      ]);
    });
  });

  describe("deleteDoctor", () => {
    it("agar shifokor topilmasa, 404 xatolik qaytarishi kerak", async () => {
      req.params.id = "5";
      db.query.mockResolvedValueOnce({ rows: [] });

      await deleteDoctor(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
