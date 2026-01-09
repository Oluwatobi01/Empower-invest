import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeToggle, AuthProvider, useAuth } from './components/Shared';
import { LandingPage, ServicesPage, ConnectPage, InsightsPage, PlanningPage, MarketsPage, AnalysisPage, PolicyPage, TechPage, PortfoliosPage } from './pages/PublicPages';
import { RetirementPage, ToolsPage, AccountsPage, ReportsPage, DocumentsPage, ConsultationPage, SettingsPage, InvestmentPortfolioPage } from './pages/AppPages';
import { AdminDashboard, AdminUsersPage, AdminContentPage, AdminTransactionsPage, AdminSettingsPage, AdminDocumentsPage, AdminClientDataPage } from './pages/AdminPages';
import { RetirementPlanningPage } from './pages/RetirementPlanningPage';
import { EducationPlanningPage } from './pages/EducationPlanningPage';
import { BookingPage } from './pages/BookingPage';

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null; // Or a loading spinner
  if (!user) return <Navigate to="/connect" replace />;
  return <>{children}</>;
};

const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user || user.role !== 'Admin') return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/connect" element={<ConnectPage />} />
      <Route path="/insights" element={<InsightsPage />} />
      <Route path="/planning" element={<PlanningPage />} />
      <Route path="/planning/retirement" element={<RetirementPlanningPage />} />
      <Route path="/planning/education" element={<EducationPlanningPage />} />
      <Route path="/booking" element={<BookingPage />} />
      
      {/* New Insight Routes */}
      <Route path="/markets" element={<MarketsPage />} />
      <Route path="/analysis" element={<AnalysisPage />} />
      <Route path="/policy" element={<PolicyPage />} />
      <Route path="/tech" element={<TechPage />} />
      <Route path="/portfolios" element={<PortfoliosPage />} />

      {/* Protected App Routes */}
      <Route path="/tools" element={<RequireAuth><ToolsPage /></RequireAuth>} />
      <Route path="/dashboard" element={<RequireAuth><ToolsPage /></RequireAuth>} />
      <Route path="/investments" element={<RequireAuth><InvestmentPortfolioPage /></RequireAuth>} />
      <Route path="/retirement" element={<RequireAuth><RetirementPage /></RequireAuth>} />
      <Route path="/accounts" element={<RequireAuth><AccountsPage /></RequireAuth>} />
      <Route path="/reports" element={<RequireAuth><ReportsPage /></RequireAuth>} />
      <Route path="/documents" element={<RequireAuth><DocumentsPage /></RequireAuth>} />
      <Route path="/consultation" element={<RequireAuth><ConsultationPage /></RequireAuth>} />
      <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
      
      {/* Protected Admin Routes */}
      <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
      <Route path="/admin/users" element={<RequireAdmin><AdminUsersPage /></RequireAdmin>} />
      <Route path="/admin/transactions" element={<RequireAdmin><AdminTransactionsPage /></RequireAdmin>} />
      <Route path="/admin/content" element={<RequireAdmin><AdminContentPage /></RequireAdmin>} />
      <Route path="/admin/documents" element={<RequireAdmin><AdminDocumentsPage /></RequireAdmin>} />
      <Route path="/admin/data" element={<RequireAdmin><AdminClientDataPage /></RequireAdmin>} />
      <Route path="/admin/settings" element={<RequireAdmin><AdminSettingsPage /></RequireAdmin>} />

      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <ThemeToggle />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;