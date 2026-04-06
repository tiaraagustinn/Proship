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
  const waveMfs = [
    trapmf(wave, [0,0,0.5,1.25]),
    trimf(wave, [1,1.75,2.5]),
    trimf(wave, [2.5,3.25,4.0]),
    trapmf(wave, [3.5,4.0,6.0,6.0])
  ];
  const windMfs = [
    trapmf(wind, [0,0,5,10]),
    trimf(wind, [10,15,20]),
    trimf(wind, [20,25,30]),
    trapmf(wind, [30,35,40,40])
  ];
  const currentMfs = [
    trapmf(current, [0,0,10,25]),
    trimf(current, [25,50,75]),
    trapmf(current, [70,80,100,100])
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
    const a1 = (i1 === 0) ? 1 : waveMfs[i1-1];
    const a2 = (i2 === 0) ? 1 : windMfs[i2-1];
    const a3 = (i3 === 0) ? 1 : currentMfs[i3-1];
    const ruleStrength = (conn === 1) ? Math.min(a1,a2,a3) : Math.max(a1,a2,a3);
    const weighted = ruleStrength * weight;
    ruleDetails.push({
      idx: ri+1, antecedent: [i1,i2,i3], degrees: [a1,a2,a3], ruleStrength: Number(ruleStrength.toFixed(6)), weighted
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

export { evalMamdaniDebug };
