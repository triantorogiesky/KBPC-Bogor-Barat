
import React, { useState } from 'react';

interface PositionsProps {
  positions: string[];
  onAdd: (pos: string) => void;
  onDelete: (pos: string) => void;
}

const Positions: React.FC<PositionsProps> = ({ positions, onAdd, onDelete }) => {
  const [newPos, setNewPos] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPos.trim()) {
      onAdd(newPos.trim());
      setNewPos('');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Manajemen Jabatan</h1>
          <p className="text-slate-500 dark:text-slate-400">Sesuaikan daftar jabatan yang tersedia di organisasi Anda.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm sticky top-24">
            <h2 className="font-bold text-slate-800 dark:text-white mb-4">Tambah Jabatan</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Nama Jabatan</label>
                <input
                  required
                  type="text"
                  placeholder="Contoh: QA Engineer"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={newPos}
                  onChange={(e) => setNewPos(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                <span>➕</span> Tambahkan
              </button>
            </form>
            <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
              <p className="text-xs text-indigo-700 dark:text-indigo-400">Tips: Gunakan nama jabatan yang standar untuk memudahkan klasifikasi anggota.</p>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
              <h2 className="font-bold text-slate-800 dark:text-white">Daftar Jabatan Saat Ini</h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {positions.map((pos) => (
                <div key={pos} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm font-bold">
                      {pos.charAt(0)}
                    </div>
                    <span className="font-medium text-slate-700 dark:text-slate-200">{pos}</span>
                  </div>
                  <button
                    onClick={() => onDelete(pos)}
                    className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Hapus Jabatan"
                  >
                    🗑️
                  </button>
                </div>
              ))}
              {positions.length === 0 && (
                <div className="p-12 text-center text-slate-400 dark:text-slate-500">
                  <p>Belum ada jabatan yang dikonfigurasi.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Positions;
