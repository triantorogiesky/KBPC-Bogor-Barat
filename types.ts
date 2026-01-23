
export enum Role {
  ADMIN = 'ADMIN',
  PENGURUS = 'PENGURUS',
  ANGGOTA = 'ANGGOTA'
}

export interface BeltLevel {
  name: string;
  color: string;
  predicate: string;
}

export interface SubBranch {
  id: string;
  code: string; // Kode 2 digit
  name: string;
  leader?: string;
  latitude?: number;
  longitude?: number;
}

export interface Branch {
  id: string;
  code: string; // Kode 2 digit
  name: string;
  leader?: string;
  subBranches: SubBranch[];
}

export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  email: string;
  role: Role;
  position: string;
  joinDate: string;
  status: 'Active' | 'Inactive' | 'Pending';
  avatar?: string;
  isCoach: boolean;
  formalPhoto?: string;
  informalPhoto?: string;
  beltLevel: string;
  predicate: string;
  gender: 'Laki-laki' | 'Perempuan';
  branch: string;
  subBranch: string;
  kecamatan: string; // Field baru
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AppNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
