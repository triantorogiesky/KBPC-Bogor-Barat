
import React, { useState, useRef } from 'react';
import { User, BeltLevel } from '../types';

interface ProfileProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
  beltLevels: BeltLevel[];
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdate, beltLevels }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<User>({ ...user });
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const formalInputRef = useRef<HTMLInputElement>(null);
  const informalInputRef = useRef<HTMLInputElement>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleResetAvatar = () => {
    const newAvatar = `https://ui-avatars.com/api/?name=${formData.name}&background=random`;
    setFormData({ ...formData, avatar: newAvatar });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'avatar' | 'formalPhoto' | 'informalPhoto') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getBeltStyle = (beltName: string) => {
    const belt = beltLevels.find(b => b.name === beltName);
    if (!belt) return { borderColor: '#e2e8f0', color: '#64748b', backgroundColor: '#f8fafc', predicate: '-' };
    
    const color = belt.color.replace('#', '');
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return {
      borderColor: belt.color,
      backgroundColor: belt.color + '20', // 12% opacity
      color: luminance > 0.5 ? '#1e293b' : belt.color,
      predicate: belt.predicate
    };
  };

  const currentBeltStyle = getBeltStyle(user.beltLevel);

  return (
    <div className="max-w-5xl mx-auto animate-in slide-in-from-bottom duration-500 space-y-8 pb-12">
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="h-48 bg-indigo-600 dark:bg-indigo-800 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          {formData.isCoach && (
            <div className="absolute top-6 left-6 px-4 py-2 bg-amber-500 text-white text-xs font-black rounded-full shadow-lg border-2 border-amber-400 flex items-center gap-2 animate-bounce">
              <span>⭐</span> PELATIH TERVERIFIKASI
            </div>
          )}
        </div>
        <div className="px-10 pb-10">
          <div className="relative -mt-20 flex flex-col md:flex-row justify-between items-center md:items-end mb-10 gap-6">
            <div className="relative group">
              <div className="relative overflow-hidden rounded-[2.5rem] border-[10px] border-white dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-700">
                <img src={formData.avatar || `https://ui-avatars.com/api/?name=${formData.name}`} className="w-40 h-40 object-cover" alt="Profile" />
                {isEditing && (
                  <button onClick={() => avatarInputRef.current?.click()} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-3xl" type="button">📸</button>
                )}
              </div>
              <input type="file" ref={avatarInputRef} onChange={(e) => handleFileChange(e, 'avatar')} className="hidden" accept="image/*" />
            </div>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/30 hover:scale-105 active:scale-95">UBAH DATA PROFIL</button>
            ) : (
              <div className="flex gap-4">
                <button onClick={() => { setIsEditing(false); setFormData({ ...user }); }} className="px-8 py-3.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl font-black hover:bg-slate-200 dark:hover:bg-slate-600 transition-all">BATAL</button>
                <button onClick={handleSave} className="px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/30 active:scale-95">SIMPAN</button>
              </div>
            )}
          </div>

          {!isEditing ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-1 space-y-8">
                <div className="space-y-2">
                  <h2 className="text-3xl font-black dark:text-white tracking-tight">{user.name}</h2>
                  <div className="flex items-center gap-3">
                    <p className="text-indigo-600 dark:text-indigo-400 font-black text-lg">@{user.username}</p>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{user.gender}</span>
                  </div>
                  <div className="flex flex-col gap-2 mt-2">
                    <div className="flex flex-wrap gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full border font-bold" style={{ borderColor: currentBeltStyle.borderColor, color: currentBeltStyle.color, backgroundColor: currentBeltStyle.backgroundColor }}>
                        {user.beltLevel.toUpperCase()}
                      </span>
                      <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-sm">{user.position}</p>
                    </div>
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 rounded-2xl flex items-center gap-3">
                      <span className="text-xl">🏢</span>
                      <div>
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">Cabang & Ranting</p>
                        <p className="text-sm font-bold text-indigo-800 dark:text-indigo-300">{user.branch || 'Pusat'} • {user.subBranch || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-5 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Email Terdaftar</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 break-all">{user.email}</p>
                  </div>
                  <div className="p-5 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Anggota Sejak</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{user.joinDate}</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-[0.3em] flex items-center gap-3">
                  <span className="w-8 h-[2px] bg-indigo-600"></span> DOKUMENTASI PROFIL
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="aspect-[3/4] rounded-[2rem] overflow-hidden bg-slate-100 dark:bg-slate-700 border-4 border-white dark:border-slate-800 shadow-xl group relative">
                    {user.formalPhoto ? (
                      <img src={user.formalPhoto} className="w-full h-full object-cover" alt="Foto Formal" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 text-5xl">🧥</div>
                    )}
                    <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                      <p className="text-white text-[10px] font-black uppercase text-center tracking-widest">FOTO FORMAL</p>
                    </div>
                  </div>
                  <div className="aspect-[3/4] rounded-[2rem] overflow-hidden bg-slate-100 dark:bg-slate-700 border-4 border-white dark:border-slate-800 shadow-xl group relative">
                    {user.informalPhoto ? (
                      <img src={user.informalPhoto} className="w-full h-full object-cover" alt="Foto Non-Formal" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 text-5xl">👕</div>
                    )}
                    <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                      <p className="text-white text-[10px] font-black uppercase text-center tracking-widest">FOTO BEBAS</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-10 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-6">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Nama Lengkap</label>
                    <input required type="text" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 dark:text-white rounded-2xl outline-none font-bold" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Jenis Kelamin</label>
                    <select className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 dark:text-white rounded-2xl font-bold" value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Cabang Organisasi</label>
                    <input type="text" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 dark:text-white rounded-2xl outline-none font-bold" value={formData.branch} onChange={(e) => setFormData({ ...formData, branch: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Ranting / Dojo</label>
                    <input type="text" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 dark:text-white rounded-2xl outline-none font-bold" value={formData.subBranch} onChange={(e) => setFormData({ ...formData, subBranch: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Username</label>
                    <input required type="text" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 dark:text-white rounded-2xl outline-none font-bold" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Email</label>
                    <input required type="email" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 dark:text-white rounded-2xl outline-none font-bold" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-2xl shadow-indigo-500/40 hover:bg-indigo-700 transition-all active:scale-[0.98]">SIMPAN PERUBAHAN DATA PROFIL</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
