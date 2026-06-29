// ── Fungsi keanggotaan ─────────────────────────────────────────────────────────

function trapmf(x, params) {
  const [a, b, c, d] = params;
  if (x <= a) return a === b ? 1 : 0;
  if (x >= d) return c === d ? 1 : 0;
  if (x >= b && x <= c) return 1;
  if (x > a && x < b) return (x - a) / (b - a);
  return (d - x) / (d - c);
}

function trimf(x, params) {
  const [a, b, c] = params;
  if (x <= a) return 0;
  if (x >= c) return 0;
  if (x === b) return 1;
  if (x > a && x < b) return (x - a) / (b - a);
  return (c - x) / (c - b);
}

// ── Output MF ─────────────────────────────────────────────────────────────────
// Skor output: 0–29 = Aman | 30–89 = Waspada | 90–100 = Bahaya

const OUTPUT_CENTERS = {
  1: 15,  // AMAN    (center of 0–30)
  2: 60,  // WASPADA (center of 30–90)
  3: 95,  // BAHAYA  (center of 90–100)
};

// ── Rule base ─────────────────────────────────────────────────────────────────
// Format: [i1_wave, i2_wind, i3_current, outIdx, weight, conn]
//   iN    : 0=any, 1=rendah/tenang/lemah, 2=sedang, 3=tinggi/kencang/kuat
//   outIdx: 1=AMAN, 2=WASPADA, 3=BAHAYA
//   conn  : 1=AND (min), 2=OR (max)
//
// ─── Filosofi desain (Wave-Focused, skala BMKG) ───────────────────────────────
// Gelombang adalah FAKTOR PRIMER (Ferry RoRo, standar PM 48/2021 + BMKG):
//   • Rendah (0–1.25m plateau, transisi s/d 1.75m) → dominan AMAN
//     Exception: hanya Angin Kencang (≥20kt) yang bisa override ke WASPADA
//   • Sedang (1.25–2.75m) → WASPADA, naik ke BAHAYA jika dikombinasikan
//   • Tinggi (≥2.5m, penuh di 3.0m = batas Ferry RoRo) → BAHAYA
//
// Skala BMKG:
//   Gelombang : 0 | 0.75 | 1.25 | 2.0 | 2.5+  (m)
//   Angin     : 0 |  10  |  20  |  25 |  30+   (knot)
//   Arus      : 0 |  25  |  55  |  70 |  100+  (cm/s)

const rules = [
  // ── BAHAYA: gabungan kondisi berbahaya ──────────────────────────────────────
  // Gelombang Tinggi (≥2.5m menuju 3m) = selalu bahaya Ferry RoRo
  [3, 1, 1, 3, 1, 1],  // Tinggi + Tenang + Lemah   → BAHAYA (wave saja ≥3m cukup)
  [3, 1, 2, 3, 1, 1],  // Tinggi + Tenang + Sedang  → BAHAYA
  [3, 1, 3, 3, 1, 1],  // Tinggi + Tenang + Kuat    → BAHAYA
  [3, 2, 1, 3, 1, 1],  // Tinggi + Sedang + Lemah   → BAHAYA
  [3, 2, 2, 3, 1, 1],  // Tinggi + Sedang + Sedang  → BAHAYA
  [3, 2, 3, 3, 1, 1],  // Tinggi + Sedang + Kuat    → BAHAYA
  [3, 3, 1, 3, 1, 1],  // Tinggi + Kencang + Lemah  → BAHAYA
  [3, 3, 2, 3, 1, 1],  // Tinggi + Kencang + Sedang → BAHAYA
  [3, 3, 3, 3, 1, 1],  // Tinggi + Kencang + Kuat   → BAHAYA
  // Angin Kencang + gelombang sedang-tinggi atau arus kuat
  [2, 3, 1, 3, 1, 1],  // Sedang + Kencang + Lemah  → BAHAYA
  [2, 3, 2, 3, 1, 1],  // Sedang + Kencang + Sedang → BAHAYA
  [2, 3, 3, 3, 1, 1],  // Sedang + Kencang + Kuat   → BAHAYA
  [1, 3, 3, 3, 1, 1],  // Rendah + Kencang + Kuat   → BAHAYA
  // Arus sangat kuat + gelombang sedang
  [2, 2, 3, 3, 1, 1],  // Sedang + Sedang + Kuat    → BAHAYA (angin+arus buruk)
  [2, 1, 3, 2, 1, 1],  // Sedang + Tenang + Kuat    → WASPADA (angin tenang = mitigasi)

  // ── WASPADA: kombinasi moderat ───────────────────────────────────────────────
  [2, 2, 2, 2, 1, 1],  // Sedang + Sedang + Sedang  → WASPADA (semua sedang)
  [2, 2, 1, 2, 1, 1],  // Sedang + Sedang + Lemah   → WASPADA
  [2, 1, 2, 2, 1, 1],  // Sedang + Tenang + Sedang  → WASPADA
  [2, 1, 1, 2, 1, 1],  // Sedang + Tenang + Lemah   → WASPADA
  [1, 3, 1, 2, 1, 1],  // Rendah + Kencang + Lemah  → WASPADA
  [1, 3, 2, 2, 1, 1],  // Rendah + Kencang + Sedang → WASPADA
  [1, 2, 3, 2, 1, 1],  // Rendah + Sedang + Kuat    → WASPADA (arus kuat = risiko)
  [1, 1, 3, 2, 1, 1],  // Rendah + Tenang + Kuat    → WASPADA (arus kuat tetap risiko)
  [1, 2, 2, 2, 1, 1],  // Rendah + Sedang + Sedang  → WASPADA (2 faktor sedang)

  // ── AMAN: semua kondisi rendah atau kombinasi ringan ─────────────────────────
  [1, 1, 1, 1, 1, 1],  // Rendah + Tenang + Lemah   → AMAN (sempurna)
  [1, 1, 2, 1, 1, 1],  // Rendah + Tenang + Sedang  → AMAN
  [1, 2, 1, 1, 1, 1],  // Rendah + Sedang + Lemah   → AMAN
  // [2, 1, 1] = Sedang + Tenang + Lemah → WASPADA (sudah ada di atas, baris 73)
];

