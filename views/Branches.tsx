
import React, { useState } from 'react';
import { Branch, SubBranch, User } from '../types';

interface BranchesProps {
  branches: Branch[];
  users: User[];
  onAddBranch: (branch: Partial<Branch>) => void;
  onUpdateBranch: (branch: Branch) => void;
  onDeleteBranch: (id: string) => void;
}

const Branches: React.FC<BranchesProps> = ({ branches, users, onAddBranch, onUpdateBranch, onDeleteBranch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [activeBranch, setActiveBranch] = useState<Branch | null>(null);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [editingSubBranch, setEditingSubBranch] = useState<SubBranch | null>(null);
  const [expandedBranchId, setExpandedBranchId] = useState<string | null>(null);
  
  const [branchForm, setBranchForm] = useState({ name: '', leader: '' });
  const [subBranchForm, setSubBranchForm] = useState({ name: '', leader: '' });

  // Sort users alphabetically for the dropdown
  const sortedUsers = [...users].sort((a, b) => a.name.localeCompare(b.name));

  const filteredBranches = branches.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.leader && b.leader.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleBranchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBranch) {
      onUpdateBranch({ ...editingBranch, ...branchForm });
    } else {
      onAddBranch({ ...branchForm, subBranches: [] });
    }
    closeModals();
  };

  const handleSubBranchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBranch) return;

    let updatedSubBranches = [...activeBranch.subBranches];
    if (editingSubBranch) {
      updatedSubBranches = updatedSubBranches.map(sb => 
        sb.id === editingSubBranch.id ? { ...sb, ...subBranchForm } : sb
      );
    } else {
      updatedSubBranches.push({
        id: Math.random().toString(36).substr(2, 9),
        ...subBranchForm
      });
    }

    onUpdateBranch({ ...activeBranch, subBranches: updatedSubBranches });
    closeModals();
  };

  const deleteSubBranch = (branch: Branch, subId: string) => {
    const updatedSubBranches = branch.subBranches.filter(sb => sb.id !== subId);
    onUpdateBranch({ ...branch, subBranches: updatedSubBranches });
  };

  const openBranchModal = (branch?: Branch) => {
    if (branch) {
      setEditingBranch(branch);
      setBranchForm({ name: branch.name, leader: branch.leader || '' });
    } else {
      setEditingBranch(null);
      setBranchForm({ name: '', leader: '' });
    }
    setIsModalOpen(true);
  };

  const openSubBranchModal = (branch: Branch, sub?: SubBranch) => {
    setActiveBranch(branch);
    if (sub) {
      setEditingSubBranch(sub);
      setSubBranchForm({ name: sub.name, leader: sub.leader || '' });
    } else {
      setEditingSubBranch(null);
      setSubBranchForm({ name: '', leader: '' });
    }
    setIsSubModalOpen(true);
  };

  const closeModals = () => {
    setIsModalOpen(false);
    setIsSubModalOpen(false);
    setEditingBranch(null);
    setEditingSubBranch(null);
    setActiveBranch(null);
  };

  const toggleBranch = (id: string) => {
    setExpandedBranchId(expandedBranchId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Struktur Wilayah</h1>
          <p className="text-slate-500 dark:text-slate-400">Kelola hierarki Cabang (Kecamatan) dan Ranting (Desa/Kelurahan).</p>
        </div>
        <button
          onClick={() => openBranchModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 shrink-0"
        >
          <span>🏢</span> Tambah Cabang
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-4">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">🔍</span>
            <input
              type="text"
              placeholder="Cari cabang atau nama ketua..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cabang (Kecamatan)</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ketua Cabang</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Statistik Wilayah</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredBranches.map((branch) => {
                const isExpanded = expandedBranchId === branch.id;
                const leaderUser = users.find(u => u.name === branch.leader);
                const branchMemberCount = users.filter(u => u.branch === branch.name).length;
                
                return (
                  <React.Fragment key={branch.id}>
                    <tr className={`hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors ${isExpanded ? 'bg-indigo-50/20 dark:bg-indigo-900/10' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-xl shadow-sm border border-indigo-200 dark:border-indigo-800">🏢</div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tight">{branch.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">WILAYAH HUKUM BOGOR</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <img 
                            src={leaderUser?.avatar || `https://ui-avatars.com/api/?name=${branch.leader || '?'}&background=random`} 
                            className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-600"
                          />
                          <div>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{branch.leader || 'Belum Ditentukan'}</p>
                            <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter">{leaderUser?.position || 'KETUA TERPILIH'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-[10px] font-black shadow-sm border dark:border-slate-600 uppercase tracking-tighter">
                            {branch.subBranches.length} Ranting
                          </span>
                          <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-[10px] font-black shadow-sm border border-emerald-100 dark:border-emerald-800 uppercase tracking-tighter">
                            👥 {branchMemberCount} Anggota
                          </span>
                          <button 
                            onClick={() => toggleBranch(branch.id)}
                            className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md transition-all ${isExpanded ? 'bg-indigo-600 text-white' : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'}`}
                          >
                            {isExpanded ? 'TUTUP DETAIL' : 'LIHAT DETAIL'}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openBranchModal(branch)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" title="Edit Cabang">✏️</button>
                          <button onClick={() => onDeleteBranch(branch.id)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Hapus Cabang">🗑️</button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded Detail View for Sub-Branches */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={4} className="px-8 py-6 bg-slate-50/50 dark:bg-slate-900/20 border-b border-slate-100 dark:border-slate-700">
                          <div className="animate-in slide-in-from-top-2 duration-300">
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                <span className="w-6 h-[1px] bg-indigo-600"></span> DAFTAR RANTING DI {branch.name.toUpperCase()}
                              </h4>
                              <button 
                                onClick={() => openSubBranchModal(branch)}
                                className="bg-white dark:bg-slate-800 border dark:border-slate-700 text-[10px] font-black px-3 py-1.5 rounded-lg hover:border-indigo-600 transition-colors shadow-sm"
                              >
                                + TAMBAH RANTING
                              </button>
                            </div>
                            
                            {branch.subBranches.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {branch.subBranches.map(sub => {
                                  const picUser = users.find(u => u.name === sub.leader);
                                  const subMemberCount = users.filter(u => u.branch === branch.name && u.subBranch === sub.name).length;
                                  
                                  return (
                                    <div key={sub.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm group hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900 transition-all">
                                      <div className="flex justify-between items-start mb-3">
                                        <div className="flex gap-3">
                                          <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-lg shadow-inner">📍</div>
                                          <div>
                                            <p className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tight">{sub.name}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Ranting / Dojo</p>
                                          </div>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button onClick={() => openSubBranchModal(branch, sub)} className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors">✏️</button>
                                          <button onClick={() => deleteSubBranch(branch, sub.id)} className="p-1.5 text-slate-400 hover:text-red-600 transition-colors">✕</button>
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50 dark:border-slate-700">
                                        <div className="flex flex-col">
                                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Penanggung Jawab</span>
                                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{sub.leader || '-'}</span>
                                        </div>
                                        <div className="bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-lg border border-indigo-100 dark:border-indigo-800">
                                          <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">👥 {subMemberCount} <span className="hidden sm:inline">ANGGOTA</span></span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="py-12 text-center bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed dark:border-slate-700">
                                <span className="text-4xl block mb-2 grayscale opacity-20">📍</span>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest italic">Belum ada ranting terdaftar di cabang ini</p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {filteredBranches.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <span className="text-6xl block mb-4 grayscale opacity-20">🏢</span>
                    <p className="text-slate-400 font-bold uppercase tracking-widest">Tidak ada cabang ditemukan</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Cabang */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in duration-200">
            <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">{editingBranch ? 'Edit Cabang' : 'Tambah Cabang Baru'}</h2>
              <button onClick={closeModals} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleBranchSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Nama Cabang (Kecamatan)</label>
                <input required type="text" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold" value={branchForm.name} onChange={e => setBranchForm({...branchForm, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Ketua Cabang</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                  value={branchForm.leader}
                  onChange={e => setBranchForm({...branchForm, leader: e.target.value})}
                >
                  <option value="">-- Pilih Anggota --</option>
                  {sortedUsers.map(u => (
                    <option key={u.id} value={u.name}>{u.name} ({u.position})</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModals} className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl">Batal</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30">Simpan Cabang</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ranting */}
      {isSubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in duration-200">
            <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">{editingSubBranch ? 'Edit Ranting' : 'Tambah Ranting Baru'}</h2>
              <button onClick={closeModals} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 border-b dark:border-slate-700 text-center">
               <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest leading-none mb-1">WILAYAH CABANG:</p>
               <p className="text-sm font-bold text-indigo-800 dark:text-indigo-200">{activeBranch?.name.toUpperCase()}</p>
            </div>
            <form onSubmit={handleSubBranchSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Nama Ranting (Desa/Kelurahan/Dojo)</label>
                <input required type="text" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold" value={subBranchForm.name} onChange={e => setSubBranchForm({...subBranchForm, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">PIC / Pembina Ranting</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                  value={subBranchForm.leader}
                  onChange={e => setSubBranchForm({...subBranchForm, leader: e.target.value})}
                >
                  <option value="">-- Pilih Anggota --</option>
                  {sortedUsers.map(u => (
                    <option key={u.id} value={u.name}>{u.name} ({u.position})</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModals} className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl">Batal</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30">Simpan Ranting</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Branches;
