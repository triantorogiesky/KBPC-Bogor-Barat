
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

// --- VIEW COMPONENTS ---

const LoginView: React.FC<{ onLogin: (u: string, p: string) => void; onForgotPassword: () => void; onRegister: () => void }> = ({ onLogin, onForgotPassword, onRegister }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password');

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-white rounded-3xl mx-auto flex items-center justify-center shadow-lg mb-6 border border-slate-100 overflow-hidden">
             <img src={LOGO_URL} alt="Logo" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Login System</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Database Padjadjaran Cimande</p>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); onLogin(username, password); }} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username / NIA</label>
            <input 
              type="text" 
              className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 dark:text-white rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-bold transition-all" 
              placeholder="Masukkan username"
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kata Sandi</label>
              <button type="button" onClick={onForgotPassword} className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase hover:underline">Lupa?</button>
            </div>
            <input 
              type="password" 
              className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 dark:text-white rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-bold transition-all" 
              placeholder="••••••••"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
            />
          </div>

          <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/30 uppercase tracking-[0.2em] text-xs hover:bg-indigo-700 transition-all active:scale-[0.98]">
            Masuk Sekarang
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Belum terdaftar? <button onClick={onRegister} className="text-indigo-600 dark:text-indigo-400 font-black hover:underline">Buat Akun Baru</button>
          </p>
        </div>
      </div>
    </div>
  );
};

