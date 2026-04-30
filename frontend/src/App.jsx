import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';

// Institutional
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Partners from './components/Partners';
import Services from './components/Services';
import HowItWorks from './components/HowItWorks';
import Stats from './components/Stats';
import Contact from './components/Contact';
import AppShowcase from './components/AppShowcase';
import Footer from './components/Footer';

// System Pages
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminFinances from './pages/AdminFinances';
import AdminMentorship from './pages/AdminMentorship';
import AdminAIConfig from './pages/AdminAIConfig';
import PartnerManagement from './pages/PartnerManagement';
import ClientDashboard from './pages/ClientDashboard';
import FinanceManagement from './pages/FinanceManagement';
import CategoryManagement from './pages/CategoryManagement';
import AccountManagement from './pages/AccountManagement';
import BudgetManagement from './pages/BudgetManagement';
import AIInsights from './pages/AIInsights';
import Mentoria from './pages/Mentoria';
import ClientOnboarding from './pages/ClientOnboarding';
import SecuritySettings from './pages/SecuritySettings';
import AuditLogs from './pages/AuditLogs';
import Reports from './pages/Reports';
import AdminReports from './pages/AdminReports';
import UserProfile from './pages/UserProfile';
import AppLandingPage from './pages/AppLandingPage';
import ForgotPassword from './pages/ForgotPassword';
import Agenda from './pages/Agenda';
import KnowledgeBase from './pages/KnowledgeBase';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

const Institutional = () => (
  <div className="min-h-screen">
    <Navbar />
    <main>
      <Hero />
      <About />
      <Partners />
      <Services />
      <AppShowcase />
      <Stats />
      <HowItWorks />
      <Contact />
    </main>
    <Footer />
  </div>
);

const DashboardRedirect = () => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;
    if (user.role === 'admin' || user.role === 'partner') return <Navigate to="/admin" />;
    return <Navigate to="/dashboard" />;
};

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<DashboardRedirect />} />
          <Route path="/home" element={<Institutional />} />
          <Route path="/app" element={<AppLandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />

          {/* Admin Protected Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute role={['admin', 'partner']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/finances" 
            element={
              <ProtectedRoute role={['admin', 'partner']}>
                <AdminFinances />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/agenda" 
            element={
              <ProtectedRoute role={['admin', 'partner']}>
                <Agenda />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/knowledge-base" 
            element={
              <ProtectedRoute role={['admin', 'partner']}>
                <KnowledgeBase />
              </ProtectedRoute>
            } 
          />

          {/* Client Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute role="client">
                <ClientDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/finance" 
            element={
              <ProtectedRoute role="client">
                <FinanceManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/categories" 
            element={
              <ProtectedRoute role="client">
                <CategoryManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/accounts" 
            element={
              <ProtectedRoute role="client">
                <AccountManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/budgets" 
            element={
              <ProtectedRoute role="client">
                <BudgetManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/mentoria" 
            element={
              <ProtectedRoute>
                <Mentoria />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/admin/ai" 
            element={
              <ProtectedRoute role="admin">
                <AdminAIConfig />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/partners" 
            element={
              <ProtectedRoute role="admin">
                <PartnerManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/insights" 
            element={
              <ProtectedRoute role="client" requiredFeature="hasAIAccess">
                <AIInsights />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-planning" 
            element={
              <ProtectedRoute role="client">
                <ClientOnboarding isReadOnly={true} />
              </ProtectedRoute>
            } 
          />
          {/* Catch-all/Redirect */}
          <Route 
            path="/panel" 
            element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/clients/:id/onboarding" 
            element={
              <ProtectedRoute role="admin">
                <ClientOnboarding />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/mentorship" 
            element={
              <ProtectedRoute role={['admin', 'partner']}>
                <AdminMentorship />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/security" 
            element={
              <ProtectedRoute role="admin">
                <SecuritySettings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/audit-logs" 
            element={
              <ProtectedRoute role="admin">
                <AuditLogs />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute requiredFeature="hasReportAccess">
                <Reports />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/reports" 
            element={
              <ProtectedRoute role="admin">
                <AdminReports />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
