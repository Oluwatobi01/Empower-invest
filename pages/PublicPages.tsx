import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { usePersistentState, useAuth, DEFAULT_USERS } from '../components/Shared';
import { supabase } from '../lib/supabaseClient';

// --- Shared Components ---

const InsightNav: React.FC = () => {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;
    const linkClass = (path: string) => `text-sm font-medium transition-colors ${isActive(path) ? 'text-primary font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-primary'}`;

    return (
        <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#101922]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
            <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-8">
                     <Link to="/" className="flex items-center gap-2">
                        <div className="text-primary text-2xl"><span className="material-symbols-outlined">account_balance_wallet</span></div>
                        <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">Empower</span>
                     </Link>
                     <nav className="hidden md:flex gap-6">
                        <Link to="/insights" className={linkClass('/insights')}>Home</Link>
                        <Link to="/markets" className={linkClass('/markets')}>Markets</Link>
                        <Link to="/analysis" className={linkClass('/analysis')}>Analysis</Link>
                        <Link to="/policy" className={linkClass('/policy')}>Policy</Link>
                        <Link to="/tech" className={linkClass('/tech')}>Tech</Link>
                        <Link to="/portfolios" className={linkClass('/portfolios')}>Portfolios</Link>
                     </nav>
                </div>
                <div className="flex items-center gap-4">
                    <button className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 relative">
                        <span className="material-symbols-outlined filled">notifications</span>
                        <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900"></span>
                    </button>
                     <div className="size-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                        <img src="https://i.pravatar.cc/150?u=5" alt="User" className="w-full h-full object-cover opacity-90" />
                    </div>
                </div>
            </div>
        </header>
    );
}

