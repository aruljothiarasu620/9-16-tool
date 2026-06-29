import { create } from 'zustand';
import { saveUserDataToCloud, auth } from '@/lib/firebase';

export type ModuleType =
  | 'schedule'
  | 'webhook'
  | 'carousel_post'
  | 'single_post'
  | 'reel'
  | 'caption_tags'
  | 'tag_location'
  | 'if_else';

export type ScenarioStatus = 'active' | 'inactive';

export interface Module {
  id: string;
  type: ModuleType;
  label: string;
  position: { x: number; y: number };
  config: Record<string, unknown>;
}

export interface Connection {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface RunLog {
  id: string;
  scenarioId: string;
  timestamp: string;
  status: 'success' | 'failed' | 'running';
  modulesExecuted: string[];
  details: string;
}

export interface Scenario {
  id: string;
  name: string;
  status: ScenarioStatus;
  lastRun: string | null;
  modules: Module[];
  connections: Connection[];
  createdAt: string;
}

export interface InstagramAccount {
  id: string;
  username: string;
  profilePicture: string;
  followerCount: number;
  accessToken: string;
  pageId: string;
  connectedAt: string;
}

export interface AppSettings {
  facebookAppId: string;
  facebookAppSecret: string;
  notifyOnSuccess: boolean;
  notifyOnFailure: boolean;
  notifyEmail: string;
}

interface AppStore {
  scenarios: Scenario[];
  runLogs: RunLog[];
  instagramAccounts: InstagramAccount[];
  settings: AppSettings;
  activeScenarioId: string | null;
  tier?: string;
  credits: number; // -1 = unlimited

  // Scenario actions
  addScenario: (scenario: Scenario) => void;
  updateScenario: (id: string, updates: Partial<Scenario>) => void;
  deleteScenario: (id: string) => void;
  setActiveScenario: (id: string | null) => void;

  // Module actions within scenario
  addModule: (scenarioId: string, module: Module) => void;
  updateModule: (scenarioId: string, moduleId: string, config: Record<string, unknown>) => void;
  removeModule: (scenarioId: string, moduleId: string) => void;
  updateModulePosition: (scenarioId: string, moduleId: string, position: { x: number; y: number }) => void;

  // Connection actions
  addConnection: (scenarioId: string, connection: Connection) => void;
  removeConnection: (scenarioId: string, connectionId: string) => void;

  // Run log actions
  addRunLog: (log: RunLog) => void;
  clearRunLogs: (scenarioId: string) => void;

  // Instagram actions
  addInstagramAccount: (account: InstagramAccount) => void;
  removeInstagramAccount: (id: string, username?: string) => void;
  updateInstagramAccount: (id: string, updates: Partial<InstagramAccount>) => void;