// ── Hitung derajat keanggotaan input ─────────────────────────────────────────
//
// ─── GELOMBANG (meter) — BMKG scale + wave-focused transition ────────────────
//   Rendah : plateau 0–1.25m (BMKG batas aman), transisi s/d 1.75m
//            → Di 1.40m: µRendah=0.70 (dominan), µSedang=0.20 (minor)
//            → Memberi PRIORITAS ke gelombang rendah sebagai faktor utama
//   Sedang : trimf 1.25–2.75m (peak 2.0m = tengah skala BMKG sedang)
//   Tinggi : mulai 2.5m, penuh di 3.0m (batas resmi Ferry RoRo)
//
// ─── ANGIN (knot) — BMKG scale ───────────────────────────────────────────────
//   Tenang  : 0–10kt  (BMKG biru muda–biru)
//   Sedang  : 8–22kt  (BMKG biru–hijau, peak 15kt)
//   Kencang : ≥20kt   (BMKG kuning–merah, bahaya di 25kt)
//
// ─── ARUS (cm/s) — BMKG scale ────────────────────────────────────────────────
//   Lemah  : 0–25 cm/s  (BMKG biru muda)
//   Sedang : 15–55 cm/s (BMKG biru–hijau, peak 40 cm/s)
//   Kuat   : ≥55 cm/s   (BMKG kuning–coklat, gradual ke 70)

function computeInputMfs(wave, wind, current) {
  const waveMfs = [
    trapmf(wave, [0, 0, 1.25, 1.75]),        // Rendah  : plateau 0–1.25m (BMKG), transisi s/d 1.75m
    trimf(wave, [1.25, 2.0, 2.75]),           // Sedang  : 1.25–2.75m (peak 2.0m, midpoint BMKG)
    trapmf(wave, [2.5, 3.0, 6.0, 6.0]),        // Tinggi  : ≥3.0m (batas Ferry RoRo)
  ];
  const windMfs = [
    trapmf(wind, [0, 0, 8.0, 10.0]),           // Tenang  : 0–10 knot (BMKG calm)
    trimf(wind, [8.0, 15.0, 22.0]),            // Sedang  : 8–22 knot (peak 15kt)
    trapmf(wind, [20.0, 25.0, 40.0, 40.0]),     // Kencang : ≥20kt (bahaya Ferry RoRo ≥25kt)
  ];
  const currentMfs = [
    trapmf(current, [0, 0, 15.0, 25.0]),         // Lemah  : 0–25 cm/s (BMKG biru)
    trimf(current, [15.0, 40.0, 60.0]),           // Sedang : 15–60 cm/s (peak 40, diperluas)
    trapmf(current, [55.0, 70.0, 200.0, 200.0]),   // Kuat   : ≥55 cm/s (gradual ke 70)
  ];
  return { waveMfs, windMfs, currentMfs };
}

