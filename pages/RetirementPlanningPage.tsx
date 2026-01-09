import React from 'react';
import { Link } from 'react-router-dom';

export const RetirementPlanningPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
             <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#101922]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4">
                 <div className="max-w-7xl mx-auto flex items-center justify-between">
                     <Link to="/planning" className="flex items-center gap-2 font-bold text-xl">
                        <span className="material-symbols-outlined text-primary">arrow_back</span> Back to Planning
                     </Link>
                 </div>
             </header>
             <main className="max-w-7xl mx-auto p-8">
                 <h1 className="text-4xl font-bold mb-4">Retirement Planning</h1>
                 <p className="text-lg text-slate-600 dark:text-slate-400">This is the placeholder page for Retirement Planning.</p>
             </main>
        </div>
    );
};