// Default articles seed
const DEFAULT_ARTICLES = [
    { id: 1, category: "Tech", title: "The Rise of DeFi in Traditional Banking", description: "Exploring how decentralized finance is reshaping the global banking infrastructure.", author: "James Wilson", date: "Oct 24, 2023", readTime: "5 min read", status: "Published", image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=2832&ixlib=rb-4.0.3" },
    { id: 2, category: "Market Watch", title: "Supply Chain Bottlenecks Ease", description: "Global shipping rates return to normal as production ramps up in key sectors.", author: "Elena Rodriguez", date: "Oct 22, 2023", readTime: "3 min read", status: "Published", image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3" }
];

// --- Page Components ---

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isBooking, setIsBooking] = useState(false);
  const { user, logout } = useAuth();
  
  // Use a unique key per user, or default. 
  // If not logged in, we show default data.
  // If logged in, we fetch their data.
  const dataKey = user ? `finserve_client_data_${user.id}` : 'finserve_client_data_default';
  
  // Initialize default data with $100.00 to match screenshot for new users/default view
  const [clientData] = usePersistentState(dataKey, { balance: 100.00 });

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBooking = () => {
    setIsBooking(true);
    setTimeout(() => {
      setIsBooking(false);
      navigate('/consultation');
    }, 500);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col font-display overflow-x-hidden bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
                 <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Empower</span>
            </div>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#services" onClick={(e) => scrollToSection(e, 'services')} className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-primary transition-colors">Services</a>
              <a href="#how-it-works" onClick={(e) => scrollToSection(e, 'how-it-works')} className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-primary transition-colors">How It Works</a>
              <Link to="/insights" className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-primary transition-colors">Resources</Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {user ? (
                  <>
                    <Link to="/tools" className="hidden sm:inline-flex items-center justify-center h-10 px-5 text-sm font-bold text-white bg-primary rounded-lg hover:bg-blue-600 transition-colors shadow-sm">
                        Dashboard
                    </Link>
                    <button onClick={logout} className="hidden sm:inline-flex items-center justify-center h-10 px-4 text-sm font-bold text-slate-500 hover:text-red-500 transition-colors">
                        Log Out
                    </button>
                  </>
              ) : (
                  <Link to="/connect" className="hidden sm:inline-flex items-center justify-center h-10 px-5 text-sm font-bold text-white bg-primary rounded-lg hover:bg-blue-600 transition-colors shadow-sm">
                    Client Login
                  </Link>
              )}
              
              {/* Only show Admin Portal to Admins */}
              {user?.role === 'Admin' && (
                  <Link to="/admin" className="hidden sm:inline-flex items-center justify-center h-10 px-5 text-sm font-bold text-slate-700 dark:text-white bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    Admin Portal
                  </Link>
              )}
              
              <button className="md:hidden text-slate-600 dark:text-slate-300">
                <span className="material-symbols-outlined text-3xl">menu</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="pt-16 pb-20 lg:pt-24 lg:pb-32 overflow-hidden">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              
              {/* Text Content */}
              <div className="flex flex-col items-start text-left max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 mb-8 border border-blue-100 dark:border-blue-800">
                  <span className="material-symbols-outlined text-primary text-[16px]">verified_user</span>
                  <span className="text-[11px] font-bold text-primary uppercase tracking-wider">SEC Registered</span>
                </div>
                
                <h1 className="text-5xl sm:text-6xl font-black leading-[1.1] tracking-tight text-slate-900 dark:text-white mb-6">
                  Future-Proof <br/>
                  <span className="text-primary">Your Wealth</span>
                </h1>
                
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                  Comprehensive management for the modern investor. Join thousands securing their retirement with our bank-level platform today.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <Link to={user ? "/retirement" : "/connect"} className="inline-flex items-center justify-center h-12 px-8 text-base font-bold text-white bg-primary rounded-lg hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20">
                    Start Your Financial Plan <span className="material-symbols-outlined ml-2 text-[20px]">arrow_forward</span>
                  </Link>
                  <button 
                    onClick={handleBooking}
                    className="inline-flex items-center justify-center h-12 px-8 text-base font-bold text-slate-700 dark:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    {isBooking ? 'Redirecting...' : 'Book a Consultation'}
                  </button>
                </div>
              </div>

              {/* Hero Image / Tablet Mockup */}
              <div className="relative w-full">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl -z-10"></div>
                
                {/* Tablet Frame */}
                <div className="relative mx-auto bg-slate-900 rounded-[2rem] p-3 shadow-2xl shadow-slate-900/20 w-full max-w-lg transform rotate-1 hover:rotate-0 transition-transform duration-700">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-800 rounded-b-xl"></div>
                  <div className="rounded-[1.5rem] overflow-hidden bg-slate-800 aspect-[4/3] relative">
                     {/* Screen Content */}
                     <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2670&ixlib=rb-4.0.3" alt="Dashboard" className="w-full h-full object-cover opacity-80" />
                     <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                  </div>
                </div>

                {/* Floating Card */}
                <div className="absolute bottom-8 -left-4 sm:-left-12 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="flex items-center justify-between gap-8 mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Assets</span>
                        <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-bold px-1.5 py-0.5 rounded">+12.5%</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                        ${(clientData?.balance || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-24 bg-white dark:bg-slate-900">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mb-16">
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-6">Our Services</h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                        We provide a holistic approach to managing your finances, combining human expertise with powerful technology.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Card 1 */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="size-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-3xl">show_chart</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Wealth Management</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                            Personalized portfolios built for your risk tolerance and financial goals using advanced algorithmic rebalancing.
                        </p>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="size-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-3xl">strategy</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Retirement Planning</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                            Detailed projections and tax-efficient withdrawal strategies that ensure you outlive your savings comfortably.
                        </p>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="size-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-3xl">link</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Account Connectivity</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                            See your entire financial life in one dashboard. Connect bank accounts, loans, and external investments securely.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-primary text-white">
            <div className="max-w-4xl mx-auto px-4 text-center">
                <h2 className="text-4xl sm:text-5xl font-black mb-6">Ready to secure your future?</h2>
                <p className="text-xl text-blue-100 mb-10">Join over 50,000 investors who trust Empower with their financial future.</p>
                <div className="flex justify-center">
                    <Link to="/connect" className="bg-white text-primary px-10 py-4 rounded-xl font-bold text-lg shadow-xl shadow-blue-900/20 hover:bg-slate-50 transition-all transform hover:-translate-y-1">
                        Get Started Now
                    </Link>
                </div>
            </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
           <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
               <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
                   <p>© 2024 Empower Inc. All rights reserved.</p>
                   <div className="flex gap-6">
                       <a href="#" className="hover:text-slate-600 dark:hover:text-slate-200">Privacy Policy</a>
                       <a href="#" className="hover:text-slate-600 dark:hover:text-slate-200">Terms of Service</a>
                   </div>
               </div>
           </div>
      </footer>
    </div>
  );
};

