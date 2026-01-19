
import React from 'react';
import { User, Role } from '../types';
import { INITIAL_BELT_LEVELS } from '../constants';

interface DashboardProps {
  users: User[];
}

const Dashboard: React.FC<DashboardProps> = ({ users }) => {
  const stats = [
    { label: 'Total Anggota', value: users.length, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', icon: '👥' },
    { label: 'Administrator', value: users.filter(u => u.role === Role.ADMIN).length, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', icon: '👑' },
    { label: 'Pengurus Cabang', value: users.filter(u => u.role === Role.PENGURUS).length, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: '💼' },
    { label: 'Anggota Aktif', value: users.filter(u => u.status === 'Active').length, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', icon: '✅' },
  ];

  const beltDistribution = INITIAL_BELT_LEVELS.map(belt => ({
    name: belt.name,
    count: users.filter(u => u.beltLevel === belt.name).length,
    percentage: users.length > 0 ? (users.filter(u => u.beltLevel === belt.name).length / users.length) * 100 : 0,
    color: belt.color
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Selamat datang di panel kendali utama KBPC.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all flex items-center gap-2">
            <span>🖨️</span> Cetak Laporan
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${stat.bg}`}>
                {stat.icon}
              </div>
              <span className="text-[10px] font-black text-slate-300 group-hover:text-indigo-400 transition-colors">LIVE</span>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800 dark:text-white mb-1">{stat.value}</p>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Belt Level Progress */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-6 flex items-center gap-2">
              <span className="text-xl">🥋</span> Distribusi Tingkatan Sabuk
            </h3>
            <div className="space-y-6">
              {beltDistribution.map((belt, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{belt.name}</span>
                    <span className="text-xs font-black text-slate-800 dark:text-white">{belt.count} Jiwa ({belt.percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${belt.percentage}%`, 
                        backgroundColor: belt.color === '#cbd5e1' ? '#94a3b8' : belt.color 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity / Members */}
        <div className="space-y-8">
           <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <h2 className="font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-6 flex items-center gap-2">
              <span className="text-xl">🆕</span> Anggota Terbaru
            </h2>
            <div className="space-y-3">
              {users.slice(-6).reverse().map(user => (
                <div key={user.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-600">
                  <div className="relative">
                    <img src={user.avatar} className="w-10 h-10 rounded-xl object-cover shadow-sm" alt={user.name} />
                    {user.status === 'Active' && <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black uppercase truncate">{user.position}</p>
                  </div>
                  <span className="text-[9px] text-slate-400 font-medium whitespace-nowrap">{user.joinDate}</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 bg-slate-50 dark:bg-slate-700 text-xs font-black text-slate-500 dark:text-slate-400 rounded-xl hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors uppercase tracking-widest">
              Lihat Semua Anggota
            </button>
          </div>

          <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-500/30 relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            <h3 className="text-xl font-black uppercase tracking-tighter mb-2">KBPC Cloud</h3>
            <p className="text-indigo-100 text-xs font-medium leading-relaxed mb-6">Database aman dengan cadangan otomatis harian. Seluruh data Anda dienkripsi untuk privasi anggota.</p>
            <button className="px-5 py-2.5 bg-white text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-colors">
              Unduh Backup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
