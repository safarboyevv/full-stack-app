import "dotenv/config"; 
import app from "./app.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(
        `===========================================================`,
      );
      console.log(`🚀 CareTrack Clinic Medical Records API Engine Is Running!`);
      console.log(`📡 Local Access:      http://localhost:${PORT}`);
      console.log(`🌐 Network Access:    http://0.0.0.0:${PORT}`);
      console.log(
        `===========================================================`,
      );
    });
  } catch (error) {
    console.error(`❌ Serverni yuklashda xatolik yuz berdi:`, error);
    process.exit(1);
  }
}

startServer();
