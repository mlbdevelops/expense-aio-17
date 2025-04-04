
import { useAuthStore } from "@/lib/auth";

const Dashboard = () => {
  const { profile } = useAuthStore();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {profile?.name || 'User'}!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
          <p className="text-muted-foreground">
            This is your personal dashboard. You can customize it to display whatever information you need.
          </p>
        </div>
        
        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Account Information</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Name:</span> {profile?.name || 'Not set'}</p>
            <p><span className="font-medium">Email:</span> {profile?.email || 'Not set'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