const ForgotPasswordView: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 text-center">
    <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700">
      <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6">🔑</div>
      <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-4">Reset Kata Sandi</h2>
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-8 leading-relaxed">Silakan hubungi Administrator Utama (Sekretariat Pusat) untuk melakukan reset kata sandi manual melalui Panel Kontrol.</p>
      <button onClick={onBack} className="w-full py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-black rounded-2xl uppercase tracking-widest text-xs transition-all hover:bg-slate-200">Kembali ke Login</button>
    </div>
  </div>
);

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
      <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700">
        <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter text-center mb-8">Registrasi Anggota</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
            <input required className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-700 border dark:border-slate-600 dark:text-white rounded-2xl outline-none focus:border-indigo-500 font-bold" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username / NIA</label>
            <input required className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-700 border dark:border-slate-600 dark:text-white rounded-2xl outline-none focus:border-indigo-500 font-bold" value={username} onChange={e => setUsername(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alamat Email</label>
            <input required type="email" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-700 border dark:border-slate-600 dark:text-white rounded-2xl outline-none focus:border-indigo-500 font-bold" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="pt-4">
             <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/30 uppercase tracking-[0.2em] text-xs hover:bg-indigo-700 transition-all">Daftar Sekarang</button>
             <button type="button" onClick={onBack} className="w-full py-4 text-slate-400 font-black uppercase tracking-widest text-[10px] mt-2">Sudah punya akun? Login</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

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

  const refreshData = () => {
    setUsers(Database.getUsers());
    setBranches(Database.getBranches());
  };

  useEffect(() => {
    const initApp = async () => {
      const config = await Database.initialize();
      setPositions(config.positions);
      setBeltLevels(config.beltLevels);
      setBranches(config.branches);
      setUsers(config.users);
      setIsDataLoaded(true);
      setAuthState(prev => ({ ...prev, isLoading: false }));
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
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000);
  };

  const handleLogin = (username: string, password: string) => {
    const allUsers = Database.getUsers();
    const user = allUsers.find(u => u.username.toLowerCase() === username.toLowerCase() || u.id.toLowerCase() === username.toLowerCase());
    
    if (user) {
      if (user.password && user.password !== password) {
        showNotification('Kata sandi salah.', 'error');
        return;
      }
      if (user.status === 'Pending') {
        showNotification('Akun Anda masih menunggu verifikasi.', 'info');
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
      password: 'password',
      name: userData.name || 'Anggota Baru',
      email: userData.email || '',
      role: userData.role || Role.ANGGOTA,
      position: userData.position || (positions[0] || ''),
      joinDate: new Date().toISOString().split('T')[0],
      status: userData.status || 'Active',
      avatar: `https://ui-avatars.com/api/?name=${userData.name}&background=random`,
      isCoach: userData.isCoach || false,
      beltLevel: userData.beltLevel || (beltLevels[0]?.name || ''),
      predicate: userData.predicate || 'Baru',
      gender: userData.gender || 'Laki-laki',
      branch: userData.branch || (branches[0]?.name || ''),
      subBranch: userData.subBranch || ''
    };
    const success = Database.saveUser(newUser);
    if (success) {
      refreshData();
      showNotification('Data Anggota Berhasil Disimpan.', 'success');
    } else {
      showNotification('Penyimpanan Gagal! Memori browser penuh. Hapus foto lama atau gunakan file lebih kecil.', 'error');
    }
  };

  const handleUpdateUser = (user: User) => {
    const success = Database.saveUser(user);
    if (success) {
      refreshData();
      if (authState.user?.id === user.id) {
          setAuthState(prev => ({ ...prev, user }));
      }
      showNotification('Perubahan Berhasil Disimpan.', 'success');
    } else {
      showNotification('Gagal Menyimpan! Data terlalu besar (mungkin karena resolusi foto terlalu tinggi).', 'error');
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (Database.importDatabase(result)) {
        window.location.reload();
      } else {
        showNotification('Gagal mengimpor database.', 'error');
      }
    };
    reader.readAsText(file);
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
            <p className="text-indigo-600 dark:text-indigo-400 font-black tracking-[0.3em] text-[10px] uppercase">MEMUAT DATABASE</p>
            <p className="text-slate-400 text-[8px] font-bold uppercase mt-2 tracking-widest">Inisialisasi Persistence Layer...</p>
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
            {activeTab === 'dashboard' && (
                <div className="space-y-6">
                    <Dashboard users={users} />
                    {authState.user?.role === Role.ADMIN && (
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm mt-8">
                            <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-4">Database Management</h3>
                            <div className="flex flex-wrap gap-4">
                                <button onClick={Database.exportDatabase} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700">Ekspor JSON (Backup)</button>
                                <label className="px-6 py-3 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 cursor-pointer">
                                    Impor JSON (Restore)
                                    <input type="file" className="hidden" accept=".json" onChange={handleImport} />
                                </label>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-4 uppercase font-bold tracking-widest">⚠️ PENTING: Gunakan fitur ini untuk memindahkan data antar perangkat atau browser.</p>
                        </div>
                    )}
                </div>
            )}
            {activeTab === 'members' && (
              <Members 
                users={users} 
                positions={positions}
                beltLevels={beltLevels}
                branches={branches}
                currentUserRole={authState.user!.role}
                onAddUser={onAddUser} 
                onBulkAddUsers={(list) => { list.forEach(u => onAddUser(u)); refreshData(); showNotification('Impor data berhasil.'); }}
                onUpdateUser={handleUpdateUser} 
                onDeleteUser={(id) => { Database.deleteUser(id); refreshData(); showNotification('Anggota berhasil dihapus.'); }} 
                showNotification={showNotification}
              />
            )}
            {activeTab === 'branches' && (
              <Branches 
                branches={branches}
                users={users}
                onAddBranch={(b) => { Database.saveBranch(b as Branch); refreshData(); showNotification('Cabang ditambahkan.'); }}
                onUpdateBranch={(b) => { Database.saveBranch(b); refreshData(); showNotification('Cabang diperbarui.'); }}
                onDeleteBranch={(id) => { Database.deleteBranch(id); refreshData(); showNotification('Cabang dihapus.'); }}
              />
            )}
            {activeTab === 'positions' && (
              <Positions 
                positions={positions} 
                onAdd={(p) => { const updated = [...positions, p]; Database.savePositions(updated); setPositions(updated); showNotification('Jabatan ditambahkan.'); }}
                onUpdate={(old, next) => { const updated = positions.map(p => p === old ? next : p); Database.savePositions(updated); setPositions(updated); showNotification('Jabatan diperbarui.'); }}
                onDelete={(p) => { const updated = positions.filter(item => item !== p); Database.savePositions(updated); setPositions(updated); showNotification('Jabatan dihapus.'); }} 
              />
            )}
            {activeTab === 'belt-levels' && (
              <BeltLevels 
                beltLevels={beltLevels} 
                onAdd={(b) => { const updated = [...beltLevels, b]; Database.saveBeltLevels(updated); setBeltLevels(updated); showNotification('Tingkat sabuk ditambahkan.'); }}
                onUpdate={(old, next) => { const updated = beltLevels.map(b => b.name === old ? next : b); Database.saveBeltLevels(updated); setBeltLevels(updated); showNotification('Tingkat sabuk diperbarui.'); }}
                onDelete={(name) => { const updated = beltLevels.filter(b => b.name !== name); Database.saveBeltLevels(updated); setBeltLevels(updated); showNotification('Tingkat sabuk dihapus.'); }} 
              />
            )}
            {activeTab === 'profile' && authState.user && (
              <Profile user={authState.user} onUpdate={handleUpdateUser} beltLevels={beltLevels} />
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
