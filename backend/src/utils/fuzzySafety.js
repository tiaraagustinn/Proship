// ─── Fungsi keanggotaan ───────────────────────────────────────────────────────

function trapmf(x, a, b, c, d) {
  if (x <= a || x >= d) return 0;
  if (x >= b && x <= c) return 1;
  return x < b ? (x - a) / (b - a) : (d - x) / (d - c);
}
function trimf(x, a, b, c) {
  if (x <= a || x >= c) return 0;
  return x <= b ? (x - a) / (b - a) : (c - x) / (c - b);
}

// ─── Gelombang (meter) ────────────────────────────────────────────────────────
// Rendah: 0–1.25 | Sedang: 1.25–2.5 | Tinggi: 2.5–4 | Sangat Tinggi: >4

function waveFS(h) {
  return {
    rendah:       trapmf(h, 0,    0,    1.0,  1.25),
    sedang:       trimf (h, 1.0,  1.875, 2.75),
    tinggi:       trimf (h, 2.25, 3.25,  4.25),
    sangat_tinggi: trapmf(h, 3.75, 4.5,  10,   10),
  };
}

// ─── Kecepatan Angin (knot) ───────────────────────────────────────────────────
// Tenang: 0–10 | Sedang: 10–20 | Kencang: 20–30 | Sangat Kencang: >30

function windFS(w) {
  return {
    tenang:         trapmf(w, 0,   0,   8,   10),
    sedang:         trimf (w, 8,   15,  22),
    kencang:        trimf (w, 18,  25,  32),
    sangat_kencang: trapmf(w, 28,  32,  60,  60),
  };
}

// ─── Kecepatan Arus (cm/s) ────────────────────────────────────────────────────
// Lemah: 0–25 | Sedang: 25–75 | Kuat: >75

function currentFS(c) {
  return {
    lemah:  trapmf(c, 0,   0,   20,  25),
    sedang: trimf (c, 20,  50,  80),
    kuat:   trapmf(c, 72,  80,  200, 200),
  };
}

// ─── Output (skor keselamatan 0–100) ─────────────────────────────────────────

const OUTPUT_RANGES = {
  sangat_aman: [80, 90, 100, 100],
  aman:        [60, 72,  80,  90],
  sedang:      [40, 52,  60,  72],
  waspada:     [18, 30,  40,  52],
  bahaya:      [ 0,  0,  15,  22],
};

function centroid(rules) {
  let num = 0, den = 0;
  for (let i = 0; i <= 300; i++) {
    const x = (100 * i) / 300;
    let agg = 0;
    rules.forEach(([key, alpha]) => {
      const [a, b, c, d] = OUTPUT_RANGES[key];
      agg = Math.max(agg, Math.min(trapmf(x, a, b, c, d), alpha));
    });
    num += x * agg;
    den += agg;
  }
  return den === 0 ? 50 : num / den;
}

// ─── Rule base (Mamdani) ──────────────────────────────────────────────────────
// Gelombang × Angin × Arus → Output

