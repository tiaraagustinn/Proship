import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Tambahkan ini 👇
app.get("/api/weather/:location", (req, res) => {
  const { location } = req.params;

  // Contoh data dummy
  const data = {
    balohan: {
      temperature: 29,
      waveHeight: 1.2,
      windSpeed: 10,
      status: "aman",
    },
    "ulee-lheue": {
      temperature: 30,
      waveHeight: 2.5,
      windSpeed: 15,
      status: "waspada",
    },
  };

  if (!data[location]) {
    return res.status(404).json({ error: "Lokasi tidak ditemukan" });
  }

  res.json(data[location]);
});

// Jalankan server
app.listen(5000, () => {
  console.log("✅ Server backend berjalan di http://localhost:5000");
});
