'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface WeatherPoint {
  id: number;
  lat: number;
  lng: number;
  label: string;
  waveMin: number;
  waveMax: number;
  windMin: number;
  windMax: number;
  windDir: string;
  weather: string;
  waveCat: string;
}

interface ForecastItem {
  time: string;
  weather: string;
  wave_cat: string;
  wave_height: number;
  wind_from: string;
  wind_speed: number;
  wind_gust?: number;
}

const ULEE_LHEUE: [number, number] = [5.5636, 95.2914];
const BALOHAN: [number, number]    = [5.8467, 95.3767];
const MAP_CENTER: [number, number] = [5.705, 95.334];
const MAP_BOUNDS: [[number, number], [number, number]] = [[5.25, 94.85], [6.15, 95.75]];

const SEA_ROUTE: [number, number][] = [
  ULEE_LHEUE,
  [5.615, 95.302],
  [5.670, 95.318],
  [5.730, 95.348],
  BALOHAN,
];

const DEFAULT_POINTS: WeatherPoint[] = [
  { id: 1, lat: 5.568, lng: 95.288, label: 'Dekat Ulee Lheue',  waveMin: 0.3, waveMax: 0.6, windMin: 10, windMax: 14, windDir: 'Tenggara',  weather: 'Cerah Berawan', waveCat: 'Rendah' },
  { id: 2, lat: 5.630, lng: 95.305, label: 'Selatan Selat',     waveMin: 0.5, waveMax: 0.9, windMin: 12, windMax: 16, windDir: 'Selatan',    weather: 'Cerah',         waveCat: 'Rendah' },
  { id: 3, lat: 5.700, lng: 95.322, label: 'Tengah Selat',      waveMin: 0.8, waveMax: 1.2, windMin: 14, windMax: 20, windDir: 'Barat Daya', weather: 'Berawan',       waveCat: 'Sedang' },
  { id: 4, lat: 5.775, lng: 95.352, label: 'Utara Selat',       waveMin: 0.6, waveMax: 1.0, windMin: 12, windMax: 18, windDir: 'Barat',      weather: 'Cerah',         waveCat: 'Rendah' },
  { id: 5, lat: 5.840, lng: 95.374, label: 'Dekat Balohan',     waveMin: 0.4, waveMax: 0.7, windMin: 10, windMax: 15, windDir: 'Timur Laut', weather: 'Cerah',         waveCat: 'Rendah' },
  { id: 6, lat: 5.520, lng: 95.200, label: 'Perairan Barat',    waveMin: 1.0, waveMax: 1.5, windMin: 16, windMax: 22, windDir: 'Barat Daya', weather: 'Berawan',       waveCat: 'Sedang' },
  { id: 7, lat: 5.620, lng: 95.480, label: 'Perairan Timur',    waveMin: 0.5, waveMax: 0.8, windMin: 10, windMax: 14, windDir: 'Timur',      weather: 'Cerah',         waveCat: 'Rendah' },
  { id: 8, lat: 5.920, lng: 95.250, label: 'Barat Laut Sabang', waveMin: 1.2, waveMax: 1.8, windMin: 18, windMax: 25, windDir: 'Barat',      weather: 'Hujan Ringan',  waveCat: 'Tinggi' },
];

const WAVE_SCALE = [
  { color: '#22c55e', label: '< 0.5 m',    sub: 'Tenang' },
  { color: '#84cc16', label: '0.5–1.0 m',  sub: 'Rendah' },
  { color: '#eab308', label: '1.0–1.5 m',  sub: 'Sedang' },
  { color: '#f97316', label: '1.5–2.0 m',  sub: 'Tinggi' },
  { color: '#ef4444', label: '≥ 2.0 m',    sub: 'Sangat Tinggi' },
];

const WIND_SCALE = [
  { color: '#22c55e', label: '< 12 kt',   sub: 'Lemah' },
  { color: '#eab308', label: '12–18 kt',  sub: 'Sedang' },
  { color: '#f97316', label: '18–25 kt',  sub: 'Kencang' },
  { color: '#ef4444', label: '≥ 25 kt',   sub: 'Sangat Kencang' },
];

function waveColor(max: number): string {
  if (max >= 2.0) return '#ef4444';
  if (max >= 1.5) return '#f97316';
  if (max >= 1.0) return '#eab308';
  if (max >= 0.5) return '#84cc16';
  return '#22c55e';
}

function waveLabel(max: number): string {
  if (max >= 2.0) return 'Sangat Tinggi';
  if (max >= 1.5) return 'Tinggi';
  if (max >= 1.0) return 'Sedang';
  if (max >= 0.5) return 'Rendah';
  return 'Tenang';
}

function windColor(max: number): string {
  if (max >= 25) return '#ef4444';
  if (max >= 18) return '#f97316';
  if (max >= 12) return '#eab308';
  return '#22c55e';
}

function windLabel(max: number): string {
  if (max >= 25) return 'Sangat Kencang';
  if (max >= 18) return 'Kencang';
  if (max >= 12) return 'Sedang';
  return 'Lemah';
}

