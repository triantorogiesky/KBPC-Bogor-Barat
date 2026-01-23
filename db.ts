
import { createClient } from '@vercel/edge-config';
import { User, Role, BeltLevel, Branch } from './types';
import { INITIAL_USERS, INITIAL_BELT_LEVELS, INITIAL_BRANCHES, POSITIONS } from './constants';

const KEYS = {
  USERS: 'kbpc_db_users_v2',
  BRANCHES: 'kbpc_db_branches_v2',
  POSITIONS: 'kbpc_db_positions_v2',
  BELTS: 'kbpc_db_belts_v2',
  CONFIG_REMOTE: 'kbpc_global_config'
};

const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      return JSON.parse(item);
    } catch (e) {
      console.error(`Gagal memuat key ${key}:`, e);
      return defaultValue;
    }
  },
  set: (key: string, value: any): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`Gagal menyimpan key ${key}:`, e);
      return false;
    }
  }
};

const edgeConfig = process.env.EDGE_CONFIG 
  ? createClient(process.env.EDGE_CONFIG) 
  : null;

export const Database = {
  initialize: async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    let remoteConfig: any = null;
    try {
      if (edgeConfig) {
        remoteConfig = await edgeConfig.get(KEYS.CONFIG_REMOTE);
      }
    } catch (error) {
      console.warn("Database: Edge Config tidak terjangkau.");
    }

    const localUsers = storage.get<User[]>(KEYS.USERS, []);
    const localBranches = storage.get<Branch[]>(KEYS.BRANCHES, []);
    const localPositions = storage.get<string[]>(KEYS.POSITIONS, []);
    const localBelts = storage.get<BeltLevel[]>(KEYS.BELTS, []);

    const finalUsers = localUsers.length > 0 ? localUsers : INITIAL_USERS;
    const finalBranches = localBranches.length > 0 ? localBranches : (remoteConfig?.branches || INITIAL_BRANCHES);
    const finalPositions = localPositions.length > 0 ? localPositions : (remoteConfig?.positions || POSITIONS);
    const finalBelts = localBelts.length > 0 ? localBelts : (remoteConfig?.beltLevels || INITIAL_BELT_LEVELS);

    storage.set(KEYS.USERS, finalUsers);
    storage.set(KEYS.BRANCHES, finalBranches);
    storage.set(KEYS.POSITIONS, finalPositions);
    storage.set(KEYS.BELTS, finalBelts);

    return { 
      branches: finalBranches, 
      positions: finalPositions, 
      beltLevels: finalBelts, 
      users: finalUsers 
    };
  },

  getUsers: (): User[] => storage.get(KEYS.USERS, INITIAL_USERS),

  saveUser: (user: User): boolean => {
    const users = Database.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = { ...users[index], ...user };
    } else {
      users.push(user);
    }
    return storage.set(KEYS.USERS, users);
  },

  deleteUser: (id: string): void => {
    const users = Database.getUsers().filter(u => u.id !== id);
    storage.set(KEYS.USERS, users);
  },

  generateNIA: (): string => {
    const year = new Date().getFullYear();
    const allUsers = Database.getUsers();
    const count = allUsers.length + 1;
    return `NIA-${year}-${count.toString().padStart(4, '0')}`;
  },

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

  savePositions: (positions: string[]): void => {
    storage.set(KEYS.POSITIONS, positions);
  },

  saveBeltLevels: (belts: BeltLevel[]): void => {
    storage.set(KEYS.BELTS, belts);
  },

  exportDatabase: () => {
    const data = {
      users: Database.getUsers(),
      branches: Database.getBranches(),
      positions: storage.get(KEYS.POSITIONS, POSITIONS),
      belts: storage.get(KEYS.BELTS, INITIAL_BELT_LEVELS),
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_kbpc_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  },

  importDatabase: (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.users) storage.set(KEYS.USERS, data.users);
      if (data.branches) storage.set(KEYS.BRANCHES, data.branches);
      if (data.positions) storage.set(KEYS.POSITIONS, data.positions);
      if (data.belts) storage.set(KEYS.BELTS, data.belts);
      return true;
    } catch (e) {
      console.error("Gagal impor database:", e);
      return false;
    }
  }
};
