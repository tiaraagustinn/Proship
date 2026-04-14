const tests = [
  { name: 'Root', url: 'http://localhost:5000/' },
  { name: 'Auth Verify', url: 'http://localhost:5000/api/auth/verify' },
  { name: 'Petugas', url: 'http://localhost:5000/api/petugas' },
];

for (const test of tests) {
  try {
    const res = await fetch(test.url);
    const data = await res.json();
    console.log(`\n${test.name} (${test.url}):`);
    console.log(`Status: ${res.status}`);
    console.log(`Data:`, JSON.stringify(data, null, 2));
  } catch (err) {
    console.log(`\n${test.name} - Error: ${err.message}`);
  }
}
