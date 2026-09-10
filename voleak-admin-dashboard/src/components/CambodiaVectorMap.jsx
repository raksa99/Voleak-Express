import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Building2,
  Truck,
  MapPin,
  Sparkles,
  Navigation,
  CheckCircle2,
  ExternalLink,
  Layers,
  Search,
} from 'lucide-react';

// 25 Cambodian Provinces with accurate relative map positions (% coordinates),
// Khmer & English names, and economic/logistics hub metadata.
export const CAMBODIA_PROVINCES = [
  {
    id: 'oddar_meanchey',
    nameEn: 'Oddor Meanchey',
    nameKm: 'ឧត្តរមានជ័យ',
    x: 290,
    y: 260,
    width: 140,
    height: 60,
    zone: 'North',
    path: 'M 220 225 L 345 220 L 405 240 L 400 305 L 300 295 L 230 310 Z',
    labelX: 300,
    labelY: 265,
  },
  {
    id: 'banteay_meanchey',
    nameEn: 'Banteay Meanchey',
    nameKm: 'បន្ទាយមានជ័យ',
    x: 150,
    y: 350,
    zone: 'Northwest',
    path: 'M 105 345 L 220 225 L 230 310 L 230 405 L 140 405 L 85 365 Z',
    labelX: 160,
    labelY: 350,
  },
  {
    id: 'siem_reap',
    nameEn: 'Siem Reap',
    nameKm: 'សៀមរាប',
    x: 330,
    y: 350,
    zone: 'North-Central',
    path: 'M 230 310 L 400 305 L 430 375 L 340 420 L 280 420 L 230 405 Z',
    labelX: 330,
    labelY: 350,
  },
  {
    id: 'preah_vihear',
    nameEn: 'Preah Vihear',
    nameKm: 'ព្រះវិហារ',
    x: 500,
    y: 350,
    zone: 'North',
    path: 'M 405 240 L 500 220 L 600 280 L 600 395 L 430 375 L 400 305 Z',
    labelX: 505,
    labelY: 350,
  },
  {
    id: 'steung_treng',
    nameEn: 'Steung Treng',
    nameKm: 'ស្ទឹងត្រែង',
    x: 690,
    y: 350,
    zone: 'Northeast',
    path: 'M 600 280 L 680 220 L 760 190 L 780 300 L 780 405 L 600 395 Z',
    labelX: 690,
    labelY: 350,
  },
  {
    id: 'ratanakiri',
    nameEn: 'Ratanakiri',
    nameKm: 'រតនគិរី',
    x: 860,
    y: 350,
    zone: 'Northeast',
    path: 'M 760 190 L 920 175 L 945 270 L 950 420 L 780 405 L 780 300 Z',
    labelX: 865,
    labelY: 350,
  },
  {
    id: 'battambang',
    nameEn: 'Battambang',
    nameKm: 'បាត់ដំបង',
    x: 180,
    y: 470,
    zone: 'West',
    path: 'M 140 405 L 230 405 L 280 420 L 275 545 L 120 545 L 75 515 L 75 440 L 115 450 Z',
    labelX: 185,
    labelY: 470,
  },
  {
    id: 'pailin',
    nameEn: 'Pailin',
    nameKm: 'ប៉ៃលិន',
    x: 100,
    y: 485,
    zone: 'West',
    path: 'M 75 440 L 115 450 L 120 520 L 75 515 Z',
    labelX: 98,
    labelY: 485,
  },
  {
    id: 'pursat',
    nameEn: 'Pursat',
    nameKm: 'ពោធិ៍សាត់',
    x: 310,
    y: 580,
    zone: 'West',
    path: 'M 120 545 L 275 545 L 350 510 L 400 595 L 360 690 L 260 640 L 120 640 Z',
    labelX: 310,
    labelY: 580,
  },
  {
    id: 'kampong_thom',
    nameEn: 'Kampong Thom',
    nameKm: 'កំពង់ធំ',
    x: 510,
    y: 510,
    zone: 'Central',
    path: 'M 430 375 L 600 395 L 635 595 L 485 595 L 370 510 L 340 420 Z',
    labelX: 510,
    labelY: 510,
  },
  {
    id: 'kratie',
    nameEn: 'Kratie',
    nameKm: 'ក្រចេះ',
    x: 690,
    y: 520,
    zone: 'East',
    path: 'M 600 395 L 780 405 L 740 555 L 635 595 Z',
    labelX: 690,
    labelY: 520,
  },
  {
    id: 'mondulkiri',
    nameEn: 'Mondulkiri',
    nameKm: 'មណ្ឌលគិរី',
    x: 855,
    y: 520,
    zone: 'East',
    path: 'M 780 405 L 950 420 L 935 590 L 805 650 L 740 555 Z',
    labelX: 855,
    labelY: 520,
  },
  {
    id: 'kampong_chhnang',
    nameEn: 'Kampong Chhnang',
    nameKm: 'កំពង់ឆ្នាំង',
    x: 420,
    y: 630,
    zone: 'Central',
    path: 'M 350 510 L 415 540 L 475 605 L 475 680 L 400 695 L 400 595 Z',
    labelX: 420,
    labelY: 630,
  },
  {
    id: 'kampong_cham',
    nameEn: 'Kampong Cham',
    nameKm: 'កំពង់ចាម',
    x: 540,
    y: 630,
    zone: 'Central-East',
    path: 'M 485 595 L 635 595 L 580 690 L 475 680 L 475 605 Z',
    labelX: 540,
    labelY: 630,
  },
  {
    id: 'tboung_khmum',
    nameEn: 'Tboung Khmum',
    nameKm: 'ត្បូងឃ្មុំ',
    x: 645,
    y: 650,
    zone: 'East',
    path: 'M 635 595 L 740 555 L 805 650 L 710 710 L 580 690 Z',
    labelX: 645,
    labelY: 650,
  },
  {
    id: 'koh_kong',
    nameEn: 'Koh Kong',
    nameKm: 'កោះកុង',
    x: 235,
    y: 730,
    zone: 'Southwest-Coast',
    path: 'M 120 640 L 260 640 L 340 730 L 275 845 L 175 845 L 140 730 Z',
    labelX: 235,
    labelY: 730,
  },
  {
    id: 'kampong_speu',
    nameEn: 'Kampong Speu',
    nameKm: 'កំពង់ស្ពឺ',
    x: 395,
    y: 740,
    zone: 'South-Central',
    path: 'M 360 690 L 475 680 L 445 760 L 340 810 L 340 730 Z',
    labelX: 395,
    labelY: 740,
  },
  {
    id: 'phnom_penh',
    nameEn: 'Phnom Penh',
    nameKm: 'រាជធានីភ្នំពេញ',
    x: 485,
    y: 735,
    zone: 'Capital',
    path: 'M 470 710 L 505 710 L 505 745 L 470 745 Z',
    labelX: 490,
    labelY: 730,
  },
  {
    id: 'kandal',
    nameEn: 'Kandal',
    nameKm: 'កណ្តាល',
    x: 525,
    y: 795,
    zone: 'South-Central',
    path: 'M 475 680 L 580 690 L 550 820 L 505 840 L 445 760 Z',
    labelX: 525,
    labelY: 805,
  },
  {
    id: 'prey_veng',
    nameEn: 'Prey Veng',
    nameKm: 'ព្រៃវែង',
    x: 585,
    y: 740,
    zone: 'Southeast',
    path: 'M 580 690 L 710 710 L 630 820 L 550 820 Z',
    labelX: 585,
    labelY: 740,
  },
  {
    id: 'svay_rieng',
    nameEn: 'Svay Rieng',
    nameKm: 'ស្វាយរៀង',
    x: 640,
    y: 795,
    zone: 'Southeast',
    path: 'M 710 710 L 805 650 L 710 860 L 630 820 Z',
    labelX: 640,
    labelY: 800,
  },
  {
    id: 'takeo',
    nameEn: 'Takeo',
    nameKm: 'តាកែវ',
    x: 475,
    y: 825,
    zone: 'South',
    path: 'M 445 760 L 505 840 L 510 910 L 445 910 L 395 865 Z',
    labelX: 475,
    labelY: 825,
  },
  {
    id: 'kampot',
    nameEn: 'Kampot',
    nameKm: 'កំពត',
    x: 385,
    y: 855,
    zone: 'South-Coast',
    path: 'M 340 810 L 445 760 L 395 865 L 445 910 L 395 925 L 305 895 L 320 840 Z',
    labelX: 385,
    labelY: 855,
  },
  {
    id: 'kep',
    nameEn: 'Kep',
    nameKm: 'កែប',
    x: 390,
    y: 905,
    zone: 'South-Coast',
    path: 'M 380 890 L 405 890 L 405 915 L 380 915 Z',
    labelX: 390,
    labelY: 905,
  },
  {
    id: 'preah_sihanouk',
    nameEn: 'Preah Sihanouk',
    nameKm: 'ព្រះសីហនុ',
    x: 290,
    y: 885,
    zone: 'South-Coast',
    path: 'M 275 845 L 340 810 L 320 840 L 305 895 L 260 870 L 230 845 Z',
    labelX: 288,
    labelY: 880,
  },
];

