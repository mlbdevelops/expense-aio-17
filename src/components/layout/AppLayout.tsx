
import { Outlet } from "react-router-dom";
import {
  Sidebar,
  SidebarHeader,
  SidebarMain,
  SidebarNav,
  SidebarNavHeader,
  SidebarNavHeaderTitle,
  SidebarNavLink,
  SidebarNavList,
  SidebarSection,
} from "@/components/ui/sidebar";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/lib/auth";
import { useMobile } from "@/hooks/use-mobile";
import {
  BarChart3,
  CalendarDays,
  CreditCard,
  DollarSign,
  LayoutDashboard,
  LogOut,
  PieChart,
  Settings,
  Target
} from "lucide-react";

export const AppLayout = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuthStore();
  const { isDesktop } = useMobile();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <Sidebar
      defaultLayout={{
        isMiniSidebar: false,
        isMobileSidebarOpen: false,
      }}
      navHeader={isDesktop ? "Links" : undefined}
    >
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <DollarSign className="h-6 w-6" />
          <h1 className="text-xl font-bold">Budget Tracker</h1>
        </div>
      </SidebarHeader>
      <SidebarMain
        className="px-2"
        mainHeader={isDesktop ? undefined : "Links"}
      >
        <SidebarSection>
          <SidebarNav>
            <SidebarNavHeader>
              <SidebarNavHeaderTitle>Menu</SidebarNavHeaderTitle>
            </SidebarNavHeader>
            <SidebarNavList>
              <SidebarNavLink
                href="/dashboard"
                icon={<LayoutDashboard className="h-4 w-4" />}
              >
                Dashboard
              </SidebarNavLink>
              <SidebarNavLink
                href="/transactions"
                icon={<CreditCard className="h-4 w-4" />}
              >
                Transactions
              </SidebarNavLink>
              <SidebarNavLink
                href="/budgets"
                icon={<BarChart3 className="h-4 w-4" />}
              >
                Budgets
              </SidebarNavLink>
              <SidebarNavLink
                href="/savings-goals"
                icon={<Target className="h-4 w-4" />}
              >
                Savings Goals
              </SidebarNavLink>
              <SidebarNavLink
                href="/financial-calendar"
                icon={<CalendarDays className="h-4 w-4" />}
              >
                Calendar
              </SidebarNavLink>
              <SidebarNavLink
                href="/financial-reports"
                icon={<PieChart className="h-4 w-4" />}
              >
                Reports
              </SidebarNavLink>
              <SidebarNavLink
                href="/budget-summary"
                icon={<DollarSign className="h-4 w-4" />}
              >
                Summary
              </SidebarNavLink>
              <SidebarNavLink
                href="/settings"
                icon={<Settings className="h-4 w-4" />}
              >
                Settings
              </SidebarNavLink>
              <SidebarNavLink
                onClick={handleLogout}
                icon={<LogOut className="h-4 w-4" />}
              >
                Logout
              </SidebarNavLink>
            </SidebarNavList>
          </SidebarNav>
        </SidebarSection>
      </SidebarMain>
      <div className="flex flex-1 flex-col p-4 md:p-6 pt-0">
        <Outlet />
      </div>
    </Sidebar>
  );
};
