
import React, { useState, useMemo, useRef } from 'react';
import { Branch, SubBranch, User } from '../types';
import * as XLSX from 'xlsx';

interface BranchesProps {
  branches: Branch[];
  users: User[];
  onAddBranch: (branch: Partial<Branch>) => void;
  onUpdateBranch: (branch: Branch) => void;
  onDeleteBranch: (id: string) => void;
  onBulkAddBranches: (branches: Branch[]) => void;
  showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const Branches: React.FC<BranchesProps> = ({ 
  branches, users, onAddBranch, onUpdateBranch, onDeleteBranch, onBulkAddBranches, showNotification 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [activeBranch, setActiveBranch] = useState<Branch | null>(null);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [editingSubBranch, setEditingSubBranch] = useState<SubBranch | null>(null);
  const [expandedBranchId, setExpandedBranchId] = useState<string | null>(null);
  
  const [branchForm, setBranchForm] = useState({ name: '', leader: '', code: '' });
  const [subBranchForm, setSubBranchForm] = useState({ name: '', leader: '', code: '', latitude: '', longitude: '' });

  const importInputRef = useRef<HTMLInputElement>(null);

  // Filter khusus untuk Ketua Cabang
  const branchLeaderCandidates = useMemo(() => 
    users.filter(u => u.position === 'Ketua Cabang')
         .sort((a, b) => a.name.localeCompare(b.name)), 
    [users]
  );

  // Filter khusus untuk Pelatih (PIC Ranting)
  const coachCandidates = useMemo(() => 
    users.filter(u => u.isCoach)
         .sort((a, b) => a.name.localeCompare(b.name)), 
    [users]
  );

  const filteredBranches = branches.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.code.includes(searchTerm) ||
    (b.leader && b.leader.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleBranchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedCode = branchForm.code.padStart(2, '0');
    if (editingBranch) {
      onUpdateBranch({ ...editingBranch, ...branchForm, code: formattedCode });
    } else {
      onAddBranch({ ...branchForm, code: formattedCode, subBranches: [] });
    }
    closeModals();
  };

  const handleSubBranchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBranch) return;

    const formattedCode = subBranchForm.code.padStart(2, '0');
    let updatedSubBranches = [...activeBranch.subBranches];
    
    const subData = {
      ...subBranchForm,
      code: formattedCode,
      latitude: subBranchForm.latitude ? parseFloat(subBranchForm.latitude) : undefined,
      longitude: subBranchForm.longitude ? parseFloat(subBranchForm.longitude) : undefined,
    };

    if (editingSubBranch) {
      updatedSubBranches = updatedSubBranches.map(sb => 
        sb.id === editingSubBranch.id ? { ...sb, ...subData } : sb
      );
    } else {
      updatedSubBranches.push({
        id: Math.random().toString(36).substr(2, 9),
        ...subData
      });
    }

    onUpdateBranch({ ...activeBranch, subBranches: updatedSubBranches });
    closeModals();
  };

