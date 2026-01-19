
import React, { useState } from 'react';
import { BeltLevel } from '../types';

interface BeltLevelsProps {
  beltLevels: BeltLevel[];
  onAdd: (belt: BeltLevel) => void;
  onUpdate: (oldBeltName: string, updatedBelt: BeltLevel) => void;
  onDelete: (beltName: string) => void;
}

const PRESET_COLORS = [
  '#cbd5e1', // Putih/Grey
  '#fbbf24', // Kuning
  '#10b981', // Hijau
  '#3b82f6', // Biru
  '#92400e', // Cokelat
  '#0f172a', // Hitam
  '#ef4444', // Merah
  '#8b5cf6', // Ungu
];

const BeltLevels: React.FC<BeltLevelsProps> = ({ beltLevels, onAdd, onUpdate, onDelete }) => {
  const [beltName, setBeltName] = useState('');
  const [beltPredicate, setBeltPredicate] = useState('');
  const [beltColor, setBeltColor] = useState('#cbd5e1');
  const [editingBelt, setEditingBelt] = useState<BeltLevel | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = beltName.trim();
    const cleanPredicate = beltPredicate.trim();
    if (!cleanName) return;

    const newBelt: BeltLevel = { 
      name: cleanName, 
      color: beltColor,
      predicate: cleanPredicate || '-'
    };

    if (editingBelt) {
      onUpdate(editingBelt.name, newBelt);
      setEditingBelt(null);
    } else {
      onAdd(newBelt);
    }
    setBeltName('');
    setBeltPredicate('');
    setBeltColor('#cbd5e1');
  };

  const handleEdit = (belt: BeltLevel) => {
    setEditingBelt(belt);
    setBeltName(belt.name);
    setBeltPredicate(belt.predicate);
    setBeltColor(belt.color);
  };

  const cancelEdit = () => {
    setEditingBelt(null);
    setBeltName('');
    setBeltPredicate('');
    setBeltColor('#cbd5e1');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Manajemen Tingkat Sabuk</h1>
          <p className="text-slate-500 dark:text-slate-400">Kelola standarisasi tingkatan, predikat, dan warna sabuk organisasi.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm sticky top-24 transition-all">
            <h2 className="font-bold text-slate-800 dark:text-white mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
              {editingBelt ? (
                <><span className="text-indigo-600">✏️</span> Edit Sabuk</>
              ) : (
                <><span className="text-emerald-600">➕</span> Tambah Sabuk</>
              )}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Nama Sabuk</label>
                  <input
                    required
                    type="text"
                    placeholder="Contoh: Calon (Kuning)"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={beltName}
                    onChange={(e) => setBeltName(e.target.value)}
                    autoFocus={!!editingBelt}
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Predikat Standar</label>
                  <input
                    type="text"
                    placeholder="Contoh: Wira Putra"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={beltPredicate}
                    onChange={(e) => setBeltPredicate(e.target.value)}
                  />
                  <p className="text-[10px] text-slate-400 mt-1 italic">Akan menjadi predikat otomatis saat anggota memilih sabuk ini.</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block">Pilih Warna Sabuk</label>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setBeltColor(color)}
                      className={`h-8 rounded-lg border-2 transition-all ${
                        beltColor === color ? 'border-indigo-600 scale-110 shadow-md' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-700 border dark:border-slate-600 dark:text-white rounded-lg text-xs font-mono uppercase"
                      value={beltColor}
                      onChange={(e) => setBeltColor(e.target.value)}
                    />
                  </div>
                  <input
                    type="color"
                    className="w-10 h-10 p-0.5 rounded-lg border dark:border-slate-600 cursor-pointer"
                    value={beltColor}
                    onChange={(e) => setBeltColor(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="submit"
                  className={`w-full py-2.5 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 ${
                    editingBelt ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  <span>🥋</span> {editingBelt ? 'Update Sabuk' : 'Simpan Sabuk'}
                </button>
                {editingBelt && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="w-full py-2 text-slate-500 dark:text-slate-400 font-bold hover:underline text-xs"
                  >
                    Batal Edit
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
              <h2 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-tighter">Standarisasi Sabuk CIMANDE</h2>
              <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">{beltLevels.length} LEVEL</span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {beltLevels.map((belt, index) => (
                <div 
                  key={belt.name} 
                  className={`p-4 flex items-center justify-between transition-all group ${
                    editingBelt?.name === belt.name ? 'bg-indigo-50 dark:bg-indigo-900/20 ring-l-4 ring-indigo-500' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-xs font-black text-slate-300 dark:text-slate-600 w-4 text-center">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="w-12 h-5 rounded border shadow-sm" style={{ backgroundColor: belt.color }}></div>
                    <div className="flex flex-col">
                      <span className={`font-bold transition-colors ${editingBelt?.name === belt.name ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200'}`}>
                        {belt.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-indigo-500/70 dark:text-indigo-400/70 uppercase">📜 {belt.predicate}</span>
                        <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase">{belt.color}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(belt)}
                      className={`p-2 rounded-lg transition-all ${
                        editingBelt?.name === belt.name ? 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900' : 'text-slate-300 dark:text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 opacity-0 group-hover:opacity-100'
                      }`}
                      title="Edit Nama/Warna Sabuk"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onDelete(belt.name)}
                      disabled={editingBelt?.name === belt.name}
                      className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
                      title="Hapus Tingkat Sabuk"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
              {beltLevels.length === 0 && (
                <div className="p-12 text-center text-slate-400 dark:text-slate-500">
                  <div className="text-4xl mb-2">🥋</div>
                  <p>Belum ada tingkatan sabuk yang dikonfigurasi.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeltLevels;
