import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { NavLink, usePersistentState, useAuth } from '../components/Shared';
import { supabase } from '../lib/supabaseClient';

const DEFAULT_CLIENT_DATA = {
    name: 'Alex Morgan',
    email: 'alex.m@empower.com',
    balance: 100.00, // Matches screenshot request
    budget: [
        { name: 'Housing', spent: 1800, limit: 1800, color: 'bg-blue-500' },
        { name: 'Food & Dining', spent: 650, limit: 600, color: 'bg-orange-500' },
        { name: 'Transportation', spent: 320, limit: 400, color: 'bg-green-500' },
        { name: 'Entertainment', spent: 150, limit: 300, color: 'bg-purple-500' },
        { name: 'Utilities', spent: 210, limit: 250, color: 'bg-cyan-500' },
    ],
    cashflow: [
        { month: 'May', in: 4200, out: 3800 },
        { month: 'Jun', in: 4300, out: 3600 },
        { month: 'Jul', in: 4100, out: 4500 },
        { month: 'Aug', in: 4800, out: 3200 },
        { month: 'Sep', in: 5200, out: 3900 },
        { month: 'Oct', in: 5100, out: 2800 },
    ],
    subscriptions: [
        { id: 1, name: "Netflix Premium", cost: 19.99, cycle: "Monthly", icon: "movie", color: "bg-red-600" },
        { id: 2, name: "Spotify Duo", cost: 14.99, cycle: "Monthly", icon: "music_note", color: "bg-green-500" },
        { id: 3, name: "Amazon Prime", cost: 139.00, cycle: "Yearly", icon: "shopping_cart", color: "bg-blue-400" },
    ],
    debts: [
        { name: "Credit Card (Visa)", balance: 4500, rate: 24.99, min: 150 },
        { name: "Student Loan", balance: 12000, rate: 5.5, min: 200 },
    ],
    emergency: { current: 12500, goal: 25000 }
};

const DEFAULT_HOLDINGS = [
    { s: 'AAPL', n: 'Apple Inc.', p: 178.35, q: 45, type: 'Stock' },
    { s: 'MSFT', n: 'Microsoft Corp.', p: 334.20, q: 20, type: 'Stock' },
    { s: 'VTI', n: 'Vanguard Total Stock', p: 224.15, q: 110, type: 'Stock' },
    { s: 'AGG', n: 'iShares Core Bond', p: 98.45, q: 200, type: 'Bond' },
    { s: 'BTC', n: 'Bitcoin', p: 42500.00, q: 0.45, type: 'Crypto' },
    { s: 'ETH', n: 'Ethereum', p: 2250.00, q: 3.5, type: 'Crypto' },
];

// --- Shared Components for App Pages ---
const ClientSidebar: React.FC = () => {
    // Fetch user name dynamically from the shared client data state
    const { user, logout } = useAuth();
    const dataKey = user ? `finserve_client_data_${user.id}` : 'finserve_client_data_default';
    
    // We initialize with DEFAULT_CLIENT_DATA but override name/email from auth context if needed
    const [clientData] = usePersistentState(dataKey, {
        ...DEFAULT_CLIENT_DATA,
        name: user?.name || DEFAULT_CLIENT_DATA.name,
        email: user?.email || DEFAULT_CLIENT_DATA.email
    });
    
    const safeName = clientData?.name || user?.name || 'User';
    
    return (
      <aside className="w-64 flex-shrink-0 bg-white dark:bg-[#1A2633] border-r border-slate-200 dark:border-slate-700 flex flex-col justify-between p-4 hidden md:flex">
        <div className="flex flex-col gap-8">
          <div className="flex gap-3 items-center px-2">
            <div className="bg-primary/10 flex items-center justify-center rounded-lg size-10 text-primary">
              <span className="material-symbols-outlined">account_balance</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-slate-900 dark:text-white text-base font-bold leading-normal">Empower</h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-normal leading-normal">Secure Banking</p>
            </div>
          </div>
          <nav className="flex flex-col gap-2">
            <NavLink to="/tools" label="Dashboard" icon="dashboard" />
            <NavLink to="/investments" label="Investments" icon="stacked_line_chart" />
            <NavLink to="/retirement" label="Retirement Plan" icon="savings" />
            <NavLink to="/accounts" label="Accounts" icon="account_balance" />
            <NavLink to="/reports" label="Reports" icon="bar_chart" />
            <NavLink to="/documents" label="Documents" icon="folder" />
          </nav>
        </div>
        <div className="flex flex-col gap-2 mt-auto p-4 border-t border-slate-100 dark:border-slate-700 -mx-4">
           <div className="flex items-center gap-3 px-2 mb-2">
                <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <img src={`https://i.pravatar.cc/150?u=${user?.id || 'def'}`} alt="Profile" />
                </div>
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{safeName}</span>
                    <span className="text-[10px] text-slate-500">Premium Member</span>
                </div>
           </div>
          <Link to="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
            <span className="material-symbols-outlined group-hover:text-primary transition-colors text-[20px]">settings</span>
            <p className="text-sm font-medium">Settings</p>
          </Link>
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors group text-left w-full">
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <p className="text-sm font-medium">Log Out</p>
          </button>
        </div>
      </aside>
    );
};

