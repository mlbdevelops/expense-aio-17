
import { useState, useEffect } from "react";
import { Outlet, Navigate, useLocation, Link } from "react-router-dom";
import { useAuthStore } from "../../lib/auth";
import { Button } from "../ui/button";
import {
  LayoutDashboard,
  CreditCard,
  PieChart,
  BarChart4,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useTheme } from "../ThemeProvider";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
  isActive: boolean;
}

function NavItem({ to, icon, label, isCollapsed, isActive }: NavItemProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={to}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-expense-primary text-white"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <div className="shrink-0">
              {icon}
            </div>
            {!isCollapsed && <span>{label}</span>}
          </Link>
        </TooltipTrigger>
        {isCollapsed && (
          <TooltipContent side="right">
            {label}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}

export function AppLayout() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsCollapsed(window.innerWidth < 1024);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    {
      to: "/dashboard",
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
    },
    {
      to: "/transactions",
      icon: <CreditCard size={20} />,
      label: "Transactions",
    },
    {
      to: "/budgets",
      icon: <PieChart size={20} />,
      label: "Budgets",
    },
    {
      to: "/reports",
      icon: <BarChart4 size={20} />,
      label: "Reports",
    },
    {
      to: "/settings",
      icon: <Settings size={20} />,
      label: "Settings",
    },
  ];

  const renderNav = () => (
    <div className="flex flex-col justify-between h-full">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className={cn(
            "flex items-center gap-2 text-lg font-semibold tracking-tight expense-gradient-text",
            isCollapsed && "justify-center"
          )}>
            {!isCollapsed && "ExpenseAI"}
            <PieChart className={cn(isCollapsed ? "h-6 w-6" : "h-5 w-5")} />
          </h2>
        </div>
        <div className="space-y-1 px-3">
          {navItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              isCollapsed={isCollapsed}
              isActive={isActive(item.to)}
            />
          ))}
        </div>
      </div>
      
      <div className="p-3 mt-auto space-y-4">
        <div className={cn(
          "flex items-center gap-2",
          isCollapsed ? "justify-center" : "px-2"
        )}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            aria-label="Logout"
          >
            <LogOut size={18} />
          </Button>

          {!isCollapsed && (
            <div className="flex items-center gap-2 rounded-md px-2 py-2 ml-auto">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-expense-primary text-white">
                  {user?.name?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen">
      {/* Sidebar - desktop */}
      <aside
        className={cn(
          "fixed inset-y-0 z-20 hidden bg-background border-r md:flex md:flex-col",
          isCollapsed ? "w-[70px]" : "w-[240px]"
        )}
      >
        {renderNav()}
      </aside>

      {/* Mobile navbar */}
      <div className="md:hidden fixed inset-x-0 top-0 z-20 bg-background border-b">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight expense-gradient-text">
              ExpenseAI
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-10 bg-background md:hidden pt-16">
          {renderNav()}
        </div>
      )}

      {/* Main content */}
      <main
        className={cn(
          "flex-1 overflow-y-auto pt-16 md:pt-0",
          isCollapsed ? "md:ml-[70px]" : "md:ml-[240px]"
        )}
      >
        <div className="container max-w-7xl pb-12 p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
