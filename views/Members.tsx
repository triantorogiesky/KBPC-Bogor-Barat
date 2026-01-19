
import React, { useState, useRef, useMemo } from 'react';
import { User, Role, BeltLevel, Branch } from '../types';
import { suggestJobDescription } from '../geminiService';
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
    subBranch: ''
  });

  const importInputRef = useRef<HTMLInputElement>(null);

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
        avatar: '',
        isCoach: false,
        beltLevel: beltLevels[0]?.name || '',
        gender: 'Laki-laki',
        branch: branches[0]?.name || '',
        subBranch: ''
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

  const handleBeltChange = (beltName: string) => {
    setFormUser(prev => ({ ...prev, beltLevel: beltName }));
  };

  const getBeltStyle = (beltName: string) => {
    const belt = beltLevels.find(b => b.name === beltName);
    if (!belt) return { color: '#64748b', beltColor: '#e2e8f0', bg: 'bg-slate-50', predicate: '-' };
    
    const hex = belt.color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return {
      beltColor: belt.color,
      textColor: luminance > 0.5 ? 'text-slate-800' : 'text-slate-100',
      bgOpacity: belt.color + '15',
      predicate: belt.predicate
    };
  };

  // --- Export / Import / Template Logic ---

  const downloadTemplate = () => {
    const headers = ['Nama', 'Username', 'Email', 'Role', 'Jabatan', 'Tanggal Bergabung', 'Status', 'Tingkat Sabuk', 'Jenis Kelamin', 'Cabang', 'Ranting'];
    const sampleData = [
      {
        'Nama': 'Contoh Anggota',
        'Username': 'contoh_user',
        'Email': 'contoh@email.com',
        'Role': 'ANGGOTA',
        'Jabatan': 'Anggota Muda',
        'Tanggal Bergabung': '2024-05-20',
        'Status': 'Active',
        'Tingkat Sabuk': 'Dasar (Putih)',
        'Jenis Kelamin': 'Laki-laki',
        'Cabang': branches[0]?.name || 'Bogor Barat',
        'Ranting': branches[0]?.subBranches[0]?.name || 'Bubulak'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template Import");
    
    // Auto-fit column widths
    const maxWidths = headers.map(h => ({ wch: h.length + 10 }));
    worksheet['!cols'] = maxWidths;

    XLSX.writeFile(workbook, "template_import_anggota_kbpc.xlsx");
    showNotification('Template Excel berhasil diunduh.', 'success');
  };

  const exportToCSV = () => {
    if (users.length === 0) {
      showNotification('Tidak ada data untuk diekspor.', 'info');
      return;
    }

    const headers = ['Nama', 'Username', 'Email', 'Role', 'Jabatan', 'Tanggal Bergabung', 'Status', 'Tingkat Sabuk', 'Jenis Kelamin', 'Cabang', 'Ranting'];
    const csvContent = [
      headers.join(','),
      ...users.map(u => [
        `"${u.name}"`,
        `"${u.username}"`,
        `"${u.email}"`,
        `"${u.role}"`,
        `"${u.position}"`,
        `"${u.joinDate}"`,
        `"${u.status}"`,
        `"${u.beltLevel}"`,
        `"${u.gender}"`,
        `"${u.branch}"`,
        `"${u.subBranch}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `data_anggota_kbpc_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification(`Berhasil mengekspor ${users.length} data anggota.`, 'success');
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const rawData = XLSX.utils.sheet_to_json(worksheet);
        
        if (rawData.length === 0) {
          throw new Error('File Excel kosong atau tidak terbaca.');
        }

        // Map Indonesian headers back to User properties
        const mappedUsers: Partial<User>[] = rawData.map((row: any) => {
          return {
            name: row['Nama'] || row['name'],
            username: row['Username'] || row['username'],
            email: row['Email'] || row['email'],
            role: (row['Role'] || row['role'] || Role.ANGGOTA).toUpperCase() as Role,
            position: row['Jabatan'] || row['position'] || row['Jabatan'],
            joinDate: row['Tanggal Bergabung'] || row['joinDate'] || new Date().toISOString().split('T')[0],
            status: row['Status'] || row['status'] || 'Active',
            beltLevel: row['Tingkat Sabuk'] || row['beltLevel'],
            gender: row['Jenis Kelamin'] || row['gender'] || 'Laki-laki',
            branch: row['Cabang'] || row['branch'],
            subBranch: row['Ranting'] || row['subBranch']
          };
        });

        // Simple validation
        const validUsers = mappedUsers.filter(u => u.name && u.username);
        
        if (validUsers.length === 0) {
          throw new Error('Tidak ada data valid ditemukan (Kolom "Nama" & "Username" wajib ada).');
        }

        onBulkAddUsers(validUsers);
        showNotification(`Berhasil mengimpor ${validUsers.length} anggota baru dari Excel.`, 'success');
        if (importInputRef.current) importInputRef.current.value = '';
      } catch (err: any) {
        showNotification(`Gagal impor Excel: ${err.message}`, 'error');
        console.error(err);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Manajemen Anggota</h1>
          <p className="text-slate-500 dark:text-slate-400">Kelola data, foto dokumentasi, dan hak akses seluruh anggota KBPC.</p>
        </div>
        <div className="flex flex-wrap justify-center sm:justify-end gap-2">
          <input 
            type="file" 
            ref={importInputRef} 
            onChange={handleImportFile} 
            accept=".xlsx, .xls" 
            className="hidden" 
          />
          <button
            onClick={downloadTemplate}
            className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-all flex items-center gap-2"
            title="Download Template Excel untuk Import"
          >
            <span>📄</span> Template Excel
          </button>
          <button
            onClick={handleImportClick}
            className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-all flex items-center gap-2"
          >
            <span>📊</span> Impor Excel
          </button>
          <button
            onClick={exportToCSV}
            className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-all flex items-center gap-2"
          >
            <span>📤</span> Ekspor CSV
          </button>
          <button
            onClick={() => openModal()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-md transition-all flex items-center gap-2"
          >
            <span>➕</span> Tambah Anggota
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-4">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">🔍</span>
            <input
              type="text"
              placeholder="Cari anggota berdasarkan nama, jabatan, cabang, atau sabuk..."
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
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Anggota</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cabang & Ranting</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tingkatan Sabuk</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Jabatan & Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredUsers.map((user) => {
                const style = getBeltStyle(user.beltLevel);
                return (
                  <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} className="w-10 h-10 rounded-full border dark:border-slate-600 object-cover" />
                          {user.isCoach && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 border-2 border-white dark:border-slate-800 rounded-full flex items-center justify-center text-[8px] text-white font-black" title="Pelatih Terverifikasi">P</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <button 
                            onClick={() => openDetail(user)}
                            className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline text-left block w-full"
                          >
                            {user.name}
                          </button>
                          <div className="flex items-center gap-1.5">
                            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase">@{user.username}</p>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">•</span>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{user.gender === 'Laki-laki' ? '♂️ L' : '♀️ P'}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">🏢 {user.branch || 'Pusat'}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">📍 {user.subBranch || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <div 
                          className="flex items-center w-fit overflow-hidden rounded-md border border-slate-200 dark:border-slate-700 shadow-sm group cursor-help transition-all hover:shadow-md"
                          title={`Sabuk: ${user.beltLevel} - Predikat: ${style.predicate}`}
                        >
                          <div className="w-2.5 self-stretch" style={{ backgroundColor: style.beltColor }}></div>
                          <div className="px-2.5 py-1 flex flex-col" style={{ backgroundColor: style.bgOpacity }}>
                            <span className="text-[10px] font-black uppercase tracking-wider dark:text-slate-200">{user.beltLevel}</span>
                            <span className="text-[8px] font-bold text-indigo-600 dark:text-indigo-400 leading-tight">📜 {style.predicate}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{user.position}</p>
                        <div className="flex items-center gap-1.5">
                           <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold border ${
                            user.status === 'Active' ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-400' : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-400'
                          }`}>
                            {user.status.toUpperCase()}
                          </span>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold border border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/40 dark:bg-indigo-900/20 dark:text-indigo-300`}>
                            {user.role}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openModal(user)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" title="Edit">✏️</button>
                        <button onClick={() => openDeleteConfirm(user)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Hapus">🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-hidden flex flex-col animate-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">{editingUser ? 'Edit Data Anggota' : 'Registrasi Anggota Baru'}</h2>
              <button onClick={closeModal} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 text-xl">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nama Lengkap</label>
                  <input required type="text" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 dark:text-white rounded-xl focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all font-medium" value={formUser.name} onChange={(e) => setFormUser({ ...formUser, name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Jenis Kelamin</label>
                  <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 dark:text-white rounded-xl focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all font-bold" value={formUser.gender} onChange={(e) => setFormUser({ ...formUser, gender: e.target.value as any })}>
                    <option value="Laki-laki">LAKI-LAKI</option>
                    <option value="Perempuan">PEREMPUAN</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Username</label>
                  <input required type="text" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 dark:text-white rounded-xl focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all font-medium" value={formUser.username} onChange={(e) => setFormUser({ ...formUser, username: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email Korespondensi</label>
                  <input required type="email" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 dark:text-white rounded-xl focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all font-medium" value={formUser.email} onChange={(e) => setFormUser({ ...formUser, email: e.target.value })} />
                </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border dark:border-slate-700 space-y-6">
                <h4 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] border-b dark:border-slate-700 pb-1">Detail Organisasi & Wilayah</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cabang (Wilayah)</label>
                    <select className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 dark:text-white rounded-xl focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all font-bold" value={formUser.branch} onChange={(e) => setFormUser({ ...formUser, branch: e.target.value, subBranch: '' })}>
                      <option value="">Pilih Cabang</option>
                      {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ranting (Desa/Dojo)</label>
                    <select disabled={!formUser.branch} className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 dark:text-white rounded-xl focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all font-bold disabled:opacity-50" value={formUser.subBranch} onChange={(e) => setFormUser({ ...formUser, subBranch: e.target.value })}>
                      <option value="">Pilih Ranting</option>
                      {availableSubBranches.map(sb => <option key={sb.id} value={sb.name}>{sb.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tingkatan Sabuk</label>
                    <select className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 dark:text-white rounded-xl focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all font-bold" value={formUser.beltLevel} onChange={(e) => handleBeltChange(e.target.value)}>
                      {beltLevels.map(level => <option key={level.name} value={level.name}>{level.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Jabatan</label>
                    <select className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 dark:text-white rounded-xl focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all font-bold uppercase" value={formUser.position} onChange={(e) => setFormUser({ ...formUser, position: e.target.value })}>
                      {positions.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hak Akses</label>
                  <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 dark:text-white rounded-xl focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all font-bold" value={formUser.role} onChange={(e) => setFormUser({ ...formUser, role: e.target.value as Role })}>
                    <option value={Role.ANGGOTA}>ANGGOTA</option>
                    <option value={Role.PENGURUS}>PENGURUS</option>
                    <option value={Role.ADMIN}>ADMINISTRATOR</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status Member</label>
                  <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 dark:text-white rounded-xl outline-none font-bold" value={formUser.status} onChange={(e) => setFormUser({ ...formUser, status: e.target.value as any })}>
                    <option value="Active">AKTIF</option>
                    <option value="Pending">PENDING</option>
                    <option value="Inactive">NON-AKTIF</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-slate-100 dark:border-slate-700">
                <button type="button" onClick={closeModal} className="flex-1 px-6 py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-black uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Batal</button>
                <button type="submit" className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-wider hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98]">{editingUser ? 'Perbarui Data' : 'Daftarkan Anggota'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;
