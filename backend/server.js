// server.js
import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Endpoint Balohan - Fetch dari BMKG
app.get("/api/weather/balohan", async (req, res) => {
  try {
    console.log("📍 Fetching Balohan data from BMKG...");
    
    const response = await axios.get(
      "https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=11.72.02.2005"
    );
    
    console.log("✅ Balohan data received");
    res.json(response.data);
    
  } catch (error) {
    console.error("❌ Error Balohan:", error.message);
    res.status(500).json({ 
      error: "Gagal mengambil data Balohan",
      details: error.message 
    });
  }
});

// ✅ Endpoint Ulee Lheue - Fetch dari BMKG
app.get("/api/weather/ulee-lheue", async (req, res) => {
  try {
    console.log("📍 Fetching Ulee Lheue data from BMKG...");
    
    const response = await axios.get(
      "https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=11.71.03.2002"
    );
    
    console.log("✅ Ulee Lheue data received");
    res.json(response.data);
    
  } catch (error) {
    console.error("❌ Error Ulee Lheue:", error.message);
    res.status(500).json({ 
      error: "Gagal mengambil data Ulee Lheue",
      details: error.message 
    });
  }
});

// Test endpoint
app.get("/", (req, res) => {
  res.json({ message: "Backend berjalan dengan baik" });
});

// Jalankan server
app.listen(5000, () => {
  console.log("✅ Server backend berjalan di http://localhost:5000");
});