
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
  name: string;
  leader?: string;
}

export interface Branch {
  id: string;
  name: string;
  leader?: string;
  subBranches: SubBranch[];
}

export interface User {
  id: string;
  username: string;
  password?: string; // Field baru untuk autentikasi
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