// --- Helper Components ---
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"><span className="material-symbols-outlined">close</span></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// --- Sub-Tools Components ---

interface ToolProps {
    data: any;
    onUpdate: (newData: any) => void;
}

const BudgetPlanner: React.FC<ToolProps> = ({ data, onUpdate }) => {
    const categories = data?.budget || [];
    const [editingCat, setEditingCat] = useState<any>(null);

    const totalSpent = categories.reduce((acc:any, c:any) => acc + (c.spent || 0), 0);
    const totalLimit = categories.reduce((acc:any, c:any) => acc + (c.limit || 0), 0);
    const percentage = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

    const handleSaveCat = (e: React.FormEvent) => {
        e.preventDefault();
        const newBudget = categories.map((c: any) => c.name === editingCat.name ? editingCat : c);
        onUpdate({ ...data, budget: newBudget });
        setEditingCat(null);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-8 items-center">
                {/* Circular Indicator */}
                <div className="relative size-48 flex-shrink-0">
                    <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                        <path className="text-slate-100 dark:text-slate-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.8" />
                        <path className="text-primary transition-all duration-1000 ease-out" strokeDasharray={`${percentage}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.8" strokeLinecap="round" />
                    </svg>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                        <span className="text-3xl font-black text-slate-900 dark:text-white">{percentage}%</span>
                        <span className="block text-xs font-bold text-slate-500 uppercase">Spent</span>
                    </div>
                </div>
                <div className="flex-1 w-full">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Monthly Budget</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">You have spent <strong>${totalSpent.toLocaleString()}</strong> out of <strong>${totalLimit.toLocaleString()}</strong>.</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
                            <span className="text-xs text-slate-500 uppercase font-bold">Left to Spend</span>
                            <p className="text-xl font-black text-green-600">${(totalLimit - totalSpent).toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
                            <span className="text-xs text-slate-500 uppercase font-bold">Daily Average</span>
                            <p className="text-xl font-black text-slate-900 dark:text-white">${Math.round(totalSpent / 30)}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-5">
                <h4 className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2">Category Breakdown <span className="text-xs font-normal text-slate-400 ml-2">(Click to edit)</span></h4>
                {categories.map((cat:any, i:number) => {
                    const limit = cat.limit || 1;
                    const spent = cat.spent || 0;
                    const catPct = Math.min(100, Math.round((spent / limit) * 100));
                    const isOver = spent > limit;
                    return (
                        <div key={i} className="group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors" onClick={() => setEditingCat(cat)}>
                            <div className="flex justify-between items-end mb-1">
                                <div className="flex items-center gap-2">
                                    <span className={`size-3 rounded-full ${cat.color}`}></span>
                                    <span className="font-bold text-sm text-slate-700 dark:text-slate-200">{cat.name}</span>
                                </div>
                                <div className="text-right">
                                    <span className={`text-sm font-bold ${isOver ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>${spent}</span>
                                    <span className="text-xs text-slate-400 mx-1">/</span>
                                    <span className="text-xs text-slate-500">${limit}</span>
                                </div>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden relative">
                                <div className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-red-500' : cat.color}`} style={{width: `${catPct}%`}}></div>
                            </div>
                            {isOver && <p className="text-[10px] text-red-500 font-bold mt-1 text-right">Over budget by ${spent - limit}</p>}
                        </div>
                    );
                })}
            </div>

            <Modal isOpen={!!editingCat} onClose={() => setEditingCat(null)} title={`Edit ${editingCat?.name || 'Category'}`}>
                <form onSubmit={handleSaveCat} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Budget Limit</label>
                        <input type="number" className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700" value={editingCat?.limit || 0} onChange={(e) => setEditingCat({...editingCat, limit: parseInt(e.target.value)})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount Spent</label>
                        <input type="number" className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700" value={editingCat?.spent || 0} onChange={(e) => setEditingCat({...editingCat, spent: parseInt(e.target.value)})} />
                    </div>
                    <button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-blue-600">Save Changes</button>
                </form>
            </Modal>
        </div>
    );
};