  const handleExport = () => {
    const exportData: any[] = [];
    branches.forEach(b => {
      if (b.subBranches.length === 0) {
        exportData.push({
          'Kode Cabang': b.code,
          'Nama Cabang': b.name,
          'Pimpinan Cabang': b.leader || '',
          'Kode Ranting': '',
          'Nama Ranting': '',
          'PIC Ranting': '',
          'Lat Ranting': '',
          'Long Ranting': ''
        });
      } else {
        b.subBranches.forEach(sb => {
          exportData.push({
            'Kode Cabang': b.code,
            'Nama Cabang': b.name,
            'Pimpinan Cabang': b.leader || '',
            'Kode Ranting': sb.code,
            'Nama Ranting': sb.name,
            'PIC Ranting': sb.leader || '',
            'Lat Ranting': sb.latitude || '',
            'Long Ranting': sb.longitude || ''
          });
        });
      }
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Struktur_Wilayah");
    XLSX.writeFile(wb, `Struktur_Wilayah_KBPC_${new Date().toISOString().split('T')[0]}.xlsx`);
    showNotification('Data wilayah berhasil diekspor.', 'success');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        const branchMap: Record<string, Branch> = {};

        data.forEach(item => {
          const bCode = String(item['Kode Cabang'] || '00');
          if (!branchMap[bCode]) {
            branchMap[bCode] = {
              id: `br-${Math.random().toString(36).substr(2, 9)}`,
              code: bCode,
              name: String(item['Nama Cabang'] || 'Cabang Baru'),
              leader: String(item['Pimpinan Cabang'] || ''),
              subBranches: []
            };
          }

          if (item['Nama Ranting']) {
            branchMap[bCode].subBranches.push({
              id: `sb-${Math.random().toString(36).substr(2, 9)}`,
              code: String(item['Kode Ranting'] || '00'),
              name: String(item['Nama Ranting']),
              leader: String(item['PIC Ranting'] || ''),
              latitude: item['Lat Ranting'] ? parseFloat(item['Lat Ranting']) : undefined,
              longitude: item['Long Ranting'] ? parseFloat(item['Long Ranting']) : undefined
            });
          }
        });

        onBulkAddBranches(Object.values(branchMap));
        if (importInputRef.current) importInputRef.current.value = '';
      } catch (error) {
        showNotification('Gagal impor wilayah. Periksa format Excel.', 'error');
      }
    };
    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        'Kode Cabang': '01',
        'Nama Cabang': 'Bogor Tengah',
        'Pimpinan Cabang': 'Nama Pimpinan',
        'Kode Ranting': '01',
        'Nama Ranting': 'Sempur',
        'PIC Ranting': 'Nama PIC',
        'Lat Ranting': '-6.5944',
        'Long Ranting': '106.7892'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template_Struktur");
    XLSX.writeFile(wb, "Template_Struktur_KBPC.xlsx");
    showNotification('Template wilayah berhasil diunduh.', 'info');
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setSubBranchForm(prev => ({
          ...prev,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString()
        }));
      }, (error) => {
        alert("Gagal mengambil lokasi: " + error.message);
      });
    } else {
      alert("Geolocation tidak didukung oleh browser ini.");
    }
  };

  const deleteSubBranch = (branch: Branch, subId: string) => {
    if(confirm('Apakah Anda yakin ingin menghapus ranting ini?')) {
      const updatedSubBranches = branch.subBranches.filter(sb => sb.id !== subId);
      onUpdateBranch({ ...branch, subBranches: updatedSubBranches });
    }
  };

  const openBranchModal = (branch?: Branch) => {
    if (branch) {
      setEditingBranch(branch);
      setBranchForm({ name: branch.name, leader: branch.leader || '', code: branch.code || '' });
    } else {
      setEditingBranch(null);
      setBranchForm({ name: '', leader: '', code: '' });
    }
    setIsModalOpen(true);
  };

  const openSubBranchModal = (branch: Branch, sub?: SubBranch) => {
    setActiveBranch(branch);
    if (sub) {
      setEditingSubBranch(sub);
      setSubBranchForm({ 
        name: sub.name, 
        leader: sub.leader || '', 
        code: sub.code || '',
        latitude: sub.latitude?.toString() || '',
        longitude: sub.longitude?.toString() || ''
      });
    } else {
      setEditingSubBranch(null);
      setSubBranchForm({ name: '', leader: '', code: '', latitude: '', longitude: '' });
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Struktur Wilayah KBPC</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Pemetaan hierarki organisasi dari tingkat Cabang hingga Ranting.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={() => openBranchModal()}
            className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 uppercase tracking-widest text-[10px]"
          >
            <span>🏢</span> Tambah Cabang
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 relative w-full">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">🔍</span>
          <input
            type="text"
            placeholder="Cari cabang, kode, atau nama ketua..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
           <button onClick={handleExport} className="flex-1 md:flex-none px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2" title="Ekspor Wilayah">
             <span>📥</span> Export
           </button>
           <button onClick={() => importInputRef.current?.click()} className="flex-1 md:flex-none px-4 py-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-600 hover:text-white transition-all flex items-center justify-center gap-2" title="Impor Wilayah">
             <span>📤</span> Import
           </button>
           <button onClick={downloadTemplate} className="flex-1 md:flex-none px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-2" title="Download Template Excel">
             <span>📋</span> Template
           </button>
           <input type="file" ref={importInputRef} onChange={handleImport} className="hidden" accept=".xlsx, .xls" />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Identitas Cabang</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Pimpinan Cabang</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Kekuatan Anggota</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-right">Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredBranches.map((branch) => {
                const isExpanded = expandedBranchId === branch.id;
                const leaderUser = users.find(u => u.name === branch.leader);
                const branchMembers = users.filter(u => u.branch === branch.name);
                const branchMemberCount = branchMembers.length;
                
                return (
                  <React.Fragment key={branch.id}>
                    <tr className={`hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-all ${isExpanded ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-2xl flex items-center justify-center text-sm font-mono font-black border border-slate-100 dark:border-slate-600 shadow-sm text-indigo-600 dark:text-indigo-400">
                            {branch.code || '??'}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tighter">[{branch.code}] {branch.name}</p>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Wilayah Bogor</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <img 
                            src={leaderUser?.avatar || `https://ui-avatars.com/api/?name=${branch.leader || '?'}&background=random`} 
                            className="w-10 h-10 rounded-xl border-2 border-white dark:border-slate-700 shadow-sm object-cover"
                            alt="Leader"
                          />
                          <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-white leading-none">{branch.leader || 'Belum Ditentukan'}</p>
                            <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-1">{leaderUser?.position || 'KETUA CABANG'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-3 py-1 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-[10px] font-black shadow-sm border dark:border-slate-600 uppercase tracking-widest">
                            {branch.subBranches.length} Ranting
                          </span>
                          <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-[10px] font-black shadow-sm border border-emerald-100 dark:border-emerald-800 uppercase tracking-widest">
                            {branchMemberCount} Jiwa
                          </span>
                          <button 
                            onClick={() => toggleBranch(branch.id)}
                            className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl transition-all border ${isExpanded ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800 hover:bg-indigo-600 hover:text-white'}`}
                          >
                            {isExpanded ? 'TUTUP' : 'DETIL'}
                          </button>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openBranchModal(branch)} className="p-2.5 bg-slate-50 dark:bg-slate-700 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-colors shadow-sm" title="Edit Cabang">✏️</button>
                          <button onClick={() => onDeleteBranch(branch.id)} className="p-2.5 bg-slate-50 dark:bg-slate-700 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors shadow-sm" title="Hapus Cabang">🗑️</button>
                        </div>
                      </td>
                    </tr>
                    
                    {isExpanded && (
                      <tr>
                        <td colSpan={4} className="px-0 py-0 overflow-hidden bg-slate-50/50 dark:bg-slate-900/40">
                          <div className="p-8 space-y-8 animate-in slide-in-from-top-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                               <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                                  <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center text-xl">🏛️</div>
                                  <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Unit</p>
                                    <p className="text-xl font-black text-slate-800 dark:text-white">{branch.subBranches.length} Ranting</p>
                                  </div>
                               </div>
                               <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                                  <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center text-xl">👥</div>
                                  <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Massa Aktif</p>
                                    <p className="text-xl font-black text-slate-800 dark:text-white">{branchMemberCount} Jiwa</p>
                                  </div>
                               </div>
                               <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                                  <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/40 rounded-xl flex items-center justify-center text-xl">🥋</div>
                                  <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Instruktur</p>
                                    <p className="text-xl font-black text-amber-500">{branchMembers.filter(u => u.isCoach).length} Pelatih</p>
                                  </div>
                               </div>
                               <button 
                                  onClick={() => openSubBranchModal(branch)}
                                  className="bg-indigo-600 p-5 rounded-3xl shadow-xl shadow-indigo-500/20 text-white flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all active:scale-95 group"
                               >
                                  <span className="text-[10px] font-black uppercase tracking-widest">Registrasi Ranting</span>
                                  <span className="text-xl group-hover:rotate-90 transition-transform">➕</span>
                               </button>
                            </div>

                            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                              <div className="px-8 py-5 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                <h4 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em]">Mapping Ranting & Penanggung Jawab</h4>
                                <span className="text-[9px] font-bold text-slate-400 uppercase">CABANG {branch.name.toUpperCase()} [{branch.code}]</span>
                              </div>
                              
                              <div className="divide-y divide-slate-50 dark:divide-slate-700">
                                {branch.subBranches.length > 0 ? (
                                  branch.subBranches.map((sub, idx) => {
                                    const picUser = users.find(u => u.name === sub.leader);
                                    const subMembersCount = branchMembers.filter(u => u.subBranch === sub.name).length;
                                    
                                    return (
                                      <div key={sub.id} className="px-8 py-5 flex flex-col md:flex-row items-center gap-6 hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-all group">
                                        <div className="flex items-center gap-6 w-full md:w-1/3 shrink-0">
                                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-mono font-black border dark:border-slate-600 text-indigo-500">
                                            {sub.code || '??'}
                                          </div>
                                          <div className="flex items-center gap-4">
                                            <div>
                                              <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tighter">[{sub.code}] {sub.name}</p>
                                              <div className="flex items-center gap-2 mt-0.5">
                                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">ID: {sub.id.slice(0, 5).toUpperCase()}</p>
                                                {sub.latitude && sub.longitude && (
                                                  <a 
                                                    href={`https://www.google.com/maps?q=${sub.latitude},${sub.longitude}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-md text-[7px] font-black uppercase tracking-tighter hover:bg-indigo-600 hover:text-white transition-all"
                                                  >
                                                    📍 LOKASI
                                                  </a>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="flex-1 flex items-center gap-8 w-full md:w-auto">
                                          <div className="flex items-center gap-3">
                                            <img 
                                              src={picUser?.avatar || `https://ui-avatars.com/api/?name=${sub.leader || '?'}&background=random`} 
                                              className="w-10 h-10 rounded-xl border-2 border-white dark:border-slate-700 shadow-sm object-cover"
                                            />
                                            <div>
                                              <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest leading-none mb-1">Penanggung Jawab</p>
                                              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{sub.leader || 'Belum Ada PIC'}</p>
                                            </div>
                                          </div>
                                          <div className="hidden lg:flex flex-col">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Populasi</p>
                                            <p className="text-xs font-black text-slate-600 dark:text-slate-300">{subMembersCount} Anggota</p>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button onClick={() => openSubBranchModal(branch, sub)} className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">✏️</button>
                                          <button onClick={() => deleteSubBranch(branch, sub.id)} className="p-2.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm">✕</button>
                                        </div>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <div className="p-20 text-center">
                                    <div className="text-6xl mb-6 grayscale opacity-10">📍</div>
                                    <h5 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter">Database Ranting Kosong</h5>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Silakan tambahkan unit baru untuk memulai pemetaan wilayah.</p>
                                    <button onClick={() => openSubBranchModal(branch)} className="mt-8 px-8 py-3.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95 transition-all">Daftarkan Ranting Pertama</button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Cabang */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl w-full max-w-md animate-in zoom-in duration-300 border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-8 border-b dark:border-slate-700 flex justify-between items-center bg-indigo-600 text-white">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tighter">{editingBranch ? 'Sunting Cabang' : 'Cabang Baru'}</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200 mt-1">Formulir Wilayah Kecamatan</p>
              </div>
              <button onClick={closeModals} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 transition-colors">✕</button>
            </div>
            <form onSubmit={handleBranchSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1 space-y-2">
                  <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Kode (2 Digit)</label>
                  <input required type="text" maxLength={2} pattern="[0-9]*" placeholder="01" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 dark:text-white rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-mono font-black transition-all text-center" value={branchForm.code} onChange={e => setBranchForm({...branchForm, code: e.target.value.replace(/\D/g, '')})} />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Nama Cabang</label>
                  <input required type="text" placeholder="Contoh: Bogor Selatan" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 dark:text-white rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold transition-all" value={branchForm.name} onChange={e => setBranchForm({...branchForm, name: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Ketua Terpilih (Kandidat Ketua Cabang)</label>
                <select 
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 dark:text-white rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold transition-all"
                  value={branchForm.leader}
                  onChange={e => setBranchForm({...branchForm, leader: e.target.value})}
                >
                  <option value="">-- Pilih Ketua Cabang --</option>
                  {branchLeaderCandidates.length > 0 ? (
                    branchLeaderCandidates.map(u => (
                      <option key={u.id} value={u.name}>{u.name} [{u.position}]</option>
                    ))
                  ) : (
                    <option disabled>Tidak ada anggota dengan jabatan Ketua Cabang</option>
                  )}
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={closeModals} className="flex-1 py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-black rounded-2xl uppercase tracking-widest text-xs transition-all hover:bg-slate-200">Batal</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/30 uppercase tracking-widest text-xs transition-all hover:bg-indigo-700 active:scale-95">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ranting */}
      {isSubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl w-full max-w-md animate-in zoom-in duration-300 border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-8 border-b dark:border-slate-700 flex justify-between items-center bg-indigo-600 text-white">
               <div>
                <h2 className="text-xl font-black uppercase tracking-tighter">{editingSubBranch ? 'Sunting Ranting' : 'Ranting Baru'}</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200 mt-1">Cabang: {activeBranch?.name.toUpperCase()}</p>
              </div>
              <button onClick={closeModals} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 transition-colors">✕</button>
            </div>
            <form onSubmit={handleSubBranchSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1 space-y-2">
                  <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Kode (2 Digit)</label>
                  <input required type="text" maxLength={2} pattern="[0-9]*" placeholder="01" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 dark:text-white rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-mono font-black transition-all text-center" value={subBranchForm.code} onChange={e => setSubBranchForm({...subBranchForm, code: e.target.value.replace(/\D/g, '')})} />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Nama Ranting</label>
                  <input required type="text" placeholder="Contoh: Dojo Garuda" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 dark:text-white rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold transition-all" value={subBranchForm.name} onChange={e => setSubBranchForm({...subBranchForm, name: e.target.value})} />
                </div>
              </div>

              <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Koordinat Lokasi (GPS)</label>
                  <button 
                    type="button" 
                    onClick={getCurrentLocation}
                    className="px-2 py-1 bg-indigo-600 text-white text-[8px] font-black uppercase rounded-lg hover:bg-indigo-700 transition-all"
                  >
                    📍 Gunakan Lokasi Saat Ini
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Latitude</p>
                    <input type="number" step="any" placeholder="-6.1234" className="w-full px-4 py-2 bg-white dark:bg-slate-800 border dark:border-slate-700 dark:text-white rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500" value={subBranchForm.latitude} onChange={e => setSubBranchForm({...subBranchForm, latitude: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Longitude</p>
                    <input type="number" step="any" placeholder="106.1234" className="w-full px-4 py-2 bg-white dark:bg-slate-800 border dark:border-slate-700 dark:text-white rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500" value={subBranchForm.longitude} onChange={e => setSubBranchForm({...subBranchForm, longitude: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">PIC / Pembina Ranting (Kandidat Pelatih)</label>
                <select 
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 dark:text-white rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold transition-all"
                  value={subBranchForm.leader}
                  onChange={e => setSubBranchForm({...subBranchForm, leader: e.target.value})}
                >
                  <option value="">-- Pilih PIC Pelatih --</option>
                  {coachCandidates.length > 0 ? (
                    coachCandidates.map(u => (
                      <option key={u.id} value={u.name}>{u.name} [{u.beltLevel}]</option>
                    ))
                  ) : (
                    <option disabled>Tidak ada anggota dengan status Pelatih</option>
                  )}
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={closeModals} className="flex-1 py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-black rounded-2xl uppercase tracking-widest text-xs transition-all hover:bg-slate-200">Batal</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/30 uppercase tracking-widest text-xs transition-all hover:bg-indigo-700 active:scale-95">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Branches;
