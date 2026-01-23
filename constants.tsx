
import { Role, User, BeltLevel, Branch } from './types';

export const LOGO_URL = 'https://i.ibb.co/vz6Gz2N/kbpc-logo.png';

export const INITIAL_BELT_LEVELS: BeltLevel[] = [
  { name: 'Dasar', color: '#cbd5e1', predicate: 'Budaya' },
  { name: 'Kuning', color: '#fbbf24', predicate: 'Wira Putra' },
  { name: 'Kuning Plat Hijau', color: '#eab308', predicate: 'Wira Muda Madya' },
  { name: 'Hijau', color: '#10b981', predicate: 'Wira Muda' },
  { name: 'Hijau Plat Biru', color: '#059669', predicate: 'Wira Utama Madya' },
  { name: 'Biru', color: '#3b82f6', predicate: 'Wira Utama' },
  { name: 'Biru Plat Cokelat', color: '#2563eb', predicate: 'Satria Muda Madya' },
  { name: 'Cokelat', color: '#92400e', predicate: 'Satria Muda' },
  { name: 'Hitam', color: '#0f172a', predicate: 'Satria Utama' },
  { name: 'Merah Kecil', color: '#ef4444', predicate: 'Pendekar Muda' },
  { name: 'Merah Besar', color: '#b91c1c', predicate: 'Guru Besar' }
];

export const KECAMATAN = [
  'Parung',
  'Ciseeng',
  'Gunung Sindur',
  'Rumpin'
];

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'br-001',
    code: '01',
    name: 'Bogor Barat',
    leader: 'Budi Santoso',
    subBranches: [
      { id: 'sb-001', code: '01', name: 'Bubulak', leader: 'Agus' },
      { id: 'sb-002', code: '02', name: 'Cifor', leader: 'Sari' },
      { id: 'sb-003', code: '03', name: 'Semplak', leader: 'Doni' }
    ]
  },
  {
    id: 'br-002',
    code: '02',
    name: 'Bogor Tengah',
    leader: 'Ahmad Fauzi',
    subBranches: [
      { id: 'sb-004', code: '01', name: 'Sempur', leader: 'Eka' },
      { id: 'sb-005', code: '02', name: 'Pabaton', leader: 'Wati' }
    ]
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: '2024010100000001',
    username: 'admin',
    password: 'marsuah1',
    name: 'Administrator Utama',
    email: 'admin@kbpcbogor.com',
    role: Role.ADMIN,
    position: 'Pembina',
    joinDate: '2024-01-01',
    status: 'Active',
    avatar: 'https://ui-avatars.com/api/?name=Admin&background=4f46e5&color=fff',
    isCoach: false,
    beltLevel: 'Hitam',
    predicate: 'Satria Utama',
    gender: 'Laki-laki',
    branch: 'Bogor Barat',
    subBranch: 'Bubulak',
    kecamatan: 'Parung',
    formalPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
    informalPhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '2024010100000002',
    username: 'budi_s',
    password: 'marsuah1',
    name: 'Budi Santoso',
    email: 'budi@kbpcbogor.com',
    role: Role.ADMIN,
    position: 'Ketua Cabang',
    joinDate: '2023-01-15',
    status: 'Active',
    avatar: 'https://picsum.photos/seed/budi/100/100',
    isCoach: true,
    beltLevel: 'Hitam',
    predicate: 'Satria Utama',
    gender: 'Laki-laki',
    branch: 'Bogor Barat',
    subBranch: 'Bubulak',
    kecamatan: 'Ciseeng'
  },
  {
    id: '2024010100000003',
    username: 'sari_w',
    password: 'password',
    name: 'Sari Wijaya',
    email: 'sari@kbpcbogor.com',
    role: Role.PENGURUS,
    position: 'Sekretaris',
    joinDate: '2023-02-20',
    status: 'Active',
    avatar: 'https://picsum.photos/seed/sari/100/100',
    isCoach: false,
    beltLevel: 'Biru',
    predicate: 'Wira Utama',
    gender: 'Perempuan',
    branch: 'Bogor Barat',
    subBranch: 'Cifor',
    kecamatan: 'Gunung Sindur'
  }
];

export const POSITIONS = [
  'Pembina',
  'Ketua Cabang',
  'Ketua DPC',
  'Sekretaris',
  'Bendahara',
  'Koordinator Biro Prestasi',
  'Koordinator Biro Tradisi',
  'Koordinator Pembinaan Mental dan Spiritual',
  'Koordinator Biro Hubungan Masyarakat',
  'Koordinator Biro Penelitian dan Pengembangan',
  'Anggota Biro Prestasi',
  'Anggota Biro Tradisi',
  'Anggota Pembinaan Mental dan Spiritual',
  'Pelatih',
  'Anggota'
];