const CashFlowMonitor: React.FC<ToolProps> = ({ data }) => {
    const cfData = data?.cashflow || [];
    if (cfData.length === 0) return <div className="text-center p-8 text-slate-500">No cashflow data available.</div>;

    const maxVal = Math.max(...cfData.map((d:any) => Math.max(d.in, d.out))) * 1.2 || 1000;

    const last = cfData[cfData.length - 1];
    const currentNet = (last?.in || 0) - (last?.out || 0);
    const totalIn = cfData.reduce((acc:any, d:any) => acc + Number(d.in || 0), 0);
    const totalOut = cfData.reduce((acc:any, d:any) => acc + Number(d.out || 0), 0);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Cash Flow</h3>
                    <p className="text-slate-500 text-sm">Net cash flow for last 6 months</p>
                </div>
                <div className="text-right">
                    <span className="block text-xs font-bold text-slate-500 uppercase">Current Month Net</span>
                    <span className={`text-3xl font-black ${currentNet >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {currentNet >= 0 ? '+' : '-'}${Math.abs(currentNet).toLocaleString()}
                    </span>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 h-64 flex items-end justify-between gap-2 md:gap-4">
                {cfData.map((d:any, i:number) => (
                    <div key={i} className="flex-1 flex flex-col justify-end gap-1 h-full group relative">
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-800 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                            <div className="text-green-400">In: ${d.in}</div>
                            <div className="text-red-400">Out: ${d.out}</div>
                        </div>
                        
                        {/* Income Bar */}
                        <div className="w-full bg-green-500/20 rounded-t-sm relative overflow-hidden transition-all hover:bg-green-500/30" style={{height: `${((d.in || 0) / maxVal) * 100}%`}}>
                             <div className="absolute bottom-0 w-full bg-green-500 h-1"></div>
                        </div>
                        {/* Expense Bar */}
                        <div className="w-full bg-slate-300 dark:bg-slate-700 rounded-t-sm -mt-1 relative overflow-hidden transition-all hover:bg-red-500/20" style={{height: `${((d.out || 0) / maxVal) * 100}%`}}>
                             <div className="absolute top-0 w-full bg-red-500 h-1"></div>
                        </div>
                        
                        <span className="text-xs font-bold text-slate-400 text-center mt-2">{d.month}</span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-900/30">
                    <div className="flex items-center gap-2 mb-2 text-green-700 dark:text-green-400 font-bold text-sm">
                        <span className="material-symbols-outlined">arrow_downward</span> Total Income (6m)
                    </div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">${totalIn.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30">
                    <div className="flex items-center gap-2 mb-2 text-red-700 dark:text-red-400 font-bold text-sm">
                        <span className="material-symbols-outlined">arrow_upward</span> Total Expenses (6m)
                    </div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">${totalOut.toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
};

const SubscriptionManager: React.FC<ToolProps> = ({ data, onUpdate }) => {
    const subs = data?.subscriptions || [];
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const monthlyTotal = subs.reduce((acc:any, s:any) => {
        return acc + (s.cycle === 'Yearly' ? s.cost / 12 : s.cost);
    }, 0);

    const confirmDelete = async () => {
        if (deleteId !== null) {
            const updatedSubs = subs.filter((s: any) => s.id !== deleteId);
            const newData = { ...data, subscriptions: updatedSubs };
            onUpdate(newData);
            setDeleteId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-slate-900 dark:bg-black rounded-xl p-6 text-white flex justify-between items-center shadow-lg">
                <div>
                    <p className="text-slate-400 text-sm font-bold uppercase mb-1">Monthly Recurring</p>
                    <h3 className="text-4xl font-black">${monthlyTotal.toFixed(2)}</h3>
                </div>
                <div className="size-12 bg-white/10 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">receipt_long</span>
                </div>
            </div>

            <div className="space-y-3">
                {subs.map((sub:any) => (
                    <div key={sub.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className={`size-12 ${sub.color || 'bg-slate-500'} rounded-lg flex items-center justify-center text-white shadow-sm`}>
                                <span className="material-symbols-outlined">{sub.icon || 'star'}</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white">{sub.name}</h4>
                                <p className="text-xs text-slate-500">{sub.cycle}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="font-bold text-slate-900 dark:text-white">${sub.cost}</span>
                            <button onClick={() => setDeleteId(sub.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors" title="Remove">
                                <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                        </div>
                    </div>
                ))}
                {subs.length === 0 && <div className="text-center text-slate-500 py-8">No subscriptions tracked.</div>}
            </div>

            <Modal isOpen={deleteId !== null} onClose={() => setDeleteId(null)} title="Stop Tracking?">
                <p className="text-slate-600 dark:text-slate-300 mb-6">Are you sure you want to remove this subscription from your dashboard? This will not cancel the service itself.</p>
                <div className="flex gap-4">
                    <button onClick={() => setDeleteId(null)} className="flex-1 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white font-bold rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
                    <button onClick={confirmDelete} className="flex-1 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors">Remove</button>
                </div>
            </Modal>
        </div>
    );
};

const EmergencyFund: React.FC<ToolProps> = ({ data, onUpdate }) => {
    // Defensive coding: Ensure data.emergency exists
    const emergency = data?.emergency || { current: 0, goal: 0 };
    const { current, goal } = emergency;
    
    // Calculate Monthly Expenses Dynamically from Budget
    // Default to 4000 if budget is empty/zero to avoid division by zero
    const budgetTotal = data?.budget?.reduce((acc: number, item: any) => acc + (item.limit || 0), 0) || 0;
    const expenses = budgetTotal > 0 ? budgetTotal : 4000; 
    
    const monthsCovered = expenses > 0 ? (current / expenses).toFixed(1) : "0";
    const progress = goal > 0 ? Math.min(100, (current / goal) * 100) : 0;

    const handleAddFunds = async () => {
        const amount = 500;
        if((data.balance || 0) < amount) {
            alert("Insufficient wallet balance.");
            return;
        }
        const newData = { 
            ...data, 
            emergency: { ...emergency, current: current + amount },
            balance: (data.balance || 0) - amount
        };
        onUpdate(newData);
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Emergency Fund</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">Your safety net for unexpected events. Aiming for 6 months of expenses.</p>
            </div>

            <div className="flex flex-col items-center justify-center py-6">
                <div className="relative size-64">
                     <div className="absolute inset-0 rounded-full border-[16px] border-slate-100 dark:border-slate-800"></div>
                     <div className="absolute inset-0 rounded-full border-[16px] border-transparent" style={{
                         background: `conic-gradient(#137fec ${progress}%, transparent 0)`,
                         mask: 'radial-gradient(transparent 62%, black 63%)',
                         WebkitMask: 'radial-gradient(transparent 62%, black 63%)'
                     }}></div>
                     
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                         <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">${current.toLocaleString()}</span>
                         <span className="text-sm font-bold text-slate-400 uppercase mt-1">Saved of ${goal.toLocaleString()}</span>
                     </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 text-center">
                    <span className="material-symbols-outlined text-primary text-2xl mb-1">calendar_month</span>
                    <p className="text-xs text-slate-500 uppercase font-bold">Runway</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white">{monthsCovered} Months</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                    <span className="material-symbols-outlined text-slate-500 text-2xl mb-1">flag</span>
                    <p className="text-xs text-slate-500 uppercase font-bold">Goal</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white">${goal.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center col-span-2 md:col-span-1">
                    <span className="material-symbols-outlined text-green-500 text-2xl mb-1">trending_up</span>
                    <p className="text-xs text-slate-500 uppercase font-bold">Completion</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white">{progress.toFixed(0)}%</p>
                </div>
            </div>

            <div className="flex gap-4">
                <button onClick={handleAddFunds} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20">
                    + Add $500
                </button>
            </div>
        </div>
    );
};

