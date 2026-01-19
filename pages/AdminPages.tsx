import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AdminSidebar, usePersistentState, DEFAULT_USERS } from '../components/Shared';
import { supabase } from '../lib/supabaseClient';

// --- Constants & Config ---
// The ID used for the main demo user (alex.m@empower.com)
// matching the logic in AuthContext: email.toLowerCase().replace(/[^a-z0-9]/g, '')
const DEMO_USER_ID = 'alexmempowercom'; 

const DEFAULT_TRANSACTIONS = [
  { id: 'TXN-93821', user: 'Alex Morgan', amount: 1200.00, type: 'Wire Transfer', status: 'Completed', date: '2023-10-24' },
  { id: 'TXN-93822', user: 'Sarah Jenkins', amount: 450.00, type: 'Withdrawal', status: 'Pending', date: '2023-10-24' },
  { id: 'TXN-93823', user: 'Michael Chen', amount: 2500.00, type: 'Deposit', status: 'Completed', date: '2023-10-23' },
  { id: 'TXN-93824', user: 'Jessica Wong', amount: 150.00, type: 'Subscription', status: 'Failed', date: '2023-10-22' },
  { id: 'TXN-93825', user: 'David Smith', amount: 8000.00, type: 'Wire Transfer', status: 'Completed', date: '2023-10-21' },
];

const DEFAULT_SETTINGS = {
  platformName: "Empower",
  maintenanceMode: false,
  allowSignups: true,
  themeColor: "blue"
};

const DEFAULT_DOCUMENTS = [
    { id: 101, category: 'Report', title: "Annual Tax Report", date: "2023", type: "PDF" },
    { id: 102, category: 'Report', title: "Q3 Investment Summary", date: "Oct 2023", type: "PDF" },
    { id: 201, category: 'Document', title: "Identity_Verification.pdf", date: "Jan 12, 2023", type: "Verification" },
    { id: 202, category: 'Document', title: "Contract_Signed.pdf", date: "Feb 28, 2023", type: "Legal" },
];

const DEFAULT_ACCOUNTS = [
    { id: 1, name: "Chase Checking", balance: 4250.00, type: "Bank", last4: "9921" },
    { id: 2, name: "Citi Savings", balance: 12500.00, type: "Bank", last4: "4582" },
];

