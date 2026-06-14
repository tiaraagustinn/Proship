// lib/config.ts
// Centralized API URL — baca dari env var di production, fallback ke localhost di development
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default API_BASE;