function buildRules(wv, wd, cr) {
  return [
    // Semua kondisi baik → sangat aman
    ["sangat_aman", Math.min(wv.rendah,        wd.tenang,         cr.lemah)],
    ["sangat_aman", Math.min(wv.rendah,        wd.tenang,         cr.sedang)],

    // Rendah/tenang tapi arus atau angin mulai naik → aman
    ["aman",        Math.min(wv.rendah,        wd.sedang,         cr.lemah)],
    ["aman",        Math.min(wv.rendah,        wd.tenang,         cr.kuat)],
    ["aman",        Math.min(wv.sedang,        wd.tenang,         cr.lemah)],
    ["aman",        Math.min(wv.rendah,        wd.sedang,         cr.sedang)],

    // Kombinasi sedang → sedang
    ["sedang",      Math.min(wv.sedang,        wd.sedang,         cr.lemah)],
    ["sedang",      Math.min(wv.sedang,        wd.tenang,         cr.sedang)],
    ["sedang",      Math.min(wv.rendah,        wd.kencang,        cr.lemah)],
    ["sedang",      Math.min(wv.sedang,        wd.sedang,         cr.sedang)],
    ["sedang",      Math.min(wv.rendah,        wd.sedang,         cr.kuat)],

    // Mulai tinggi → waspada
    ["waspada",     Math.min(wv.tinggi,        wd.tenang,         cr.lemah)],
    ["waspada",     Math.min(wv.sedang,        wd.kencang,        cr.sedang)],
    ["waspada",     Math.min(wv.sedang,        wd.sedang,         cr.kuat)],
    ["waspada",     Math.min(wv.tinggi,        wd.sedang,         cr.sedang)],
    ["waspada",     Math.min(wv.rendah,        wd.kencang,        cr.kuat)],
    ["waspada",     Math.min(wv.sedang,        wd.kencang,        cr.kuat)],
    ["waspada",     Math.min(wv.rendah,        wd.sangat_kencang, cr.sedang)],

    // Tinggi/kencang → bahaya
    ["bahaya",      Math.min(wv.tinggi,        wd.kencang,        cr.sedang)],
    ["bahaya",      Math.min(wv.tinggi,        wd.sedang,         cr.kuat)],
    ["bahaya",      Math.min(wv.tinggi,        wd.kencang,        cr.kuat)],
    ["bahaya",      Math.min(wv.sangat_tinggi, wd.tenang,         cr.lemah)],
    ["bahaya",      Math.min(wv.sangat_tinggi, wd.sedang,         cr.sedang)],
    ["bahaya",      Math.min(wv.sangat_tinggi, wd.kencang,        cr.kuat)],
    ["bahaya",      Math.min(wv.tinggi,        wd.sangat_kencang, cr.kuat)],
    ["bahaya",      Math.min(wv.sangat_tinggi, wd.sangat_kencang, cr.kuat)],
  ];
}

// ─── Konversi satuan ──────────────────────────────────────────────────────────

export function kmjToKnot(kmj)    { return kmj / 1.852; }
export function knotToCms(knot)   { return knot * 51.444; }

// ─── Fungsi utama ─────────────────────────────────────────────────────────────

/**
 * @param {number} wave_height    – meter (dari BMKG)
 * @param {number} wind_speed     – km/j (dari BMKG, akan dikonversi)
 * @param {number} current_speed  – knot (dari BMKG, akan dikonversi)
 */
export function hitungKeselamatan({ wave_height, wind_speed, current_speed }) {
  const windKnot  = kmjToKnot(wind_speed);
  const currentCms = knotToCms(current_speed);

  const wv = waveFS(wave_height);
  const wd = windFS(windKnot);
  const cr = currentFS(currentCms);

  const rules = buildRules(wv, wd, cr);
  const score = Math.round(centroid(rules));

  const levels = [
    { min: 72, status: "Aman",            warna: "green",  desc: "Kondisi layak untuk operasional kapal ferry" },
    { min: 55, status: "Cukup Aman",       warna: "teal",   desc: "Operasional dapat berjalan, awasi perkembangan cuaca" },
    { min: 38, status: "Waspada",          warna: "yellow", desc: "Pertimbangkan penundaan keberangkatan" },
    { min: 20, status: "Berbahaya",        warna: "orange", desc: "Tunda keberangkatan, kondisi tidak aman" },
    { min:  0, status: "Sangat Berbahaya", warna: "red",    desc: "Hentikan semua operasional" },
  ];

  return {
    score,
    // nilai setelah konversi (untuk ditampilkan di UI)
    input: {
      wave_height,
      wind_knot:    +windKnot.toFixed(2),
      current_cms:  +currentCms.toFixed(1),
    },
    // derajat keanggotaan (opsional, untuk debug/transparansi)
    membership: { wv, wd, cr },
    ...levels.find(l => score >= l.min),
  };
}