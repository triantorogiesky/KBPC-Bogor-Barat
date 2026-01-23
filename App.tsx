
import React, { useState, useEffect, useCallback } from 'react';
import { User, Role, BeltLevel, Branch, AuthState, AppNotification } from './types';
import { Database } from './db';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import Members from './views/Members';
import Branches from './views/Branches';
import Positions from './views/Positions';
import BeltLevels from './views/BeltLevels';
import Profile from './views/Profile';
import Certificates from './views/Certificates';
import MapView from './views/MapView';

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [positions, setPositions] = useState<string[]>([]);
  const [beltLevels, setBeltLevels] = useState<BeltLevel[]>([]);
  const [auth, setAuth] = useState<AuthState>({ user: null, isAuthenticated: false, isLoading: true });
  const [activeView, setActiveView] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const refreshData = useCallback(async () => {
    const data = await Database.initialize();
    setUsers(data.users);
    setBranches(data.branches);
    setPositions(data.positions);
    setBeltLevels(data.beltLevels);
    
    const savedUser = localStorage.getItem('kbpc_session');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        const current = data.users.find((u: User) => u.id === parsed.id);
        if (current) {
          setAuth({ user: current, isAuthenticated: true, isLoading: false });
        } else {
          setAuth({ user: null, isAuthenticated: false, isLoading: false });
        }
      } catch (e) {
        setAuth({ user: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      setAuth({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const handleLogin = (username: string, password: string) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setAuth({ user, isAuthenticated: true, isLoading: false });
      localStorage.setItem('kbpc_session', JSON.stringify(user));
      showNotification('Login Berhasil', 'success');
    } else {
      showNotification('Username atau password salah', 'error');
    }
  };

  const handleLogout = () => {
    setAuth({ user: null, isAuthenticated: false, isLoading: false });
    localStorage.removeItem('kbpc_session');
    showNotification('Berhasil Logout', 'info');
  };

  const onAddUser = (userData: Partial<User>) => {
    if (auth.user?.role !== Role.ADMIN && auth.user?.role !== Role.PENGURUS) {
      showNotification('Anda tidak memiliki akses untuk menambah anggota.', 'error');
      return;
    }

    const newUser: User = {
      id: (userData.id && userData.id.length === 16) ? userData.id : Database.generateNIA(),
      username: userData.username || 'user',
      password: userData.password || 'password',
      name: userData.name || 'Anggota Baru',
      email: userData.email || '',
      role: (auth.user?.role === Role.ADMIN) ? (userData.role || Role.ANGGOTA) : Role.ANGGOTA,
      position: userData.position || (positions[0] || ''),
      joinDate: new Date().toISOString().split('T')[0],
      status: userData.status || 'Active',
      avatar: userData.avatar || `https://ui-avatars.com/api/?name=${userData.name}&background=random`,
      isCoach: userData.isCoach || false,
      beltLevel: userData.beltLevel || (beltLevels[0]?.name || ''),
      predicate: userData.predicate || 'Baru',
      gender: userData.gender || 'Laki-laki',
      branch: userData.branch || (branches[0]?.name || ''),
      subBranch: userData.subBranch || '',
      kecamatan: userData.kecamatan || '',
      formalPhoto: userData.formalPhoto || '',
      informalPhoto: userData.informalPhoto || ''
    };
    const success = Database.saveUser(newUser);
    if (success) {
      refreshData();
      showNotification('Data Anggota Berhasil Disimpan.', 'success');
    } else {
      showNotification('Penyimpanan Gagal! Memori browser penuh.', 'error');
    }
  };

  const onUpdateUser = (updatedUser: User, oldId?: string) => {
    const isEditingSelf = auth.user?.id === (oldId || updatedUser.id);
    const isAdmin = auth.user?.role === Role.ADMIN;
    const isPengurus = auth.user?.role === Role.PENGURUS;

    if (!isAdmin && !isPengurus && !isEditingSelf) {
      showNotification('Akses ditolak.', 'error');
      return;
    }

    const success = Database.saveUser(updatedUser, oldId);
    if (success) {
      refreshData();
      if (isEditingSelf) {
        setAuth(prev => ({ ...prev, user: updatedUser }));
      }
      showNotification('Data Berhasil Diperbarui', 'success');
    } else {
      showNotification('Gagal memperbarui data.', 'error');
    }
  };

  const onDeleteUser = (id: string) => {
    if (auth.user?.role !== Role.ADMIN) {
      showNotification('Hanya Administrator yang dapat menghapus data.', 'error');
      return;
    }

    Database.deleteUser(id);
    refreshData();
    showNotification('Anggota Berhasil Dihapus', 'success');
  };

  const onBulkAddUsers = (usersToImport: Partial<User>[]) => {
    if (auth.user?.role !== Role.ADMIN) {
      showNotification('Hanya Administrator yang dapat melakukan impor data.', 'error');
      return;
    }

    usersToImport.forEach(u => {
      Database.saveUser({
        ...u,
        id: u.id || Database.generateNIA(),
        password: 'password',
        joinDate: u.joinDate || new Date().toISOString().split('T')[0],
        status: u.status || 'Active',
        avatar: u.avatar || `https://ui-avatars.com/api/?name=${u.name}&background=random`,
        predicate: u.predicate || 'Imported'
      } as User);
    });
    refreshData();
    showNotification(`Berhasil impor ${usersToImport.length} data.`, 'success');
  };

  const onBulkAddBranches = (branchesToImport: Branch[]) => {
    if (auth.user?.role !== Role.ADMIN) return;
    branchesToImport.forEach(b => {
      Database.saveBranch(b);
    });
    refreshData();
    showNotification(`Berhasil impor ${branchesToImport.length} cabang.`, 'success');
  };

  const handleAddPosition = (pos: string) => {
    if (auth.user?.role !== Role.ADMIN) return;
    const newPositions = [...positions, pos];
    Database.savePositions(newPositions);
    refreshData();
  };

  const handleUpdatePosition = (oldPos: string, newPos: string) => {
    if (auth.user?.role !== Role.ADMIN) return;
    const newPositions = positions.map(p => p === oldPos ? newPos : p);
    Database.savePositions(newPositions);
    users.forEach(u => {
      if (u.position === oldPos) {
        Database.saveUser({ ...u, position: newPos });
      }
    });
    refreshData();
  };

  const handleDeletePosition = (pos: string) => {
    if (auth.user?.role !== Role.ADMIN) return;
    const newPositions = positions.filter(p => p !== pos);
    Database.savePositions(newPositions);
    refreshData();
  };

  const handleAddBelt = (belt: BeltLevel) => {
    if (auth.user?.role !== Role.ADMIN) return;
    const newBelts = [...beltLevels, belt];
    Database.saveBeltLevels(newBelts);
    refreshData();
  };

  const handleUpdateBelt = (oldName: string, updatedBelt: BeltLevel) => {
    if (auth.user?.role !== Role.ADMIN) return;
    const newBelts = beltLevels.map(b => b.name === oldName ? updatedBelt : b);
    Database.saveBeltLevels(newBelts);
    users.forEach(u => {
      if (u.beltLevel === oldName) {
        Database.saveUser({ ...u, beltLevel: updatedBelt.name, predicate: updatedBelt.predicate });
      }
    });
    refreshData();
  };

  const handleDeleteBelt = (name: string) => {
    if (auth.user?.role !== Role.ADMIN) return;
    const newBelts = beltLevels.filter(b => b.name !== name);
    Database.saveBeltLevels(newBelts);
    refreshData();
  };

  const handleAddBranch = (branch: Partial<Branch>) => {
    if (auth.user?.role !== Role.ADMIN) return;
    Database.saveBranch(branch as Branch);
    refreshData();
  };

  const handleUpdateBranch = (branch: Branch) => {
    if (auth.user?.role !== Role.ADMIN) return;
    Database.saveBranch(branch);
    refreshData();
  };

  const handleDeleteBranch = (id: string) => {
    if (auth.user?.role !== Role.ADMIN) return;
    Database.deleteBranch(id);
    refreshData();
  };

  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest text-xs">Memuat Sistem...</p>
        </div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md animate-in zoom-in-95 duration-500">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Login Database KBPC</h1>
            <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest font-black">Padjadjaran Cimande</p>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            const target = e.target as any;
            handleLogin(target.username.value, target.password.value);
          }} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Username</label>
              <input name="username" type="text" className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-700 border dark:border-slate-600 dark:text-white rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
              <input name="password" type="password" className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-700 border dark:border-slate-600 dark:text-white rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-indigo-500" />
            </div>
            <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/30 uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all mt-4">
              Masuk Sistem
            </button>
          </form>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard users={users} />;
      case 'members': return (
        <Members 
          users={users} 
          positions={positions} 
          beltLevels={beltLevels} 
          branches={branches} 
          currentUserRole={auth.user?.role || Role.ANGGOTA}
          onAddUser={onAddUser}
          onBulkAddUsers={onBulkAddUsers}
          onUpdateUser={onUpdateUser}
          onDeleteUser={onDeleteUser}
          showNotification={showNotification}
        />
      );
      case 'branches': return (
        <Branches 
          branches={branches} 
          users={users} 
          onAddBranch={handleAddBranch}
          onUpdateBranch={handleUpdateBranch}
          onDeleteBranch={handleDeleteBranch}
          onBulkAddBranches={onBulkAddBranches}
          showNotification={showNotification}
        />
      );
      case 'map-view': return (
        <MapView 
          branches={branches} 
          users={users} 
        />
      );
      case 'positions': return (
        <Positions 
          positions={positions} 
          onAdd={handleAddPosition}
          onUpdate={handleUpdatePosition}
          onDelete={handleDeletePosition}
        />
      );
      case 'belt-levels': return (
        <BeltLevels 
          beltLevels={beltLevels} 
          onAdd={handleAddBelt}
          onUpdate={handleUpdateBelt}
          onDelete={handleDeleteBelt}
        />
      );
      case 'profile': return (
        <Profile 
          user={auth.user!} 
          onUpdate={onUpdateUser} 
          beltLevels={beltLevels} 
          currentUserRole={auth.user?.role || Role.ANGGOTA}
        />
      );
      case 'certificates': return (
        <Certificates 
          users={users} 
          beltLevels={beltLevels} 
        />
      );
      default: return <Dashboard users={users} />;
    }
  };

  return (
    <>
      <Layout 
        user={auth.user!} 
        onLogout={handleLogout} 
        activeView={activeView} 
        setActiveView={setActiveView}
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      >
        {renderView()}
      </Layout>

      <div className="fixed bottom-8 right-8 z-[100] space-y-4 pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className={`px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-4 animate-in slide-in-from-right-8 pointer-events-auto ${
            n.type === 'success' ? 'bg-emerald-500 border-emerald-400 text-white' :
            n.type === 'error' ? 'bg-red-500 border-red-400 text-white' :
            'bg-indigo-600 border-indigo-500 text-white'
          }`}>
            <span className="font-black text-[10px] uppercase tracking-widest">{n.message}</span>
            <button onClick={() => setNotifications(prev => prev.filter(item => item.id !== n.id))} className="text-white/60 hover:text-white">✕</button>
          </div>
        ))}
      </div>
    </>
  );
};

export default App;