// Tonle Sap Lake & Mekong Waterways Geometry
const TONLE_SAP_LAKE_PATH =
  'M 280 420 C 310 440, 330 460, 350 510 C 370 540, 415 540, 415 540 C 390 560, 360 540, 330 490 C 290 440, 275 430, 280 420 Z';

const TONLE_SAP_RIVER_PATH =
  'M 370 535 Q 420 580 450 630 T 475 710 T 510 780 T 510 880';

const MEKONG_RIVER_PATH =
  'M 680 220 Q 640 320 635 480 T 560 630 T 490 730 T 540 850';

export default function CambodiaVectorMap({
  operators = [],
  trips = [],
  routes = [],
  selectedProvince,
  onSelectProvince,
  onSelectHub,
  selectedHub,
}) {
  const { t } = useLanguage();
  const [hoveredProvince, setHoveredProvince] = useState(null);
  const [showRoutesOverlay, setShowRoutesOverlay] = useState(true);
  const [showHubsOverlay, setShowHubsOverlay] = useState(true);
  const [showTrucksOverlay, setShowTrucksOverlay] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Map province coordinates for dynamic markers
  const provinceMap = useMemo(() => {
    const map = {};
    CAMBODIA_PROVINCES.forEach((p) => {
      map[p.nameEn.toLowerCase()] = p;
      map[p.id] = p;
    });
    return map;
  }, []);

  // Filtered Provinces based on search
  const filteredProvinces = useMemo(() => {
    if (!searchQuery.trim()) return CAMBODIA_PROVINCES;
    const q = searchQuery.toLowerCase();
    return CAMBODIA_PROVINCES.filter(
      (p) =>
        p.nameEn.toLowerCase().includes(q) ||
        p.nameKm.includes(q) ||
        p.zone.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Derive Hub Coordinates from Province
  const hubsWithCoords = useMemo(() => {
    return (operators || []).map((op, idx) => {
      const provKey = (op.province || 'Phnom Penh').toLowerCase();
      const provData = provinceMap[provKey] || provinceMap['phnom penh'] || { labelX: 490, labelY: 730 };
      // slight jitter so multiple hubs in same province don't overlap completely
      const jitterX = ((idx % 3) - 1) * 16;
      const jitterY = Math.floor(idx / 3) * 14 - 10;
      return {
        ...op,
        mapX: provData.labelX + jitterX,
        mapY: provData.labelY + jitterY,
      };
    });
  }, [operators, provinceMap]);

  return (
    <div className="w-full rounded-3xl bg-[#003893] text-white overflow-hidden shadow-2xl border border-blue-900/60 relative flex flex-col">
      {/* Top Banner Header matching the user's reference image */}
      <div className="pt-6 pb-2 px-6 flex flex-col items-center justify-center text-center relative z-10">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-widest text-white drop-shadow-md uppercase font-sans">
          CAMBODIA MAP
        </h2>
        <p className="text-xs sm:text-sm text-blue-200/90 font-medium tracking-wide mt-1">
          {t('brandSubtitle') || 'Factory-to-Factory Heavy Freight Logistics & SEZ Corridors'}
        </p>

        {/* Map Interactive Filter & Toggle Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3 bg-blue-950/70 p-1.5 sm:p-2 rounded-2xl border border-blue-800/80 backdrop-blur-md text-xs">
          {/* Quick Search */}
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-blue-300 absolute left-2.5" />
            <input
              type="text"
              placeholder="Search province..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 rounded-xl bg-blue-900/60 border border-blue-700/60 text-white placeholder-blue-300 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 w-36 sm:w-44"
            />
          </div>

          {/* Layer Toggles */}
          <button
            onClick={() => setShowHubsOverlay(!showHubsOverlay)}
            className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
              showHubsOverlay
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                : 'bg-blue-900/80 text-blue-300 hover:bg-blue-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>SEZ Hubs ({operators?.length || 0})</span>
          </button>

          <button
            onClick={() => setShowRoutesOverlay(!showRoutesOverlay)}
            className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
              showRoutesOverlay
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                : 'bg-blue-900/80 text-blue-300 hover:bg-blue-800'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Corridors</span>
          </button>

          <button
            onClick={() => setShowTrucksOverlay(!showTrucksOverlay)}
            className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
              showTrucksOverlay
                ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/30'
                : 'bg-blue-900/80 text-blue-300 hover:bg-blue-800'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Live Trucks</span>
          </button>

          {selectedProvince && (
            <button
              onClick={() => onSelectProvince && onSelectProvince(null)}
              className="px-2.5 py-1 rounded-xl bg-rose-500/80 hover:bg-rose-500 text-white font-bold text-xs"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Main Vector SVG Map Canvas */}
      <div className="relative w-full h-[620px] sm:h-[680px] lg:h-[760px] flex items-center justify-center p-2">
        <svg
          viewBox="0 0 1020 960"
          className="w-full h-full max-h-full drop-shadow-2xl select-none"
          style={{ filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.5))' }}
        >
          {/* Subtle Map Ambient Glow */}
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="tonleSapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00b4d8" />
              <stop offset="100%" stopColor="#0077b6" />
            </linearGradient>
            <linearGradient id="provinceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
            <linearGradient id="provinceHoverGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#fde047" />
            </linearGradient>
          </defs>

          {/* 1. All 25 Provinces Polygons */}
          <g id="provinces-group">
            {CAMBODIA_PROVINCES.map((p) => {
              const isHovered = hoveredProvince?.id === p.id;
              const isSelected = selectedProvince?.id === p.id;
              const isFiltered = filteredProvinces.some((fp) => fp.id === p.id);

              return (
                <path
                  key={p.id}
                  d={p.path}
                  fill={
                    isSelected
                      ? '#f59e0b'
                      : isHovered
                      ? '#fed7aa'
                      : isFiltered
                      ? '#f1f5f9'
                      : '#cbd5e1'
                  }
                  stroke="#3b82f6"
                  strokeWidth={isSelected ? '3.5' : isHovered ? '2.5' : '1.4'}
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredProvince(p)}
                  onMouseLeave={() => setHoveredProvince(null)}
                  onClick={() => onSelectProvince && onSelectProvince(p)}
                />
              );
            })}
          </g>

          {/* 2. Tonle Sap Lake & Mekong Waterways (Vibrant Blue Water) */}
          <g id="waterways-group" className="pointer-events-none">
            {/* Tonle Sap River */}
            <path
              d={TONLE_SAP_RIVER_PATH}
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="5"
              strokeLinecap="round"
              opacity="0.9"
            />
            {/* Mekong River */}
            <path
              d={MEKONG_RIVER_PATH}
              fill="none"
              stroke="#0284c7"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.8"
            />
            {/* Tonle Sap Lake Body */}
            <path
              d={TONLE_SAP_LAKE_PATH}
              fill="url(#tonleSapGradient)"
              stroke="#0284c7"
              strokeWidth="2"
              className="animate-pulse"
            />
            {/* Tonle Sap Text Label in the center */}
            <g transform="translate(315, 465) rotate(-35)">
              <text
                textAnchor="middle"
                fontSize="11"
                fontWeight="bold"
                fill="#ffffff"
                className="select-none"
              >
                ទន្លេសាប
              </text>
              <text
                y="12"
                textAnchor="middle"
                fontSize="10"
                fontWeight="900"
                fill="#ffffff"
                className="select-none"
              >
                Tonle
              </text>
              <text
                y="22"
                textAnchor="middle"
                fontSize="10"
                fontWeight="900"
                fill="#ffffff"
                className="select-none"
              >
                Sap
              </text>
              <text
                y="32"
                textAnchor="middle"
                fontSize="9"
                fontWeight="bold"
                fill="#ffffff"
                className="select-none"
              >
                River
              </text>
            </g>
          </g>

          {/* 3. Province Khmer & English Labels */}
          <g id="province-labels" className="pointer-events-none">
            {CAMBODIA_PROVINCES.map((p) => {
              const isSelected = selectedProvince?.id === p.id;
              const isHovered = hoveredProvince?.id === p.id;

              return (
                <g key={`lbl-${p.id}`} transform={`translate(${p.labelX}, ${p.labelY})`}>
                  {/* Khmer Name (Top) */}
                  <text
                    x="0"
                    y="-5"
                    textAnchor="middle"
                    fill={isSelected ? '#78350f' : isHovered ? '#1e3a8a' : '#1e3a8a'}
                    fontSize="11"
                    fontWeight="bold"
                    className="select-none"
                  >
                    {p.nameKm}
                  </text>
                  {/* English Name (Bottom) */}
                  <text
                    x="0"
                    y="9"
                    textAnchor="middle"
                    fill={isSelected ? '#92400e' : isHovered ? '#1d4ed8' : '#1d4ed8'}
                    fontSize="10"
                    fontWeight="800"
                    className="select-none font-sans"
                  >
                    {p.nameEn}
                  </text>
                </g>
              );
            })}
          </g>

          {/* 4. Connected Freight Highway Corridor Overlays */}
          {showRoutesOverlay && (
            <g id="corridor-lines" className="pointer-events-none">
              {/* National Road 4: Phnom Penh ⇄ Sihanoukville */}
              <line
                x1="490"
                y1="730"
                x2="288"
                y2="880"
                stroke="#f59e0b"
                strokeWidth="4"
                strokeDasharray="6 4"
                className="animate-pulse"
              />
              {/* National Road 1: Phnom Penh ⇄ Bavet (Svay Rieng) */}
              <line
                x1="490"
                y1="730"
                x2="640"
                y2="800"
                stroke="#10b981"
                strokeWidth="4"
                strokeDasharray="6 4"
              />
              {/* National Road 5/6: Phnom Penh ⇄ Siem Reap & Poipet */}
              <polyline
                points="490,730 420,630 330,350 160,350"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="3.5"
                strokeDasharray="6 4"
              />
            </g>
          )}

          {/* 5. Industrial SEZ Hub Interactive Markers */}
          {showHubsOverlay && (
            <g id="hub-markers">
              {hubsWithCoords.map((hub) => {
                const isSelected = selectedHub?.id === hub.id;
                return (
                  <g
                    key={hub.id}
                    transform={`translate(${hub.mapX}, ${hub.mapY})`}
                    className="cursor-pointer group"
                    onClick={() => onSelectHub && onSelectHub(hub)}
                  >
                    {/* Pulsing Outer Radar Circle */}
                    <circle
                      r="16"
                      fill="#f59e0b"
                      opacity="0.3"
                      className="animate-ping origin-center"
                    />
                    {/* Hub Pin Base */}
                    <circle
                      r="10"
                      fill={isSelected ? '#ea580c' : '#f59e0b'}
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      className="drop-shadow-lg"
                    />
                    {/* Hub Icon Glyph */}
                    <text
                      x="0"
                      y="3.5"
                      textAnchor="middle"
                      fontSize="10"
                      fill="#ffffff"
                      fontWeight="bold"
                    >
                      🏭
                    </text>
                    {/* Hub Label Floating Tooltip */}
                    <g transform="translate(0, -18)" className="opacity-95">
                      <rect
                        x="-50"
                        y="-16"
                        width="100"
                        height="18"
                        rx="9"
                        fill="#0f172a"
                        stroke="#f59e0b"
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="-4"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="9"
                        fontWeight="bold"
                      >
                        {hub.code || hub.name?.slice(0, 12)}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          )}

          {/* 6. Active Freight Trucks Live Markers */}
          {showTrucksOverlay && (
            <g id="truck-markers">
              {/* Truck on NR4 Corridor */}
              <g transform="translate(380, 810)" className="cursor-pointer animate-bounce">
                <circle r="11" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                <text x="0" y="3.5" textAnchor="middle" fontSize="10">
                  🚚
                </text>
              </g>
              {/* Truck on NR1 Bavet Corridor */}
              <g transform="translate(565, 765)" className="cursor-pointer">
                <circle r="11" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                <text x="0" y="3.5" textAnchor="middle" fontSize="10">
                  🚛
                </text>
              </g>
            </g>
          )}
        </svg>

        {/* Floating Interactive Province Inspector Card */}
        {hoveredProvince && (
          <div className="absolute bottom-4 left-4 z-30 p-4 rounded-2xl bg-slate-950/90 text-white backdrop-blur-md border border-blue-500/40 shadow-2xl max-w-xs animate-fadeIn space-y-1.5">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div>
                <h4 className="font-extrabold text-sm text-amber-400">
                  {hoveredProvince.nameKm}
                </h4>
                <p className="text-xs font-bold text-slate-200">
                  {hoveredProvince.nameEn} ({hoveredProvince.zone})
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold">
                Zone {hoveredProvince.zone}
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Click to view connected SEZ logistics hubs, freight routes, and active dispatch manifests for {hoveredProvince.nameEn}.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Summary Bar */}
      <div className="px-6 py-3 bg-blue-950/90 border-t border-blue-900/80 flex flex-wrap items-center justify-between gap-3 text-xs text-blue-200">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>SEZ Hub Logistics Terminals</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0ea5e9]" />
            <span>Tonle Sap Waterway & Lake</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Primary Freight Corridors</span>
          </span>
        </div>
        <div className="text-[11px] text-blue-300/80">
          25 Provinces & Autonomous Port Gateways • Kingdom of Cambodia
        </div>
      </div>
    </div>
  );
}