const DebtPayoff: React.FC<ToolProps> = ({ data }) => {
    const [strategy, setStrategy] = useState<'Snowball' | 'Avalanche'>('Avalanche');
    const debts = data?.debts || [];

    // Calculate Real Payoff Date
    const totalDebt = debts.reduce((acc: number, d: any) => acc + (d.balance || 0), 0);
    const minPayments = debts.reduce((acc: number, d: any) => acc + (d.min || 0), 0);
    // Assume user pays $500 extra per month
    const monthlyPayment = minPayments + 500; 
    
    const monthsToPayoff = monthlyPayment > 0 ? Math.ceil(totalDebt / monthlyPayment) : 999;
    
    // Calculate Future Date
    const today = new Date();
    const futureDate = new Date(today.setMonth(today.getMonth() + monthsToPayoff));
    const payoffDateStr = futureDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    return (
        <div className="space-y-6">
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
                <button 
                    onClick={() => setStrategy('Snowball')}
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${strategy === 'Snowball' ? 'bg-white dark:bg-slate-800 shadow text-slate-900 dark:text-white' : 'text-slate-500'}`}
                >
                    Snowball (Smallest First)
                </button>
                <button 
                    onClick={() => setStrategy('Avalanche')}
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${strategy === 'Avalanche' ? 'bg-white dark:bg-slate-800 shadow text-slate-900 dark:text-white' : 'text-slate-500'}`}
                >
                    Avalanche (Highest Interest)
                </button>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-lg">Projected Freedom Date</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Based on current payments + $500 extra/mo</p>
                </div>
                <div className="text-center">
                    <span className="block text-3xl font-black text-primary">{payoffDateStr}</span>
                    <span className="text-xs font-bold text-slate-500">{monthsToPayoff} Months to go</span>
                </div>
            </div>

            <div className="space-y-3">
                {debts.sort((a:any,b:any) => strategy === 'Avalanche' ? b.rate - a.rate : a.balance - b.balance).map((debt:any, i:number) => (
                    <div key={i} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 relative overflow-hidden">
                        <div className="absolute top-0 left-0 h-full w-1 bg-slate-300 dark:bg-slate-600"></div>
                        {i === 0 && <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">PRIORITY</div>}
                        
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-slate-900 dark:text-white">{debt.name}</h4>
                            <span className="font-mono font-bold text-slate-900 dark:text-white">${(debt.balance || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex gap-4 text-xs text-slate-500">
                            <span>APR: <span className="font-bold text-slate-700 dark:text-slate-300">{debt.rate}%</span></span>
                            <span>Min: <span className="font-bold text-slate-700 dark:text-slate-300">${debt.min}</span></span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const ToolsPage: React.FC = () => {
    const { user } = useAuth();
    const dataKey = user ? `finserve_client_data_${user.id}` : 'finserve_client_data_default';
    const [clientData, setClientData] = usePersistentState(dataKey, DEFAULT_CLIENT_DATA);

    return (
        <div className="flex h-screen w-full bg-background-light dark:bg-background-dark">
            <ClientSidebar />
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Financial Dashboard</h1>
                        <p className="text-slate-500 dark:text-slate-400">Welcome back, {clientData.name}</p>
                    </div>
                    <div className="text-right bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Balance</p>
                        <p className="text-3xl font-black text-primary">${(clientData.balance || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <BudgetPlanner data={clientData} onUpdate={setClientData} />
                        </section>
                        <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                             <CashFlowMonitor data={clientData} onUpdate={setClientData} />
                        </section>
                    </div>
                    <div className="space-y-6">
                        <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                             <SubscriptionManager data={clientData} onUpdate={setClientData} />
                        </section>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <EmergencyFund data={clientData} onUpdate={setClientData} />
                            </section>
                            <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <DebtPayoff data={clientData} onUpdate={setClientData} />
                            </section>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export const RetirementPage: React.FC = () => {
    const { user } = useAuth();
    // 1. Get All Relevant Data to build Net Worth for Projection
    const dataKey = user ? `finserve_client_data_${user.id}` : 'finserve_client_data_default';
    const [clientData] = usePersistentState(dataKey, DEFAULT_CLIENT_DATA);
    const [accounts] = usePersistentState(`finserve_accounts_${user?.id}`, [
        { id: 1, name: "Chase Checking", balance: 4250.00, type: "Bank", last4: "9921" },
        { id: 2, name: "Citi Savings", balance: 12500.00, type: "Bank", last4: "4582" },
    ]);
    const [retirement, setRetirement] = usePersistentState(`finserve_retirement_${user?.id}`, { rate401k: 12, rateRoth: 500, currentAge: 32, retireAge: 65 });
    
    // 2. Load Shared Holdings to calculate real investment value
    const [holdings] = usePersistentState(`finserve_holdings_${user?.id}`, DEFAULT_HOLDINGS);

    // Calculate Current Net Worth (Starting Principal)
    const walletBalance = clientData?.balance || 0;
    const bankBalance = accounts.reduce((acc: number, item: any) => acc + (item.balance || 0), 0);
    
    // Calculate Holdings Value Dynamically
    const investmentHoldingsValue = holdings.reduce((acc: number, h: any) => acc + (h.p * h.q), 0);

    const totalCurrentSavings = walletBalance + bankBalance + investmentHoldingsValue;
    
    // Projection Logic
    const years = retirement.retireAge - retirement.currentAge;
    const rate = 0.07; // 7% avg return
    // Compounded Principal + Future Contributions
    const projected = Math.floor(
        totalCurrentSavings * Math.pow(1 + rate, years) + 
        (retirement.rateRoth * 12 + (100000 * retirement.rate401k/100)) * ((Math.pow(1 + rate, years) - 1) / rate)
    );

    return (
        <div className="flex h-screen w-full bg-background-light dark:bg-background-dark">
            <ClientSidebar />
            <main className="flex-1 p-8 overflow-y-auto">
                 <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-6">Retirement Planner</h1>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                         <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Configuration</h3>
                         <div className="space-y-4">
                             <div>
                                 <label className="block text-sm font-bold text-slate-500 mb-1">Current Age</label>
                                 <input type="range" min="18" max="80" value={retirement.currentAge} onChange={e => setRetirement({...retirement, currentAge: parseInt(e.target.value)})} className="w-full accent-primary" />
                                 <div className="text-right font-bold text-slate-900 dark:text-white">{retirement.currentAge} years</div>
                             </div>
                             <div>
                                 <label className="block text-sm font-bold text-slate-500 mb-1">Retirement Age</label>
                                 <input type="range" min="50" max="90" value={retirement.retireAge} onChange={e => setRetirement({...retirement, retireAge: parseInt(e.target.value)})} className="w-full accent-primary" />
                                 <div className="text-right font-bold text-slate-900 dark:text-white">{retirement.retireAge} years</div>
                             </div>
                             <div>
                                 <label className="block text-sm font-bold text-slate-500 mb-1">401k Contribution (%)</label>
                                 <input type="number" value={retirement.rate401k} onChange={e => setRetirement({...retirement, rate401k: parseInt(e.target.value)})} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
                             </div>
                         </div>
                         <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-700">
                             <p className="text-sm text-slate-500 font-bold mb-2">Starting Principal (Net Worth)</p>
                             <p className="text-2xl font-black text-slate-900 dark:text-white">${totalCurrentSavings.toLocaleString()}</p>
                             <p className="text-xs text-slate-400 mt-1">Includes Wallet, Linked Accounts & Investments</p>
                         </div>
                     </div>
                     <div className="bg-primary text-white p-8 rounded-xl shadow-lg flex flex-col justify-center items-center text-center">
                         <span className="text-blue-200 font-bold uppercase tracking-widest text-sm mb-2">Projected Savings</span>
                         <span className="text-5xl font-black mb-4">${projected.toLocaleString()}</span>
                         <p className="text-blue-100 max-w-xs">Based on a conservative 7% annual return on your total net worth and current contribution levels.</p>
                     </div>
                 </div>
            </main>
        </div>
    );
};

export const AccountsPage: React.FC = () => {
    const { user } = useAuth();
    const [accounts] = usePersistentState(`finserve_accounts_${user?.id}`, [
        { id: 1, name: "Chase Checking", balance: 4250.00, type: "Bank", last4: "9921" },
        { id: 2, name: "Citi Savings", balance: 12500.00, type: "Bank", last4: "4582" },
    ]);

    return (
        <div className="flex h-screen w-full bg-background-light dark:bg-background-dark">
            <ClientSidebar />
            <main className="flex-1 p-8 overflow-y-auto">
                 <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-6">Connected Accounts</h1>
                 <div className="grid gap-4">
                     {accounts.map((acc: any) => (
                         <div key={acc.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex justify-between items-center">
                             <div className="flex items-center gap-4">
                                 <div className="size-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                     <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">account_balance</span>
                                 </div>
                                 <div>
                                     <h3 className="font-bold text-slate-900 dark:text-white">{acc.name}</h3>
                                     <p className="text-sm text-slate-500">**** **** **** {acc.last4}</p>
                                 </div>
                             </div>
                             <div className="text-right">
                                 <p className="text-xl font-black text-slate-900 dark:text-white">${acc.balance.toLocaleString()}</p>
                                 <p className="text-xs font-bold text-slate-500 uppercase">{acc.type}</p>
                             </div>
                         </div>
                     ))}
                     <button className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                         + Link External Account
                     </button>
                 </div>
            </main>
        </div>
    );
};

export const ReportsPage: React.FC = () => {
    return (
        <div className="flex h-screen w-full bg-background-light dark:bg-background-dark">
            <ClientSidebar />
            <main className="flex-1 p-8 overflow-y-auto flex items-center justify-center">
                 <div className="text-center text-slate-500">
                     <span className="material-symbols-outlined text-6xl mb-4">bar_chart</span>
                     <h2 className="text-2xl font-bold">Financial Reports</h2>
                     <p>Generate PDF reports of your performance in the Documents section.</p>
                 </div>
            </main>
        </div>
    );
};

export const DocumentsPage: React.FC = () => {
    const { user } = useAuth();
    const [docs] = usePersistentState(`finserve_documents_${user?.id}`, [
        { id: 101, category: 'Report', title: "Annual Tax Report", date: "2023", type: "PDF" },
        { id: 102, category: 'Report', title: "Q3 Investment Summary", date: "Oct 2023", type: "PDF" },
    ]);

    return (
        <div className="flex h-screen w-full bg-background-light dark:bg-background-dark">
            <ClientSidebar />
            <main className="flex-1 p-8 overflow-y-auto">
                 <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-6">Documents</h1>
                 <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                     <table className="w-full text-left text-sm">
                         <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 font-bold uppercase text-xs">
                             <tr>
                                 <th className="px-6 py-4">Name</th>
                                 <th className="px-6 py-4">Date</th>
                                 <th className="px-6 py-4">Type</th>
                                 <th className="px-6 py-4 text-right">Action</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                             {docs.map((doc: any) => (
                                 <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                     <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{doc.title}</td>
                                     <td className="px-6 py-4 text-slate-500">{doc.date}</td>
                                     <td className="px-6 py-4"><span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs font-bold">{doc.type}</span></td>
                                     <td className="px-6 py-4 text-right">
                                         <button className="text-primary font-bold hover:underline">Download</button>
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
            </main>
        </div>
    );
};

export const ConsultationPage: React.FC = () => {
    const [date, setDate] = useState('');
    const { user } = useAuth();
    const [bookings, setBookings] = usePersistentState('finserve_bookings', []);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setBookings([...bookings, { id: Date.now(), user: user?.name, date, status: 'Pending' }]);
        setSubmitted(true);
    };

    return (
        <div className="flex h-screen w-full bg-background-light dark:bg-background-dark">
            <ClientSidebar />
            <main className="flex-1 p-8 overflow-y-auto">
                 <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-6">Book Consultation</h1>
                 {submitted ? (
                     <div className="p-8 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl text-center">
                         <span className="material-symbols-outlined text-4xl mb-2">check_circle</span>
                         <h3 className="text-xl font-bold">Request Sent</h3>
                         <p>An advisor will contact you shortly to confirm.</p>
                     </div>
                 ) : (
                     <form onSubmit={handleSubmit} className="max-w-md bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                         <div className="mb-4">
                             <label className="block text-sm font-bold text-slate-500 mb-1">Preferred Date</label>
                             <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full p-3 border rounded-lg dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
                         </div>
                         <button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-blue-600">Request Appointment</button>
                     </form>
                 )}
            </main>
        </div>
    );
};

export const SettingsPage: React.FC = () => {
    const { user } = useAuth();
    return (
        <div className="flex h-screen w-full bg-background-light dark:bg-background-dark">
            <ClientSidebar />
            <main className="flex-1 p-8 overflow-y-auto">
                 <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-6">Settings</h1>
                 <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm max-w-2xl">
                     <div className="flex items-center gap-4 mb-8">
                         <div className="size-16 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                             <img src={`https://i.pravatar.cc/150?u=${user?.id}`} alt="Profile" />
                         </div>
                         <div>
                             <h3 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h3>
                             <p className="text-slate-500">{user?.email}</p>
                         </div>
                     </div>
                     <div className="space-y-4">
                         <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                             <span className="font-bold text-slate-700 dark:text-slate-300">Two-Factor Authentication</span>
                             <button className="text-primary font-bold">Enable</button>
                         </div>
                         <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                             <span className="font-bold text-slate-700 dark:text-slate-300">Email Notifications</span>
                             <input type="checkbox" defaultChecked className="accent-primary w-5 h-5" />
                         </div>
                     </div>
                 </div>
            </main>
        </div>
    );
};

export const InvestmentPortfolioPage: React.FC = () => {
    // 1. Get Client Data (Wallet Balance)
    const { user } = useAuth();
    const dataKey = user ? `finserve_client_data_${user.id}` : 'finserve_client_data_default';
    const [clientData] = usePersistentState(dataKey, DEFAULT_CLIENT_DATA);
    
    // 2. Get External Accounts
    const [accounts] = usePersistentState(`finserve_accounts_${user?.id}`, [
        { id: 1, name: "Chase Checking", balance: 4250.00, type: "Bank", last4: "9921" },
        { id: 2, name: "Citi Savings", balance: 12500.00, type: "Bank", last4: "4582" },
    ]);

    // 3. Performance data for chart (mock)
    const performanceData = [100, 102, 105, 104, 108, 112, 115, 113, 118, 122, 125, 130];
    const generateChartPath = (data: number[], width: number, height: number) => {
        const max = Math.max(...data);
        const min = Math.min(...data);
        const range = max - min;
        const stepX = width / (data.length - 1);
        
        return data.map((val, i) => {
            const x = i * stepX;
            const y = height - ((val - min) / range) * height * 0.8 - height * 0.1;
            return `${x},${y}`;
        }).join(' ');
    };

    // 4. Holdings Data (Use Shared State)
    const [holdings] = usePersistentState(`finserve_holdings_${user?.id}`, DEFAULT_HOLDINGS);

    // 5. Calculate Consolidated Wealth
    const cashBalance = clientData?.balance || 0; // "Wallet"
    const externalBankBalance = accounts.reduce((acc: number, item: any) => acc + (item.balance || 0), 0); // "Linked Accounts"
    
    const holdingsWithValues = holdings.map((h: any) => {
        const value = h.p * h.q;
        const change = (Math.sin(h.p) * 2.5).toFixed(2);
        return { ...h, v: value, c: Number(change) };
    });

    const stockVal = holdingsWithValues.filter((h: any) => h.type === 'Stock').reduce((a: any, b: any) => a + b.v, 0);
    const bondVal = holdingsWithValues.filter((h: any) => h.type === 'Bond').reduce((a: any, b: any) => a + b.v, 0);
    const cryptoVal = holdingsWithValues.filter((h: any) => h.type === 'Crypto').reduce((a: any, b: any) => a + b.v, 0);
    
    // Total Net Worth = Investments + Wallet Cash + Linked Bank Accounts
    const totalNetWorth = stockVal + bondVal + cryptoVal + cashBalance + externalBankBalance;
    
    // For allocation chart, treat External Banks as "Cash/Equivalents"
    const totalCashEquivalents = cashBalance + externalBankBalance;

    // Percentages
    const stockPct = totalNetWorth > 0 ? (stockVal / totalNetWorth) * 100 : 0;
    const bondPct = totalNetWorth > 0 ? (bondVal / totalNetWorth) * 100 : 0;
    const cryptoPct = totalNetWorth > 0 ? (cryptoVal / totalNetWorth) * 100 : 0;
    const cashPct = totalNetWorth > 0 ? (totalCashEquivalents / totalNetWorth) * 100 : 0;

    // Donut Gradient Stops
    const p1 = stockPct;
    const p2 = p1 + bondPct;
    const p3 = p2 + cryptoPct;
    
    const chartGradient = `conic-gradient(
        #3b82f6 0% ${p1}%, 
        #10b981 ${p1}% ${p2}%, 
        #f59e0b ${p2}% ${p3}%, 
        #ef4444 ${p3}% 100%
    )`;

    return (
        <div className="flex h-screen w-full bg-background-light dark:bg-background-dark">
            <ClientSidebar />
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Investment Portfolio</h1>
                        <p className="text-slate-500 dark:text-slate-400">Detailed performance analysis and risk assessment.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                         <button className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white">1M</button>
                         <button className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white">3M</button>
                         <button className="px-3 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded">YTD</button>
                         <button className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white">1Y</button>
                         <button className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white">ALL</button>
                    </div>
                </div>

                {/* Top Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Net Worth</span>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-2xl font-black text-slate-900 dark:text-white">${totalNetWorth.toLocaleString('en-US', {maximumFractionDigits: 0})}</span>
                            <span className="text-xs font-bold text-green-500">+8.4%</span>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">YTD Return</span>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-2xl font-black text-green-500">+12.4%</span>
                            <span className="text-xs font-bold text-slate-400">vs S&P 8.2%</span>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                         <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Beta</span>
                         <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-2xl font-black text-slate-900 dark:text-white">0.92</span>
                            <span className="text-xs font-bold text-slate-400">Moderate Risk</span>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                         <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Sharpe Ratio</span>
                         <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-2xl font-black text-slate-900 dark:text-white">1.45</span>
                            <span className="text-xs font-bold text-green-500">Excellent</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Performance Chart */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Portfolio Growth</h3>
                        <div className="w-full h-64 relative">
                             {/* Grid Lines */}
                             <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                 {[...Array(5)].map((_, i) => (
                                     <div key={i} className="w-full h-px bg-slate-100 dark:bg-slate-700"></div>
                                 ))}
                             </div>
                             {/* Chart */}
                             <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200" preserveAspectRatio="none">
                                <polyline 
                                    points={generateChartPath(performanceData, 500, 200)} 
                                    fill="none" 
                                    stroke="#137fec" 
                                    strokeWidth="4" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    className="drop-shadow-lg"
                                />
                             </svg>
                        </div>
                    </div>

                    {/* Allocation Donut */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Asset Allocation</h3>
                        <div className="flex-1 flex flex-col items-center justify-center relative">
                             {/* CSS Donut Chart */}
                             <div className="relative size-48 rounded-full border-[20px] border-slate-100 dark:border-slate-700 flex items-center justify-center">
                                 {/* Segments (Simulated with conic gradient) */}
                                 <div className="absolute inset-0 rounded-full" style={{
                                     background: chartGradient,
                                     mask: 'radial-gradient(transparent 60%, black 61%)',
                                     WebkitMask: 'radial-gradient(transparent 60%, black 61%)',
                                     transition: 'background 1s ease'
                                 }}></div>
                                 <div className="text-center z-10">
                                     <span className="text-xs font-bold text-slate-500 uppercase">Total Assets</span>
                                     <p className="text-2xl font-black text-slate-900 dark:text-white">${(totalNetWorth / 1000).toFixed(1)}k</p>
                                 </div>
                             </div>
                        </div>
                        <div className="mt-6 grid grid-cols-2 gap-4 text-xs">
                             <div className="flex items-center gap-2">
                                 <span className="size-3 rounded-full bg-blue-500"></span>
                                 <span className="text-slate-600 dark:text-slate-300">Stocks ({stockPct.toFixed(0)}%)</span>
                             </div>
                             <div className="flex items-center gap-2">
                                 <span className="size-3 rounded-full bg-green-500"></span>
                                 <span className="text-slate-600 dark:text-slate-300">Bonds ({bondPct.toFixed(0)}%)</span>
                             </div>
                             <div className="flex items-center gap-2">
                                 <span className="size-3 rounded-full bg-amber-500"></span>
                                 <span className="text-slate-600 dark:text-slate-300">Crypto ({cryptoPct.toFixed(0)}%)</span>
                             </div>
                             <div className="flex items-center gap-2">
                                 <span className="size-3 rounded-full bg-red-500"></span>
                                 <span className="text-slate-600 dark:text-slate-300">Cash & Banks ({cashPct.toFixed(0)}%)</span>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Holdings Table */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">Current Holdings</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase text-[11px] tracking-wider border-b border-slate-100 dark:border-slate-700">
                                <tr>
                                    <th className="px-6 py-4">Symbol</th>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4 text-right">Price</th>
                                    <th className="px-6 py-4 text-right">Shares</th>
                                    <th className="px-6 py-4 text-right">Value</th>
                                    <th className="px-6 py-4 text-right">Change (24h)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {holdingsWithValues.map((row: any, i: number) => (
                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{row.s}</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{row.n}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${row.type === 'Stock' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : row.type === 'Bond' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                                {row.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-slate-900 dark:text-white">${row.p.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400">{row.q}</td>
                                        <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">${row.v.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                        <td className={`px-6 py-4 text-right font-bold ${row.c >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {row.c >= 0 ? '+' : ''}{row.c}%
                                        </td>
                                    </tr>
                                ))}
                                <tr className="bg-slate-50 dark:bg-slate-800 font-bold border-t border-slate-200 dark:border-slate-700">
                                    <td colSpan={5} className="px-6 py-4 text-right text-slate-500 uppercase text-xs">Wallet Cash</td>
                                    <td className="px-6 py-4 text-right text-slate-900 dark:text-white">${cashBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                    <td></td>
                                </tr>
                                <tr className="bg-slate-50 dark:bg-slate-800 font-bold border-t border-slate-200 dark:border-slate-700">
                                    <td colSpan={5} className="px-6 py-4 text-right text-slate-500 uppercase text-xs">Linked Accounts</td>
                                    <td className="px-6 py-4 text-right text-slate-900 dark:text-white">${externalBankBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};