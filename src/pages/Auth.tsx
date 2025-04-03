
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { useAuthStore } from "@/lib/auth";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Auth = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  // Default to login unless explicitly on register route
  const [isLogin, setIsLogin] = useState(location.pathname !== "/register");
  
  useEffect(() => {
    // Update form based on route
    setIsLogin(location.pathname !== "/register");
  }, [location.pathname]);
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const toggleAuthMode = () => {
    // Update URL when toggling between login and register
    navigate(isLogin ? "/register" : "/login", { replace: true });
    setIsLogin(!isLogin);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          {isLogin ? (
            <LoginForm />
          ) : (
            <RegisterForm />
          )}
          
          <div className="mt-6 text-center">
            <button
              onClick={toggleAuthMode}
              className="text-sm text-expense-primary hover:underline"
            >
              {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
            </button>
          </div>
        </div>
      </div>

      {/* Right side - Illustration */}
      <div className="flex-1 bg-gradient-to-br from-expense-primary to-expense-secondary p-6 flex items-center justify-center hidden md:flex">
        <div className="max-w-lg text-white">
          <h1 className="text-4xl font-bold mb-4">Manage Your Finances with ExpenseAI</h1>
          <p className="text-lg opacity-90 mb-6">
            Track expenses, set budgets, and get AI-powered insights to help you save money and achieve your financial goals.
          </p>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <span>Real-time tracking</span>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <span>Budget management</span>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
              </div>
              <span>AI-powered insights</span>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <span>Financial planning</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
