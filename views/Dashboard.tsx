
import React, { useState, useEffect } from 'react';
import { User, Role } from '../types';
import { getMemberAnalytics } from '../geminiService';

interface DashboardProps {
  users: User[];
}

const Dashboard: React.FC<DashboardProps> = ({ users }) => {
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const stats = [
    { label: 'Total Anggota', value: users.length, color: 'bg-blue-500', icon: '👥' },
    { label: 'Admin', value: users.filter(u => u.role === Role.ADMIN).length, color: 'bg-purple-500', icon: '👑' },
    { label: 'Pengurus', value: users.filter(u => u.role === Role.PENGURUS).length, color: 'bg-emerald-500', icon: '💼' },
    { label: 'Aktif', value: users.filter(u => u.status === 'Active').length, color: 'bg-amber-500', icon: '✅' },
  ];

  const fetchAiInsight = async () => {
    setIsLoadingAi(true);
    const result = await getMemberAnalytics(users);
    setAiInsight(result);
    setIsLoadingAi(false);
  };

  useEffect(() => {
    fetchAiInsight();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Ringkasan Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">Selamat datang kembali di pusat manajemen data.</p>
        </div>
        <div className="text-sm text-slate-400 dark:text-slate-500">
          Terakhir diperbarui: {new Date().toLocaleDateString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4 transition-all hover:scale-[1.02]">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-2xl ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-indigo-50/30 dark:bg-indigo-900/10">
            <div className="flex items-center gap-2">
              <span className="text-xl">✨</span>
              <h2 className="font-bold text-slate-800 dark:text-white">AI Member Insights</h2>
            </div>
            <button
              onClick={fetchAiInsight}
              disabled={isLoadingAi}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 disabled:opacity-50"
            >
              {isLoadingAi ? 'Menganalisis...' : 'Refresh Analisis'}
            </button>
          </div>
          <div className="p-6 text-slate-600 dark:text-slate-300 leading-relaxed min-h-[200px]">
            {isLoadingAi ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="w-8 h-8 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-sm text-slate-400 dark:text-slate-500">Gemini sedang merangkum data anggota Anda...</p>
              </div>
            ) : (
              <div className="prose dark:prose-invert prose-slate max-w-none whitespace-pre-wrap">
                {aiInsight}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <h2 className="font-bold text-slate-800 dark:text-white mb-4">Anggota Terbaru</h2>
          <div className="space-y-4">
            {users.slice(-5).reverse().map(user => (
              <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <img src={user.avatar} className="w-10 h-10 rounded-full border border-slate-100 dark:border-slate-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.position}</p>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase shrink-0 ${
                  user.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {user.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