function createPortIcon(name: string) {
  return L.divIcon({
    html: `
      <div style="display:flex;flex-direction:column;align-items:center">
        <div style="background:linear-gradient(135deg,#1e3a8a,#1d4ed8);color:white;border:2.5px solid #fff;border-radius:50%;width:38px;height:38px;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 3px 10px rgba(0,0,0,0.35)">⚓</div>
        <div style="background:rgba(15,30,80,0.9);color:white;font-size:10px;font-weight:700;padding:2px 8px;border-radius:6px;margin-top:3px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.3);letter-spacing:0.3px">${name}</div>
      </div>`,
    className: '',
    iconSize: [90, 56],
    iconAnchor: [45, 19],
    popupAnchor: [0, -22],
  });
}

function createWeatherMarkerIcon(value: string, unit: string, color: string) {
  return L.divIcon({
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.25))">
        <div style="background:${color};border:2.5px solid white;border-radius:50%;width:46px;height:46px;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1">
          <span style="color:white;font-size:12px;font-weight:800">${value}</span>
          <span style="color:rgba(255,255,255,0.85);font-size:9px;font-weight:600">${unit}</span>
        </div>
      </div>`,
    className: '',
    iconSize: [46, 46],
    iconAnchor: [23, 23],
    popupAnchor: [0, -26],
  });
}

export default function LeafletMap() {
  const [points, setPoints] = useState<WeatherPoint[]>(DEFAULT_POINTS);
  const [selectedLayer, setSelectedLayer] = useState<'gelombang' | 'angin'>('gelombang');
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/maritim-weather/sabang-bandaAceh')
      .then(r => r.json())
      .then(data => {
        // Gabungkan forecast_day1 dan forecast_day2-4 dari struktur API BMKG Maritim baru
        const forecasts: ForecastItem[] = [
          ...(data.forecast_day1 || []),
          ...(data['forecast_day2-4'] || []),
        ];
        if (!forecasts.length) return;

        // Cari entry forecast terdekat dengan waktu sekarang (real-time)
        const now = new Date();
        let closestEntry: ForecastItem | null = null;
        let minDiff = Infinity;

        for (const entry of forecasts) {
          const timeUtc = new Date(entry.time.replace(' UTC', 'Z'));
          const diff = Math.abs(timeUtc.getTime() - now.getTime());
          if (diff < minDiff) {
            minDiff = diff;
            closestEntry = entry;
          }
        }

        if (closestEntry) {
          const cur = closestEntry;
          setPoints(prev => prev.map((p) => {
            // Berikan faktor pengali geografis/lokasi agar peta berasa realistik & spasial
            let factor = 1.0;
            if (p.id === 1) factor = 0.65;      // Dekat Ulee Lheue (teluk/terlindungi)
            else if (p.id === 2) factor = 0.85; // Selatan Selat
            else if (p.id === 3) factor = 1.0;  // Tengah Selat (laut terbuka)
            else if (p.id === 4) factor = 0.95; // Utara Selat
            else if (p.id === 5) factor = 0.75; // Dekat Balohan (teluk/terlindungi)
            else if (p.id === 6) factor = 1.15; // Perairan Barat
            else if (p.id === 7) factor = 0.8;  // Perairan Timur
            else if (p.id === 8) factor = 1.25; // Barat Laut Sabang (laut terbuka)

            const rawWave = cur.wave_height || 1.0;
            const rawWind = cur.wind_speed || 10;
            const rawGust = cur.wind_gust || (rawWind * 1.35);

            const waveMax = Number((rawWave * factor).toFixed(2));
            const waveMin = Number((waveMax * 0.6).toFixed(2));

            const windMax = Math.round(rawGust * factor);
            const windMin = Math.round(rawWind * factor);

            return {
              ...p,
              waveMin,
              waveMax,
              windMin,
              windMax,
              windDir: cur.wind_from || p.windDir,
              weather: cur.weather || p.weather,
              waveCat: waveMax < 0.5 ? 'Tenang' : waveMax < 1.0 ? 'Rendah' : waveMax < 1.5 ? 'Sedang' : waveMax < 2.0 ? 'Tinggi' : 'Sangat Tinggi',
            };
          }));
          
          // Format penerbitan BMKG asli untuk label info peta
          const issuedDate = new Date(data.issued.replace(' UTC', 'Z'));
          const wibTime = new Date(issuedDate.getTime() + 7 * 3600 * 1000);
          setLastUpdated(wibTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB (BMKG)');
        }
      })
      .catch(() => {});
  }, []);

  const portIconBandaAceh = createPortIcon('Ulee Lheue');
  const portIconBalohan   = createPortIcon('Balohan');
  const isWave            = selectedLayer === 'gelombang';
  const scale             = isWave ? WAVE_SCALE : WIND_SCALE;

  return (
    <div>
      <div className="relative">

        {/* Layer toggle — kiri atas */}
        <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-1 bg-white rounded-2xl shadow-lg border border-gray-100 p-1.5">
          {(['gelombang', 'angin'] as const).map(layer => (
            <button
              key={layer}
              onClick={() => setSelectedLayer(layer)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                selectedLayer === layer
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <span className="text-sm">{layer === 'gelombang' ? '🌊' : '💨'}</span>
              <span>{layer === 'gelombang' ? 'Gelombang' : 'Angin'}</span>
            </button>
          ))}
        </div>

        {/* Timestamp — kiri bawah */}
        {lastUpdated && (
          <div className="absolute bottom-3 left-3 z-[1000] flex items-center gap-1.5 bg-white/95 backdrop-blur text-xs text-gray-600 px-3 py-1.5 rounded-xl shadow border border-gray-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Data BMKG · {lastUpdated} WIB
          </div>
        )}

        <MapContainer
          center={MAP_CENTER}
          zoom={11}
          minZoom={10}
          maxZoom={14}
          maxBounds={MAP_BOUNDS}
          maxBoundsViscosity={1.0}
          zoomControl={false}
          style={{ height: '540px', width: '100%' }}
        >
          <ZoomControl position="bottomright" />

          {/* Tile layer — CartoDB Voyager (lebih bersih & modern) */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {/* Rute pelayaran */}
          <Polyline
            positions={SEA_ROUTE}
            pathOptions={{ color: '#2563eb', weight: 3.5, dashArray: '10 7', opacity: 0.9 }}
          />

          {/* Pelabuhan */}
          <Marker position={ULEE_LHEUE} icon={portIconBandaAceh}>
            <Popup>
              <div className="text-sm min-w-[170px]">
                <p className="font-bold text-base mb-1">⚓ Pelabuhan Ulee Lheue</p>
                <p className="text-gray-500 text-xs">Banda Aceh · 5.5636°N, 95.2914°E</p>
                <p className="mt-2 text-blue-700 font-semibold text-xs">Terminal penyeberangan Banda Aceh – Sabang</p>
              </div>
            </Popup>
          </Marker>

          <Marker position={BALOHAN} icon={portIconBalohan}>
            <Popup>
              <div className="text-sm min-w-[170px]">
                <p className="font-bold text-base mb-1">⚓ Pelabuhan Balohan</p>
                <p className="text-gray-500 text-xs">Sabang · 5.8467°N, 95.3767°E</p>
                <p className="mt-2 text-blue-700 font-semibold text-xs">Terminal penyeberangan Sabang – Banda Aceh</p>
              </div>
            </Popup>
          </Marker>

          {/* Titik cuaca */}
          {points.map(pt => {
            const color      = isWave ? waveColor(pt.waveMax) : windColor(pt.windMax);
            const badgeLabel = isWave ? waveLabel(pt.waveMax) : windLabel(pt.windMax);
            const value      = isWave ? pt.waveMax.toFixed(1) : pt.windMax.toString();
            const unit       = isWave ? 'm' : 'kt';

            return (
              <Marker
                key={pt.id}
                position={[pt.lat, pt.lng]}
                icon={createWeatherMarkerIcon(value, unit, color)}
              >
                <Popup>
                  <div className="text-sm min-w-[190px]">
                    <p className="font-bold text-gray-800 text-base mb-3">{pt.label}</p>
                    <div className="space-y-2 text-gray-700">
                      <div className="flex justify-between items-center gap-4">
                        <span className="flex items-center gap-1 text-gray-500"><span>🌊</span> Gelombang</span>
                        <span className="font-semibold text-gray-800">{pt.waveMin}–{pt.waveMax} m</span>
                      </div>
                      <div className="flex justify-between items-center gap-4">
                        <span className="flex items-center gap-1 text-gray-500"><span>💨</span> Angin</span>
                        <span className="font-semibold text-gray-800">{pt.windMin}–{pt.windMax} kt</span>
                      </div>
                      <div className="flex justify-between items-center gap-4">
                        <span className="flex items-center gap-1 text-gray-500"><span>🧭</span> Arah</span>
                        <span className="font-semibold text-gray-800">{pt.windDir}</span>
                      </div>
                      <div className="flex justify-between items-center gap-4">
                        <span className="flex items-center gap-1 text-gray-500"><span>☁️</span> Cuaca</span>
                        <span className="font-semibold text-gray-800">{pt.weather}</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-100">
                      <span
                        className="inline-block text-white text-xs font-bold px-3 py-1 rounded-full"
                        style={{ backgroundColor: color }}
                      >
                        {badgeLabel}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="px-5 py-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {isWave ? '🌊 Tinggi Gelombang' : '💨 Kecepatan Angin'}
            </p>
            <div className="flex flex-wrap gap-3">
              {scale.map(({ color, label, sub }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-xs text-gray-600">{label} <span className="text-gray-400">({sub})</span></span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500 border-l border-gray-200 pl-4">
            <div className="flex items-center gap-1.5">
              <div className="w-6 border-t-2 border-dashed border-blue-500" />
              <span>Rute Penyeberangan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>⚓</span>
              <span>Pelabuhan</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
