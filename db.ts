
import { User, Role, BeltLevel, Branch } from './types';
import { INITIAL_USERS, INITIAL_BELT_LEVELS, INITIAL_BRANCHES, POSITIONS } from './constants';

const KEYS = {
  USERS: 'kbpc_db_users',
  BELTS: 'kbpc_db_belts',
  BRANCHES: 'kbpc_db_branches',
  POSITIONS: 'kbpc_db_positions'
};

export const Database = {
  // --- USER OPERATIONS ---
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
  getBranches: (): Branch[] => {
    const data = localStorage.getItem(KEYS.BRANCHES);
    if (!data) {
      localStorage.setItem(KEYS.BRANCHES, JSON.stringify(INITIAL_BRANCHES));
      return INITIAL_BRANCHES;
    }
    return JSON.parse(data);
  },

  saveBranch: (branch: Branch): void => {
    const branches = Database.getBranches();
    const index = branches.findIndex(b => b.id === branch.id);
    if (index !== -1) {
      branches[index] = branch;
    } else {
      branches.push(branch);
    }
    localStorage.setItem(KEYS.BRANCHES, JSON.stringify(branches));
  },

  deleteBranch: (id: string): void => {
    const branches = Database.getBranches().filter(b => b.id !== id);
    localStorage.setItem(KEYS.BRANCHES, JSON.stringify(branches));
  },

  // --- BELT OPERATIONS ---
  getBelts: (): BeltLevel[] => {
    const data = localStorage.getItem(KEYS.BELTS);
    if (!data) {
      localStorage.setItem(KEYS.BELTS, JSON.stringify(INITIAL_BELT_LEVELS));
      return INITIAL_BELT_LEVELS;
    }
    return JSON.parse(data);
  },

  saveBelt: (belt: BeltLevel, oldName?: string): void => {
    const belts = Database.getBelts();
    if (oldName) {
      const index = belts.findIndex(b => b.name === oldName);
      if (index !== -1) belts[index] = belt;
    } else {
      belts.push(belt);
    }
    localStorage.setItem(KEYS.BELTS, JSON.stringify(belts));
  },

  // --- POSITION OPERATIONS ---
  getPositions: (): string[] => {
    const data = localStorage.getItem(KEYS.POSITIONS);
    if (!data) {
      localStorage.setItem(KEYS.POSITIONS, JSON.stringify(POSITIONS));
      return POSITIONS;
    }
    return JSON.parse(data);
  },

  savePositions: (positions: string[]): void => {
    localStorage.setItem(KEYS.POSITIONS, JSON.stringify(positions));
  },

  // --- SYSTEM ---
  resetDatabase: (): void => {
    localStorage.clear();
    window.location.reload();
  }
};
