
import { createClient } from '@vercel/edge-config';
import { User, Role, BeltLevel, Branch } from './types';
import { INITIAL_USERS, INITIAL_BELT_LEVELS, INITIAL_BRANCHES, POSITIONS } from './constants';

const KEYS = {
  USERS: 'kbpc_db_users',
  BRANCHES: 'kbpc_db_branches',
  POSITIONS: 'kbpc_db_positions',
  BELTS: 'kbpc_db_belts',
  CONFIG_REMOTE: 'kbpc_global_config'
};

// Helper untuk LocalStorage
const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: (key: string, value: any): void => {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

const edgeConfig = process.env.EDGE_CONFIG 
  ? createClient(process.env.EDGE_CONFIG) 
  : null;

export const Database = {
  // --- INITIALIZATION ---
  initialize: async () => {
    // Simulasi latency jaringan
    await new Promise(resolve => setTimeout(resolve, 1200));

    let remoteConfig: any = null;
    try {
      if (edgeConfig) {
        remoteConfig = await edgeConfig.get(KEYS.CONFIG_REMOTE);
      }
    } catch (error) {
      console.warn("Database: Edge Config unavailable, using local persistence.");
    }

    // Ambil data dengan hierarki: 1. Remote Edge, 2. Local Storage, 3. Initial Constants
    const branches = remoteConfig?.branches || storage.get(KEYS.BRANCHES, INITIAL_BRANCHES);
    const positions = remoteConfig?.positions || storage.get(KEYS.POSITIONS, POSITIONS);
    const beltLevels = remoteConfig?.beltLevels || storage.get(KEYS.BELTS, INITIAL_BELT_LEVELS);
    const users = storage.get(KEYS.USERS, INITIAL_USERS);

    // Pastikan data tersimpan di local untuk sesi berikutnya
    storage.set(KEYS.BRANCHES, branches);
    storage.set(KEYS.POSITIONS, positions);
    storage.set(KEYS.BELTS, beltLevels);
    storage.set(KEYS.USERS, users);

    return { branches, positions, beltLevels, users };
  },

  // --- USER OPERATIONS ---
  getUsers: (): User[] => storage.get(KEYS.USERS, INITIAL_USERS),

  saveUser: (user: User): void => {
    const users = Database.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
    } else {
      users.push(user);
    }
    storage.set(KEYS.USERS, users);
  },

  deleteUser: (id: string): void => {
    const users = Database.getUsers().filter(u => u.id !== id);
    storage.set(KEYS.USERS, users);
  },

  generateNIA: (): string => {
    const year = new Date().getFullYear();
    const count = Database.getUsers().length + 1;
    return `NIA-${year}-${count.toString().padStart(4, '0')}`;
  },

  // --- BRANCH OPERATIONS ---
  getBranches: (): Branch[] => storage.get(KEYS.BRANCHES, INITIAL_BRANCHES),

  saveBranch: (branch: Branch): void => {
    const branches = Database.getBranches();
    const index = branches.findIndex(b => b.id === branch.id);
    if (index !== -1) {
      branches[index] = branch;
    } else {
      if (!branch.id) branch.id = `br-${Math.random().toString(36).substr(2, 9)}`;
      branches.push(branch);
    }
    storage.set(KEYS.BRANCHES, branches);
  },

  deleteBranch: (id: string): void => {
    const branches = Database.getBranches().filter(b => b.id !== id);
    storage.set(KEYS.BRANCHES, branches);
  },

  // --- CONFIG PERSISTENCE (POSITIONS & BELTS) ---
  savePositions: (positions: string[]): void => {
    storage.set(KEYS.POSITIONS, positions);
  },

  saveBeltLevels: (belts: BeltLevel[]): void => {
    storage.set(KEYS.BELTS, belts);
  },

  // Utility untuk sinkronisasi (Manual Sync)
  persistLocalConfig: (key: string, data: any) => {
    const storageKey = 
      key === 'branches' ? KEYS.BRANCHES :
      key === 'positions' ? KEYS.POSITIONS :
      key === 'belt-levels' ? KEYS.BELTS : `kbpc_db_${key}`;
    storage.set(storageKey, data);
  }
};
