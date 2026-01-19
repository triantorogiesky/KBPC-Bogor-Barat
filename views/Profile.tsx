
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const formalInputRef = useRef<HTMLInputElement>(null);
  const informalInputRef = useRef<HTMLInputElement>(null);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (formData.name.trim().length < 3) newErrors.name = 'Nama minimal 3 karakter.';
    if (!formData.username.trim()) newErrors.username = 'Username wajib diisi.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) newErrors.email = 'Email tidak valid.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onUpdate(formData);
      setIsEditing(false);
      setErrors({});
    }
  };

  const handleInputChange = (field: keyof User, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
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
    return {
      borderColor: belt.color,
      backgroundColor: belt.color + '20',
      color: belt.color,
      predicate: belt.predicate
    };
  };

  const currentBeltStyle = getBeltStyle(user.beltLevel);

  return (
    <div className="max-w-6xl mx-auto animate-in slide-in-from-bottom-8 duration-700 space-y-8 pb-20">
      <div className="bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
        {/* Cover Header */}
        <div className="h-56 bg-gradient-to-r from-indigo-600 to-indigo-800 relative">
          <div className="absolute inset-0 bg-black/10"></div>
          {formData.isCoach && (
            <div className="absolute top-8 left-8 px-5 py-2.5 bg-amber-500 text-white text-[10px] font-black rounded-full shadow-2xl border-2 border-amber-400 flex items-center gap-2 uppercase tracking-widest animate-pulse">
              <span>⭐</span> Pelatih Terverifikasi
            </div>
          )}
        </div>

        <div className="px-12 pb-12">
          {/* Avatar & Action Section */}
          <div className="relative -mt-24 flex flex-col md:flex-row justify-between items-center md:items-end mb-12 gap-8">
            <div className="relative group">
              <div className="relative overflow-hidden rounded-[3rem] border-[12px] border-white dark:border-slate-800 shadow-2xl bg-slate-100 dark:bg-slate-700 w-48 h-48">
                <img 
                  src={formData.avatar || `https://ui-avatars.com/api/?name=${formData.name}&background=6366f1&color=fff`} 
                  className="w-full h-full object-cover" 
                  alt="Profile" 
                />
                {isEditing && (
                  <button 
                    onClick={() => avatarInputRef.current?.click()} 
                    className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-white"
                    type="button"
                  >
                    <span className="text-3xl mb-1">📸</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Ganti Avatar</span>
                  </button>
                )}
              </div>
              <input type="file" ref={avatarInputRef} onChange={(e) => handleFileChange(e, 'avatar')} className="hidden" accept="image/*" />
            </div>

            <div className="flex flex-col items-center md:items-end gap-4">
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-500/40 hover:scale-105 active:scale-95 flex items-center gap-3 uppercase tracking-widest text-xs"
                >
                  <span>✏️</span> Ubah Data Profil
                </button>
              ) : (
                <div className="flex flex-wrap justify-center gap-4">
                  <button 
                    onClick={() => { setIsEditing(false); setFormData({ ...user }); setErrors({}); }} 
                    className="px-8 py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl font-black hover:bg-slate-200 dark:hover:bg-slate-600 transition-all uppercase tracking-widest text-xs"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={handleSave} 
                    className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-500/40 active:scale-95 uppercase tracking-widest text-xs"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              )}
            </div>
          </div>

          {!isEditing ? (
            /* VIEW MODE */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-5 space-y-10">
                <div className="space-y-4">
                  <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter leading-none">{user.name}</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-indigo-600 dark:text-indigo-400 font-black text-xl tracking-tight">@{user.username}</span>
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-[10px] font-black text-slate-500 dark:text-slate-400 rounded-full uppercase tracking-widest">{user.gender}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="p-5 bg-slate-50 dark:bg-slate-900/40 rounded-[2rem] border border-slate-100 dark:border-slate-700 group hover:border-indigo-200 transition-all">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tingkat Sabuk</p>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: currentBeltStyle.borderColor }}></div>
                        <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{user.beltLevel}</p>
                      </div>
                   </div>
                   <div className="p-5 bg-slate-50 dark:bg-slate-900/40 rounded-[2rem] border border-slate-100 dark:border-slate-700">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Jabatan Struktur</p>
                      <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tight">{user.position}</p>
                   </div>
                </div>

                <div className="p-6 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 rounded-[2rem] flex items-center gap-4">
                  <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-2xl shadow-sm">🏢</div>
                  <div>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Afiliasi Wilayah</p>
                    <p className="text-md font-black text-indigo-800 dark:text-indigo-300 uppercase tracking-tighter">{user.branch} • {user.subBranch || 'Pusat'}</p>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-900/40 rounded-[2rem] border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Kontak Email</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{user.email}</p>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-[0.3em] flex items-center gap-3">
                    <span className="w-10 h-[2px] bg-indigo-600"></span> Dokumentasi Profil
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lengkapi Data Anda</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {/* Formal Photo Box */}
                  <div className="space-y-4">
                    <div className="aspect-[3/4] rounded-[2.5rem] overflow-hidden bg-slate-100 dark:bg-slate-700 border-4 border-white dark:border-slate-800 shadow-2xl group relative transition-transform hover:scale-[1.02]">
                      {user.formalPhoto ? (
                        <img src={user.formalPhoto} className="w-full h-full object-cover" alt="Foto Formal" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-3 grayscale opacity-40">
                          <span className="text-6xl">🥋</span>
                          <p className="text-[10px] font-black uppercase tracking-widest">Belum Ada Foto Formal</p>
                        </div>
                      )}
                      <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-white text-[11px] font-black uppercase text-center tracking-[0.2em]">Foto Formal</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-center font-bold text-slate-400 uppercase tracking-widest italic">Digunakan untuk Sertifikasi/Ijazah</p>
                  </div>

                  {/* Informal Photo Box */}
                  <div className="space-y-4">
                    <div className="aspect-[3/4] rounded-[2.5rem] overflow-hidden bg-slate-100 dark:bg-slate-700 border-4 border-white dark:border-slate-800 shadow-2xl group relative transition-transform hover:scale-[1.02]">
                      {user.informalPhoto ? (
                        <img src={user.informalPhoto} className="w-full h-full object-cover" alt="Foto Non-Formal" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-3 grayscale opacity-40">
                          <span className="text-6xl">👕</span>
                          <p className="text-[10px] font-black uppercase tracking-widest">Belum Ada Foto Bebas</p>
                        </div>
                      )}
                      <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-white text-[11px] font-black uppercase text-center tracking-[0.2em]">Foto Non-Formal</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-center font-bold text-slate-400 uppercase tracking-widest italic">Dokumentasi Kegiatan / Bebas</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* EDIT MODE */
            <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="bg-slate-50 dark:bg-slate-900/40 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-700">
                <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                  <span className="w-8 h-[2px] bg-indigo-600"></span> Pengaturan Data Dasar
                </h3>
                <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Nama Lengkap Sesuai Akta</label>
                      <input 
                        required 
                        type="text" 
                        className={`w-full px-6 py-4 bg-white dark:bg-slate-800 border ${errors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'} dark:text-white rounded-2xl outline-none font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all`} 
                        value={formData.name} 
                        onChange={(e) => handleInputChange('name', e.target.value)} 
                      />
                      {errors.name && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Alamat Email Aktif</label>
                      <input 
                        required 
                        type="email" 
                        className={`w-full px-6 py-4 bg-white dark:bg-slate-800 border ${errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'} dark:text-white rounded-2xl outline-none font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all`} 
                        value={formData.email} 
                        onChange={(e) => handleInputChange('email', e.target.value)} 
                      />
                      {errors.email && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.email}</p>}
                    </div>
                </form>
              </div>

              <div className="space-y-8">
                <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-[0.3em] flex items-center gap-3">
                  <span className="w-10 h-[2px] bg-indigo-600"></span> Upload Dokumentasi Terbaru
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Foto Formal (Seragam Lengkap)</p>
                    <div 
                      className="aspect-[3/4] rounded-[3rem] overflow-hidden bg-white dark:bg-slate-800 border-4 border-dashed border-slate-200 dark:border-slate-700 relative group cursor-pointer hover:border-indigo-400 transition-all"
                      onClick={() => formalInputRef.current?.click()}
                    >
                      {formData.formalPhoto ? (
                        <img src={formData.formalPhoto} className="w-full h-full object-cover" alt="Preview Formal" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-3">
                          <span className="text-5xl">🥋</span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-center px-8">Klik untuk Upload Foto Seragam Lengkap</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-indigo-600/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-all">
                        <span className="text-3xl mb-2">📤</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">Ganti Foto Formal</span>
                      </div>
                    </div>
                    <input type="file" ref={formalInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'formalPhoto')} />
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Foto Non-Formal (Bebas / Santai)</p>
                    <div 
                      className="aspect-[3/4] rounded-[3rem] overflow-hidden bg-white dark:bg-slate-800 border-4 border-dashed border-slate-200 dark:border-slate-700 relative group cursor-pointer hover:border-indigo-400 transition-all"
                      onClick={() => informalInputRef.current?.click()}
                    >
                      {formData.informalPhoto ? (
                        <img src={formData.informalPhoto} className="w-full h-full object-cover" alt="Preview Non-Formal" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-3">
                          <span className="text-5xl">📸</span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-center px-8">Klik untuk Upload Foto Bebas</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-indigo-600/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-all">
                        <span className="text-3xl mb-2">📤</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">Ganti Foto Bebas</span>
                      </div>
                    </div>
                    <input type="file" ref={informalInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'informalPhoto')} />
                  </div>
                </div>
              </div>

              <div className="pt-10 border-t border-slate-100 dark:border-slate-700 flex justify-center">
                <button 
                  onClick={handleSave} 
                  className="w-full max-w-2xl py-6 bg-indigo-600 text-white font-black rounded-[2rem] shadow-2xl shadow-indigo-500/40 hover:bg-indigo-700 transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-sm"
                >
                  Simpan Semua Perubahan Profil
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
