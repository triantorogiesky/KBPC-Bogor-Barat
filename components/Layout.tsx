
import React, { useState, useEffect } from 'react';
import { Role, User } from '../types';
import { LOGO_URL } from '../constants';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  roles: Role[];
  children?: { id: string; label: string; icon: string }[];
}

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
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', roles: [Role.ADMIN, Role.PENGURUS, Role.ANGGOTA] },
    { id: 'members', label: 'Anggota', icon: '👥', roles: [Role.ADMIN, Role.PENGURUS] },
    { id: 'branches', label: 'Struktur Cabang', icon: '🏢', roles: [Role.ADMIN] },
    { 
      id: 'access-mgmt', 
      label: 'Manajemen Akses', 
      icon: '🛡️', 
      roles: [Role.ADMIN],
      children: [
        { id: 'positions', label: 'Jabatan', icon: '🏷️' },
        { id: 'belt-levels', label: 'Tingkat Sabuk', icon: '🥋' },
        { id: 'roles', label: 'Hak Akses', icon: '🔐' },
      ]
    },
    { id: 'profile', label: 'Profil Saya', icon: '👤', roles: [Role.ADMIN, Role.PENGURUS, Role.ANGGOTA] },
  ];

  useEffect(() => {
    const parent = navItems.find(item => item.children?.some(child => child.id === activeView));
    if (parent && !expandedMenus.includes(parent.id)) {
      setExpandedMenus(prev => [...prev, parent.id]);
    }
  }, [activeView]);

  const toggleMenu = (id: string) => {
    setExpandedMenus(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const isChildActive = (item: NavItem) => {
    return item.children?.some(child => child.id === activeView);
  };

  const getActiveLabels = () => {
    let parent = navItems.find(n => n.id === activeView);
    if (parent) return [parent.label];
    
    for (const item of navItems) {
      const child = item.children?.find(c => c.id === activeView);
      if (child) return [item.label, child.label];
    }
    return ['Menu'];
  };

  const activeLabels = getActiveLabels();

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col fixed h-full z-20 shadow-xl`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl overflow-hidden shadow-lg shadow-indigo-500/30 flex items-center justify-center shrink-0 border border-indigo-400">
            <img src={LOGO_URL} alt="Logo KBPC" className="w-10 h-10 object-contain brightness-0 invert" />
          </div>
          {isSidebarOpen && (
            <div className="min-w-0">
              <span className="font-black text-xl text-slate-800 dark:text-white tracking-tighter block leading-none">DB KBPC</span>
              <span className="text-[8px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] mt-1.5 block leading-none">Padjadjaran Cimande</span>
            </div>
          )}
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.filter(item => item.roles.includes(user.role)).map(item => {
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedMenus.includes(item.id);
            const isActive = activeView === item.id || isChildActive(item);

            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => {
                    if (hasChildren) {
                      toggleMenu(item.id);
                    } else {
                      setActiveView(item.id);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all ${
                    isActive && !hasChildren
                      ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' 
                      : isActive && hasChildren
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <span className="text-xl shrink-0">{item.icon}</span>
                  {isSidebarOpen && (
                    <>
                      <span className="font-black text-[11px] uppercase tracking-widest flex-1 text-left">{item.label}</span>
                      {hasChildren && (
                        <span className={`text-[8px] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                          ▼
                        </span>
                      )}
                    </>
                  )}
                </button>

                {isSidebarOpen && hasChildren && isExpanded && (
                  <div className="ml-6 pl-4 border-l-2 border-slate-100 dark:border-slate-700 space-y-1 animate-in slide-in-from-top-2 duration-300">
                    {item.children!.map(child => (
                      <button
                        key={child.id}
                        onClick={() => setActiveView(child.id)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          activeView === child.id
                            ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/30'
                        }`}
                      >
                        <span className="truncate">{child.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-4 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-colors group"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">🚪</span>
            {isSidebarOpen && <span className="font-black text-[11px] uppercase tracking-widest">Logout System</span>}
          </button>
        </div>
      </aside>

      <main className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <header className="h-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm print:hidden">
          <div className="flex items-center gap-6">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl dark:text-white transition-all shadow-sm active:scale-90">
              <span className="text-xl">☰</span>
            </button>
            <nav className="hidden sm:flex items-center gap-2">
               <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">KBPC</span>
               {activeLabels.map((label, i) => (
                 <React.Fragment key={i}>
                   <span className="text-[10px] text-slate-300 dark:text-slate-600">/</span>
                   <span className={`text-[10px] font-black uppercase tracking-widest ${i === activeLabels.length - 1 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}>
                     {label}
                   </span>
                 </React.Fragment>
               ))}
            </nav>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-full">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">System Online</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleDarkMode}
                className={`p-2.5 rounded-xl transition-all shadow-sm ${
                  isDarkMode ? 'bg-indigo-600 text-white shadow-indigo-500/20' : 'bg-slate-100 text-slate-500'
                }`}
              >
                <span className="text-sm">{isDarkMode ? '🌙' : '🌞'}</span>
              </button>
            </div>
            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none mb-1">{user.name}</p>
                <p className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] leading-none">{user.role}</p>
              </div>
              <div className="relative">
                <img 
                  src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} 
                  className="w-10 h-10 rounded-xl border-2 border-white dark:border-slate-700 shadow-md object-cover transition-transform group-hover:scale-105" 
                  alt="User profile" 
                />
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-80px)] transition-colors duration-300 print:p-0 print:bg-white">
          <div className="max-w-7xl mx-auto print:max-w-none">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
