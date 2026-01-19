
import React, { useState, useEffect, useCallback } from 'react';
import { Role, User, AuthState, AppNotification, BeltLevel, Branch } from './types';
import { INITIAL_USERS, POSITIONS as INITIAL_POSITIONS, INITIAL_BELT_LEVELS, INITIAL_BRANCHES, LOGO_URL } from './constants';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import Members from './views/Members';
import Positions from './views/Positions';
import BeltLevels from './views/BeltLevels';
import Profile from './views/Profile';
import Branches from './views/Branches';
import Certificates from './views/Certificates';

const LoginView: React.FC<{ onLogin: (username: string) => void; onForgotPassword: () => void; onRegister: () => void }> = ({ onLogin, onForgotPassword, onRegister }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password');

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-600 dark:bg-indigo-950 p-6 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-10 space-y-8 animate-in slide-in-from-bottom duration-500">
        <div className="text-center">
          <div className="w-24 h-24 bg-white rounded-3xl mx-auto flex items-center justify-center shadow-xl mb-6 border-4 border-slate-50 dark:border-slate-700 overflow-hidden transform hover:scale-110 transition-transform">
            <img src={LOGO_URL} alt="KBPC Logo" className="w-20 h-20 object-contain" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter uppercase">Padjadjaran Cimande</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">Sistem Manajemen Data Anggota (DATABASE)</p>
        </div>

        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl border border-indigo-100 dark:border-indigo-800 mb-4">
          <p className="text-[10px] font-black text-indigo-700 dark:text-indigo-400 uppercase mb-1 tracking-widest">Akses Administrator:</p>
          <div className="flex justify-between text-xs">
            <p className="text-indigo-600 dark:text-indigo-300">User: <span className="font-mono font-bold">admin</span></p>
            <p className="text-indigo-600 dark:text-indigo-300">Pass: <span className="font-mono font-bold">password</span></p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onLogin(username); }}>
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Username</label>
            <input
              required
              type="text"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 dark:text-white rounded-xl focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all font-bold"
              placeholder="Masukkan username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Kata Sandi</label>
            <input
              required
              type="password"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 dark:text-white rounded-xl focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all font-bold"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="text-right">
            <button type="button" onClick={onForgotPassword} className="text-xs text-indigo-600 dark:text-indigo-400 font-black hover:underline tracking-tighter">LUPA PASSWORD?</button>
          </div>
          <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-xl shadow-indigo-500/30 transition-all transform active:scale-[0.98] uppercase tracking-widest">
            Masuk Sekarang
          </button>
        </form>

        <div className="text-center">
          <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">
            Belum terdaftar? <button onClick={onRegister} className="text-indigo-600 dark:text-indigo-400 font-black hover:underline">Registrasi</button>
          </p>
        </div>
      </div>
    </div>
  );
};

const ForgotPasswordView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-6">
        <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl p-8 text-center space-y-6 animate-in zoom-in duration-300">
          <div className="text-5xl">📧</div>
          <h2 className="text-2xl font-bold dark:text-white">Cek Email Anda</h2>
          <p className="text-slate-500 dark:text-slate-400">Kami telah mengirimkan instruksi pemulihan kata sandi ke <b>{email}</b>.</p>
          <button onClick={onBack} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl">Kembali ke Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-6">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl p-8 space-y-6 animate-in fade-in duration-300">
        <h2 className="text-2xl font-bold dark:text-white">Lupa Kata Sandi?</h2>
        <p className="text-slate-500 dark:text-slate-400">Masukkan email Anda untuk menerima link reset.</p>
        <div className="space-y-4">
          <input
            type="email"
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={() => setSubmitted(true)} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl">Kirim Instruksi</button>
          <button onClick={onBack} className="w-full text-slate-400 dark:text-slate-500 text-sm font-semibold">Batal</button>
        </div>
      </div>
    </div>
  );
};

