
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { User, Role, BeltLevel, Branch } from '../types';
import { KECAMATAN } from '../constants';
import { compressImage } from '../utils';
import * as XLSX from 'xlsx';

interface MembersProps {
  users: User[];
  positions: string[];
  beltLevels: BeltLevel[];
  branches: Branch[];
  currentUserRole: Role;
  onAddUser: (user: Partial<User>) => void;
  onBulkAddUsers: (users: Partial<User>[]) => void;
  onUpdateUser: (user: User, oldId?: string) => void;
  onDeleteUser: (id: string) => void;
  showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const Members: React.FC<MembersProps> = ({ 
  users, positions, beltLevels, branches, currentUserRole, 
  onAddUser, onBulkAddUsers, onUpdateUser, onDeleteUser, showNotification 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formUser, setFormUser] = useState<Partial<User>>({
    id: '',
    name: '',
    username: '',
    password: 'password',
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
    kecamatan: '',
    formalPhoto: '',
    informalPhoto: ''
  });

  const importInputRef = useRef<HTMLInputElement>(null);
  const informalPhotoInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = currentUserRole === Role.ADMIN;
  const isPengurus = currentUserRole === Role.PENGURUS;

  const filteredUsers = useMemo(() => {
    return users.filter(u =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.beltLevel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.subBranch.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'formalPhoto' | 'informalPhoto') => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        try {
          const compressed = await compressImage(result, 600, 800);
          setFormUser(prev => ({ ...prev, [field]: compressed }));
          showNotification('Foto berhasil diunggah.', 'success');
        } catch (err) {
          setFormUser(prev => ({ ...prev, [field]: result }));
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExport = () => {
    const exportData = filteredUsers.map(u => ({
      'NIA': u.id,
      'Nama': u.name,
      'Username': u.username,
      'Email': u.email,
      'Jabatan': u.position,
      'Tingkat Sabuk': u.beltLevel,
      'Cabang': u.branch,
      'Ranting': u.subBranch,
      'Kecamatan': u.kecamatan,
      'Gender': u.gender,
      'Role': u.role
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Database_Anggota");
    XLSX.writeFile(wb, `KBPC_Anggota_${new Date().toISOString().split('T')[0]}.xlsx`);
    showNotification('Data berhasil diekspor.', 'success');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) return;
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

        const mappedUsers: Partial<User>[] = data.map(item => ({
          id: String(item['NIA'] || ''),
          name: String(item['Nama'] || 'Anggota Baru'),
          username: String(item['Username'] || 'user' + Math.floor(Math.random() * 1000)),
          email: String(item['Email'] || ''),
          position: String(item['Jabatan'] || positions[0]),
          beltLevel: String(item['Tingkat Sabuk'] || beltLevels[0].name),
          role: (item['Role'] as Role) || Role.ANGGOTA,
          branch: String(item['Cabang'] || branches[0]?.name || ''),
          subBranch: String(item['Ranting'] || ''),
          kecamatan: String(item['Kecamatan'] || ''),
          gender: item['Gender'] === 'Perempuan' ? 'Perempuan' : 'Laki-laki'
        }));

        onBulkAddUsers(mappedUsers);
        if (importInputRef.current) importInputRef.current.value = '';
      } catch (error) {
        showNotification('Format Excel tidak sesuai.', 'error');
      }
    };
    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    const templateData = [{
      'NIA': '2024000000000001',
      'Nama': 'Nama Lengkap Anggota',
      'Username': 'user_unik',
      'Email': 'email@kbpc.com',
      'Jabatan': 'Anggota',
      'Tingkat Sabuk': 'Dasar',
      'Cabang': 'Bogor Barat',
      'Ranting': 'Bubulak',
      'Kecamatan': 'Parung',
      'Role': 'ANGGOTA',
      'Gender': 'Laki-laki'
    }];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template_KBPC");
    XLSX.writeFile(wb, "Template_Import_KBPC.xlsx");
    showNotification('Template Excel diunduh.', 'info');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      onUpdateUser(formUser as User, editingUser.id);
    } else {
      onAddUser(formUser);
    }
    closeModal();
  };

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormUser({ ...user });
    } else {
      setEditingUser(null);
      setFormUser({
        id: '',
        name: '',
        username: '',
        password: 'password',
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
        kecamatan: '',
        formalPhoto: '',
        informalPhoto: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsDetailOpen(false);
    setIsDeleteConfirmOpen(false);
    setEditingUser(null);
    setViewingUser(null);
    setUserToDelete(null);
  };

  const openDetail = (user: User) => {
    setViewingUser(user);
    setIsDetailOpen(true);
  };

  const openDeleteConfirm = (user: User) => {
    if (!isAdmin) return;
    setUserToDelete(user);
    setIsDeleteConfirmOpen(true);
  };

  const getBeltStyle = (beltName: string) => {
    const belt = beltLevels.find(b => b.name === beltName);
    const defaultStyle = { beltColor: '#e2e8f0', bgOpacity: '#e2e8f015', predicate: 'Budaya', textColor: undefined };
    if (!belt) return defaultStyle;
    return {
      beltColor: belt.color,
      bgOpacity: belt.color + '15',
      predicate: belt.predicate,
      textColor: belt.color
    };
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 text-[9px] font-black uppercase rounded-lg border border-indigo-200 dark:border-indigo-800 tracking-widest">Admin</span>;
      case Role.PENGURUS:
        return <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-[9px] font-black uppercase rounded-lg border border-blue-200 dark:border-blue-800 tracking-widest">Pengurus</span>;
      default:
        return <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-[9px] font-black uppercase rounded-lg border border-slate-200 dark:border-slate-700 tracking-widest">Anggota</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-800 dark:text-white tracking-tight">Data Anggota</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Manajemen arsip digital dan struktur keanggotaan KBPC.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
             <button onClick={() => setViewMode('table')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Tabel</button>
             <button onClick={() => setViewMode('grid')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Grid</button>
          </div>
          {(isAdmin || isPengurus) && (
            <button onClick={() => openModal()} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl shadow-indigo-500/20 transition-all text-[10px] flex items-center gap-2 justify-center flex-1 lg:flex-none uppercase tracking-widest">
              <span>➕</span> Tambah Anggota
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 relative w-full">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input 
            type="text" 
            placeholder="Cari berdasarkan nama, NIA, wilayah, atau jabatan..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-sm" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
           <button onClick={handleExport} className="flex-1 md:flex-none px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2">
             <span>📥</span> Export
           </button>
           {isAdmin && (
             <>
              <button onClick={() => importInputRef.current?.click()} className="flex-1 md:flex-none px-4 py-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-600 hover:text-white transition-all flex items-center justify-center gap-2">
                <span>📤</span> Import
              </button>
              <button onClick={downloadTemplate} className="flex-1 md:flex-none px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                <span>📋</span> Template
              </button>
              <input type="file" ref={importInputRef} onChange={handleImport} className="hidden" accept=".xlsx, .xls" />
             </>
           )}
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1200px]">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-8 py-5">Anggota & NIA</th>
                  <th className="px-6 py-5">Wilayah (Cabang/Ranting)</th>
                  <th className="px-6 py-5">Jabatan Struktural</th>
                  <th className="px-6 py-5">Tingkat Sabuk</th>
                  <th className="px-6 py-5">Hak Akses</th>
                  <th className="px-8 py-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                {paginatedUsers.map((user) => {
                  const style = getBeltStyle(user.beltLevel);
                  return (
                    <tr key={user.id} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="relative shrink-0">
                            <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} className="w-12 h-12 rounded-2xl object-cover border shadow-sm" alt={user.name} />
                            {user.isCoach && <div className="absolute -top-1 -right-1 bg-amber-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[8px] border border-white">⭐</div>}
                          </div>
                          <div className="min-w-0">
                            <button onClick={() => openDetail(user)} className="text-sm font-black text-slate-800 dark:text-white hover:text-indigo-600 block uppercase tracking-tight truncate leading-none mb-1">{user.name}</button>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">NIA: {user.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                         <div className="min-w-0">
                           <p className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-tighter truncate">{user.branch}</p>
                           <p className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-1 truncate">{user.subBranch || 'Pusat'}</p>
                         </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-700/50 px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-200 uppercase shadow-sm border border-slate-200 dark:border-slate-700">
                          {user.position}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                           <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: style.beltColor }}></div>
                           <div className="min-w-0">
                              <p className="text-[10px] font-black uppercase tracking-tight text-slate-700 dark:text-slate-200 leading-none">{user.beltLevel}</p>
                              <p className="text-[8px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mt-1 truncate">{style.predicate}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">{getRoleBadge(user.role)}</td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openModal(user)} className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">✏️</button>
                          {isAdmin && (
                            <button onClick={() => openDeleteConfirm(user)} className="p-2.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm">🗑️</button>
                          )}
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
          {paginatedUsers.map((user) => {
            const style = getBeltStyle(user.beltLevel);
            return (
              <div key={user.id} className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center relative group">
                {isAdmin && (
                  <button onClick={() => openDeleteConfirm(user)} className="absolute top-4 right-4 p-2 bg-red-50 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                )}
                <div className="relative mb-4">
                  <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} className="w-24 h-24 rounded-[2rem] object-cover mx-auto border-4 border-slate-50 dark:border-slate-700 shadow-xl" alt={user.name} />
                  {user.isCoach && <div className="absolute top-0 right-0 bg-amber-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white">⭐</div>}
                </div>
                <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tighter truncate w-full leading-none mb-1">{user.name}</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">NIA: {user.id}</p>
                <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mb-1">{user.beltLevel} - {style.predicate}</p>
                <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-4">{user.branch} / {user.subBranch || '-'}</p>
                <div className="flex gap-2 w-full mt-auto">
                  <button onClick={() => openDetail(user)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Detil</button>
                  <button onClick={() => openModal(user)} className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all">✏️</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 pb-4 border-t border-slate-100 dark:border-slate-700 mt-6">
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
          Menampilkan <span className="text-indigo-600 dark:text-indigo-400">{paginatedUsers.length}</span> dari <span className="text-slate-800 dark:text-white">{filteredUsers.length}</span> Anggota
        </p>
        
        {totalPages > 1 && (
          <div className="flex items-center gap-3">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl disabled:opacity-30 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-indigo-50 dark:hover:bg-slate-700"
            >
              Kembali
            </button>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl disabled:opacity-30 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-indigo-50 dark:hover:bg-slate-700"
            >
              Lanjut
            </button>
          </div>
        )}
      </div>

      {/* ENHANCED IDENTITY CARD MODAL */}
      {isDetailOpen && viewingUser && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className="bg-slate-50 dark:bg-slate-900 w-full max-w-4xl rounded-[4rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-500 max-h-[90vh] flex flex-col relative">
            
            {/* CARD TOP DECORATION */}
            <div className="h-56 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 shrink-0 relative overflow-hidden">
               {/* Pattern Overlay */}
               <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]"></div>
               <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
               
               <button onClick={closeModal} className="absolute top-10 right-10 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-2xl flex items-center justify-center transition-all z-30 group">
                 <span className="text-xl group-hover:rotate-90 transition-transform">✕</span>
               </button>
               
               <div className="absolute inset-0 flex flex-col justify-center px-16">
                  <div className="flex items-center gap-6 mb-2">
                     <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
                        <img src="https://i.ibb.co/vz6Gz2N/kbpc-logo.png" className="w-10 h-10 object-contain brightness-0 invert" alt="Logo" />
                     </div>
                     <div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">Identity Document</h2>
                        <p className="text-indigo-400 font-bold text-[10px] uppercase tracking-[0.4em] mt-2">Keluarga Besar Padjadjaran Cimande</p>
                     </div>
                  </div>
                  <div className="h-[1px] w-full bg-gradient-to-r from-white/20 to-transparent my-4"></div>
                  <div className="flex items-center gap-4">
                     <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-widest rounded-full border border-emerald-500/30">Verified Member</span>
                     <span className="text-white/40 text-[8px] font-bold uppercase tracking-widest font-mono">Serial: {viewingUser.id.slice(-8).toUpperCase()}</span>
                  </div>
               </div>
            </div>

            {/* CARD CONTENT */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-12 -mt-16 bg-white dark:bg-slate-800 rounded-[4rem] z-10 border-t border-slate-200 dark:border-slate-700">
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                  
                  {/* LEFT COLUMN: VISUALS */}
                  <div className="lg:col-span-5 flex flex-col items-center">
                    <div className="relative mb-10 w-full">
                       <div className="w-full aspect-[3/4] bg-slate-100 dark:bg-slate-900 rounded-[3.5rem] border-[10px] border-white dark:border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden relative group">
                          <img 
                            src={viewingUser.informalPhoto || viewingUser.avatar || `https://ui-avatars.com/api/?name=${viewingUser.name}`} 
                            className="w-full h-full object-cover grayscale-[0.2] transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0" 
                            alt={viewingUser.name} 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                       </div>
                       
                       {viewingUser.isCoach && (
                         <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-amber-500 text-white rounded-[2rem] border-[6px] border-white dark:border-slate-800 shadow-2xl flex items-center justify-center text-3xl animate-bounce">
                           ⭐
                         </div>
                       )}
                    </div>

                    <div className="w-full space-y-6">
                       {/* NIA DISPLAY */}
                       <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center shadow-inner group">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 group-hover:text-indigo-500 transition-colors">Identification Number (NIA)</p>
                          <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono tracking-wider">{viewingUser.id}</p>
                       </div>

                       {/* QR PLACEHOLDER */}
                       <div className="flex justify-between items-center p-6 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-inner overflow-hidden">
                          <div className="flex flex-col">
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Digital Scan</p>
                             <div className="w-20 h-20 bg-white dark:bg-slate-800 p-2 rounded-2xl border dark:border-slate-700 flex items-center justify-center">
                                <div className="grid grid-cols-3 gap-1 opacity-20">
                                   {[...Array(9)].map((_, i) => <div key={i} className="w-4 h-4 bg-slate-800 dark:bg-white rounded-[2px]"></div>)}
                                </div>
                                <span className="absolute text-[8px] font-black text-slate-800 dark:text-white uppercase tracking-tighter bg-white dark:bg-slate-800 px-1">QR SECURE</span>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status</p>
                             <p className="text-xs font-black text-emerald-500 uppercase tracking-widest">ACTIVE MEMBER</p>
                             <p className="text-[7px] font-bold text-slate-400 mt-2">Exp: DEC 2026</p>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: DATA */}
                  <div className="lg:col-span-7 flex flex-col h-full">
                     <div className="space-y-6 border-b dark:border-slate-700 pb-10">
                        <div className="flex items-center gap-3">
                           <span className="w-10 h-1 bg-indigo-600 rounded-full"></span>
                           <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em]">Official Bio-Data</span>
                        </div>
                        <h3 className="text-5xl font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none">{viewingUser.name}</h3>
                        <div className="flex flex-wrap gap-3">
                           <span className="px-5 py-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl border border-indigo-100 dark:border-indigo-900">{viewingUser.position}</span>
                           <span className="px-5 py-2 bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl">{viewingUser.gender}</span>
                           {getRoleBadge(viewingUser.role)}
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10 py-10">
                        {/* STRUCTURE DATA */}
                        <div className="space-y-8">
                           <div className="flex flex-col">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Main Branch</span>
                              <span className="text-base font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none">{viewingUser.branch}</span>
                           </div>
                           <div className="flex flex-col">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Sub Unit (Ranting)</span>
                              <span className="text-base font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none">{viewingUser.subBranch || 'Kantor Pusat'}</span>
                           </div>
                           <div className="flex flex-col">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Location Area</span>
                              <span className="text-base font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none">{viewingUser.kecamatan || 'N/A'}</span>
                           </div>
                        </div>

                        {/* PROGRESSION DATA */}
                        <div className="space-y-8 p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border border-slate-100 dark:border-slate-700">
                           <div className="flex flex-col">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">Tingkatan Sabuk</span>
                              <div className="flex items-center gap-4">
                                 <div className="w-6 h-6 rounded-xl shadow-lg border-4 border-white dark:border-slate-800" style={{ backgroundColor: getBeltStyle(viewingUser.beltLevel).beltColor }}></div>
                                 <span className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none">{viewingUser.beltLevel}</span>
                              </div>
                           </div>
                           <div className="flex flex-col">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Predikat Budaya</span>
                              <span className="text-sm font-black text-amber-600 uppercase tracking-tight leading-none">{getBeltStyle(viewingUser.beltLevel).predicate}</span>
                           </div>
                           <div className="flex flex-col">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Registry Date</span>
                              <span className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight leading-none">
                                {new Date(viewingUser.joinDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </span>
                           </div>
                        </div>
                     </div>

                     {/* SIGNATURE AREA */}
                     <div className="mt-auto pt-10 border-t dark:border-slate-700 flex justify-between items-end">
                        <div className="text-center">
                           <div className="w-32 h-12 flex items-center justify-center relative mb-2">
                              <span className="text-[10px] font-serif italic text-slate-300 dark:text-slate-600 rotate-[-5deg]">Signed Digitally</span>
                              <div className="absolute inset-0 border-b border-dashed border-slate-200 dark:border-slate-700"></div>
                           </div>
                           <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Dewan Guru Besar</p>
                        </div>
                        <button onClick={closeModal} className="px-12 py-5 bg-slate-900 dark:bg-indigo-600 text-white font-black rounded-[2rem] uppercase tracking-widest text-xs shadow-2xl shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all">
                           Close Document
                        </button>
                     </div>
                  </div>
               </div>
            </div>
            
            {/* CARD BOTTOM BAR */}
            <div className="px-16 py-6 bg-slate-100 dark:bg-slate-950/50 flex justify-between items-center text-[8px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.4em]">
               <span>CIMANDE DIGITAL IDENTITY SYSTEM</span>
               <span className="text-indigo-500/40">© 2024 KBPC BOGOR</span>
            </div>
          </div>
        </div>
      )}

      {/* FORM MODAL AREA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-700 custom-scrollbar">
            <div className="p-8 border-b dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10 flex justify-between items-center">
               <div>
                  <h2 className="text-xl lg:text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">{editingUser ? 'Sunting Anggota' : 'Registrasi Baru'}</h2>
                  <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1">Hak Akses: {currentUserRole}</p>
               </div>
               <button onClick={closeModal} className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b pb-2">Identitas & Akses</h3>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center mb-1">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">NIA (Nomor Induk Anggota)</label>
                         {isAdmin && editingUser && <span className="text-[8px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded">ADMIN ACCESS</span>}
                      </div>
                      <input 
                        type="text" required maxLength={16} pattern="[0-9]*"
                        className={`w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 dark:text-white rounded-2xl font-mono text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all ${!isAdmin && !!editingUser ? 'opacity-50 cursor-not-allowed' : 'font-bold'}`} 
                        value={formUser.id} 
                        onChange={e => setFormUser({...formUser, id: e.target.value.replace(/\D/g, '')})} 
                        disabled={!isAdmin && !!editingUser} 
                      />
                    </div>
                    
                    {(isAdmin || !editingUser) && (
                      <div className="space-y-1 animate-in slide-in-from-top-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Kata Sandi Baru</label>
                        <input type="text" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 dark:text-white rounded-2xl font-mono text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" value={formUser.password} onChange={e => setFormUser({...formUser, password: e.target.value})} />
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nama Lengkap</label>
                      <input required type="text" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 dark:text-white rounded-2xl font-bold uppercase" value={formUser.name} onChange={e => setFormUser({...formUser, name: e.target.value})} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Username</label>
                        <input required type="text" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 dark:text-white rounded-2xl font-bold" value={formUser.username} onChange={e => setFormUser({...formUser, username: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Jenis Kelamin</label>
                        <select className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 dark:text-white rounded-2xl font-bold" value={formUser.gender} onChange={e => setFormUser({...formUser, gender: e.target.value as any})}>
                          <option value="Laki-laki">Laki-laki</option>
                          <option value="Perempuan">Perempuan</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b pb-2">Struktur & Lokasi</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Jabatan</label>
                        <select className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 dark:text-white rounded-2xl font-bold text-xs" value={formUser.position} onChange={e => setFormUser({...formUser, position: e.target.value})}>
                          {positions.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sabuk</label>
                        <select className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 dark:text-white rounded-2xl font-bold text-xs" value={formUser.beltLevel} onChange={e => setFormUser({...formUser, beltLevel: e.target.value})}>
                          {beltLevels.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cabang</label>
                        <select className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 dark:text-white rounded-2xl font-bold text-xs" value={formUser.branch} onChange={e => setFormUser({...formUser, branch: e.target.value})}>
                          {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ranting</label>
                        <select className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 dark:text-white rounded-2xl font-bold text-xs" value={formUser.subBranch} onChange={e => setFormUser({...formUser, subBranch: e.target.value})}>
                          <option value="">-- Kantor Pusat --</option>
                          {branches.find(b => b.name === formUser.branch)?.subBranches.map(sb => (
                            <option key={sb.id} value={sb.name}>{sb.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="p-6 bg-indigo-50 dark:bg-indigo-950/20 rounded-[2rem] border border-indigo-100 dark:border-indigo-900 space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Hak Akses Sistem</label>
                          <select className="w-full px-4 py-2 bg-white dark:bg-slate-800 border dark:border-slate-700 dark:text-white rounded-xl font-black text-[10px] uppercase outline-none" value={formUser.role} onChange={e => setFormUser({...formUser, role: e.target.value as Role})}>
                            <option value={Role.ANGGOTA}>ANGGOTA</option>
                            <option value={Role.PENGURUS}>PENGURUS</option>
                            <option value={Role.ADMIN}>ADMIN</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Status Pelatih</label>
                          <input type="checkbox" className="w-6 h-6 accent-amber-500 rounded-lg cursor-pointer" checked={formUser.isCoach} onChange={e => setFormUser({...formUser, isCoach: e.target.checked})} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2 space-y-6">
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b pb-2">Dokumentasi Foto</h3>
                   <div className="max-w-xs mx-auto">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center block">Foto Anggota (Mode Portrait)</label>
                         <div 
                           onClick={() => informalPhotoInputRef.current?.click()}
                           className="relative w-full aspect-[3/4] rounded-[2.5rem] border-4 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 overflow-hidden cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-all flex flex-col items-center justify-center group"
                         >
                            {formUser.informalPhoto ? (
                              <img src={formUser.informalPhoto} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Preview Portrait" />
                            ) : (
                              <div className="text-center p-6">
                                 <span className="text-4xl block mb-2 opacity-20">📸</span>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Klik untuk pilih Foto Anggota</p>
                              </div>
                            )}
                            {isUploading && (
                              <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 flex items-center justify-center">
                                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                              </div>
                            )}
                         </div>
                         <input type="file" ref={informalPhotoInputRef} className="hidden" accept="image/*" onChange={e => handlePhotoUpload(e, 'informalPhoto')} />
                      </div>
                   </div>
                </div>
              </div>

              <div className="pt-8 border-t dark:border-slate-700 flex flex-col sm:flex-row gap-4">
                 <button type="button" onClick={closeModal} className="flex-1 py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-black rounded-2xl uppercase tracking-widest text-xs transition-all">Batal</button>
                 <button type="submit" disabled={isUploading} className="flex-[2] py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/30 uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50">
                   {isUploading ? 'Memproses Foto...' : 'Simpan Data Anggota'}
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteConfirmOpen && userToDelete && isAdmin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-12 max-w-sm w-full text-center shadow-2xl border border-slate-200 dark:border-slate-700 animate-in zoom-in">
              <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-8 shadow-inner">⚠️</div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Hapus Anggota?</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-4 leading-relaxed">Seluruh data milik <b>{userToDelete.name}</b> akan dihapus permanen.</p>
              <div className="grid grid-cols-2 gap-4 mt-10">
                 <button onClick={closeModal} className="py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-black rounded-2xl uppercase tracking-widest text-[10px]">Batal</button>
                 <button onClick={() => { onDeleteUser(userToDelete.id); closeModal(); }} className="py-4 bg-red-600 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-xl shadow-red-500/40">Hapus</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Members;
