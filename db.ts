
import { createClient } from '@vercel/edge-config';
import { User, Role, BeltLevel, Branch } from './types';
import { INITIAL_USERS, INITIAL_BELT_LEVELS, INITIAL_BRANCHES, POSITIONS } from './constants';

const KEYS = {
  USERS: 'kbpc_db_users',
  CONFIG_REMOTE: 'kbpc_global_config'
};

// Vercel Edge Config Client (akan menggunakan env VERCEL_URL & EDGE_CONFIG)
// Catatan: Di client-side, kita memerlukan token pembacaan publik jika tidak menggunakan API routes.
const edgeConfig = process.env.EDGE_CONFIG 
  ? createClient(process.env.EDGE_CONFIG) 
  : null;

export const Database = {
  // Inisialisasi Data dari Edge Config (Asynchronous)
  initialize: async () => {
    try {
      if (edgeConfig) {
        const remoteConfig = await edgeConfig.get(KEYS.CONFIG_REMOTE) as any;
        if (remoteConfig) {
          console.log("Database: Berhasil memuat konfigurasi dari Vercel Edge.");
          return {
            branches: remoteConfig.branches || INITIAL_BRANCHES,
            positions: remoteConfig.positions || POSITIONS,
            beltLevels: remoteConfig.beltLevels || INITIAL_BELT_LEVELS
          };
        }
      }
    } catch (error) {
      console.warn("Database: Edge Config tidak terjangkau, menggunakan data lokal.");
    }
    
    // Fallback ke localStorage jika ada override lokal, atau ke konstanta
    const localBranches = localStorage.getItem('kbpc_db_branches');
    const localPositions = localStorage.getItem('kbpc_db_positions');
    const localBelts = localStorage.getItem('kbpc_db_belts');

    return {
      branches: localBranches ? JSON.parse(localBranches) : INITIAL_BRANCHES,
      positions: localPositions ? JSON.parse(localPositions) : POSITIONS,
      beltLevels: localBelts ? JSON.parse(localBelts) : INITIAL_BELT_LEVELS
    };
  },

  // --- USER OPERATIONS (Tetap di LocalStorage untuk Write Access) ---
  getUsers: (): User[] => {
    const data = localStorage.getItem(KEYS.USERS);
    if (!data) {
      localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(data);
  },

  saveUser: (user: User): void => {
    const users = Database.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  },

  deleteUser: (id: string): void => {
    const users = Database.getUsers().filter(u => u.id !== id);
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  },

  generateNIA: (): string => {
    const year = new Date().getFullYear();
    const count = Database.getUsers().length + 1;
    return `NIA-${year}-${count.toString().padStart(4, '0')}`;
  },

  // --- BRANCH OPERATIONS ---
  // Fix: Added missing getBranches method
  getBranches: (): Branch[] => {
    const data = localStorage.getItem('kbpc_db_branches');
    if (!data) {
      localStorage.setItem('kbpc_db_branches', JSON.stringify(INITIAL_BRANCHES));
      return INITIAL_BRANCHES;
    }
    return JSON.parse(data);
  },

  // Fix: Added missing saveBranch method
  saveBranch: (branch: Branch): void => {
    const branches = Database.getBranches();
    const index = branches.findIndex(b => b.id === branch.id);
    if (index !== -1) {
      branches[index] = branch;
    } else {
      if (!branch.id) {
        branch.id = `br-${Math.random().toString(36).substr(2, 9)}`;
      }
      branches.push(branch);
    }
    localStorage.setItem('kbpc_db_branches', JSON.stringify(branches));
  },

  // Fix: Added missing deleteBranch method
  deleteBranch: (id: string): void => {
    const branches = Database.getBranches().filter(b => b.id !== id);
    localStorage.setItem('kbpc_db_branches', JSON.stringify(branches));
  },

  // --- LOCAL PERSISTENCE FOR CONFIG (Caching Edge Config) ---
  persistLocalConfig: (key: string, data: any) => {
    localStorage.setItem(`kbpc_db_${key}`, JSON.stringify(data));
  }
};
