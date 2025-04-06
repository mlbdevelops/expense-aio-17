
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  BarChart3, 
  CalendarDays, 
  CreditCard, 
  DollarSign, 
  LayoutDashboard, 
  Menu, 
  PieChart, 
  Settings, 
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const MobileNavBar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  
  const navigationItems = [
    { path: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { path: "/transactions", label: "Transactions", icon: <CreditCard className="h-5 w-5" /> },
    { path: "/budgets", label: "Budgets", icon: <BarChart3 className="h-5 w-5" /> },
    { path: "/savings-goals", label: "Savings Goals", icon: <Target className="h-5 w-5" /> },
    { path: "/financial-calendar", label: "Calendar", icon: <CalendarDays className="h-5 w-5" /> },
    { path: "/financial-reports", label: "Reports", icon: <PieChart className="h-5 w-5" /> },
    { path: "/budget-summary", label: "Summary", icon: <DollarSign className="h-5 w-5" /> },
    { path: "/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b md:hidden">
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center">
          <DollarSign className="h-6 w-6 text-primary mr-2" />
          <span className="font-bold text-lg">Fiscaleon</span>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[80vw] max-w-sm">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <DollarSign className="h-6 w-6 text-primary mr-2" />
                  <span className="font-bold text-xl">Fiscaleon</span>
                </div>
                {/* Removed the duplicate X button here */}
              </div>
              <nav className="flex-1">
                <ul className="space-y-2">
                  {navigationItems.map((item) => (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                          isActive(item.path)
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent"
                        }`}
                        onClick={() => setOpen(false)}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};
