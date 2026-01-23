
import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { Branch, SubBranch, User } from '../types';

interface MapViewProps {
  branches: Branch[];
  users: User[];
}

const MapView: React.FC<MapViewProps> = ({ branches, users }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Flatten branches to get all sub-branches with coordinates and member count
  const mappedSubBranches = useMemo(() => {
    const list: (SubBranch & { branchName: string; memberCount: number })[] = [];
    branches.forEach(b => {
      b.subBranches.forEach(sb => {
        if (sb.latitude && sb.longitude) {
          // Hitung anggota berdasarkan kecocokan cabang dan ranting
          const count = users.filter(u => u.branch === b.name && u.subBranch === sb.name).length;
          list.push({ ...sb, branchName: b.name, memberCount: count });
        }
      });
    });
    return list;
  }, [branches, users]);

  const totalSubBranches = branches.reduce((acc, b) => acc + b.subBranches.length, 0);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map if not already done
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: [-6.5944, 106.7892], // Default focus on Bogor
        zoom: 11,
        zoomControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; KBPC Digital'
      }).addTo(mapRef.current);

      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add new markers
    const group = L.featureGroup();
    
    mappedSubBranches.forEach(sb => {
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div class="relative w-8 h-8 bg-indigo-600 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-white text-[10px] font-black ring-4 ring-indigo-500/20">
            ${sb.code || '??'}
            <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-indigo-600 rotate-45 border-r-2 border-b-2 border-white"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

      const popupContent = `
        <div class="p-4 w-56 font-sans">
          <p class="text-[8px] font-black text-indigo-500 uppercase tracking-widest mb-1">${sb.branchName}</p>
          <h5 class="text-sm font-black text-slate-800 uppercase tracking-tighter leading-none mb-3">[${sb.code}] ${sb.name}</h5>
          
          <div class="space-y-2 mb-4">
            <div class="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-100">
              <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-xs shadow-sm">👤</div>
              <div class="min-w-0">
                <p class="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Pimpinan</p>
                <p class="text-[10px] font-bold text-slate-700 truncate">${sb.leader || 'Belum Ada PIC'}</p>
              </div>
            </div>
            
            <div class="flex items-center gap-3 p-2 bg-emerald-50 rounded-xl border border-emerald-100">
              <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-xs shadow-sm">👥</div>
              <div class="min-w-0">
                <p class="text-[7px] font-black text-emerald-500 uppercase tracking-widest leading-none mb-1">Anggota Aktif</p>
                <p class="text-[10px] font-bold text-emerald-700 truncate">${sb.memberCount} Jiwa</p>
              </div>
            </div>
          </div>

          <a href="https://www.google.com/maps?q=${sb.latitude},${sb.longitude}" target="_blank" rel="noopener noreferrer" class="block w-full py-2.5 bg-indigo-600 text-white text-center rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20">📍 Navigasi Google Maps</a>
        </div>
      `;

      const marker = L.marker([sb.latitude!, sb.longitude!], { icon: customIcon })
        .bindPopup(popupContent, { 
          closeButton: false, 
          className: 'custom-leaflet-popup',
          offset: L.point(0, -10)
        })
        .addTo(map);

      markersRef.current.push(marker);
      group.addLayer(marker);
    });

    // Auto-fit bounds if we have markers
    if (mappedSubBranches.length > 0) {
      map.fitBounds(group.getBounds(), { padding: [50, 50] });
    }

    // Refresh layout
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      // Instance cleanup on unmount
    };
  }, [mappedSubBranches, users]);

  const flyToLocation = (lat: number, lng: number) => {
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lng], 15, {
        duration: 1.5,
        easeLinearity: 0.25
      });
      
      // Find and open the popup for this marker
      markersRef.current.forEach(m => {
        const pos = m.getLatLng();
        if (pos.lat === lat && pos.lng === lng) {
          m.openPopup();
        }
      });
    }
  };

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col lg:flex-row gap-6 animate-in fade-in duration-700">
      {/* Sidebar List */}
      <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0 h-full">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-4 overflow-hidden h-full">
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Sebaran Wilayah</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Pemetaan GPS Ranting KBPC</p>
          </div>
          
          <div className="flex gap-2 p-1 bg-slate-50 dark:bg-slate-900 rounded-xl">
             <div className="flex-1 py-2 text-center">
                <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 leading-none">{mappedSubBranches.length}</p>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Terpetakan</p>
             </div>
             <div className="w-[1px] bg-slate-200 dark:bg-slate-700 my-2"></div>
             <div className="flex-1 py-2 text-center">
                <p className="text-lg font-black text-slate-300 dark:text-slate-600 leading-none">{totalSubBranches - mappedSubBranches.length}</p>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Belum Ada GPS</p>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar -mr-2 pr-2 space-y-2">
             {mappedSubBranches.length > 0 ? (
               mappedSubBranches.map((sb) => (
                <button
                  key={sb.id}
                  onClick={() => flyToLocation(sb.latitude!, sb.longitude!)}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-left hover:border-indigo-400 hover:bg-white dark:hover:bg-slate-700 transition-all group"
                >
                  <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mb-1">{sb.branchName}</p>
                  <h5 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none mb-2">
                    [{sb.code}] {sb.name}
                  </h5>
                  <div className="flex items-center justify-between">
                     <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 truncate max-w-[140px]">PIC: {sb.leader || '-'}</span>
                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-0.5">{sb.memberCount} Anggota</span>
                     </div>
                     <span className="text-[8px] font-mono text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 px-1.5 py-0.5 rounded h-fit">LOC</span>
                  </div>
                </button>
               ))
             ) : (
               <div className="py-10 text-center">
                  <span className="text-4xl block mb-4 grayscale opacity-20">📍</span>
                  <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed px-4">Belum ada data ranting yang memiliki koordinat GPS.</p>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Map Content */}
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden relative z-0">
        <div ref={mapContainerRef} className="w-full h-full"></div>
        
        {/* Map Legend/Overlay */}
        <div className="absolute top-6 left-6 z-[1000] p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl pointer-events-none">
           <h4 className="text-[9px] font-black text-slate-800 dark:text-white uppercase tracking-widest mb-2 flex items-center gap-2">
             <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
             Status Operasional Wilayah
           </h4>
           <p className="text-[8px] text-slate-500 dark:text-slate-400 font-medium">Menampilkan lokasi ranting yang terverifikasi melalui koordinat global.</p>
        </div>
      </div>

      <style>{`
        .leaflet-popup-content-wrapper {
          padding: 0;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
        }
        .leaflet-popup-content {
          margin: 0;
        }
        .leaflet-popup-tip {
          box-shadow: none;
        }
      `}</style>
    </div>
  );
};

export default MapView;
