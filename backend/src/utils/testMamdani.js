import { evalMamdani } from './fuzzyMamdani.js';

const wave = 3.0;
const wind = 7.0;
const current = 56.9;

const result = evalMamdani(wave, wind, current);
console.log('Result from fuzzyMamdani.js with wave=3:', JSON.stringify(result, null, 2));
