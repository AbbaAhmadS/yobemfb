import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AIChatbot } from "@/components/AIChatbot";
import Index from "./pages/Index";
import Products from "./pages/Products";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Dashboard from "./pages/Dashboard";
import ApplyLoan from "./pages/ApplyLoan";
import OpenAccount from "./pages/OpenAccount";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CreditAdminDashboard from "./pages/admin/CreditAdminDashboard";
import CreateApplication from "./pages/admin/CreateApplication";
import ApplicationDetail from "./pages/admin/ApplicationDetail";
import AnalyticsDashboard from "./pages/admin/AnalyticsDashboard";
import OperationsAnalyticsDashboard from "./pages/admin/OperationsAnalyticsDashboard";
import AdminTools from "./pages/admin/AdminTools";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<Products />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
            </Route>
            
            {/* Protected User Routes with Dashboard Layout */}
            <Route element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/apply-loan" element={<ApplyLoan />} />
              <Route path="/open-account" element={<OpenAccount />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/credit-dashboard" element={
              <ProtectedRoute requireAdmin allowedRoles={['credit']}>
                <CreditAdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/analytics" element={
              <ProtectedRoute requireAdmin>
                <AnalyticsDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/operations-analytics" element={
              <ProtectedRoute requireAdmin allowedRoles={['operations']}>
                <OperationsAnalyticsDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/create-application" element={
              <ProtectedRoute requireAdmin allowedRoles={['credit']}>
                <CreateApplication />
              </ProtectedRoute>
            } />
            <Route path="/admin/applications/:id" element={
              <ProtectedRoute requireAdmin>
                <ApplicationDetail />
              </ProtectedRoute>
            } />
            <Route path="/admin/application/:id" element={
              <ProtectedRoute requireAdmin>
                <ApplicationDetail />
              </ProtectedRoute>
            } />
            <Route path="/admin/tools" element={
              <ProtectedRoute requireAdmin allowedRoles={['managing_director']}>
                <AdminTools />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          {/* AI Chatbot available on all pages */}
          <AIChatbot />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