const DEFAULT_CLIENT_DATA = {
    name: 'Alex Morgan',
    email: 'alex.m@empower.com',
    balance: 1248300.00,
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

const DEFAULT_ARTICLES = [
    { id: 1, category: "Tech", title: "The Rise of DeFi in Traditional Banking", description: "Exploring how decentralized finance is reshaping the global banking infrastructure.", author: "James Wilson", date: "Oct 24, 2023", readTime: "5 min read", status: "Published", image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=2832&ixlib=rb-4.0.3" },
    { id: 2, category: "Market Watch", title: "Supply Chain Bottlenecks Ease", description: "Global shipping rates return to normal as production ramps up in key sectors.", author: "Elena Rodriguez", date: "Oct 22, 2023", readTime: "3 min read", status: "Published", image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3" }
];

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

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // We use the Shared user list
  const [users] = usePersistentState('finserve_users', DEFAULT_USERS);
  // We point to the Demo User's transactions to ensure stats reflect their dashboard
  const [transactions] = usePersistentState(`finserve_transactions_${DEMO_USER_ID}`, DEFAULT_TRANSACTIONS);
  const [settings] = usePersistentState('finserve_settings', DEFAULT_SETTINGS);
  const [bookings] = usePersistentState('finserve_bookings', []);

  const totalRevenue = transactions
    .filter((t: any) => t.status === 'Completed' && t.type !== 'Withdrawal')
    .reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);

  const activeUsers = users.filter((u: any) => u.status === 'Active').length;
  const pendingTxns = transactions.filter((t: any) => t.status === 'Pending').length;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark">
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex flex-col flex-1 min-w-0">
        <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 z-10 sticky top-0">
           <div className="flex items-center gap-4">
             <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white">
               <span className="material-symbols-outlined">menu</span>
             </button>
             <h2 className="hidden md:block text-slate-900 dark:text-white text-xl font-bold leading-tight">Dashboard: {settings.platformName}</h2>
           </div>
           <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-300 dark:border-slate-600">
                 <div className="w-full h-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs">AM</div>
              </div>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
               <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Volume</span>
                  <div className="p-1.5 bg-green-50 dark:bg-green-900/20 rounded text-green-600"><span className="material-symbols-outlined text-[18px]">trending_up</span></div>
               </div>
               <div className="flex flex-col gap-1">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">${totalRevenue.toLocaleString()}</span>
                  <span className="text-xs font-medium text-slate-500"><span className="text-green-600 font-bold">+12%</span> vs last month</span>
               </div>
            </div>
            {/* Other Stats Cards */}
            <div className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
               <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Users</span>
                  <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded text-blue-600"><span className="material-symbols-outlined text-[18px]">group</span></div>
               </div>
               <div className="flex flex-col gap-1">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">{activeUsers}</span>
                  <span className="text-xs font-medium text-slate-500">of {users.length} total</span>
               </div>
            </div>
            <div className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
               <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Txns</span>
                  <div className="p-1.5 bg-orange-50 dark:bg-orange-900/20 rounded text-orange-600"><span className="material-symbols-outlined text-[18px]">hourglass_empty</span></div>
               </div>
               <div className="flex flex-col gap-1">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">{pendingTxns}</span>
                  <span className="text-xs font-bold text-orange-600">Action Required</span>
               </div>
            </div>
            <div className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
               <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Consultations</span>
                  <div className="p-1.5 bg-purple-50 dark:bg-purple-900/20 rounded text-purple-600"><span className="material-symbols-outlined text-[18px]">event</span></div>
               </div>
               <div className="flex flex-col gap-1">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">{bookings.length}</span>
                  <span className="text-xs font-medium text-slate-500">Upcoming appointments</span>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Bookings List */}
              <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                      <h3 className="font-bold text-slate-900 dark:text-white">Recent Consultation Requests</h3>
                      <Link to="/admin/users" className="text-xs text-primary font-bold hover:underline">View All</Link>
                  </div>
                  <div className="flex-1 overflow-y-auto max-h-[300px]">
                      {bookings.length > 0 ? (
                          <div className="divide-y divide-slate-100 dark:divide-slate-800">
                              {bookings.map((booking: any) => (
                                  <div key={booking.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                      <div className="flex items-center gap-3">
                                          <div className="size-10 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full flex items-center justify-center">
                                              <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                                          </div>
                                          <div>
                                              <p className="text-sm font-bold text-slate-900 dark:text-white">{booking.user}</p>
                                              <p className="text-xs text-slate-500">{booking.date}</p>
                                          </div>
                                      </div>
                                      <span className="px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                          {booking.status}
                                      </span>
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <div className="p-8 text-center text-slate-500">No pending consultations.</div>
                      )}
                  </div>
              </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = usePersistentState('finserve_users', DEFAULT_USERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.id) {
        setUsers(users.map((u: any) => u.id === currentUser.id ? currentUser : u));
        await supabase.from('users').update(currentUser).eq('id', currentUser.id);
    } else {
        // Omit the password from the user data before inserting it into the database.
        const { password, ...userToInsert } = currentUser;
        const { data, error } = await supabase
            .from('users')
            .insert(userToInsert)
            .select(); // Use .select() to get the new record back.

        if (error) {
            console.error("Error creating user:", error);
        } else if (data) {
            // Add the new user to the local state.
            setUsers([...users, data[0]]);
        }
    }
    setIsModalOpen(false);
  };

  const confirmDelete = async () => {
      if(deleteId !== null) {
          setUsers(users.filter((u: any) => u.id !== deleteId));
          await supabase.from('users').delete().eq('id', deleteId);
          setDeleteId(null);
      }
  };

  const openEdit = (user: any) => { setCurrentUser({ ...user, password: '' }); setIsModalOpen(true); };
  const openCreate = () => { setCurrentUser({ name: '', email: '', password: '', role: 'User', status: 'Active', plan: 'Basic' }); setIsModalOpen(true); };

  return (
    <div className="flex h-screen w-full bg-background-light dark:bg-background-dark">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex justify-between items-center px-6 py-4 bg-white dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800">
           <h2 className="text-xl font-bold text-slate-900 dark:text-white">User Management</h2>
           <button onClick={openCreate} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-sm hover:bg-blue-600">+ Add User</button>
        </header>
        <div className="p-6 overflow-y-auto">
             <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                        <tr><th className="px-6 py-4">Name</th><th className="px-6 py-4">Email</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {users.map((user: any) => (
                        <tr key={user.id}>
                            <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{user.name}</td>
                            <td className="px-6 py-4 text-slate-500">{user.email}</td>
                            <td className="px-6 py-4">{user.role}</td>
                            <td className="px-6 py-4">{user.status}</td>
                            <td className="px-6 py-4 text-right">
                                <button onClick={() => openEdit(user)} className="text-primary mr-3 font-bold text-xs">Edit</button>
                                <button onClick={() => setDeleteId(user.id)} className="text-red-500 font-bold text-xs">Delete</button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentUser?.id ? 'Edit User' : 'Add User'}>
          <form onSubmit={handleSave} className="flex flex-col gap-4">
              <input placeholder="Name" className="p-2 border rounded" value={currentUser?.name} onChange={e => setCurrentUser({...currentUser, name: e.target.value})} />
              <input placeholder="Email" className="p-2 border rounded" value={currentUser?.email} onChange={e => setCurrentUser({...currentUser, email: e.target.value})} />
              <input placeholder="Password" type="password" className="p-2 border rounded" value={currentUser?.password} onChange={e => setCurrentUser({...currentUser, password: e.target.value})} />
              <button type="submit" className="bg-primary text-white p-2 rounded">Save</button>
          </form>
      </Modal>
      <Modal isOpen={deleteId !== null} onClose={() => setDeleteId(null)} title="Delete User">
          <p className="text-slate-600 dark:text-slate-300 mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>
          <div className="flex gap-4">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white font-bold rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors">Delete</button>
          </div>
      </Modal>
    </div>
  );
};

export const AdminContentPage: React.FC = () => {
    const [articles, setArticles] = usePersistentState('finserve_articles', DEFAULT_ARTICLES);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentArticle, setCurrentArticle] = useState<any>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (currentArticle.id) {
            setArticles(articles.map((a: any) => a.id === currentArticle.id ? currentArticle : a));
            await supabase.from('articles').update(currentArticle).eq('id', currentArticle.id);
        } else {
            const newArticle = { ...currentArticle, id: Date.now(), status: 'Published' };
            setArticles([...articles, newArticle]);
            await supabase.from('articles').insert(newArticle);
        }
        setIsModalOpen(false);
    };

    const confirmDelete = async () => {
        if(deleteId !== null) {
            setArticles(articles.filter((a: any) => a.id !== deleteId));
            await supabase.from('articles').delete().eq('id', deleteId);
            setDeleteId(null);
        }
    };

    const openEdit = (a: any) => { setCurrentArticle(a); setIsModalOpen(true); };
    const openCreate = () => { setCurrentArticle({ title: '', category: 'General', author: '', date: new Date().toLocaleDateString(), description: '' }); setIsModalOpen(true); };

    return (
        <div className="flex h-screen w-full bg-background-light dark:bg-background-dark">
            <AdminSidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <header className="flex justify-between items-center px-6 py-4 bg-white dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Content Management</h2>
                    <button onClick={openCreate} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-sm hover:bg-blue-600">+ New Article</button>
                </header>
                <div className="p-6 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Author</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {articles.map((article: any) => (
                                    <tr key={article.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{article.title}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">{article.category}</span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">{article.author}</td>
                                        <td className="px-6 py-4 text-slate-500">{article.date}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => openEdit(article)} className="text-primary mr-3 font-bold text-xs">Edit</button>
                                            <button onClick={() => setDeleteId(article.id)} className="text-red-500 font-bold text-xs">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentArticle?.id ? 'Edit Article' : 'New Article'}>
                <form onSubmit={handleSave} className="flex flex-col gap-4">
                    <input placeholder="Title" className="p-2 border rounded" value={currentArticle?.title} onChange={e => setCurrentArticle({...currentArticle, title: e.target.value})} required />
                    <input placeholder="Category" className="p-2 border rounded" value={currentArticle?.category} onChange={e => setCurrentArticle({...currentArticle, category: e.target.value})} required />
                    <input placeholder="Author" className="p-2 border rounded" value={currentArticle?.author} onChange={e => setCurrentArticle({...currentArticle, author: e.target.value})} required />
                    <textarea placeholder="Description" className="p-2 border rounded" value={currentArticle?.description} onChange={e => setCurrentArticle({...currentArticle, description: e.target.value})} />
                    <button type="submit" className="bg-primary text-white p-2 rounded font-bold">Save Article</button>
                </form>
            </Modal>
            <Modal isOpen={deleteId !== null} onClose={() => setDeleteId(null)} title="Delete Article">
                <p className="text-slate-600 dark:text-slate-300 mb-6">Are you sure you want to delete this article?</p>
                <div className="flex gap-4">
                    <button onClick={() => setDeleteId(null)} className="flex-1 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white font-bold rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
                    <button onClick={confirmDelete} className="flex-1 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors">Delete</button>
                </div>
            </Modal>
        </div>
    );
};

export const AdminDocumentsPage: React.FC = () => {
    // Target the demo user's documents
    const [docs, setDocs] = usePersistentState(`finserve_documents_${DEMO_USER_ID}`, DEFAULT_DOCUMENTS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentDoc, setCurrentDoc] = useState<any>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (currentDoc.id) {
            setDocs(docs.map((d: any) => d.id === currentDoc.id ? currentDoc : d));
            await supabase.from('documents').update(currentDoc).eq('id', currentDoc.id);
        } else {
            const newDoc = { ...currentDoc, id: Date.now() };
            setDocs([...docs, newDoc]);
            await supabase.from('documents').insert(newDoc);
        }
        setIsModalOpen(false);
    };

    const confirmDelete = async () => {
        if(deleteId !== null) {
            setDocs(docs.filter((d: any) => d.id !== deleteId));
            await supabase.from('documents').delete().eq('id', deleteId);
            setDeleteId(null);
        }
    };

    const openEdit = (doc: any) => { setCurrentDoc(doc); setIsModalOpen(true); };
    const openCreate = () => { setCurrentDoc({ category: 'Document', title: '', date: new Date().toLocaleDateString(), type: 'PDF' }); setIsModalOpen(true); };

    return (
        <div className="flex h-screen w-full bg-background-light dark:bg-background-dark">
            <AdminSidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <header className="flex justify-between items-center px-6 py-4 bg-white dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Documents & Reports</h2>
                    <button onClick={openCreate} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-blue-600">+ Add Item</button>
                </header>
                <div className="p-6 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {docs.map((doc: any) => (
                                    <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{doc.title}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${doc.category === 'Report' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {doc.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">{doc.date}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => openEdit(doc)} className="text-primary mr-3 font-bold text-xs">Edit</button>
                                            <button onClick={() => setDeleteId(doc.id)} className="text-red-500 font-bold text-xs">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentDoc?.id ? 'Edit Item' : 'New Item'}>
                <form onSubmit={handleSave} className="flex flex-col gap-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                        <select className="w-full mt-1 p-2 border rounded bg-transparent" value={currentDoc?.category} onChange={e => setCurrentDoc({...currentDoc, category: e.target.value})}>
                            <option>Document</option>
                            <option>Report</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Title</label>
                        <input className="w-full mt-1 p-2 border rounded bg-transparent" value={currentDoc?.title} onChange={e => setCurrentDoc({...currentDoc, title: e.target.value})} required />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Date</label>
                        <input className="w-full mt-1 p-2 border rounded bg-transparent" value={currentDoc?.date} onChange={e => setCurrentDoc({...currentDoc, date: e.target.value})} required />
                    </div>
                    <button type="submit" className="w-full py-2 bg-primary text-white rounded font-bold">Save Item</button>
                </form>
            </Modal>
            <Modal isOpen={deleteId !== null} onClose={() => setDeleteId(null)} title="Delete Item">
                <p className="text-slate-600 dark:text-slate-300 mb-6">Are you sure you want to delete this item?</p>
                <div className="flex gap-4">
                    <button onClick={() => setDeleteId(null)} className="flex-1 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white font-bold rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
                    <button onClick={confirmDelete} className="flex-1 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors">Delete</button>
                </div>
            </Modal>
        </div>
    );
};

// Extracted Component to handle specific user data context
const ClientDataEditor: React.FC<{ userId: string, initialName: string, initialEmail: string }> = ({ userId, initialName, initialEmail }) => {
    // Shared state hooks target the specific userId provided by props
    const [clientData, setClientData] = usePersistentState(`finserve_client_data_${userId}`, {
        ...DEFAULT_CLIENT_DATA,
        name: initialName,
        email: initialEmail
    });
    const [accounts, setAccounts] = usePersistentState(`finserve_accounts_${userId}`, DEFAULT_ACCOUNTS);
    const [retirement, setRetirement] = usePersistentState(`finserve_retirement_${userId}`, { rate401k: 12, rateRoth: 500 });
    
    // UI State
    const [activeTab, setActiveTab] = useState<'General' | 'Accounts' | 'Retirement'>('General');
    const [jsonStr, setJsonStr] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);
    const [fundAmount, setFundAmount] = useState('');

    // Sync local json string when tab or data changes
    useEffect(() => {
        if (activeTab === 'General') setJsonStr(JSON.stringify(clientData, null, 2));
        if (activeTab === 'Accounts') setJsonStr(JSON.stringify(accounts, null, 2));
        if (activeTab === 'Retirement') setJsonStr(JSON.stringify(retirement, null, 2));
        setError(null);
    }, [activeTab, clientData, accounts, retirement]);

    const handleUpdate = async () => {
        try {
            const parsed = JSON.parse(jsonStr);
            if (activeTab === 'General') {
                setClientData(parsed);
                await supabase.from('client_data').update({ data: parsed }).eq('id', 1);
            }
            if (activeTab === 'Accounts') {
                setAccounts(parsed);
                // In a real app we'd bulk update.
            }
            if (activeTab === 'Retirement') {
                setRetirement(parsed);
                await supabase.from('retirement_settings').update(parsed).eq('id', 1);
            }
            
            setError(null);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (e:any) {
            setError("Invalid JSON format: " + e.message);
        }
    };

    const handleFundAdjustment = (type: 'add' | 'remove') => {
        const amount = parseFloat(fundAmount);
        if (isNaN(amount) || amount <= 0) {
            return;
        }

        const adjustmentMultiplier = type === 'add' ? 1 : -1;
        const newBalance = (clientData.balance || 0) + amount * adjustmentMultiplier;

        // Recalculate budget
        const newBudget = clientData.budget.map((item: any) => {
            const adjustment = amount * (item.limit / clientData.balance) * adjustmentMultiplier;
            return { ...item, limit: item.limit + adjustment };
        });

        // Recalculate retirement
        const retirementAdjustment = amount * 0.01 * adjustmentMultiplier;
        const newRetirement = {
            ...retirement,
            rate401k: retirement.rate401k + retirementAdjustment,
        };
        setRetirement(newRetirement);

        const newData = { ...clientData, balance: newBalance, budget: newBudget };
        setClientData(newData);
        setFundAmount('');
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const tabs = ['General', 'Accounts', 'Retirement'];

    return (
        <div className="flex flex-col h-full">
            <header className="flex flex-col md:flex-row justify-between items-center px-6 py-4 bg-white dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 gap-4">
                <div className="flex items-center gap-4">
                     <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        {tabs.map(tab => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${activeTab === tab ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
                <button onClick={handleUpdate} className={`px-6 py-2 rounded-lg text-sm font-bold text-white transition-colors ${saved ? 'bg-green-500' : 'bg-primary hover:bg-blue-600'}`}>
                    {saved ? 'Saved!' : 'Save JSON'}
                </button>
            </header>
            
            <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6">
                {/* Wallet Management Section - Only visible on General Tab */}
                {activeTab === 'General' && (
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                            Wallet Management
                        </h3>
                        <div className="flex flex-col sm:flex-row items-end gap-6">
                            <div className="flex-1 w-full">
                                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Current Balance</label>
                                <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                                    ${(clientData.balance || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                </div>
                            </div>
                            <div className="flex-1 w-full">
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Manual Adjustment</label>
                                    <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                        <input 
                                            type="number" 
                                            className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary dark:text-white font-bold transition-all"
                                            placeholder="0.00"
                                            value={fundAmount}
                                            onChange={e => setFundAmount(e.target.value)}
                                        />
                                    </div>
                                    <button onClick={() => handleFundAdjustment('add')} className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-green-500/20 active:scale-95 transform">
                                        Add Funds
                                    </button>
                                    <button onClick={() => handleFundAdjustment('remove')} className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-red-500/20 active:scale-95 transform">
                                        Remove Funds
                                    </button>
                                    </div>
                            </div>
                        </div>
                    </div>
                )}

                {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm font-bold">{error}</div>}
                
                <div className="flex-1 min-h-[400px] border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm relative flex flex-col">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <span className="text-[10px] font-mono text-slate-500 font-bold uppercase ml-2">Raw JSON Editor</span>
                        <span className="text-[10px] font-mono text-slate-400">finserve_{activeTab.toLowerCase().replace(' ', '_')}</span>
                    </div>
                    <textarea 
                        className="flex-1 w-full p-4 font-mono text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none resize-none"
                        value={jsonStr}
                        onChange={(e) => setJsonStr(e.target.value)}
                        spellCheck={false}
                    />
                </div>
                <div className="text-xs text-slate-500">
                    <strong>Warning:</strong> Modifying JSON directly will instantly update the Client App for {initialName}. Ensure syntax is correct.
                </div>
            </div>
        </div>
    );
};

export const AdminClientDataPage: React.FC = () => {
    // Fetch all users to populate the selector
    const [users] = usePersistentState('finserve_users', DEFAULT_USERS);
    // Use Alex's email as default selection
    const [selectedEmail, setSelectedEmail] = useState('alex.m@empower.com');

    // Derived state: Find the full user object based on selection
    const selectedUser = users.find((u: any) => u.email === selectedEmail) || users[0];
    
    // Generate the consistent User ID used by the App logic (AuthContext)
    // Formula: email -> lowercase -> remove non-alphanumeric
    const userId = selectedUser ? selectedUser.email.toLowerCase().replace(/[^a-z0-9]/g, '') : 'default';

    return (
        <div className="flex h-screen w-full bg-background-light dark:bg-background-dark">
            <AdminSidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 py-4 bg-white dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Client Data Editor</h2>
                        <p className="text-xs text-slate-500">Manage balances and data for specific clients.</p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
                            <span className="material-symbols-outlined text-slate-500">person_search</span>
                            <select 
                                value={selectedEmail}
                                onChange={(e) => setSelectedEmail(e.target.value)}
                                className="bg-transparent border-none outline-none text-sm font-bold text-slate-700 dark:text-slate-200 w-full sm:w-64 cursor-pointer"
                            >
                                {users.map((u: any) => (
                                    <option key={u.id} value={u.email}>{u.name} ({u.role})</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </header>
                
                {/* 
                   We use the `key` prop here to force React to completely re-mount 
                   the Editor component when the user changes. This ensures the 
                   usePersistentState hooks inside initialize with the new user's keys.
                */}
                <ClientDataEditor 
                    key={userId} 
                    userId={userId} 
                    initialName={selectedUser?.name || 'User'} 
                    initialEmail={selectedUser?.email || ''} 
                />
            </div>
        </div>
    );
};

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = usePersistentState('finserve_settings', DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
      setSaved(true);
      await supabase.from('settings').update(settings).eq('id', 1);
      setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark">
      <AdminSidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 z-10 sticky top-0">
           <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight">System Settings</h2>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth">
             <div className="max-w-2xl mx-auto bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-8">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Platform Name</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                            value={settings.platformName}
                            onChange={(e) => setSettings({...settings, platformName: e.target.value})}
                        />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Maintenance Mode</h4>
                        </div>
                        <input type="checkbox" checked={settings.maintenanceMode} onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})} className="accent-primary w-5 h-5" />
                    </div>
                </div>
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                    <button onClick={handleSave} className={`px-6 py-2 font-bold rounded-lg transition-all shadow-sm ${saved ? 'bg-green-500 text-white' : 'bg-primary text-white'}`}>
                        {saved ? 'Saved' : 'Save Changes'}
                    </button>
                </div>
             </div>
        </main>
      </div>
    </div>
  );
};

export const AdminTransactionsPage: React.FC = () => {
  // Target the Demo User's transactions so they show up on the Client Dashboard
  const [transactions, setTransactions] = usePersistentState(`finserve_transactions_${DEMO_USER_ID}`, DEFAULT_TRANSACTIONS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTxn, setCurrentTxn] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (transactions.find((t: any) => t.id === currentTxn.id)) {
        setTransactions(transactions.map((t: any) => t.id === currentTxn.id ? currentTxn : t));
        await supabase.from('transactions').update(currentTxn).eq('id', currentTxn.id);
    } else {
        const newTxn = { ...currentTxn, id: `TXN-${Date.now()}` };
        setTransactions([newTxn, ...transactions]);
        await supabase.from('transactions').insert(newTxn);
    }
    setIsModalOpen(false);
  };

  const confirmDelete = async () => {
      if(deleteId !== null) {
          setTransactions(transactions.filter((t: any) => t.id !== deleteId));
          await supabase.from('transactions').delete().eq('id', deleteId);
          setDeleteId(null);
      }
  };

  const openEdit = (txn: any) => { setCurrentTxn(txn); setIsModalOpen(true); };
  const openCreate = () => { setCurrentTxn({ user: 'Alex Morgan', amount: '', type: 'Wire Transfer', status: 'Pending', date: new Date().toISOString().split('T')[0] }); setIsModalOpen(true); };

  return (
    <div className="flex h-screen w-full bg-background-light dark:bg-background-dark">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex justify-between items-center px-6 py-4 bg-white dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800">
           <h2 className="text-xl font-bold text-slate-900 dark:text-white">Transactions</h2>
           <button onClick={openCreate} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-blue-600">+ New</button>
        </header>
        <div className="p-6 overflow-y-auto">
             <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                        <tr><th className="px-6 py-4">ID</th><th className="px-6 py-4">User</th><th className="px-6 py-4">Amount</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {transactions.map((txn: any) => (
                        <tr key={txn.id}>
                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{txn.id}</td>
                            <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{txn.user}</td>
                            <td className="px-6 py-4">${txn.amount}</td>
                            <td className="px-6 py-4">{txn.status}</td>
                            <td className="px-6 py-4 text-right">
                                <button onClick={() => openEdit(txn)} className="text-primary mr-3 font-bold text-xs">Edit</button>
                                <button onClick={() => setDeleteId(txn.id)} className="text-red-500 font-bold text-xs">Delete</button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Edit Transaction">
          <form onSubmit={handleSave} className="flex flex-col gap-4">
              <input placeholder="User" className="p-2 border rounded" value={currentTxn?.user} onChange={e => setCurrentTxn({...currentTxn, user: e.target.value})} />
              <input placeholder="Amount" type="number" className="p-2 border rounded" value={currentTxn?.amount} onChange={e => setCurrentTxn({...currentTxn, amount: e.target.value})} />
              <button type="submit" className="bg-primary text-white p-2 rounded">Save</button>
          </form>
      </Modal>
      <Modal isOpen={deleteId !== null} onClose={() => setDeleteId(null)} title="Delete Transaction">
          <p className="text-slate-600 dark:text-slate-300 mb-6">Are you sure you want to delete this transaction?</p>
          <div className="flex gap-4">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white font-bold rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors">Delete</button>
          </div>
      </Modal>
    </div>
  );
};