const RegisterView: React.FC<{ onBack: () => void; onRegister: (userData: Partial<User>) => void; beltLevels: BeltLevel[]; branches: Branch[] }> = ({ onBack, onRegister, beltLevels, branches }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [branchName, setBranchName] = useState(branches[0]?.name || '');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister({ 
      name, username, email, gender, 
      branch: branchName, 
      subBranch: '', 
      role: Role.ANGGOTA,
      status: 'Pending', 
      isCoach: false, 
      beltLevel: beltLevels[0]?.name || '', 
      predicate: 'Anggota Baru' 
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-6">
        <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl p-8 text-center space-y-6 animate-in zoom-in duration-300">
          <div className="text-5xl">✅</div>
          <h2 className="text-2xl font-bold dark:text-white">Pendaftaran Berhasil</h2>
          <p className="text-slate-500 dark:text-slate-400">Pendaftaran Anda sedang diproses. Mohon tunggu konfirmasi admin untuk verifikasi akun <b>{username}</b>.</p>
          <button onClick={onBack} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl">Lanjut Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-50 dark:bg-indigo-950 p-6">
      <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl p-10 shadow-xl space-y-6 animate-in fade-in duration-300 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center gap-4 mb-2">
            <img src={LOGO_URL} className="w-12 h-12 object-contain" alt="Logo" />
            <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none">Daftar Akun Anggota</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nama Lengkap</label>
              <input required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border dark:border-slate-600 dark:text-white rounded-xl outline-none font-bold" placeholder="Contoh: John Doe" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Jenis Kelamin</label>
                <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border dark:border-slate-600 dark:text-white rounded-xl outline-none font-bold" value={gender} onChange={e => setGender(e.target.value as any)}>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cabang</label>
                <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border dark:border-slate-600 dark:text-white rounded-xl outline-none font-bold" value={branchName} onChange={e => setBranchName(e.target.value)}>
                  {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Username</label>
              <input required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border dark:border-slate-600 dark:text-white rounded-xl outline-none font-bold" placeholder="Contoh: john_doe123" value={username} onChange={e => setUsername(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</label>
              <input required type="email" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border dark:border-slate-600 dark:text-white rounded-xl outline-none font-bold" placeholder="email@domain.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Password</label>
              <input required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border dark:border-slate-600 dark:text-white rounded-xl outline-none font-bold" placeholder="••••••••" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-black rounded-xl shadow-lg hover:bg-indigo-700 transition-all mt-4 uppercase tracking-widest">Daftar Sekarang</button>
        </form>
        <button onClick={onBack} className="w-full text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-widest">Sudah punya akun? Login</button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });
  const [view, setView] = useState<'login' | 'forgot' | 'register'>('login');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('mh_theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('mh_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [positions, setPositions] = useState<string[]>(() => {
    const saved = localStorage.getItem('mh_positions');
    return saved ? JSON.parse(saved) : INITIAL_POSITIONS;
  });

  const [beltLevels, setBeltLevels] = useState<BeltLevel[]>(() => {
    const saved = localStorage.getItem('mh_belts');
    return saved ? JSON.parse(saved) : INITIAL_BELT_LEVELS;
  });

  const [branches, setBranches] = useState<Branch[]>(() => {
    const saved = localStorage.getItem('mh_branches');
    return saved ? JSON.parse(saved) : INITIAL_BRANCHES;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('mh_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('mh_theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('mh_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('mh_positions', JSON.stringify(positions));
  }, [positions]);

  useEffect(() => {
    localStorage.setItem('mh_belts', JSON.stringify(beltLevels));
  }, [beltLevels]);

  useEffect(() => {
    localStorage.setItem('mh_branches', JSON.stringify(branches));
  }, [branches]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const handleLogin = (username: string) => {
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (user) {
      if (user.status === 'Pending') {
        showNotification('Akun Anda masih menunggu verifikasi.', 'info');
        return;
      }
      setAuthState({ user, isAuthenticated: true, isLoading: false });
      showNotification(`Selamat datang kembali, ${user.name}!`, 'success');
    } else {
      showNotification('Akun tidak ditemukan atau username salah.', 'error');
    }
  };

  const handleLogout = () => {
    setAuthState({ user: null, isAuthenticated: false, isLoading: false });
    setView('login');
    showNotification('Berhasil keluar dari sistem.', 'info');
  };

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const addUser = (userData: Partial<User>) => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username: userData.username || `user_${Math.random().toString(36).substr(2, 5)}`,
      name: userData.name || 'New Member',
      email: userData.email || '',
      role: userData.role || Role.ANGGOTA,
      position: userData.position || (positions.length > 0 ? positions[0] : 'Anggota Muda'),
      joinDate: new Date().toISOString().split('T')[0],
      status: userData.status || 'Active',
      avatar: userData.avatar || `https://ui-avatars.com/api/?name=${userData.name}&background=random`,
      isCoach: userData.isCoach || false,
      formalPhoto: userData.formalPhoto,
      informalPhoto: userData.informalPhoto,
      beltLevel: userData.beltLevel || (beltLevels.length > 0 ? beltLevels[0].name : ''),
      predicate: userData.predicate || 'Anggota Muda',
      gender: userData.gender || 'Laki-laki',
      branch: userData.branch || (branches[0]?.name || 'Pusat'),
      subBranch: userData.subBranch || ''
    };
    setUsers([...users, newUser]);
    return newUser;
  };

  const addBulkUsers = (newUsersList: Partial<User>[]) => {
    const mappedUsers: User[] = newUsersList.map(userData => ({
      id: Math.random().toString(36).substr(2, 9),
      username: userData.username || `user_${Math.random().toString(36).substr(2, 5)}`,
      name: userData.name || 'Imported Member',
      email: userData.email || '',
      role: userData.role || Role.ANGGOTA,
      position: userData.position || (positions.length > 0 ? positions[0] : 'Anggota Muda'),
      joinDate: userData.joinDate || new Date().toISOString().split('T')[0],
      status: userData.status || 'Active',
      avatar: userData.avatar || `https://ui-avatars.com/api/?name=${userData.name}&background=random`,
      isCoach: userData.isCoach || false,
      beltLevel: userData.beltLevel || (beltLevels.length > 0 ? beltLevels[0].name : ''),
      predicate: userData.predicate || 'Anggota Muda',
      gender: userData.gender || 'Laki-laki',
      branch: userData.branch || (branches[0]?.name || 'Pusat'),
      subBranch: userData.subBranch || ''
    }));
    setUsers(prev => [...prev, ...mappedUsers]);
  };

  const updateUser = (updatedUser: User) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (authState.user?.id === updatedUser.id) {
      setAuthState(prev => ({ ...prev, user: updatedUser }));
    }
    showNotification('Data berhasil diperbarui.');
  };

  const deleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
    showNotification('Anggota telah dihapus.', 'info');
  };

  const addBranch = (branchData: Partial<Branch>) => {
    const newBranch: Branch = {
      id: Math.random().toString(36).substr(2, 9),
      name: branchData.name || 'New Branch',
      leader: branchData.leader || '',
      subBranches: branchData.subBranches || []
    };
    setBranches([...branches, newBranch]);
    showNotification('Cabang baru ditambahkan.');
  };

  const updateBranch = (updatedBranch: Branch) => {
    setBranches(branches.map(b => b.id === updatedBranch.id ? updatedBranch : b));
    showNotification('Struktur cabang diperbarui.');
  };

  const deleteBranch = (id: string) => {
    setBranches(branches.filter(b => b.id !== id));
    showNotification('Cabang dihapus.', 'info');
  };

  const handleRegistration = (userData: Partial<User>) => {
    addUser(userData);
    showNotification('Pendaftaran berhasil! Silakan tunggu konfirmasi.', 'success');
  };

  const addPosition = (newPos: string) => {
    if (positions.includes(newPos)) {
      showNotification('Jabatan sudah ada.', 'error');
      return;
    }
    setPositions([...positions, newPos]);
    showNotification('Jabatan baru ditambahkan.');
  };

  const updatePosition = (oldPos: string, newPos: string) => {
    if (oldPos !== newPos && positions.includes(newPos)) {
      showNotification('Jabatan dengan nama tersebut sudah ada.', 'error');
      return;
    }
    setPositions(positions.map(p => p === oldPos ? newPos : p));
    setUsers(users.map(u => u.position === oldPos ? { ...u, position: newPos } : u));
    showNotification('Jabatan berhasil diperbarui.', 'success');
  };

  const deletePosition = (pos: string) => {
    const isUsed = users.some(u => u.position === pos);
    if (isUsed) {
      showNotification('Gagal: Jabatan masih digunakan oleh anggota.', 'error');
      return;
    }
    setPositions(positions.filter(p => p !== pos));
    showNotification('Jabatan dihapus.', 'info');
  };

  const addBeltLevel = (newBelt: BeltLevel) => {
    if (beltLevels.some(b => b.name === newBelt.name)) {
      showNotification('Tingkat sabuk sudah ada.', 'error');
      return;
    }
    setBeltLevels([...beltLevels, newBelt]);
    showNotification('Tingkat sabuk baru ditambahkan.');
  };

  const updateBeltLevel = (oldBeltName: string, updatedBelt: BeltLevel) => {
    if (oldBeltName !== updatedBelt.name && beltLevels.some(b => b.name === updatedBelt.name)) {
      showNotification('Tingkat sabuk dengan nama baru sudah ada.', 'error');
      return;
    }
    setBeltLevels(beltLevels.map(b => b.name === oldBeltName ? updatedBelt : b));
    if (oldBeltName !== updatedBelt.name) {
      setUsers(users.map(u => u.beltLevel === oldBeltName ? { ...u, beltLevel: updatedBelt.name } : u));
    }
    showNotification('Tingkat sabuk telah diperbarui.', 'success');
  };

  const deleteBeltLevel = (beltName: string) => {
    const isUsed = users.some(u => u.beltLevel === beltName);
    if (isUsed) {
      showNotification('Gagal: Tingkat sabuk masih digunakan oleh anggota.', 'error');
      return;
    }
    setBeltLevels(beltLevels.filter(b => b.name !== beltName));
    showNotification('Tingkat sabuk dihapus.', 'info');
  };

  if (authState.isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-indigo-600 dark:text-indigo-400 font-black tracking-[0.3em] text-[10px] uppercase">MEMULAI DATABASE KBPC</p>
        </div>
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        {view === 'login' && <LoginView onLogin={handleLogin} onForgotPassword={() => setView('forgot')} onRegister={() => setView('register')} />}
        {view === 'forgot' && <ForgotPasswordView onBack={() => setView('login')} />}
        {view === 'register' && <RegisterView onBack={() => setView('login')} onRegister={handleRegistration} beltLevels={beltLevels} branches={branches} />}
        
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
          {notifications.map(n => (
            <div key={n.id} className={`px-6 py-4 rounded-xl shadow-lg border-l-4 text-white font-medium animate-in slide-in-from-right ${
              n.type === 'success' ? 'bg-emerald-500 border-emerald-700' :
              n.type === 'error' ? 'bg-red-500 border-red-700' : 'bg-slate-800 border-slate-600'
            }`}>
              {n.message}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Layout 
      user={authState.user!} 
      onLogout={handleLogout} 
      activeView={activeTab} 
      setActiveView={setActiveTab}
      isDarkMode={isDarkMode}
      toggleDarkMode={toggleDarkMode}
    >
      <div className="max-w-7xl mx-auto">
        {activeTab === 'dashboard' && <Dashboard users={users} />}
        {activeTab === 'members' && (
          <Members 
            users={users} 
            positions={positions}
            beltLevels={beltLevels}
            branches={branches}
            currentUserRole={authState.user!.role}
            onAddUser={(u) => { addUser(u); showNotification('Anggota baru ditambahkan.'); }} 
            onBulkAddUsers={addBulkUsers}
            onUpdateUser={updateUser} 
            onDeleteUser={deleteUser} 
            showNotification={showNotification}
          />
        )}
        {activeTab === 'certificates' && (
          <Certificates 
            users={users}
            beltLevels={beltLevels}
          />
        )}
        {activeTab === 'branches' && (
          <Branches 
            branches={branches}
            users={users}
            onAddBranch={addBranch}
            onUpdateBranch={updateBranch}
            onDeleteBranch={deleteBranch}
          />
        )}
        {activeTab === 'positions' && (
          <Positions 
            positions={positions} 
            onAdd={addPosition}
            onUpdate={updatePosition}
            onDelete={deletePosition} 
          />
        )}
        {activeTab === 'belt-levels' && (
          <BeltLevels 
            beltLevels={beltLevels} 
            onAdd={addBeltLevel}
            onUpdate={updateBeltLevel}
            onDelete={deleteBeltLevel} 
          />
        )}
        {activeTab === 'roles' && (
          <div className="bg-white dark:bg-slate-800 p-10 rounded-3xl border border-slate-200 dark:border-slate-700 text-center space-y-4 shadow-sm">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Manajemen Hak Akses</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Fitur ini memungkinkan administrator untuk mengatur izin spesifik per jabatan.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-left">
              <div className="p-6 border rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800">
                <p className="font-black text-indigo-700 dark:text-indigo-400 mb-2 uppercase text-xs tracking-widest">ADMIN (Full Access)</p>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
                  <li>✅ Kelola Seluruh Data Anggota</li>
                  <li>✅ Konfigurasi Hak Akses & Jabatan</li>
                  <li>✅ Analisis Data dengan AI</li>
                  <li>✅ Pengaturan Sistem</li>
                </ul>
              </div>
              <div className="p-6 border rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800">
                <p className="font-black text-emerald-700 dark:text-emerald-400 mb-2 uppercase text-xs tracking-widest">PENGURUS (Staff Access)</p>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
                  <li>✅ Lihat & Tambah Anggota</li>
                  <li>✅ Update Status Anggota</li>
                  <li>✅ Akses Dashboard Pengurus</li>
                  <li>❌ Hapus Data Anggota</li>
                </ul>
              </div>
              <div className="p-6 border rounded-2xl bg-slate-50 dark:bg-slate-700/30 border-slate-200 dark:border-slate-600">
                <p className="font-black text-slate-700 dark:text-slate-300 mb-2 uppercase text-xs tracking-widest">ANGGOTA (Read Only)</p>
                <ul className="text-xs text-slate-500 dark:text-slate-500 space-y-2">
                  <li>✅ Lihat Profil Sendiri</li>
                  <li>✅ Lihat Dashboard Umum</li>
                  <li>❌ Edit Data Anggota Lain</li>
                  <li>❌ Kelola Hak Akses</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'profile' && authState.user && (
          <Profile 
            user={authState.user} 
            onUpdate={updateUser}
            beltLevels={beltLevels}
          />
        )}
      </div>

      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 print:hidden">
        {notifications.map(n => (
          <div key={n.id} className={`px-6 py-4 rounded-xl shadow-lg border-l-4 text-white font-medium animate-in slide-in-from-right ${
            n.type === 'success' ? 'bg-emerald-500 border-emerald-700' :
            n.type === 'error' ? 'bg-red-500 border-red-700' : 'bg-slate-800 border-slate-600'
          }`}>
            {n.message}
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default App;
