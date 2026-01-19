
import React, { useState } from 'react';
import { User, BeltLevel } from '../types';
import { LOGO_URL } from '../constants';

interface CertificatesProps {
  users: User[];
  beltLevels: BeltLevel[];
}

const Certificates: React.FC<CertificatesProps> = ({ users, beltLevels }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrint = () => {
    window.print();
  };

  const getBeltPredicate = (beltName: string) => {
    return beltLevels.find(b => b.name === beltName)?.predicate || '-';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Selection Section - Hidden on Print */}
      <div className="print:hidden space-y-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Generator Ijazah Otomatis</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Pilih anggota di bawah ini untuk menghasilkan ijazah resmi secara instan.</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input
              type="text"
              placeholder="Cari anggota berdasarkan nama atau ID..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 dark:text-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-bold transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[300px] overflow-y-auto custom-scrollbar">
          {filteredUsers.map(user => (
            <button
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={`p-4 rounded-2xl border transition-all flex items-center gap-4 text-left ${
                selectedUser?.id === user.id
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
              }`}
            >
              <img src={user.avatar} className="w-12 h-12 rounded-xl object-cover border-2 border-white/20" alt={user.name} />
              <div className="min-w-0">
                <p className="font-black text-xs uppercase truncate tracking-tighter">{user.name}</p>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedUser?.id === user.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {user.beltLevel}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Certificate Display Area */}
      {selectedUser ? (
        <div className="space-y-8">
          <div className="print:hidden flex justify-center">
             <button 
              onClick={handlePrint}
              className="px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/30 hover:bg-emerald-700 transition-all flex items-center gap-3 uppercase tracking-widest text-xs"
             >
               <span>🖨️</span> Cetak Ijazah (PDF)
             </button>
          </div>

          {/* THE IJAZAH TEMPLATE */}
          <div className="certificate-container flex justify-center">
            <div className="relative w-[800px] aspect-[1.414/1] bg-white text-slate-900 border-[16px] border-slate-900 p-2 overflow-hidden shadow-2xl">
              {/* Gold Inner Border */}
              <div className="h-full w-full border-[2px] border-amber-500 p-12 relative flex flex-col items-center justify-between">
                
                {/* Watermark Logo */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                  <img src={LOGO_URL} className="w-[400px]" alt="Watermark" />
                </div>

                {/* Header Section */}
                <div className="text-center space-y-2 z-10">
                  <img src={LOGO_URL} className="w-20 h-20 mx-auto mb-4" alt="KBPC Logo" />
                  <h1 className="text-3xl font-black uppercase tracking-[0.3em] text-slate-800">Sertifikat / Ijazah</h1>
                  <h2 className="text-xl font-bold uppercase tracking-[0.1em] text-amber-600">Keluarga Besar Padjadjaran Cimande</h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">SK. KEMENKUMHAM NO: AHU-00123.AH.01.07.THN 2024</p>
                </div>

                {/* Body Section */}
                <div className="text-center space-y-6 z-10">
                   <p className="italic font-serif text-slate-500">Dengan ini menyatakan bahwa anggota di bawah ini:</p>
                   
                   <div className="space-y-1">
                      <h3 className="text-4xl font-black uppercase tracking-tight text-slate-900 border-b-2 border-slate-200 px-12 inline-block pb-2">
                        {selectedUser.name}
                      </h3>
                      <p className="text-xs font-mono font-bold text-slate-400 mt-2">NOMOR REGISTRASI: {selectedUser.id.toUpperCase()}</p>
                   </div>

                   <p className="text-sm font-medium leading-relaxed max-w-lg mx-auto">
                     Telah berhasil menyelesaikan ujian kenaikan tingkat dan dinyatakan lulus dengan kualifikasi sebagai berikut:
                   </p>

                   <div className="grid grid-cols-2 gap-8 w-full max-w-md mx-auto py-4">
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tingkat Sabuk</span>
                         <span className="text-lg font-black uppercase tracking-tighter" style={{ color: beltLevels.find(b => b.name === selectedUser.beltLevel)?.color }}>
                            {selectedUser.beltLevel}
                         </span>
                      </div>
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Predikat</span>
                         <span className="text-lg font-black uppercase tracking-tighter text-slate-800">
                            {getBeltPredicate(selectedUser.beltLevel)}
                         </span>
                      </div>
                   </div>
                </div>

                {/* Footer Section: Photo & Signature */}
                <div className="w-full flex justify-between items-end mt-8 z-10 px-10">
                   {/* Member Photo (Formal) */}
                   <div className="flex flex-col items-center gap-2">
                      <div className="w-24 h-32 border-4 border-slate-100 bg-slate-50 overflow-hidden shadow-inner">
                        {selectedUser.formalPhoto ? (
                          <img src={selectedUser.formalPhoto} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-200">
                             <span className="text-3xl">👤</span>
                          </div>
                        )}
                      </div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-300">Pas Foto 3x4</p>
                   </div>

                   {/* Date & Signature Area */}
                   <div className="text-center space-y-12">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-600">Bogor, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest">Ketua Umum KBPC</p>
                      </div>
                      <div className="space-y-1">
                        <div className="w-40 h-[1px] bg-slate-800 mx-auto"></div>
                        <p className="text-[10px] font-black uppercase">Dewan Guru Besar</p>
                      </div>
                   </div>

                   {/* Seal / Stempel Area */}
                   <div className="relative w-24 h-24 flex items-center justify-center">
                      <div className="absolute inset-0 border-4 border-indigo-600 rounded-full opacity-10"></div>
                      <span className="text-[8px] font-black text-indigo-600 opacity-20 uppercase tracking-widest rotate-[-15deg]">STEMPEL RESMI KBPC</span>
                   </div>
                </div>

                {/* Corner Decoration */}
                <div className="absolute top-0 left-0 w-16 h-16 border-t-8 border-l-8 border-amber-500 opacity-20"></div>
                <div className="absolute top-0 right-0 w-16 h-16 border-t-8 border-r-8 border-amber-500 opacity-20"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-8 border-l-8 border-amber-500 opacity-20"></div>
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-8 border-r-8 border-amber-500 opacity-20"></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-20 text-center bg-white dark:bg-slate-800 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
          <div className="text-6xl mb-6 grayscale opacity-20">📜</div>
          <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Siap Untuk Mencetak</h3>
          <p className="text-slate-400 font-medium max-w-sm mx-auto mt-2">Cari dan pilih anggota di atas untuk mulai melihat preview ijazah mereka.</p>
        </div>
      )}

      {/* Styles for print optimization */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .certificate-container, .certificate-container * {
            visibility: visible;
          }
          .certificate-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: flex;
            justify-content: center;
          }
          @page {
            size: landscape;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Certificates;
