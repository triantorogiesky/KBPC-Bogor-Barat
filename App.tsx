
import React, { useState, useEffect } from 'react';
import { Role, User, AuthState, AppNotification, BeltLevel, Branch } from './types';
import { LOGO_URL } from './constants';
import { Database } from './db';
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
          <p className="text-slate-500 dark:text-slate-400">Kami telah mengirimkan instruksi reset ke <b>{email}</b>.</p>
          <button onClick={onBack} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl">Kembali ke Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-6">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl p-8 space-y-6 animate-in fade-in duration-300">
        <h2 className="text-2xl font-bold dark:text-white">Lupa Kata Sandi?</h2>
        <input
          type="email"
          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 dark:text-white rounded-xl outline-none"
          placeholder="email@anda.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={() => setSubmitted(true)} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl">Kirim Instruksi</button>
        <button onClick={onBack} className="w-full text-slate-400 text-sm font-semibold">Batal</button>
      </div>
    </div>
  );
};

const RegisterView: React.FC<{ onBack: () => void; onRegister: (userData: Partial<User>) => void; beltLevels: BeltLevel[]; branches: Branch[] }> = ({ onBack, onRegister, beltLevels, branches }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister({ name, username, email, status: 'Pending' });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-6">
        <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl p-8 text-center space-y-6 animate-in zoom-in duration-300">
          <div className="text-5xl">✅</div>
          <h2 className="text-2xl font-bold dark:text-white">Pendaftaran Berhasil</h2>
          <p className="text-slate-500 dark:text-slate-400">Akun sedang diverifikasi oleh administrator.</p>
          <button onClick={onBack} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl">Kembali Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-50 dark:bg-indigo-950 p-6">
      <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl p-10 shadow-xl space-y-6">
        <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Daftar Anggota</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border dark:text-white rounded-xl" placeholder="Nama Lengkap" value={name} onChange={e => setName(e.target.value)} />
          <input required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border dark:text-white rounded-xl" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
          <input required type="email" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border dark:text-white rounded-xl" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-black rounded-xl uppercase tracking-widest">Daftar Sekarang</button>
        </form>
        <button onClick={onBack} className="w-full text-slate-400 text-xs font-black uppercase">Sudah punya akun? Login</button>
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
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('kbpc_theme') === 'dark');
  
  const [users, setUsers] = useState<User[]>([]);
  const [positions, setPositions] = useState<string[]>([]);
  const [beltLevels, setBeltLevels] = useState<BeltLevel[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    // Initial Data Load from "Database"
    setUsers(Database.getUsers());
    setPositions(Database.getPositions());
    setBeltLevels(Database.getBelts());
    setBranches(Database.getBranches());
    
    const timer = setTimeout(() => {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('kbpc_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('kbpc_theme', 'light');
    }
  }, [isDarkMode]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3000);
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
      showNotification('Username atau password salah.', 'error');
    }
  };

  const handleLogout = () => {
    setAuthState({ user: null, isAuthenticated: false, isLoading: false });
    setView('login');
    showNotification('Berhasil logout.');
  };

  const onAddUser = (userData: Partial<User>) => {
    const newUser: User = {
      id: Database.generateNIA(),
      username: userData.username || 'user',
      name: userData.name || 'Anggota Baru',
      email: userData.email || '',
      role: userData.role || Role.ANGGOTA,
      position: userData.position || positions[0],
      joinDate: new Date().toISOString().split('T')[0],
      status: userData.status || 'Active',
      avatar: `https://ui-avatars.com/api/?name=${userData.name}&background=random`,
      isCoach: userData.isCoach || false,
      beltLevel: userData.beltLevel || beltLevels[0].name,
      predicate: userData.predicate || 'Baru',
      gender: userData.gender || 'Laki-laki',
      branch: userData.branch || branches[0].name,
      subBranch: userData.subBranch || ''
    };
    Database.saveUser(newUser);
    setUsers(Database.getUsers());
  };

  const onUpdateUser = (updatedUser: User) => {
    Database.saveUser(updatedUser);
    const refreshed = Database.getUsers();
    setUsers(refreshed);
    if (authState.user?.id === updatedUser.id) {
      setAuthState(prev => ({ ...prev, user: updatedUser }));
    }
    showNotification('Data anggota berhasil disimpan.');
  };

  const onDeleteUser = (id: string) => {
    Database.deleteUser(id);
    setUsers(Database.getUsers());
    showNotification('Anggota telah dihapus.', 'info');
  };

  if (authState.isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-indigo-600 dark:text-indigo-400 font-black tracking-[0.3em] text-[10px] uppercase animate-pulse">MEMULAI DATABASE KBPC</p>
        </div>
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        {view === 'login' && <LoginView onLogin={handleLogin} onForgotPassword={() => setView('forgot')} onRegister={() => setView('register')} />}
        {view === 'forgot' && <ForgotPasswordView onBack={() => setView('login')} />}
        {view === 'register' && <RegisterView onBack={() => setView('login')} onRegister={onAddUser} beltLevels={beltLevels} branches={branches} />}
        
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
      toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
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
            onAddUser={onAddUser} 
            onBulkAddUsers={(list) => { list.forEach(u => onAddUser(u)); showNotification('Impor data berhasil.'); }}
            onUpdateUser={onUpdateUser} 
            onDeleteUser={onDeleteUser} 
            showNotification={showNotification}
          />
        )}
        {activeTab === 'branches' && (
          <Branches 
            branches={branches}
            users={users}
            onAddBranch={(b) => { Database.saveBranch(b as Branch); setBranches(Database.getBranches()); showNotification('Cabang ditambahkan.'); }}
            onUpdateBranch={(b) => { Database.saveBranch(b); setBranches(Database.getBranches()); showNotification('Cabang diperbarui.'); }}
            onDeleteBranch={(id) => { Database.deleteBranch(id); setBranches(Database.getBranches()); showNotification('Cabang dihapus.'); }}
          />
        )}
        {activeTab === 'positions' && (
          <Positions 
            positions={positions} 
            onAdd={(p) => { const updated = [...positions, p]; Database.savePositions(updated); setPositions(updated); }}
            onUpdate={(old, next) => { const updated = positions.map(p => p === old ? next : p); Database.savePositions(updated); setPositions(updated); }}
            onDelete={(p) => { const updated = positions.filter(item => item !== p); Database.savePositions(updated); setPositions(updated); }} 
          />
        )}
        {activeTab === 'belt-levels' && (
          <BeltLevels 
            beltLevels={beltLevels} 
            onAdd={(b) => { Database.saveBelt(b); setBeltLevels(Database.getBelts()); }}
            onUpdate={(old, next) => { Database.saveBelt(next, old); setBeltLevels(Database.getBelts()); }}
            onDelete={(name) => { const updated = beltLevels.filter(b => b.name !== name); localStorage.setItem('kbpc_db_belts', JSON.stringify(updated)); setBeltLevels(updated); }} 
          />
        )}
        {activeTab === 'profile' && authState.user && (
          <Profile user={authState.user} onUpdate={onUpdateUser} beltLevels={beltLevels} />
        )}
        {activeTab === 'roles' && <div className="p-10 text-center font-bold">Modul Manajemen Hak Akses (Segera Hadir)</div>}
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
