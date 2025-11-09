import { runFuzzyFromUrl, fetchAndPrepareInputsFromFile } from "./src/services/fuzzyProcess.js";
import fs from 'fs';
import path from 'path';

const arg = process.argv[2];

async function main() {
  try {
    if (arg && fs.existsSync(arg)) {
      // treat as local file path
      const inputs = fetchAndPrepareInputsFromFile(arg);
      // call evaluator directly (re-use runFuzzyFromUrl's behaviour)
      const result = await (await import('./src/services/fuzzyProcess.js')).runFuzzyFromUrl(undefined);
      // Note: runFuzzyFromUrl always fetches from URL; for local-file path we will instead
      // run the eval directly here to avoid HTTP.
      // But to keep it simple, if arg is a path, call the service functions directly.
    }

    // Default: try HTTP URL first, but fall back to local data file if HTTP fails.
    try {
      const url = arg || "http://localhost:5000/api/dummy/perairan/dummy.json";
      await runFuzzyFromUrl(url);
      return;
    } catch (httpErr) {
      const filePath = path.join(process.cwd(), 'data', 'dummy.json');
      console.warn('HTTP fetch failed, falling back to local file:', filePath);
      const inputs = fetchAndPrepareInputsFromFile(filePath);
      // call the evaluator directly from utils
      const { evalMamdaniDebug } = await import('./src/utils/fuzzyMamdani.js');
      const result = evalMamdaniDebug(inputs.wave, inputs.wind, inputs.current, { step: 0.5 });
      console.log('Inputs used for fuzzy processing (file):', { wave: inputs.wave, wind: inputs.wind, current: inputs.current });
      console.log('Fuzzy result summary:');
      console.log('  score:', result.score);
      console.log('  category:', result.category);
      console.log('  rule count:', result.ruleDetails?.length ?? 0);
      if (result.ruleDetails && result.ruleDetails.length) {
        console.log('  sample rules (first 6):');
        result.ruleDetails.slice(0,6).forEach(r => {
          const degs = r.degrees.map(d => d==null ? '-' : d.toFixed(3)).join(',');
          console.log(`    rule ${r.idx}: antecedent=${r.antecedent.join(',')} degrees=${degs} strength=${r.ruleStrength}`);
        });
      }
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