export const ConnectPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  // Access shared user state to register new users
  const [users, setUsers] = usePersistentState('finserve_users', DEFAULT_USERS);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    
    try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Use the auth context login
        const displayName = name || email.split('@')[0];
        login(email, displayName);
        
        // Ensure user exists in the admin list
        const existingUser = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
        if (!existingUser) {
            const newUser = {
                id: Date.now(),
                name: displayName,
                email: email,
                role: email.toLowerCase().includes('admin') ? 'Admin' : 'User',
                status: 'Active',
                plan: 'Basic'
            };
            setUsers([...users, newUser]);
        }
        
        setSuccess(true);
        setTimeout(() => {
            // Redirect based on role logic in AuthContext (implied or manual check)
            if (email.toLowerCase().includes('admin')) {
                navigate('/admin');
            } else {
                navigate('/tools');
            }
        }, 1500);
    } catch (error: any) {
        console.error('Error connecting to database:', error);
        setErrorMsg(error.message || 'Failed to authenticate. Please try again.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen font-display text-slate-900 dark:text-white flex flex-col">
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#101922]/90 backdrop-blur-md">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3 cursor-pointer">
              <div className="text-primary"><span className="material-symbols-outlined text-3xl">verified_user</span></div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Empower</span>
            </Link>
          </div>
        </div>
      </nav>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
             <div className="p-8">
                 <div className="text-center mb-8">
                     <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{isLoginMode ? 'Welcome Back' : 'Create Account'}</h1>
                     <p className="text-slate-500 dark:text-slate-400">Join thousands of investors securing their future.</p>
                 </div>
                 
                 {errorMsg && (
                     <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm text-center">
                         {errorMsg}
                     </div>
                 )}

                 {success ? (
                     <div className="text-center py-8">
                         <div className="size-16 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                             <span className="material-symbols-outlined text-3xl">check</span>
                         </div>
                         <h3 className="text-lg font-bold text-slate-900 dark:text-white">Authenticated!</h3>
                         <p className="text-slate-500 text-sm">Redirecting...</p>
                     </div>
                 ) : (
                     <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                         {!isLoginMode && (
                             <div>
                                 <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                                 <input 
                                    type="text" 
                                    className="w-full mt-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary dark:text-white transition-all"
                                    placeholder="Alex Morgan"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                 />
                             </div>
                         )}
                         <div>
                             <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                             <input 
                                required 
                                type="email" 
                                className="w-full mt-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary dark:text-white transition-all"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                             />
                         </div>
                         <div>
                             <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
                             <input 
                                required 
                                type="password" 
                                className="w-full mt-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary dark:text-white transition-all"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                             />
                         </div>
                         <button 
                            type="submit" 
                            disabled={loading}
                            className={`mt-4 w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                         >
                             {loading ? (
                                 <>
                                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                                    {isLoginMode ? 'Logging in...' : 'Creating Account...'}
                                 </>
                             ) : (isLoginMode ? 'Log In' : 'Get Started')}
                         </button>
                     </form>
                 )}
                 
                 {!success && (
                     <div className="mt-6 text-center">
                         <p className="text-xs text-slate-400">
                             {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                             <button onClick={() => setIsLoginMode(!isLoginMode)} className="text-primary font-bold hover:underline">
                                 {isLoginMode ? 'Sign up' : 'Log in'}
                             </button>
                         </p>
                     </div>
                 )}
             </div>
        </div>
      </main>
    </div>
  );
};

export const ServicesPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
             <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#101922]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4">
                 <div className="max-w-7xl mx-auto flex items-center justify-between">
                     <Link to="/" className="flex items-center gap-2 font-bold text-xl">
                        <span className="material-symbols-outlined text-primary">arrow_back</span> Back
                     </Link>
                 </div>
             </header>
             <main className="max-w-7xl mx-auto p-8">
                 <h1 className="text-4xl font-bold mb-4">Our Services</h1>
                 <p className="text-lg text-slate-600 dark:text-slate-400">Detailed breakdown of our financial services.</p>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                    <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span className="material-symbols-outlined text-4xl text-primary mb-4">show_chart</span>
                        <h3 className="text-xl font-bold mb-2">Wealth Management</h3>
                        <p className="text-slate-600 dark:text-slate-400">Comprehensive investment strategies tailored to your financial goals.</p>
                    </div>
                    <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span className="material-symbols-outlined text-4xl text-primary mb-4">strategy</span>
                        <h3 className="text-xl font-bold mb-2">Retirement Planning</h3>
                        <p className="text-slate-600 dark:text-slate-400">Expert guidance to ensure a secure and comfortable retirement.</p>
                    </div>
                    <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span className="material-symbols-outlined text-4xl text-primary mb-4">account_balance</span>
                        <h3 className="text-xl font-bold mb-2">Tax Optimization</h3>
                        <p className="text-slate-600 dark:text-slate-400">Strategies to minimize tax liability and maximize returns.</p>
                    </div>
                 </div>
             </main>
        </div>
    );
};

export const InsightsPage: React.FC = () => {
    const [articles] = usePersistentState('finserve_articles', DEFAULT_ARTICLES);
    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-display">
            <InsightNav />
            <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-12 text-center max-w-2xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-black mb-4">Financial Insights</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400">Expert analysis, market trends, and strategic advice for the modern investor.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articles.map((article: any) => (
                        <div key={article.id} className="group cursor-pointer flex flex-col gap-4">
                            <div className="aspect-[16/9] overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 relative">
                                <img src={article.image || "https://placehold.co/600x400"} alt={article.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute top-4 left-4">
                                    <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur text-slate-900 dark:text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                                        {article.category}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                                    <span>{article.date}</span>
                                    <span>•</span>
                                    <span>{article.readTime || '5 min read'}</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-primary transition-colors">
                                    {article.title}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">
                                    {article.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export const PlanningPage: React.FC = () => { return <InsightsPage />; };
export const MarketsPage: React.FC = () => { return <InsightsPage />; };
export const AnalysisPage: React.FC = () => { return <InsightsPage />; };
export const PolicyPage: React.FC = () => { return <InsightsPage />; };
export const TechPage: React.FC = () => { return <InsightsPage />; };
export const PortfoliosPage: React.FC = () => { return <InsightsPage />; };