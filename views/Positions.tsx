
import React, { useState } from 'react';

interface PositionsProps {
  positions: string[];
  onAdd: (pos: string) => void;
  onUpdate: (oldPos: string, newPos: string) => void;
  onDelete: (pos: string) => void;
}

const Positions: React.FC<PositionsProps> = ({ positions, onAdd, onUpdate, onDelete }) => {
  const [newPos, setNewPos] = useState('');
  const [editingPos, setEditingPos] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPos = newPos.trim();
    if (!cleanPos) return;

    if (editingPos) {
      onUpdate(editingPos, cleanPos);
      setEditingPos(null);
    } else {
      onAdd(cleanPos);
    }
    setNewPos('');
  };

  const handleEdit = (pos: string) => {
    setEditingPos(pos);
    setNewPos(pos);
  };

  const cancelEdit = () => {
    setEditingPos(null);
    setNewPos('');
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
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm sticky top-24 transition-all">
            <h2 className="font-bold text-slate-800 dark:text-white mb-4 uppercase text-xs tracking-wider flex items-center gap-2">
              {editingPos ? <><span className="text-indigo-600">✏️</span> Edit Jabatan</> : <><span className="text-emerald-600">➕</span> Tambah Jabatan</>}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Nama Jabatan</label>
                <input
                  required
                  type="text"
                  placeholder="Contoh: QA Engineer"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                  value={newPos}
                  onChange={(e) => setNewPos(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="submit"
                  className={`w-full py-2.5 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 ${
                    editingPos ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  <span>{editingPos ? '💾' : '➕'}</span> {editingPos ? 'Simpan Perubahan' : 'Tambahkan Jabatan'}
                </button>
                {editingPos && (
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
            <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
              <p className="text-[10px] font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-widest leading-relaxed">Tips: Mengubah nama jabatan akan otomatis memperbarui data seluruh anggota yang memiliki jabatan tersebut.</p>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 flex justify-between items-center">
              <h2 className="font-bold text-slate-800 dark:text-white uppercase text-xs tracking-widest">Daftar Jabatan Terdaftar</h2>
              <span className="text-[10px] font-black bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full uppercase">{positions.length} JABATAN</span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[600px] overflow-y-auto custom-scrollbar">
              {positions.map((pos) => (
                <div key={pos} className={`p-4 flex items-center justify-between transition-colors group ${editingPos === pos ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black shadow-sm border ${
                      editingPos === pos 
                        ? 'bg-indigo-600 text-white border-indigo-700' 
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-600'
                    }`}>
                      {pos.charAt(0).toUpperCase()}
                    </div>
                    <span className={`font-bold uppercase tracking-tight ${editingPos === pos ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200'}`}>{pos}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(pos)}
                      className={`p-2 rounded-lg transition-all ${
                        editingPos === pos 
                          ? 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900' 
                          : 'text-slate-300 dark:text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 opacity-0 group-hover:opacity-100'
                      }`}
                      title="Edit Nama Jabatan"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onDelete(pos)}
                      disabled={editingPos === pos}
                      className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
                      title="Hapus Jabatan"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
              {positions.length === 0 && (
                <div className="p-12 text-center text-slate-400 dark:text-slate-500">
                  <div className="text-4xl mb-2 grayscale opacity-30">💼</div>
                  <p className="text-xs font-bold uppercase tracking-widest">Belum ada jabatan yang dikonfigurasi.</p>
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
