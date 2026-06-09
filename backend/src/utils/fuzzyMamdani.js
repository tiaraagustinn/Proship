// ── Fungsi keanggotaan ─────────────────────────────────────────────────────────

function trapmf(x, params) {
  const [a, b, c, d] = params;
  // Support shoulder trapezoids where a==b (left shoulder) or c==d (right shoulder).
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
// Pusat (z) tiap output MF — digunakan defuzzifikasi sigma (weighted average)
//   AMAN    : trapezoid [ 0,  0,  20,  40] → midpoint plateau = (0+20)/2  = 10
//   WASPADA : triangle  [30, 50,  70]      → peak = 50
//   BAHAYA  : trapezoid [60, 80, 100, 100] → midpoint plateau = (80+100)/2 = 90
//
// Skor output: 0–39 = Aman | 40–69 = Waspada | 70–100 = Bahaya

const OUTPUT_CENTERS = {
  1: 10,  // AMAN    → skor rendah
  2: 50,  // WASPADA → skor tengah
  3: 90,  // BAHAYA  → skor tinggi
};

// ── Rule base ─────────────────────────────────────────────────────────────────
// Format: [i1_wave, i2_wind, i3_current, outIdx, weight, conn]
//   iN  : 0=any, 1=rendah/tenang/lemah, 2=sedang, 3=tinggi/kencang/sedang-arus, 4=sangat tinggi/kencang
//   outIdx: 1=AMAN, 2=WASPADA, 3=BAHAYA
//   conn  : 1=AND (min), 2=OR (max)

const rules = [
  // ── Bahaya absolut (satu kondisi ekstrem sudah cukup = OR) ──────────────────
  [4, 0, 0, 3, 1, 2],  // SangatTinggi wave, any wind, any current → BAHAYA
  [0, 4, 0, 3, 1, 2],  // any wave, SangatKencang wind, any current → BAHAYA

  // ── Bahaya kombinasi ────────────────────────────────────────────────────────
  [3, 3, 3, 3, 1, 1],  // Tinggi + Kencang + Kuat → BAHAYA
  [3, 3, 2, 3, 1, 1],  // Tinggi + Kencang + Sedang → BAHAYA
  [2, 3, 3, 3, 1, 1],  // Sedang + Kencang + Kuat → BAHAYA
  [2, 3, 2, 3, 1, 1],  // Sedang + Kencang + Sedang → BAHAYA
  [3, 2, 3, 3, 1, 1],  // Tinggi + Sedang + Kuat → BAHAYA
  [3, 1, 3, 3, 1, 1],  // Tinggi + Tenang + Kuat → BAHAYA
  [2, 2, 3, 3, 1, 1],  // Sedang + Sedang + Kuat → BAHAYA  ← kunci! (data BMKG ~110 cm/s)
  [1, 3, 3, 3, 1, 1],  // Rendah + Kencang + Kuat → BAHAYA
  [4, 4, 0, 3, 1, 2],  // SangatTinggi + SangatKencang → BAHAYA (redundan, diperkuat)

  // ── Waspada ─────────────────────────────────────────────────────────────────
  [2, 2, 2, 2, 1, 1],  // Sedang + Sedang + Sedang → WASPADA
  [1, 2, 2, 2, 1, 1],  // Rendah + Sedang + Sedang → WASPADA
  [2, 1, 2, 2, 1, 1],  // Sedang + Tenang + Sedang → WASPADA
  [2, 2, 1, 2, 1, 1],  // Sedang + Sedang + Lemah → WASPADA
  [3, 2, 2, 2, 1, 1],  // Tinggi + Sedang + Sedang → WASPADA
  [1, 3, 1, 2, 1, 1],  // Rendah + Kencang + Lemah → WASPADA
  [1, 3, 2, 2, 1, 1],  // Rendah + Kencang + Sedang → WASPADA
  [1, 1, 3, 2, 1, 1],  // Rendah + Tenang + Kuat → WASPADA
  [1, 2, 3, 2, 1, 1],  // Rendah + Sedang + Kuat → WASPADA  ← baru
  [2, 3, 1, 2, 1, 1],  // Sedang + Kencang + Lemah → WASPADA
  [2, 1, 3, 2, 1, 1],  // Sedang + Tenang + Kuat → WASPADA
  [3, 1, 1, 2, 1, 1],  // Tinggi + Tenang + Lemah → WASPADA
  [3, 1, 2, 2, 1, 1],  // Tinggi + Tenang + Sedang → WASPADA

  // ── Aman ────────────────────────────────────────────────────────────────────
  [1, 1, 1, 1, 1, 1],  // Rendah + Tenang + Lemah → AMAN
  [1, 1, 2, 1, 1, 1],  // Rendah + Tenang + Sedang → AMAN
  [2, 1, 1, 1, 1, 1],  // Sedang + Tenang + Lemah → AMAN
  [1, 2, 1, 1, 1, 1],  // Rendah + Sedang + Lemah → AMAN
];



// ── Hitung derajat keanggotaan input ─────────────────────────────────────────

function computeInputMfs(wave, wind, current) {
  const waveMfs = [
    trapmf(wave, [0, 0, 0.75, 1.5]),                       // Rendah (overlap dengan Sedang)
    trimf(wave,  [1.0, 1.875, 2.75]),                       // Sedang (overlap dengan Rendah & Tinggi)
    trimf(wave,  [2.0, 3.125, 4.25]),                       // Tinggi (overlap dengan Sedang & Sangat Tinggi)
    trapmf(wave, [3.5, 4.5, 6.0, 6.0]),                     // Sangat Tinggi (overlap dengan Tinggi)
  ];
  const windMfs = [
    trapmf(wind, [0, 0, 5.0, 15.0]),                       // Tenang (overlap dengan Sedang)
    trimf(wind,  [10.0, 17.5, 25.0]),                      // Sedang (overlap dengan Tenang & Kencang)
    trimf(wind,  [20.0, 27.5, 35.0]),                      // Kencang (overlap dengan Sedang & Sangat Kencang)
    trapmf(wind, [30.0, 40.0, 50.0, 50.0]),                 // Sangat Kencang (overlap dengan Kencang)
  ];
  const currentMfs = [
    trapmf(current, [0, 0, 15.0, 35.0]),                   // Lemah (overlap dengan Sedang)
    trimf(current,  [25.0, 50.0, 75.0]),                    // Sedang (overlap dengan Lemah & Kuat)
    trapmf(current, [60.0, 80.0, 100.0, 100.0]),            // Kuat (overlap dengan Sedang)
  ];
  return { waveMfs, windMfs, currentMfs };
}

// ── Evaluasi Mamdani — defuzzifikasi Centroid (Integral Numerik) ──────────────

function evalMamdaniDebug(wave, wind, current) {
  const waveNum    = Number(wave);
  const windNum    = Number(wind);
  const currentNum = Number(current);

  if (![waveNum, windNum, currentNum].every(Number.isFinite)) {
    throw new Error("wave, wind, dan current harus berupa nilai numerik");
  }

  const { waveMfs, windMfs, currentMfs } = computeInputMfs(waveNum, windNum, currentNum);

  const ruleDetails = [];
  const alphas = [];

  for (let ri = 0; ri < rules.length; ri++) {
    const [i1, i2, i3, outIdx, weight, conn] = rules[ri];

    // Kumpulkan derajat keanggotaan antecedent
    const antecedentDegrees = [];
    const degreesDisplay    = [null, null, null];
    if (i1 !== 0) { antecedentDegrees.push(waveMfs[i1 - 1]);    degreesDisplay[0] = waveMfs[i1 - 1]; }
    if (i2 !== 0) { antecedentDegrees.push(windMfs[i2 - 1]);    degreesDisplay[1] = windMfs[i2 - 1]; }
    if (i3 !== 0) { antecedentDegrees.push(currentMfs[i3 - 1]); degreesDisplay[2] = currentMfs[i3 - 1]; }

    // Kekuatan rule: AND=min, OR=max
    const ruleStrength = antecedentDegrees.length === 0
      ? 1
      : conn === 1
        ? Math.min(...antecedentDegrees)
        : Math.max(...antecedentDegrees);

    const alpha = ruleStrength * weight; // αᵢ
    alphas.push(alpha);

    ruleDetails.push({
      idx:         ri + 1,
      antecedent:  [i1, i2, i3],
      output:      outIdx,
      outputLabel: outIdx === 1 ? 'AMAN' : outIdx === 2 ? 'WASPADA' : 'BAHAYA',
      outputCenter: OUTPUT_CENTERS[outIdx],
      degrees:     degreesDisplay,
      ruleStrength: Number(ruleStrength.toFixed(6)),
      weighted:    Number(alpha.toFixed(6)),
    });
  }

  // Defuzzifikasi: Centroid (Integral numerik)
  let num = 0;
  let den = 0;
  const step = 0.5;

  for (let z = 0; z <= 100; z += step) {
    let maxVal = 0;
    for (let ri = 0; ri < rules.length; ri++) {
      const alpha = alphas[ri];
      if (alpha <= 0) continue;

      const [,,, outIdx] = rules[ri];
      let outMfVal = 0;
      if (outIdx === 1) {
        outMfVal = trapmf(z, [0, 0, 20, 40]);
      } else if (outIdx === 2) {
        outMfVal = trimf(z, [30, 50, 70]);
      } else if (outIdx === 3) {
        outMfVal = trapmf(z, [60, 80, 100, 100]);
      }

      const val = Math.min(alpha, outMfVal);
      if (val > maxVal) {
        maxVal = val;
      }
    }

    num += z * maxVal;
    den += maxVal;
  }

  const score = den === 0 ? 0 : num / den;

  return {
    input:       { wave: waveNum, wind: windNum, current: currentNum },
    ruleDetails,
    score:       Number(score.toFixed(4)),
    category:    score < 40 ? 'AMAN' : score < 70 ? 'WASPADA' : 'BAHAYA',
    defuzz:      'centroid-integral',
    };
}

export { evalMamdaniDebug as evalMamdani, evalMamdaniDebug };
