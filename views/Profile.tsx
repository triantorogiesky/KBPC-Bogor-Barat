
import React, { useState, useRef } from 'react';
import { User, BeltLevel, Role } from '../types';
import { KECAMATAN } from '../constants';
import { compressImage } from '../utils';

interface ProfileProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
  beltLevels: BeltLevel[];
  currentUserRole: Role;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdate, beltLevels, currentUserRole }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<User>({ ...user });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = currentUserRole === Role.ADMIN;
  const isPengurus = currentUserRole === Role.PENGURUS;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (formData.name.trim().length < 3) newErrors.name = 'Nama minimal 3 karakter.';
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: 'avatar' | 'informalPhoto') => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        try {
          const compressed = await compressImage(result);
          setFormData(prev => ({ ...prev, [field]: compressed }));
        } catch (err) {
          setFormData(prev => ({ ...prev, [field]: result }));
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getBeltStyle = (beltName: string) => {
    const belt = beltLevels.find(b => b.name === beltName);
    if (!belt) return { color: '#64748b', predicate: '-' };
    return { color: belt.color, predicate: belt.predicate };
  };

  const currentBeltStyle = getBeltStyle(user.beltLevel);

  return (
    <div className="max-w-6xl mx-auto animate-in slide-in-from-bottom-8 duration-700 space-y-8 pb-20">
      <div className="bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
        <div className="h-56 bg-gradient-to-r from-indigo-600 to-indigo-800 relative">
          {formData.isCoach && (
            <div className="absolute top-8 left-8 px-5 py-2.5 bg-amber-500 text-white text-[10px] font-black rounded-full shadow-2xl uppercase tracking-widest animate-pulse">
              <span>⭐</span> Pelatih Terverifikasi
            </div>
          )}
        </div>

        <div className="px-12 pb-12">
          <div className="relative -mt-24 flex flex-col md:flex-row justify-between items-center md:items-end mb-12 gap-8">
            <div className="relative group">
              <div className={`relative overflow-hidden rounded-[3rem] border-[12px] border-white dark:border-slate-800 shadow-2xl bg-slate-100 dark:bg-slate-700 w-48 h-48 ${isProcessing ? 'animate-pulse' : ''}`}>
                <img 
                  src={formData.avatar || `https://ui-avatars.com/api/?name=${formData.name}&background=6366f1&color=fff`} 
                  className="w-full h-full object-cover" 
                  alt="Profile" 
                />
                {(isEditing || isProcessing) && (
                  <button 
                    onClick={() => !isProcessing && avatarInputRef.current?.click()} 
                    className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-white"
                    type="button"
                    disabled={isProcessing}
                  >
                    <span className="text-3xl mb-1">{isProcessing ? '⏳' : '📸'}</span>
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
                  className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-2xl uppercase tracking-widest text-xs"
                >
                  <span>✏️</span> Ubah Data Profil
                </button>
              ) : (
                <div className="flex flex-wrap justify-center gap-4">
                  <button onClick={() => { setIsEditing(false); setFormData({ ...user }); setErrors({}); }} className="px-8 py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl font-black uppercase tracking-widest text-xs">Batal</button>
                  <button onClick={handleSave} disabled={isProcessing} className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition-all uppercase tracking-widest text-xs">Simpan Perubahan</button>
                </div>
              )}
            </div>
          </div>

          {!isEditing ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="p-6 bg-slate-50 dark:bg-slate-900/40 rounded-[2rem] border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nama Lengkap</p>
                  <p className="text-lg font-black text-slate-800 dark:text-white uppercase">{user.name}</p>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-900/40 rounded-[2rem] border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">NIA</p>
                  <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono">{user.id}</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="p-6 bg-slate-50 dark:bg-slate-900/40 rounded-[2rem] border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Sabuk</p>
                  <p className="text-lg font-black uppercase" style={{ color: currentBeltStyle.color }}>{user.beltLevel}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">{currentBeltStyle.predicate}</p>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-900/40 rounded-[2rem] border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Wilayah</p>
                  <p className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase">{user.branch} • {user.subBranch || 'Pusat'}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900/40 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-700">
              <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em] mb-8">Data yang dapat diubah</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase">Nama Lengkap</label>
                  <input type="text" className="w-full px-6 py-4 bg-white dark:bg-slate-800 border dark:border-slate-700 dark:text-white rounded-2xl outline-none font-bold" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase">Email</label>
                  <input type="email" className="w-full px-6 py-4 bg-white dark:bg-slate-800 border dark:border-slate-700 dark:text-white rounded-2xl outline-none font-bold" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase">Kecamatan</label>
                  <select className="w-full px-6 py-4 bg-white dark:bg-slate-800 border dark:border-slate-700 dark:text-white rounded-2xl outline-none font-bold" value={formData.kecamatan} onChange={(e) => handleInputChange('kecamatan', e.target.value)}>
                    <option value="">-- Pilih --</option>
                    {KECAMATAN.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
                {isAdmin && (
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase">Hak Akses (Khusus Admin)</label>
                    <select className="w-full px-6 py-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 dark:text-white rounded-2xl outline-none font-bold" value={formData.role} onChange={(e) => handleInputChange('role', e.target.value)}>
                      <option value={Role.ANGGOTA}>ANGGOTA</option>
                      <option value={Role.PENGURUS}>PENGURUS</option>
                      <option value={Role.ADMIN}>ADMIN</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
