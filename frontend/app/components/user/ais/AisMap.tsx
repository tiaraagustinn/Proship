'use client';

// Koordinat center: perairan Sabang - Banda Aceh
const CENTER_LAT = 5.72;
const CENTER_LNG = 95.32;
const ZOOM = 11;

const embedUrl =
  `https://www.marinetraffic.com/en/ais/embed/zoom:${ZOOM}/centery:${CENTER_LAT}/centerx:${CENTER_LNG}` +
  `/maptype:4/shownames:true/mmsi:0/shipid:0/fleet:/fleet_id:/vtypes:/showmenu:/remember:false`;

export default function AisMap() {
  return (
    <div>
      <div className="relative">
        <iframe
          src={embedUrl}
          style={{ width: '100%', height: '560px', border: 'none' }}
          allowFullScreen
          loading="lazy"
          title="AIS Tracker - Perairan Sabang Banda Aceh"
        />
      </div>

      {/* Legend */}
      <div className="px-5 py-4 bg-gray-50 border-t border-gray-200">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Keterangan Jenis Kapal</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { color: '#3b82f6', label: 'Penumpang',     desc: 'Feri & kapal penumpang' },
            { color: '#22c55e', label: 'Kargo',        desc: 'Kapal muatan barang' },
          ].map(({ color, label, desc }) => (
            <div key={label} className="flex items-start gap-2.5">
              <svg width="14" height="18" viewBox="0 0 20 24" fill="none" className="mt-0.5 flex-shrink-0">
                <path d="M10 0L18 20H10H2L10 0Z" fill={color} stroke="white" strokeWidth="1.5" />
              </svg>
              <div>
                <p className="text-xs font-semibold text-gray-700">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Data real-time via MarineTraffic. Klik ikon kapal di peta untuk melihat detail informasi.
        </p>
      </div>
    </div>
  );
}
