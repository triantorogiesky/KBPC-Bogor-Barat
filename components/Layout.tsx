
import React, { useState } from 'react';
import { Role, User } from '../types';
import { LOGO_URL } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, activeView, setActiveView, isDarkMode, toggleDarkMode }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', roles: [Role.ADMIN, Role.PENGURUS, Role.ANGGOTA] },
    { id: 'members', label: 'Anggota', icon: '👥', roles: [Role.ADMIN, Role.PENGURUS] },
    { id: 'branches', label: 'Struktur Cabang', icon: '🏢', roles: [Role.ADMIN] },
    { id: 'positions', label: 'Jabatan', icon: '🏷️', roles: [Role.ADMIN] },
    { id: 'belt-levels', label: 'Tingkat Sabuk', icon: '🥋', roles: [Role.ADMIN] },
    { id: 'roles', label: 'Hak Akses', icon: '🔐', roles: [Role.ADMIN] },
    { id: 'profile', label: 'Profil Saya', icon: '👤', roles: [Role.ADMIN, Role.PENGURUS, Role.ANGGOTA] },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col fixed h-full z-20 shadow-xl`}>
        <div className="p-4 flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-xl overflow-hidden shadow-sm flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-700">
            <img src={LOGO_URL} alt="Logo KBPC" className="w-10 h-10 object-contain" />
          </div>
          {isSidebarOpen && <span className="font-black text-lg text-slate-800 dark:text-white tracking-tighter">DB KBPC</span>}
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-2">
          {navItems.filter(item => item.roles.includes(user.role)).map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                activeView === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {isSidebarOpen && <span className="font-bold text-sm tracking-tight">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
          >
            <span className="text-xl">🚪</span>
            {isSidebarOpen && <span className="font-bold text-sm">Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg dark:text-white transition-colors">
              <span className="text-xl">☰</span>
            </button>
            <h2 className="font-black text-slate-800 dark:text-white hidden sm:block uppercase tracking-widest text-xs">
              {navItems.find(n => n.id === activeView)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-6">
            {/* Theme Switch Component */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest hidden lg:block">Tema</span>
              <button
                onClick={toggleDarkMode}
                className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isDarkMode ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
                role="switch"
                aria-checked={isDarkMode}
                aria-label="Toggle Dark Mode"
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none flex items-center justify-center h-6 w-6 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                    isDarkMode ? 'translate-x-7' : 'translate-x-0'
                  }`}
                >
                  <span className="text-[12px]">{isDarkMode ? '🌙' : '🌞'}</span>
                </span>
              </button>
            </div>

            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 dark:text-white">{user.name}</p>
                <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter">{user.role}</p>
              </div>
              <img 
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} 
                className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-600 shadow-sm object-cover" 
                alt="Avatar" 
              />
            </div>
          </div>
        </header>

        <div className="p-8 bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-64px)] transition-colors duration-300">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
