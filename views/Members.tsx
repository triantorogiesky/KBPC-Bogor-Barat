
import React, { useState, useRef, useMemo } from 'react';
import { User, Role, BeltLevel, Branch } from '../types';
import * as XLSX from 'xlsx';

interface MembersProps {
  users: User[];
  positions: string[];
  beltLevels: BeltLevel[];
  branches: Branch[];
  currentUserRole: Role;
  onAddUser: (user: Partial<User>) => void;
  onBulkAddUsers: (users: Partial<User>[]) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
  showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const Members: React.FC<MembersProps> = ({ 
  users, positions, beltLevels, branches, currentUserRole, 
  onAddUser, onBulkAddUsers, onUpdateUser, onDeleteUser, showNotification 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  const [formUser, setFormUser] = useState<Partial<User>>({
    name: '',
    username: '',
    email: '',
    role: Role.ANGGOTA,
    position: positions[0] || '',
    status: 'Active',
    avatar: '',
    isCoach: false,
    beltLevel: beltLevels[0]?.name || '',
    gender: 'Laki-laki',
    branch: branches[0]?.name || '',
    subBranch: '',
    formalPhoto: '',
    informalPhoto: ''
  });

  const importInputRef = useRef<HTMLInputElement>(null);
  const formalRef = useRef<HTMLInputElement>(null);
  const informalRef = useRef<HTMLInputElement>(null);

  const availableSubBranches = useMemo(() => {
    const branch = branches.find(b => b.name === formUser.branch);
    return branch ? branch.subBranches : [];
  }, [branches, formUser.branch]);

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.beltLevel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.subBranch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      onUpdateUser({ ...editingUser, ...formUser } as User);
    } else {
      onAddUser(formUser);
    }
    closeModal();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'formalPhoto' | 'informalPhoto') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormUser(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormUser(user);
    } else {
      setEditingUser(null);
      setFormUser({
        name: '',
        username: '',
        email: '',
        role: Role.ANGGOTA,
        position: positions[0] || '',
        status: 'Active',
        avatar: `https://ui-avatars.com/api/?background=random&name=New+Member`,
        isCoach: false,
        beltLevel: beltLevels[0]?.name || '',
        gender: 'Laki-laki',
        branch: branches[0]?.name || '',
        subBranch: '',
        formalPhoto: '',
        informalPhoto: ''
      });
    }
    setIsModalOpen(true);
  };

  const openDetail = (user: User) => {
    setViewingUser(user);
    setIsDetailOpen(true);
  };

  const openDeleteConfirm = (user: User) => {
    setUserToDelete(user);
    setIsDeleteConfirmOpen(true);
  };

  const handleDelete = () => {
    if (userToDelete) {
      onDeleteUser(userToDelete.id);
      closeModal();
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsDetailOpen(false);
    setIsDeleteConfirmOpen(false);
    setEditingUser(null);
    setViewingUser(null);
    setUserToDelete(null);
  };

  const getBeltStyle = (beltName: string) => {
    const belt = beltLevels.find(b => b.name === beltName);
    const defaultStyle = { beltColor: '#e2e8f0', bgOpacity: '#e2e8f015', predicate: '-', textColor: undefined };
    if (!belt) return defaultStyle;

    const lightBelts = ['Dasar', 'Kuning', 'Kuning Plat Hijau'];
    const darkBelts = ['Hitam', 'Biru Plat Cokelat', 'Cokelat', 'Merah Besar'];
    const isExtreme = lightBelts.includes(belt.name) || darkBelts.includes(belt.name);

    return {
      beltColor: belt.color,
      bgOpacity: belt.color + '15',
      predicate: belt.predicate,
      textColor: isExtreme ? undefined : belt.color
    };
  };

  const exportToCSV = () => {
    if (users.length === 0) {
      showNotification('Tidak ada data untuk diekspor.', 'info');
      return;
    }
    const headers = ['Nama', 'Username', 'Email', 'Role', 'Jabatan', 'Tanggal Bergabung', 'Status', 'Tingkat Sabuk', 'Jenis Kelamin', 'Cabang', 'Ranting', 'Pelatih'];
    const csvContent = [
      headers.join(','),
      ...users.map(u => [`"${u.name}"`, `"${u.username}"`, `"${u.email}"`, `"${u.role}"`, `"${u.position}"`, `"${u.joinDate}"`, `"${u.status}"`, `"${u.beltLevel}"`, `"${u.gender}"`, `"${u.branch}"`, `"${u.subBranch}"`, `"${u.isCoach ? 'Ya' : 'Tidak'}"`].join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `data_anggota_kbpc_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showNotification(`Berhasil mengekspor ${users.length} data.`, 'success');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(firstSheet);
        const mappedUsers: Partial<User>[] = rawData.map((row: any) => ({
          name: row['Nama'] || row['name'],
          username: row['Username'] || row['username'],
          email: row['Email'] || row['email'],
          role: (row['Role'] || Role.ANGGOTA).toUpperCase() as Role,
          position: row['Jabatan'] || 'Anggota Muda',
          joinDate: row['Tanggal Bergabung'] || new Date().toISOString().split('T')[0],
          status: row['Status'] || 'Active',
          beltLevel: row['Tingkat Sabuk'] || beltLevels[0].name,
          gender: row['Jenis Kelamin'] || 'Laki-laki',
          branch: row['Cabang'] || branches[0].name,
          subBranch: row['Ranting'] || '',
          isCoach: row['Pelatih'] === 'Ya' || row['isCoach'] === true
        }));
        onBulkAddUsers(mappedUsers);
        showNotification(`Berhasil impor ${mappedUsers.length} anggota.`, 'success');
      } catch (err) { showNotification('Gagal impor Excel.', 'error'); }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header View */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Manajemen Anggota</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Kelola profil, riwayat sabuk, dan dokumentasi anggota secara efisien.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
             <button 
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400'}`}
             >
               List
             </button>
             <button 
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400'}`}
             >
               Grid
             </button>
          </div>
          <button onClick={() => importInputRef.current?.click()} className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-all text-sm flex items-center gap-2">
            <span>📊</span> Impor
            <input type="file" ref={importInputRef} onChange={handleImportFile} accept=".xlsx, .xls" className="hidden" />
          </button>
          <button onClick={exportToCSV} className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-all text-sm flex items-center gap-2">
            <span>📤</span> Ekspor
          </button>
          <button onClick={() => openModal()} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all text-sm flex items-center gap-2">
            <span>➕</span> Tambah Anggota
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 transition-colors">🔍</span>
          <input
            type="text"
            placeholder="Cari anggota berdasarkan nama, jabatan, cabang, NIA, atau sabuk..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 dark:text-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'table' ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Data Anggota</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Wilayah Hukum</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Standar Sabuk</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Jabatan & Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredUsers.map((user) => {
                  const style = getBeltStyle(user.beltLevel);
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-all group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <img src={user.avatar} className="w-12 h-12 rounded-2xl border dark:border-slate-700 shadow-sm object-cover" />
                            {user.isCoach && (
                                <span className="absolute -top-1 -right-1 bg-amber-500 text-white w-5 h-5 rounded-lg flex items-center justify-center text-[10px] border-2 border-white dark:border-slate-800 shadow-sm" title="Pelatih Terverifikasi">⭐</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <button onClick={() => openDetail(user)} className="text-sm font-black text-slate-800 dark:text-white truncate hover:text-indigo-600 dark:hover:text-indigo-400 text-left block uppercase">
                                  {user.name}
                                </button>
                                {user.isCoach && (
                                    <span className="px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[8px] font-black rounded border border-amber-200 dark:border-amber-800 uppercase tracking-tighter">PELATIH</span>
                                )}
                            </div>
                            <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-wider">NIA: {user.id.toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">🏢 {user.branch}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">📍 {user.subBranch || 'Tanpa Ranting'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center w-fit overflow-hidden rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm" style={{ backgroundColor: style.bgOpacity }}>
                          <div className="w-2.5 h-10 shrink-0" style={{ backgroundColor: style.beltColor }}></div>
                          <div className="px-3 py-1.5 flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-200" style={style.textColor ? { color: style.textColor } : {}}>{user.beltLevel}</span>
                            <span className="text-[8px] font-bold text-indigo-600 dark:text-indigo-400 leading-none mt-1">📜 {style.predicate}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">{user.position}</p>
                          <span className={`text-[8px] px-2 py-0.5 rounded-lg font-black uppercase tracking-widest border ${
                            user.status === 'Active' ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-400' : 'border-amber-200 bg-amber-50 text-amber-700'
                          }`}>{user.status}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openModal(user)} className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">✏️</button>
                          <button onClick={() => openDeleteConfirm(user)} className="p-2.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredUsers.map((user) => {
            const style = getBeltStyle(user.beltLevel);
            return (
              <div key={user.id} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                   <button onClick={() => openModal(user)} className="w-8 h-8 bg-white dark:bg-slate-700 rounded-lg shadow-md flex items-center justify-center text-sm border dark:border-slate-600">✏️</button>
                </div>
                {user.isCoach && (
                   <div className="absolute top-4 left-4 z-10">
                      <span className="px-2 py-1 bg-amber-500 text-white text-[8px] font-black rounded-lg shadow-lg border border-amber-400 uppercase tracking-widest">⭐ PELATIH</span>
                   </div>
                )}
                <div className="flex flex-col items-center text-center space-y-4">
                   <img src={user.avatar} className="w-24 h-24 rounded-[2rem] object-cover border-4 border-slate-50 dark:border-slate-700 shadow-xl" />
                   <div>
                      <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none mb-1">{user.name}</h3>
                      <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">NIA: {user.id.toUpperCase()}</p>
                   </div>
                   <div className="w-full py-2 px-3 rounded-2xl border dark:border-slate-700 flex flex-col items-center" style={{ backgroundColor: style.bgOpacity }}>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-100" style={style.textColor ? { color: style.textColor } : {}}>{user.beltLevel}</span>
                      <span className="text-[8px] font-bold text-slate-500 uppercase mt-0.5">PREDIKAT: {style.predicate}</span>
                   </div>
                   <div className="flex gap-2 w-full">
                      <button onClick={() => openDetail(user)} className="flex-1 py-3 bg-slate-50 dark:bg-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:bg-indigo-600 hover:text-white transition-all">Detail</button>
                      <button onClick={() => openDeleteConfirm(user)} className="p-3 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all text-sm">🗑️</button>
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="p-20 text-center bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
          <div className="text-6xl mb-6 grayscale opacity-20">🔍</div>
          <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Anggota Tidak Ditemukan</h3>
        </div>
      )}

      {/* --- ADD/EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10 flex justify-between items-center">
               <div>
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">{editingUser ? 'Sunting Data Anggota' : 'Registrasi Anggota Baru'}</h2>
                  <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em] mt-1">KBPC DATABASE SYSTEM</p>
               </div>
               <button onClick={closeModal} className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Info */}
                <div className="space-y-6">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">Informasi Personal</h3>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Nama Lengkap</label>
                      <input required type="text" className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-700 border dark:border-slate-600 dark:text-white rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold" value={formUser.name} onChange={e => setFormUser({...formUser, name: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Username</label>
                        <input required type="text" className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-700 border dark:border-slate-600 dark:text-white rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold" value={formUser.username} onChange={e => setFormUser({...formUser, username: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Jenis Kelamin</label>
                        <select className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-700 border dark:border-slate-600 dark:text-white rounded-2xl outline-none font-bold" value={formUser.gender} onChange={e => setFormUser({...formUser, gender: e.target.value as any})}>
                          <option value="Laki-laki">Laki-laki</option>
                          <option value="Perempuan">Perempuan</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Email</label>
                      <input required type="email" className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-700 border dark:border-slate-600 dark:text-white rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold" value={formUser.email} onChange={e => setFormUser({...formUser, email: e.target.value})} />
                    </div>
                    
                    {/* Documentation Photos Upload in Modal */}
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Foto Formal</label>
                        <div className="aspect-[3/4] rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center relative group cursor-pointer overflow-hidden" onClick={() => formalRef.current?.click()}>
                           {formUser.formalPhoto ? (
                             <img src={formUser.formalPhoto} className="w-full h-full object-cover" />
                           ) : <span className="text-2xl text-slate-300">📸</span>}
                        </div>
                        <input type="file" ref={formalRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'formalPhoto')} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Foto Bebas</label>
                        <div className="aspect-[3/4] rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center relative group cursor-pointer overflow-hidden" onClick={() => informalRef.current?.click()}>
                           {formUser.informalPhoto ? (
                             <img src={formUser.informalPhoto} className="w-full h-full object-cover" />
                           ) : <span className="text-2xl text-slate-300">🖼️</span>}
                        </div>
                        <input type="file" ref={informalRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'informalPhoto')} />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                        <div className="flex-1">
                            <p className="text-xs font-black text-amber-800 dark:text-amber-400 uppercase tracking-widest leading-tight">Status Pelatih</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={formUser.isCoach} onChange={e => setFormUser({...formUser, isCoach: e.target.checked})} />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-amber-500"></div>
                        </label>
                    </div>
                  </div>
                </div>

                {/* Organization Info */}
                <div className="space-y-6">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">Afiliasi Organisasi</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Cabang</label>
                        <select className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-700 border dark:border-slate-600 dark:text-white rounded-2xl outline-none font-bold" value={formUser.branch} onChange={e => setFormUser({...formUser, branch: e.target.value, subBranch: ''})}>
                          {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Ranting</label>
                        <select className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-700 border dark:border-slate-600 dark:text-white rounded-2xl outline-none font-bold" value={formUser.subBranch} onChange={e => setFormUser({...formUser, subBranch: e.target.value})}>
                          <option value="">-- Pilih Ranting --</option>
                          {availableSubBranches.map(sb => <option key={sb.id} value={sb.name}>{sb.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Jabatan</label>
                        <select className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-700 border dark:border-slate-600 dark:text-white rounded-2xl outline-none font-bold" value={formUser.position} onChange={e => setFormUser({...formUser, position: e.target.value})}>
                          {positions.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Tingkat Sabuk</label>
                        <select className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-700 border dark:border-slate-600 dark:text-white rounded-2xl outline-none font-bold" value={formUser.beltLevel} onChange={e => setFormUser({...formUser, beltLevel: e.target.value})}>
                          {beltLevels.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Status Akun</label>
                        <select className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-700 border dark:border-slate-600 dark:text-white rounded-2xl outline-none font-bold" value={formUser.status} onChange={e => setFormUser({...formUser, status: e.target.value as any})}>
                          <option value="Active">Aktif</option>
                          <option value="Pending">Pending</option>
                          <option value="Inactive">Non-Aktif</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Peran Sistem</label>
                        <select className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-700 border dark:border-slate-600 dark:text-white rounded-2xl outline-none font-bold" value={formUser.role} onChange={e => setFormUser({...formUser, role: e.target.value as Role})}>
                          <option value={Role.ANGGOTA}>Anggota</option>
                          <option value={Role.PENGURUS}>Pengurus</option>
                          <option value={Role.ADMIN}>Administrator</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t dark:border-slate-700 flex flex-col sm:flex-row gap-4">
                 <button type="button" onClick={closeModal} className="flex-1 py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-black rounded-2xl uppercase tracking-widest text-xs">Batal</button>
                 <button type="submit" className="flex-[2] py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/30 uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all">Simpan Data Anggota</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-700 max-w-sm w-full text-center animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6">⚠️</div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Konfirmasi Hapus</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-2 leading-relaxed">
                Apakah Anda yakin ingin menghapus <b>{userToDelete?.name}</b> dari database? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="mt-8 flex flex-col gap-3">
                 <button onClick={handleDelete} className="w-full py-4 bg-red-600 text-white font-black rounded-2xl shadow-lg shadow-red-500/20 uppercase tracking-widest text-xs hover:bg-red-700 transition-all">Hapus Permanen</button>
                 <button onClick={closeModal} className="w-full py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-black rounded-2xl uppercase tracking-widest text-xs">Batal</button>
              </div>
           </div>
        </div>
      )}

      {/* --- IMPROVED DETAIL VIEW MODAL --- */}
      {isDetailOpen && viewingUser && (() => {
        const style = getBeltStyle(viewingUser.beltLevel);
        const statusColors = {
          Active: 'bg-emerald-500',
          Pending: 'bg-amber-500',
          Inactive: 'bg-slate-400'
        };

        return (
          <div className="fixed inset-0 z-[65] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-800 w-full max-w-4xl rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-300 max-h-[95vh] overflow-y-auto custom-scrollbar flex flex-col">
              
              {/* Profile Header Banner */}
              <div className="h-48 bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 relative shrink-0">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                <button onClick={closeModal} className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/30 text-white rounded-2xl flex items-center justify-center transition-all z-10 backdrop-blur-md border border-white/20">
                  <span className="text-xl">✕</span>
                </button>
                
                <div className="absolute -bottom-16 left-12 flex items-end gap-6">
                  <div className="relative">
                    <img src={viewingUser.avatar} className="w-40 h-40 rounded-[3rem] border-[10px] border-white dark:border-slate-800 shadow-2xl object-cover bg-slate-100" />
                    <div className={`absolute bottom-3 right-3 w-6 h-6 rounded-full border-4 border-white dark:border-slate-800 ${statusColors[viewingUser.status]}`}></div>
                  </div>
                  <div className="pb-4 space-y-1">
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">{viewingUser.name}</h2>
                    <p className="text-indigo-200 font-bold uppercase tracking-[0.2em] text-xs">@{viewingUser.username} • {viewingUser.gender}</p>
                  </div>
                </div>

                <div className="absolute top-8 left-8 flex flex-wrap gap-2">
                  {viewingUser.isCoach && (
                    <div className="px-4 py-1.5 bg-amber-500 text-white text-[10px] font-black rounded-full border border-amber-400 shadow-xl flex items-center gap-2 animate-pulse">
                      <span>⭐</span> PELATIH TERVERIFIKASI
                    </div>
                  )}
                  <div className={`px-4 py-1.5 text-white text-[10px] font-black rounded-full border border-white/20 shadow-xl flex items-center gap-2 backdrop-blur-md ${statusColors[viewingUser.status]}`}>
                    {viewingUser.status.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Main Data Content */}
              <div className="p-12 pt-24 grid grid-cols-1 lg:grid-cols-12 gap-12">
                
                {/* Left Column: Essential Data */}
                <div className="lg:col-span-7 space-y-10">
                  
                  {/* Identity Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 bg-slate-50 dark:bg-slate-900/40 rounded-[2rem] border border-slate-100 dark:border-slate-700">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nomor Induk Anggota (NIA)</p>
                       <p className="text-lg font-mono font-black text-slate-800 dark:text-white uppercase">{viewingUser.id.toUpperCase()}</p>
                    </div>
                    <div className="p-6 bg-slate-50 dark:bg-slate-900/40 rounded-[2rem] border border-slate-100 dark:border-slate-700">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tingkat Sabuk</p>
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-3 rounded shadow-sm" style={{ backgroundColor: style.beltColor }}></div>
                         <p className="text-md font-black text-slate-800 dark:text-white uppercase" style={style.textColor ? { color: style.textColor } : {}}>
                            {viewingUser.beltLevel}
                         </p>
                       </div>
                       <p className="text-[9px] font-black text-indigo-500 uppercase mt-1">Predikat: {style.predicate}</p>
                    </div>
                  </div>

                  {/* Organization & Meta */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-[0.3em] flex items-center gap-3">
                        <span className="w-10 h-[2px] bg-indigo-600"></span> INFORMASI KEANGGOTAAN
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl shadow-sm flex items-center gap-4">
                          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950 rounded-2xl flex items-center justify-center text-2xl">🏢</div>
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Wilayah / Cabang</p>
                            <p className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase">{viewingUser.branch}</p>
                          </div>
                       </div>
                       <div className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl shadow-sm flex items-center gap-4">
                          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950 rounded-2xl flex items-center justify-center text-2xl">📍</div>
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Unit / Ranting</p>
                            <p className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase">{viewingUser.subBranch || 'PUSAT'}</p>
                          </div>
                       </div>
                       <div className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl shadow-sm flex items-center gap-4">
                          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950 rounded-2xl flex items-center justify-center text-2xl">🏷️</div>
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Jabatan Struktur</p>
                            <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase">{viewingUser.position}</p>
                          </div>
                       </div>
                       <div className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl shadow-sm flex items-center gap-4">
                          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-950 rounded-2xl flex items-center justify-center text-2xl">📅</div>
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tanggal Bergabung</p>
                            <p className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase">{viewingUser.joinDate}</p>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-900/30 flex flex-col md:flex-row justify-between items-center gap-4">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-lg shadow-sm">✉️</div>
                        <div>
                           <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Kontak Email Resmi</p>
                           <p className="text-sm font-bold text-indigo-800 dark:text-indigo-300">{viewingUser.email}</p>
                        </div>
                     </div>
                     <button 
                       onClick={() => { navigator.clipboard.writeText(viewingUser.email); showNotification('Email disalin ke clipboard'); }}
                       className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30"
                     >
                       Salin Email
                     </button>
                  </div>
                </div>

                {/* Right Column: Photos & Documentation */}
                <div className="lg:col-span-5 space-y-8">
                  <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-[0.3em] flex items-center gap-3">
                        <span className="w-10 h-[2px] bg-indigo-600"></span> DOKUMENTASI PROFIL
                  </h3>
                  
                  <div className="space-y-8">
                    {/* Formal Photo Box */}
                    <div className="space-y-3">
                      <div className="aspect-[3/4] rounded-[3rem] overflow-hidden bg-slate-100 dark:bg-slate-700 border-8 border-white dark:border-slate-800 shadow-2xl relative group transition-transform hover:scale-[1.02]">
                        {viewingUser.formalPhoto ? (
                          <img src={viewingUser.formalPhoto} className="w-full h-full object-cover" alt="Foto Formal" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                            <span className="text-6xl opacity-30">🧥</span>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Belum Ada Foto Formal</p>
                          </div>
                        )}
                        <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                          <p className="text-white text-[11px] font-black uppercase text-center tracking-[0.2em]">Foto Formal (Seragam)</p>
                        </div>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest italic">Dokumentasi Administrasi Ijazah</p>
                    </div>

                    {/* Informal Photo Box */}
                    <div className="space-y-3">
                      <div className="aspect-[3/4] rounded-[3rem] overflow-hidden bg-slate-100 dark:bg-slate-700 border-8 border-white dark:border-slate-800 shadow-2xl relative group transition-transform hover:scale-[1.02]">
                        {viewingUser.informalPhoto ? (
                          <img src={viewingUser.informalPhoto} className="w-full h-full object-cover" alt="Foto Non-Formal" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                            <span className="text-6xl opacity-30">👕</span>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Belum Ada Foto Bebas</p>
                          </div>
                        )}
                        <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                          <p className="text-white text-[11px] font-black uppercase text-center tracking-[0.2em]">Foto Non-Formal (Bebas)</p>
                        </div>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest italic">Dokumentasi Arsip Kegiatan</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="p-10 border-t dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex flex-col sm:flex-row gap-4 shrink-0">
                <button 
                  onClick={() => { closeModal(); openModal(viewingUser); }} 
                  className="flex-1 py-5 bg-indigo-600 text-white font-black rounded-2xl uppercase tracking-[0.2em] text-xs shadow-2xl shadow-indigo-500/40 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <span>✏️</span> Sunting Profil Lengkap
                </button>
                <button 
                  onClick={closeModal} 
                  className="px-12 py-5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black rounded-2xl uppercase tracking-[0.2em] text-xs border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all"
                >
                  Tutup Panel Detail
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default Members;
