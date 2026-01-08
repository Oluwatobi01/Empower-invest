import React, { useState, useEffect, createContext, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

// --- Constants ---
export const DEFAULT_USERS = [
  { id: 1, name: 'Alex Morgan', email: 'alex.m@empower.com', role: 'User', status: 'Active', plan: 'Premium' },
  { id: 2, name: 'Sarah Jenkins', email: 'sarah.j@example.com', role: 'User', status: 'Active', plan: 'Basic' },
  { id: 3, name: 'Michael Chen', email: 'm.chen@example.com', role: 'Admin', status: 'Active', plan: 'Staff' },
  { id: 4, name: 'Jessica Wong', email: 'j.wong@example.com', role: 'User', status: 'Inactive', plan: 'Basic' },
  { id: 5, name: 'David Smith', email: 'david.s@example.com', role: 'Editor', status: 'Active', plan: 'Pro' },
];

// --- Types ---
export interface NavLinkProps {
  to: string;
  label: string;
  icon?: string;
  active?: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'User' | 'Admin';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, name?: string) => void;
  logout: () => void;
  isLoading: boolean;
}

// --- Auth Context ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for existing session
    const storedUser = localStorage.getItem('empower_current_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, name: string = 'User') => {
    // Simple mock auth logic
    const isAdmin = email.toLowerCase().includes('admin');
    const newUser: User = {
      id: email.toLowerCase().replace(/[^a-z0-9]/g, ''), // Generate simple ID from email
      name: name,
      email: email,
      role: isAdmin ? 'Admin' : 'User'
    };
    
    setUser(newUser);
    localStorage.setItem('empower_current_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('empower_current_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// --- Mapping Helper ---
const getKeyTableMap = (key: string) => {
    switch(key) {
        case 'finserve_transactions': return { table: 'transactions', type: 'array' };
        case 'finserve_users': return { table: 'users', type: 'array' };
        case 'finserve_bookings': return { table: 'bookings', type: 'array' };
        case 'finserve_articles': return { table: 'articles', type: 'array' };
        case 'finserve_documents': return { table: 'documents', type: 'array' };
        case 'finserve_accounts': return { table: 'accounts', type: 'array' };
        case 'finserve_client_data': return { table: 'client_data', type: 'object', id: 1 };
        case 'finserve_retirement': return { table: 'retirement_settings', type: 'object', id: 1 };
        case 'finserve_settings': return { table: 'settings', type: 'object', id: 1 };
        default: return null;
    }
};

// --- Hooks ---
export const usePersistentState = (key: string, defaultValue: any) => {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (err) {
      console.warn(`Error reading ${key} from localStorage`, err);
      return defaultValue;
    }
  });

  // Sync to LocalStorage (Immediate Cache)
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  // Sync from Supabase (On Mount)
  useEffect(() => {
    const fetchData = async () => {
        const map = getKeyTableMap(key);
        if (!map) return;

        try {
            let query = supabase.from(map.table).select('*');
            if (map.type === 'object') {
                query = query.eq('id', map.id).single();
            } else {
                query = query.order('created_at', { ascending: false });
            }

            const { data, error } = await query;
            if (error) {
                // console.warn('Supabase fetch error for', key, error.message);
                return;
            }

            if (data) {
                if (map.type === 'object') {
                    if (key.startsWith('finserve_client_data')) {
                        setState(data.data || defaultValue);
                    } else {
                        const { created_at, ...rest } = data;
                        setState(rest);
                    }
                } else {
                    setState(data);
                }
            }
        } catch (e) {
            // console.error(e);
        }
    };
    
    // Only fetch from Supabase if it's a shared key (not user specific for this demo)
    if (!key.includes('_user_')) {
        fetchData();
    }
  }, [key]);

  return [state, setState];
};

// --- Components ---

export const NavLink: React.FC<NavLinkProps> = ({ to, label, icon, active }) => {
  const baseClass = "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group";
  const activeClass = "bg-primary/10 text-primary dark:text-primary";
  const inactiveClass = "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800";
  
  return (
    <Link to={to} className={`${baseClass} ${active ? activeClass : inactiveClass}`}>
      {icon && <span className={`material-symbols-outlined text-[20px] ${active ? 'fill-1' : 'text-slate-400 group-hover:text-primary transition-colors'}`}>{icon}</span>}
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
};

export const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const { logout } = useAuth();

  return (
    <aside className="hidden lg:flex flex-col w-72 h-full bg-white dark:bg-slate-850 border-r border-slate-200 dark:border-slate-800 shrink-0 transition-colors">
      <div className="p-6 pb-2">
        <div className="flex gap-3 items-center">
          <div className="bg-primary/10 flex items-center justify-center rounded-lg size-10 text-primary">
            <span className="material-symbols-outlined">security</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-slate-900 dark:text-white text-base font-bold leading-normal">Admin Panel</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-normal">Empower</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <nav className="flex flex-col gap-2">
          <NavLink to="/admin" label="Dashboard" icon="dashboard" active={isActive('/admin')} />
          <NavLink to="/admin/transactions" label="Transactions" icon="receipt_long" active={isActive('/admin/transactions')} />
          <NavLink to="/admin/users" label="Users" icon="group" active={isActive('/admin/users')} />
          <NavLink to="/admin/content" label="Content" icon="article" active={isActive('/admin/content')} />
          <NavLink to="/admin/documents" label="Documents & Reports" icon="folder_shared" active={isActive('/admin/documents')} />
          <NavLink to="/admin/data" label="Client Data" icon="dataset" active={isActive('/admin/data')} />
          <NavLink to="/admin/settings" label="Settings" icon="settings" active={isActive('/admin/settings')} />
        </nav>
      </div>
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <button onClick={logout} className="flex w-full cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-primary hover:bg-blue-600 text-white text-sm font-bold leading-normal tracking-[0.015em] transition-colors shadow-sm">
          Log Out
        </button>
      </div>
    </aside>
  );
};

export const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <button 
      onClick={() => setIsDark(!isDark)}
      className="fixed bottom-4 right-4 z-[100] p-3 rounded-full bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-lg hover:scale-110 transition-transform"
      title="Toggle Dark Mode"
    >
      <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
    </button>
  );
};