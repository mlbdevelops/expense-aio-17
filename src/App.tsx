
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import { AppLayout } from "./components/layout/AppLayout";
import Settings from "./pages/Settings";
import { useAuthStore } from "./lib/auth";
import Budgets from "./pages/Budgets";
import Transactions from "./pages/Transactions";
import BudgetSummary from "./pages/BudgetSummary";
import SavingsGoals from "./pages/SavingsGoals";
import FinancialCalendar from "./pages/FinancialCalendar";
import FinancialReports from "./pages/FinancialReports";

const queryClient = new QueryClient();

const App = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
              <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Auth />} />
              <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Auth />} />
              
              {/* Protected Routes - Wrapped in AppLayout */}
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/budgets" element={<Budgets />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/budget-summary" element={<BudgetSummary />} />
                <Route path="/savings-goals" element={<SavingsGoals />} />
                <Route path="/financial-calendar" element={<FinancialCalendar />} />
                <Route path="/financial-reports" element={<FinancialReports />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
