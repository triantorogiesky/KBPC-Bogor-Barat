
import { Role, User, BeltLevel, Branch } from './types';

export const LOGO_URL = 'https://i.ibb.co/vz6Gz2N/kbpc-logo.png'; // Using the provided Padjadjaran Cimande logo

export const INITIAL_BELT_LEVELS: BeltLevel[] = [
  { name: 'Dasar (Putih)', color: '#cbd5e1', predicate: 'Tunas Muda' },
  { name: 'Calon (Kuning)', color: '#fbbf24', predicate: 'Wira Putra' },
  { name: 'Muda (Hijau)', color: '#10b981', predicate: 'Sakti Digdaya' },
  { name: 'Madya (Biru)', color: '#3b82f6', predicate: 'Satria Tama' },
  { name: 'Utama (Cokelat)', color: '#92400e', predicate: 'Wira Bakti' },
  { name: 'Pendekar (Hitam)', color: '#0f172a', predicate: 'Pendekar Utama' }
];

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'br-001',
    name: 'Bogor Barat',
    leader: 'Budi Santoso',
    subBranches: [
      { id: 'sb-001', name: 'Bubulak', leader: 'Agus' },
      { id: 'sb-002', name: 'Cifor', leader: 'Sari' },
      { id: 'sb-003', name: 'Semplak', leader: 'Doni' }
    ]
  },
  {
    id: 'br-002',
    name: 'Bogor Tengah',
    leader: 'Ahmad Fauzi',
    subBranches: [
      { id: 'sb-004', name: 'Sempur', leader: 'Eka' },
      { id: 'sb-005', name: 'Pabaton', leader: 'Wati' }
    ]
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'admin-001',
    username: 'admin',
    name: 'Administrator',
    email: 'admin@kbpcbogor.com',
    role: Role.ADMIN,
    position: 'System Administrator',
    joinDate: '2024-01-01',
    status: 'Active',
    avatar: 'https://ui-avatars.com/api/?name=Admin&background=4f46e5&color=fff',
    isCoach: false,
    beltLevel: 'Pendekar (Hitam)',
    predicate: 'Pengembang Sistem',
    gender: 'Laki-laki',
    branch: 'Bogor Barat',
    subBranch: 'Bubulak'
  },
  {
    id: '1',
    username: 'budi_s',
    name: 'Budi Santoso',
    email: 'budi@kbpcbogor.com',
    role: Role.ADMIN,
    position: 'Ketua Cabang',
    joinDate: '2023-01-15',
    status: 'Active',
    avatar: 'https://picsum.photos/seed/budi/100/100',
    isCoach: true,
    beltLevel: 'Pendekar (Hitam)',
    predicate: 'Pendekar Utama',
    gender: 'Laki-laki',
    branch: 'Bogor Barat',
    subBranch: 'Bubulak'
  },
  {
    id: '2',
    username: 'sari_w',
    name: 'Sari Wijaya',
    email: 'sari@kbpcbogor.com',
    role: Role.PENGURUS,
    position: 'Sekretaris',
    joinDate: '2023-02-20',
    status: 'Active',
    avatar: 'https://picsum.photos/seed/sari/100/100',
    isCoach: false,
    beltLevel: 'Madya (Biru)',
    predicate: 'Sekretaris Teladan',
    gender: 'Perempuan',
    branch: 'Bogor Barat',
    subBranch: 'Cifor'
  }
];

export const POSITIONS = [
  'Ketua Cabang',
  'Wakil Ketua',
  'Sekretaris',
  'Bendahara',
  'Kepala Pelatih',
  'Pelatih',
  'Asisten Pelatih',
  'Anggota Senior',
  'Anggota Muda',
  'Staf Administrasi'
];
