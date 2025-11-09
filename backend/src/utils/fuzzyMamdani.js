// fuzzyMamdaniDebug.js
function trapmf(x, params) {
  const [a,b,c,d] = params;
  if (b === a && c === d) {
    // degenerate trap (flat top at 1 between b and c)
    if (x >= b && x <= c) return 1;
  }
  if (x <= a) return 0;
  if (x >= d) return 0;
  if (x >= b && x <= c) return 1;
  if (x > a && x < b) return (x - a) / (b - a);
  // x > c && x < d
  return (d - x) / (d - c);
}

function trimf(x, params) {
  const [a,b,c] = params;
  if (x <= a) return 0;
  if (x >= c) return 0;
  if (x === b) return 1;
  if (x > a && x < b) return (x - a) / (b - a);
  return (c - x) / (c - b);
}

const outputMfsDefs = {
  1: { type: 'trap', params: [60,80,100,100] }, // Aman
  2: { type: 'tri', params: [30,50,70] },       // Waspada
  3: { type: 'trap', params: [0,0,20,40] }      // Bahaya
};

const rules = [
  [4,0,0,3,1,2],
  [0,4,0,3,1,2],
  [3,3,3,3,1,1],
  [3,3,2,3,1,1],
  [2,3,3,3,1,1],
  [2,2,2,2,1,1],
  [1,2,2,2,1,1],
  [2,1,2,2,1,1],
  [2,2,1,2,1,1],
  [1,1,1,1,1,1],
  [1,1,2,1,1,1],
  [2,1,1,1,1,1],
  [3,2,2,2,1,1],
  [3,2,3,3,1,1],
  [2,3,2,3,1,1],
  [1,3,1,2,1,1],
  [1,1,3,2,1,1],
  [4,4,0,3,1,2]
];

function computeInputMfs(wave, wind, current) {
  // Membership functions aligned to category boundaries you provided:
  // Wave (m): Rendah 0-1.25, Sedang 1.25-2.5, Tinggi 2.5-4.0, Sangat Tinggi >4.0
  const waveMfs = [
    trapmf(wave, [0,0,0,1.25]),           // Rendah
    trimf(wave, [1.25, (1.25+2.5)/2, 2.5]),
    trimf(wave, [2.5, (2.5+4.0)/2, 4.0]),
    trapmf(wave, [4.0,4.5,6.0,6.0])       // Sangat Tinggi
  ];
  const windMfs = [
    // Wind (kt): Tenang 0-10, Sedang 10-20, Kencang 20-30, Sangat Kencang >30
    trapmf(wind, [0,0,0,10]),
    trimf(wind, [10,15,20]),
    trimf(wind, [20,25,30]),
    trapmf(wind, [30,35,50,50])
  ];
  const currentMfs = [
    // Current (cm/s): Lemah 0-25, Sedang 25-75, Kuat >75
    trapmf(current, [0,0,0,25]),
    trimf(current, [25,50,75]),
    trapmf(current, [75,80,100,100])
  ];
  return { waveMfs, windMfs, currentMfs };
}

function evalMamdaniDebug(wave, wind, current, opts = {}) {
  const step = opts.step ?? 0.1;
  const { waveMfs, windMfs, currentMfs } = computeInputMfs(wave, wind, current);
  const xs = [];
  for (let x = 0; x <= 100; x = Number((x + step).toFixed(6))) xs.push(x);
  const agg = new Array(xs.length).fill(0);

  const ruleDetails = [];
  for (let ri = 0; ri < rules.length; ri++) {
    const r = rules[ri];
    const [i1,i2,i3,outIdx,weight,conn] = r;
    // Build list of actual antecedent degrees (ignore 0 = don't-care entries)
    const antecedentDegrees = [];
    const degreesDisplay = [null, null, null];
    if (i1 !== 0) { antecedentDegrees.push(waveMfs[i1-1]); degreesDisplay[0] = waveMfs[i1-1]; }
    if (i2 !== 0) { antecedentDegrees.push(windMfs[i2-1]); degreesDisplay[1] = windMfs[i2-1]; }
    if (i3 !== 0) { antecedentDegrees.push(currentMfs[i3-1]); degreesDisplay[2] = currentMfs[i3-1]; }

    let ruleStrength;
    if (antecedentDegrees.length === 0) {
      // No antecedents specified -> rule always applies
      ruleStrength = 1;
    } else {
      ruleStrength = (conn === 1) ? Math.min(...antecedentDegrees) : Math.max(...antecedentDegrees);
    }
    const weighted = ruleStrength * weight;
    ruleDetails.push({
      idx: ri+1,
      antecedent: [i1,i2,i3],
      degrees: degreesDisplay,
      ruleStrength: Number(ruleStrength.toFixed(6)),
      weighted
    });

    if (weighted <= 0) continue;

    const def = outputMfsDefs[outIdx];
    for (let xi = 0; xi < xs.length; xi++) {
      const x = xs[xi];
      let mfVal = 0;
      if (def.type === 'trap') mfVal = trapmf(x, def.params);
      else mfVal = trimf(x, def.params);
      const clipped = Math.min(weighted, mfVal);
      if (clipped > agg[xi]) agg[xi] = clipped;
    }
  }

  // centroid
  let num = 0, den = 0;
  for (let i = 0; i < xs.length; i++) {
    num += xs[i] * agg[i];
    den += agg[i];
  }
  const score = den === 0 ? 0 : num/den;

  return {
    input: { wave, wind, current },
    ruleDetails,
    xs, agg, score: Number(score.toFixed(6)),
    category: score < 40 ? 'Bahaya' : score < 70 ? 'Waspada' : 'Aman'
  };
}

// Export both a named evalMamdani (used by controller) and the debug name.
export { evalMamdaniDebug as evalMamdani, evalMamdaniDebug };
