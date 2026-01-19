
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

// Fix: Implemented LoginView component
const LoginView: React.FC<{ onLogin: (u: string) => void; onForgotPassword: () => void; onRegister: () => void }> = ({ onLogin, onForgotPassword, onRegister }) => {
  const [username, setUsername] = useState('');
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-700">
        <div className="text-center mb-8">
          <img src={LOGO_URL} alt="Logo" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Login KBPC</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Masuk ke sistem database Cimande</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onLogin(username); }} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Username</label>
            <input 
              type="text" 
              className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-700 border dark:border-slate-600 dark:text-white rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required
            />
          </div>
          <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/30 uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all">Masuk</button>
        </form>
        <div className="mt-8 flex flex-col gap-4 text-center">
          <button onClick={onForgotPassword} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Lupa Kata Sandi?</button>
          <button onClick={onRegister} className="text-xs font-bold text-slate-500 dark:text-slate-400">Belum punya akun? <span className="text-indigo-600">Daftar Sekarang</span></button>
        </div>
      </div>
    </div>
  );
};

// Fix: Implemented ForgotPasswordView component
const ForgotPasswordView: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 text-center">
    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-700">
      <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-4">Lupa Kata Sandi</h2>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Silakan hubungi Administrator Utama atau Sekretaris Cabang untuk mereset kata sandi Anda secara manual.</p>
      <button onClick={onBack} className="w-full py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-black rounded-2xl uppercase tracking-widest text-xs">Kembali ke Login</button>
    </div>
  </div>
);

// Fix: Implemented RegisterView component
const RegisterView: React.FC<{ onBack: () => void; onRegister: (u: Partial<User>) => void; beltLevels: BeltLevel[]; branches: Branch[] }> = ({ onBack, onRegister }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister({ name, username, email, status: 'Pending' });
    onBack();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter text-center mb-8">Registrasi Anggota</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Nama Lengkap</label>
            <input required className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-700 border dark:border-slate-600 dark:text-white rounded-2xl outline-none" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Username</label>
            <input required className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-700 border dark:border-slate-600 dark:text-white rounded-2xl outline-none" value={username} onChange={e => setUsername(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Email</label>
            <input required type="email" className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-700 border dark:border-slate-600 dark:text-white rounded-2xl outline-none" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/30 uppercase tracking-widest text-xs mt-4">Daftar Sekarang</button>
          <button type="button" onClick={onBack} className="w-full py-4 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Sudah punya akun? Login</button>
        </form>
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
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      // 1. Ambil Konfigurasi dari Vercel Edge Config
      const config = await Database.initialize();
      setPositions(config.positions);
      setBeltLevels(config.beltLevels);
      setBranches(config.branches);

      // 2. Ambil Data Anggota dari Local Storage
      setUsers(Database.getUsers());
      
      setIsDataLoaded(true);
      
      // Beri sedikit delay untuk animasi loading yang smooth
      setTimeout(() => {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }, 800);
    };

    initApp();
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
        showNotification('Akun Anda masih menunggu verifikasi email.', 'info');
        return;
      }
      setAuthState({ user, isAuthenticated: true, isLoading: false });
      showNotification(`Selamat datang, ${user.name}!`, 'success');
    } else {
      showNotification('Username tidak ditemukan.', 'error');
    }
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
      branch: userData.branch || (branches[0] ? branches[0].name : ''),
      subBranch: userData.subBranch || ''
    };
    Database.saveUser(newUser);
    setUsers(Database.getUsers());
  };

  if (authState.isLoading || !isDataLoaded) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
               <img src={LOGO_URL} className="w-8 h-8 animate-pulse" alt="KBPC" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-indigo-600 dark:text-indigo-400 font-black tracking-[0.3em] text-[10px] uppercase">Menghubungkan ke Edge Config</p>
            <p className="text-slate-400 text-[8px] font-bold uppercase mt-2 tracking-widest">Sinkronisasi Data Global Vercel...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={isDarkMode ? 'dark' : ''}>
       {!authState.isAuthenticated ? (
         <>
          {view === 'login' && <LoginView onLogin={handleLogin} onForgotPassword={() => setView('forgot')} onRegister={() => setView('register')} />}
          {view === 'forgot' && <ForgotPasswordView onBack={() => setView('login')} />}
          {view === 'register' && <RegisterView onBack={() => setView('login')} onRegister={onAddUser} beltLevels={beltLevels} branches={branches} />}
         </>
       ) : (
         <Layout 
            user={authState.user!} 
            onLogout={() => { setAuthState({user: null, isAuthenticated: false, isLoading: false}); setView('login'); }} 
            activeView={activeTab} 
            setActiveView={setActiveTab}
            isDarkMode={isDarkMode}
            toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          >
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
                onUpdateUser={(u) => { Database.saveUser(u); setUsers(Database.getUsers()); }} 
                onDeleteUser={(id) => { Database.deleteUser(id); setUsers(Database.getUsers()); }} 
                showNotification={showNotification}
              />
            )}
            {activeTab === 'branches' && (
              <Branches 
                branches={branches}
                users={users}
                onAddBranch={(b) => { Database.saveBranch(b as Branch); setBranches(Database.getBranches()); Database.persistLocalConfig('branches', [...branches, b]); }}
                onUpdateBranch={(b) => { Database.saveBranch(b); setBranches(Database.getBranches()); Database.persistLocalConfig('branches', branches.map(x => x.id === b.id ? b : x)); }}
                onDeleteBranch={(id) => { Database.deleteBranch(id); setBranches(Database.getBranches()); Database.persistLocalConfig('branches', branches.filter(x => x.id !== id)); }}
              />
            )}
          </Layout>
       )}

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
};

export default App;
