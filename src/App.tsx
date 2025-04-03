
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import { AppLayout } from "./components/layout/AppLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Auth />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/register" element={<Auth />} />
            
            {/* Protected Routes - Wrapped in AppLayout */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/transactions" element={<div className="p-4"><h1 className="text-3xl font-bold">Transactions</h1><p className="mt-2">View and manage your transactions</p></div>} />
              <Route path="/budgets" element={<div className="p-4"><h1 className="text-3xl font-bold">Budgets</h1><p className="mt-2">Set and track your budget goals</p></div>} />
              <Route path="/reports" element={<div className="p-4"><h1 className="text-3xl font-bold">Reports</h1><p className="mt-2">View detailed financial reports</p></div>} />
              <Route path="/settings" element={<div className="p-4"><h1 className="text-3xl font-bold">Settings</h1><p className="mt-2">Manage your account settings</p></div>} />
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
