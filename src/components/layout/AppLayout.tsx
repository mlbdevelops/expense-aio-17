
import { Outlet } from "react-router-dom";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider
} from "@/components/ui/sidebar";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/lib/auth";
import { useMediaQuery } from "@/hooks/useMediaQuery";
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
  const isDesktop = useMediaQuery("(min-width: 768px)");

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
    <SidebarProvider>
      <div className="flex min-h-svh w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-6 w-6" />
              <h1 className="text-xl font-bold">Fiscora</h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/dashboard" className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Dashboard</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/transactions" className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        <span>Transactions</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/budgets" className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        <span>Budgets</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/savings-goals" className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        <span>Savings Goals</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/financial-calendar" className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        <span>Calendar</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/financial-reports" className="flex items-center gap-2">
                        <PieChart className="h-4 w-4" />
                        <span>Reports</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/budget-summary" className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span>Summary</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/settings" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild onClick={handleLogout}>
                      <div className="flex items-center gap-2 cursor-pointer">
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <div className="flex flex-1 flex-col p-4 md:p-6 pt-0">
            <Outlet />
          </div>
        </Sidebar>
      </div>
    </SidebarProvider>
  );
};
