
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate, Link, Outlet, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  LayoutDashboard, 
  Wallet, 
  PieChart, 
  Receipt, 
  Settings, 
  Menu, 
  X, 
  LogOut,
  User
} from "lucide-react";
import { useEffect, useState } from "react";
import { useMobileView } from "@/hooks/use-mobile";

export function AppLayout() {
  const { user, profile, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useMobileView();

  // Check if the user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Navigation items with icons
  const navItems = [
    {
      label: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/dashboard"
    },
    {
      label: "Transactions",
      icon: <Receipt className="h-5 w-5" />,
      href: "/transactions"
    },
    {
      label: "Budgets",
      icon: <Wallet className="h-5 w-5" />,
      href: "/budgets"
    },
    {
      label: "Reports",
      icon: <PieChart className="h-5 w-5" />,
      href: "/reports"
    },
    {
      label: "Settings",
      icon: <Settings className="h-5 w-5" />,
      href: "/settings"
    }
  ];

  // If not authenticated, don't render the app layout
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar for desktop */}
      <aside className={`bg-accent/40 w-64 flex-shrink-0 border-r hidden md:flex flex-col`}>
        <div className="p-4 border-b">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-expense-primary" />
            <span className="font-bold text-xl">ExpenseAI</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                location.pathname === item.href
                  ? "bg-expense-primary text-white"
                  : "hover:bg-accent"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar || ""} />
                  <AvatarFallback>
                    {profile?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{profile?.name || user?.email}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-background z-10 border-b">
        <div className="flex items-center justify-between p-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-expense-primary" />
            <span className="font-bold text-xl">ExpenseAI</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </header>

      {/* Mobile navigation menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-background z-30 pt-16">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                  location.pathname === item.href
                    ? "bg-expense-primary text-white"
                    : "hover:bg-accent"
                }`}
                onClick={closeMobileMenu}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
            <div className="mt-8 pt-4 border-t">
              <div className="flex items-center gap-3 px-4 py-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.avatar || ""} />
                  <AvatarFallback>
                    {profile?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{profile?.name || "User"}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {user?.email}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 mt-2 px-4"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                Logout
              </Button>
            </div>
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden pt-0 md:pt-0">
        {/* Content area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 pt-20 md:pt-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
