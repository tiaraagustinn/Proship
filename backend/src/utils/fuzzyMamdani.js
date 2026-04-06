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

const outputMfsDefs = {
  1: { type: "trap", params: [60, 80, 100, 100] },
  2: { type: "tri", params: [30, 50, 70] },
  3: { type: "trap", params: [0, 0, 20, 40] },
};

const rules = [
  [4, 0, 0, 3, 1, 2],
  [0, 4, 0, 3, 1, 2],
  [3, 3, 3, 3, 1, 1],
  [3, 3, 2, 3, 1, 1],
  [2, 3, 3, 3, 1, 1],
  [2, 2, 2, 2, 1, 1],
  [1, 2, 2, 2, 1, 1],
  [2, 1, 2, 2, 1, 1],
  [2, 2, 1, 2, 1, 1],
  [1, 1, 1, 1, 1, 1],
  [1, 1, 2, 1, 1, 1],
  [2, 1, 1, 1, 1, 1],
  [3, 2, 2, 2, 1, 1],
  [3, 2, 3, 3, 1, 1],
  [2, 3, 2, 3, 1, 1],
  [1, 3, 1, 2, 1, 1],
  [1, 1, 3, 2, 1, 1],
  [4, 4, 0, 3, 1, 2],
];

function computeInputMfs(wave, wind, current) {
  const waveMfs = [
    trapmf(wave, [0, 0, 0, 1.25]),
    trimf(wave, [1.25, (1.25 + 2.5) / 2, 2.5]),
    trimf(wave, [2.5, (2.5 + 4.0) / 2, 4.0]),
    trapmf(wave, [4.0, 4.5, 6.0, 6.0]),
  ];
  const windMfs = [
    trapmf(wind, [0, 0, 0, 10]),
    trimf(wind, [10, 15, 20]),
    trimf(wind, [20, 25, 30]),
    trapmf(wind, [30, 35, 50, 50]),
  ];
  const currentMfs = [
    trapmf(current, [0, 0, 0, 25]),
    trimf(current, [25, 50, 75]),
    trapmf(current, [75, 80, 100, 100]),
  ];
  return { waveMfs, windMfs, currentMfs };
}

function evalMamdaniDebug(wave, wind, current, opts = {}) {
  const waveNum = Number(wave);
  const windNum = Number(wind);
  const currentNum = Number(current);

  if (![waveNum, windNum, currentNum].every(Number.isFinite)) {
    throw new Error("wave, wind, and current must be numeric values");
  }

  const step = opts.step ?? 0.1;
  const { waveMfs, windMfs, currentMfs } = computeInputMfs(waveNum, windNum, currentNum);
  const xs = [];
  for (let x = 0; x <= 100; x = Number((x + step).toFixed(6))) xs.push(x);
  const agg = new Array(xs.length).fill(0);

  const ruleDetails = [];
  for (let ri = 0; ri < rules.length; ri++) {
    const [i1, i2, i3, outIdx, weight, conn] = rules[ri];

    const antecedentDegrees = [];
    const degreesDisplay = [null, null, null];
    if (i1 !== 0) {
      antecedentDegrees.push(waveMfs[i1 - 1]);
      degreesDisplay[0] = waveMfs[i1 - 1];
    }
    if (i2 !== 0) {
      antecedentDegrees.push(windMfs[i2 - 1]);
      degreesDisplay[1] = windMfs[i2 - 1];
    }
    if (i3 !== 0) {
      antecedentDegrees.push(currentMfs[i3 - 1]);
      degreesDisplay[2] = currentMfs[i3 - 1];
    }

    let ruleStrength;
    if (antecedentDegrees.length === 0) {
      ruleStrength = 1;
    } else {
      ruleStrength = conn === 1 ? Math.min(...antecedentDegrees) : Math.max(...antecedentDegrees);
    }

    const weighted = ruleStrength * weight;
    ruleDetails.push({
      idx: ri + 1,
      antecedent: [i1, i2, i3],
      degrees: degreesDisplay,
      ruleStrength: Number(ruleStrength.toFixed(6)),
      weighted: Number(weighted.toFixed(6)),
    });

    if (weighted <= 0) continue;

    const def = outputMfsDefs[outIdx];
    for (let xi = 0; xi < xs.length; xi++) {
      const x = xs[xi];
      const mfVal = def.type === "trap" ? trapmf(x, def.params) : trimf(x, def.params);
      const clipped = Math.min(weighted, mfVal);
      if (clipped > agg[xi]) agg[xi] = clipped;
    }
  }

  let num = 0;
  let den = 0;
  for (let i = 0; i < xs.length; i++) {
    num += xs[i] * agg[i];
    den += agg[i];
  }
  const score = den === 0 ? 0 : num / den;

  return {
    input: { wave: waveNum, wind: windNum, current: currentNum },
    ruleDetails,
    xs,
    agg,
    score: Number(score.toFixed(6)),
    category: score < 40 ? "BAHAYA" : score < 70 ? "WASPADA" : "AMAN",
  };
}

export { evalMamdaniDebug as evalMamdani, evalMamdaniDebug };
