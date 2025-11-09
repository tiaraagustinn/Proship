"use client";
import React, { useEffect, useState } from 'react';

type RuleDetail = {
  idx: number;
  antecedent: number[];
  degrees: Array<number | null>;
  ruleStrength: number;
  weighted: number;
};

export default function FuzzyPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputs, setInputs] = useState<{ wave:number, wind:number, current:number } | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [rules, setRules] = useState<RuleDetail[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('http://localhost:5000/api/fuzzy/evaluate');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setInputs(data.inputs ?? null);
        setScore(data.score ?? null);
        setCategory(data.category ?? null);
        setRules(data.ruleDetails ?? []);
      } catch (err:any) {
        setError(String(err.message || err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <main style={{ padding: 20, fontFamily: 'Inter, system-ui, sans-serif' }} className="bg-white">
      <h1>Fuzzy Safety Evaluation</h1>
      {loading && <p>Loading...</p>}
      {error && <div style={{ color: 'crimson' }}>Error: {error}</div>}

      {!loading && !error && (
        <section>
          <h2>Inputs</h2>
          <ul>
            <li>Wave (m): {inputs?.wave ?? '-'}</li>
            <li>Wind (kt): {inputs?.wind ?? '-'}</li>
            <li>Current (cm/s): {inputs?.current ?? '-'}</li>
          </ul>

          <h2>Result</h2>
          <p>Score: <strong>{score ?? '-'}</strong></p>
          <p>Category: <strong>{category ?? '-'}</strong></p>

          <h3>Sample Rules</h3>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: 6 }}>#</th>
                <th style={{ border: '1px solid #ddd', padding: 6 }}>Antecedent (wave,wind,current)</th>
                <th style={{ border: '1px solid #ddd', padding: 6 }}>Degrees</th>
                <th style={{ border: '1px solid #ddd', padding: 6 }}>Strength</th>
              </tr>
            </thead>
            <tbody>
              {rules.slice(0, 12).map(r => (
                <tr key={r.idx}>
                  <td style={{ border: '1px solid #eee', padding: 6 }}>{r.idx}</td>
                  <td style={{ border: '1px solid #eee', padding: 6 }}>{r.antecedent.join(',')}</td>
                  <td style={{ border: '1px solid #eee', padding: 6 }}>{r.degrees.map(d => d==null? '-' : d.toFixed(3)).join(',')}</td>
                  <td style={{ border: '1px solid #eee', padding: 6 }}>{r.ruleStrength}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}