  // Settings
  updateSettings: (updates: Partial<AppSettings>) => void;
}

const defaultScenarios: Scenario[] = [
  {
    id: 'scenario-1',
    name: 'Daily Product Post',
    status: 'active',
    lastRun: '2026-04-19T08:00:00Z',
    createdAt: '2026-04-01T00:00:00Z',
    modules: [],
    connections: [],
  },
  {
    id: 'scenario-2',
    name: 'Weekly Carousel',
    status: 'inactive',
    lastRun: '2026-04-13T10:30:00Z',
    createdAt: '2026-04-05T00:00:00Z',
    modules: [],
    connections: [],
  },
  {
    id: 'scenario-3',
    name: 'Reel Automation',
    status: 'active',
    lastRun: null,
    createdAt: '2026-04-15T00:00:00Z',
    modules: [],
    connections: [],
  },
];

const defaultLogs: RunLog[] = [
  {
    id: 'log-1',
    scenarioId: 'scenario-1',
    timestamp: '2026-04-19T08:00:00Z',
    status: 'success',
    modulesExecuted: ['Schedule', 'Single Post', 'Caption+Hashtags'],
    details: 'Posted successfully to @myaccount',
  },
  {
    id: 'log-2',
    scenarioId: 'scenario-2',
    timestamp: '2026-04-13T10:30:00Z',
    status: 'failed',
    modulesExecuted: ['Schedule', 'Carousel Post'],
    details: 'Error: Invalid image URL at index 3',
  },
  {
    id: 'log-3',
    scenarioId: 'scenario-1',
    timestamp: '2026-04-18T08:00:00Z',
    status: 'success',
    modulesExecuted: ['Schedule', 'Single Post'],
    details: 'Posted successfully',
  },
];

export const useStore = create<AppStore>()(
  (set) => ({
    scenarios: defaultScenarios,
    runLogs: defaultLogs,
    instagramAccounts: [],
    activeScenarioId: null,
    tier: 'free',
    credits: 5, // default free tier = 5 credits
    settings: {
      facebookAppId: '2001458060448073',
      facebookAppSecret: 'fff9231ce808e506def32a87c8cef303',
      notifyOnSuccess: true,
      notifyOnFailure: true,
      notifyEmail: '',
    },

    addScenario: (scenario) =>
      set((state) => {
        const nextScenarios = [...state.scenarios, scenario];
        saveUserDataToCloud({ scenarios: nextScenarios });
        return { scenarios: nextScenarios };
      }),

    updateScenario: (id, updates) =>
      set((state) => {
        const nextScenarios = state.scenarios.map((s) =>
          s.id === id ? { ...s, ...updates } : s
        );
        saveUserDataToCloud({ scenarios: nextScenarios });
        return { scenarios: nextScenarios };
      }),

    deleteScenario: (id) =>
      set((state) => {
        const nextScenarios = state.scenarios.filter((s) => s.id !== id);
        saveUserDataToCloud({ scenarios: nextScenarios });
        return { scenarios: nextScenarios };
      }),

    setActiveScenario: (id) => set({ activeScenarioId: id }),

    addModule: (scenarioId, module) =>
      set((state) => {
        const nextScenarios = state.scenarios.map((s) =>
          s.id === scenarioId ? { ...s, modules: [...s.modules, module] } : s
        );
        saveUserDataToCloud({ scenarios: nextScenarios });
        return { scenarios: nextScenarios };
      }),

    updateModule: (scenarioId, moduleId, config) =>
      set((state) => {
        const nextScenarios = state.scenarios.map((s) =>
          s.id === scenarioId
            ? {
                ...s,
                modules: s.modules.map((m) =>
                  m.id === moduleId ? { ...m, config } : m
                ),
              }
            : s
        );
        saveUserDataToCloud({ scenarios: nextScenarios });
        return { scenarios: nextScenarios };
      }),

    removeModule: (scenarioId, moduleId) =>
      set((state) => {
        const nextScenarios = state.scenarios.map((s) =>
          s.id === scenarioId
            ? {
                ...s,
                modules: s.modules.filter((m) => m.id !== moduleId),
                connections: s.connections.filter(
                  (c) => c.source !== moduleId && c.target !== moduleId
                ),
              }
            : s
        );
        saveUserDataToCloud({ scenarios: nextScenarios });
        return { scenarios: nextScenarios };
      }),

    updateModulePosition: (scenarioId, moduleId, position) =>
      set((state) => {
        const nextScenarios = state.scenarios.map((s) =>
          s.id === scenarioId
            ? {
                ...s,
                modules: s.modules.map((m) =>
                  m.id === moduleId ? { ...m, position } : m
                ),
              }
            : s
        );
        saveUserDataToCloud({ scenarios: nextScenarios });
        return { scenarios: nextScenarios };
      }),

    addConnection: (scenarioId, connection) =>
      set((state) => {
        const nextScenarios = state.scenarios.map((s) =>
          s.id === scenarioId
            ? { ...s, connections: [...s.connections, connection] }
            : s
        );
        saveUserDataToCloud({ scenarios: nextScenarios });
        return { scenarios: nextScenarios };
      }),

    removeConnection: (scenarioId, connectionId) =>
      set((state) => {
        const nextScenarios = state.scenarios.map((s) =>
          s.id === scenarioId
            ? {
                ...s,
                connections: s.connections.filter((c) => c.id !== connectionId),
              }
            : s
        );
        saveUserDataToCloud({ scenarios: nextScenarios });
        return { scenarios: nextScenarios };
      }),

    addRunLog: (log) =>
      set((state) => {
        // Increased log history cap to 1000 to cover extensive run histories
        const nextLogs = [log, ...state.runLogs].slice(0, 1000);
        saveUserDataToCloud({ runLogs: nextLogs });
        return { runLogs: nextLogs };
      }),

    clearRunLogs: (scenarioId) =>
      set((state) => {
        const nextLogs = state.runLogs.filter((l) => l.scenarioId !== scenarioId);
        saveUserDataToCloud({ runLogs: nextLogs });
        return { runLogs: nextLogs };
      }),

    addInstagramAccount: (account) =>
      set((state) => {
        const nextAccounts = [...state.instagramAccounts, account];
        if (typeof window !== 'undefined') {
          const key = auth.currentUser ? `ig_accounts_${auth.currentUser.uid}` : 'instagramAccounts';
          localStorage.setItem(key, JSON.stringify(nextAccounts));
        }
        return { instagramAccounts: nextAccounts };
      }),

    removeInstagramAccount: (id, username) =>
      set((state) => {
        const nextAccounts = state.instagramAccounts.filter((a) => {
          const idMatch = a.id === id;
          const usernameMatch = username && a.username.toLowerCase() === username.toLowerCase();
          return !idMatch && !usernameMatch;
        });
        if (typeof window !== 'undefined') {
          const key = auth.currentUser ? `ig_accounts_${auth.currentUser.uid}` : 'instagramAccounts';
          localStorage.setItem(key, JSON.stringify(nextAccounts));
          localStorage.setItem('instagramAccounts', JSON.stringify(nextAccounts));
        }
        return { instagramAccounts: nextAccounts };
      }),

    updateInstagramAccount: (id, updates) =>
      set((state) => {
        const nextAccounts = state.instagramAccounts.map((a) =>
          a.id === id ? { ...a, ...updates } : a
        );
        if (typeof window !== 'undefined') {
          const key = auth.currentUser ? `ig_accounts_${auth.currentUser.uid}` : 'instagramAccounts';
          localStorage.setItem(key, JSON.stringify(nextAccounts));
        }
        return { instagramAccounts: nextAccounts };
      }),

    updateSettings: (updates) =>
      set((state) => ({
        settings: { ...state.settings, ...updates },
      })),
  })
);