// ── Evaluasi Mamdani — defuzzifikasi Centroid (Integral Numerik) ──────────────

function evalMamdaniDebug(wave, wind, current) {
  const waveNum = Number(wave);
  const windNum = Number(wind);
  const currentNum = Number(current);

  if (![waveNum, windNum, currentNum].every(Number.isFinite)) {
    throw new Error("wave, wind, dan current harus berupa nilai numerik");
  }

  const { waveMfs, windMfs, currentMfs } = computeInputMfs(waveNum, windNum, currentNum);

  const ruleDetails = [];
  const alphas = [];

  for (let ri = 0; ri < rules.length; ri++) {
    const [i1, i2, i3, outIdx, weight, conn] = rules[ri];

    const antecedentDegrees = [];
    const degreesDisplay = [null, null, null];
    if (i1 !== 0) { antecedentDegrees.push(waveMfs[i1 - 1]); degreesDisplay[0] = waveMfs[i1 - 1]; }
    if (i2 !== 0) { antecedentDegrees.push(windMfs[i2 - 1]); degreesDisplay[1] = windMfs[i2 - 1]; }
    if (i3 !== 0) { antecedentDegrees.push(currentMfs[i3 - 1]); degreesDisplay[2] = currentMfs[i3 - 1]; }

    const ruleStrength = antecedentDegrees.length === 0
      ? 1
      : conn === 1
        ? Math.min(...antecedentDegrees)
        : Math.max(...antecedentDegrees);

    const alpha = ruleStrength * weight;
    alphas.push(alpha);

    ruleDetails.push({
      idx: ri + 1,
      antecedent: [i1, i2, i3],
      output: outIdx,
      outputLabel: outIdx === 1 ? 'AMAN' : outIdx === 2 ? 'WASPADA' : 'BAHAYA',
      outputCenter: OUTPUT_CENTERS[outIdx],
      degrees: degreesDisplay,
      ruleStrength: Number(ruleStrength.toFixed(6)),
      weighted: Number(alpha.toFixed(6)),
    });
  }

  // ── 3. Defuzzifikasi (Centroid) ──────────────────────────────────────────────
  let num = 0;
  let den = 0;

  for (let z = 0; z <= 100; z += 1) {
    // Fungsi keanggotaan output:
    // AMAN    : 0–30  (centroid ~15)
    // WASPADA : 30–90 (centroid ~60)
    // BAHAYA  : 90–100 (centroid ~95)
    const amanMF    = trapmf(z, [0,   0,  20,  30]);   // penuh s/d 20, turun ke 0 di 30
    const waspadaMF = trapmf(z, [20,  30,  80,  90]);   // naik dari 20–30, plateau 30–80, turun ke 0 di 90
    const bahayaMF  = trapmf(z, [80,  90, 100, 100]);   // naik dari 80–90, penuh s/d 100

    let maxVal = 0;
    for (let ri = 0; ri < rules.length; ri++) {
      const alpha = alphas[ri];
      if (alpha <= 0) continue;

      const [, , , outIdx] = rules[ri];
      let outMfVal = 0;
      if (outIdx === 1) {
        outMfVal = amanMF;
      } else if (outIdx === 2) {
        outMfVal = waspadaMF;
      } else if (outIdx === 3) {
        outMfVal = bahayaMF;
      }

      const val = Math.min(alpha, outMfVal);
      if (val > maxVal) maxVal = val;
    }

    num += z * maxVal;
    den += maxVal;
  }

  const score = den === 0 ? 0 : num / den;

  return {
    input: { wave: waveNum, wind: windNum, current: currentNum },
    ruleDetails,
    score: Number(score.toFixed(4)),
    category: score < 30 ? 'AMAN' : score < 90 ? 'WASPADA' : 'BAHAYA',
    defuzz: 'centroid-integral',
  };
}

export { evalMamdaniDebug as evalMamdani, evalMamdaniDebug };
