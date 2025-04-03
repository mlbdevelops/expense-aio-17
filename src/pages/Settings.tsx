
import { useState } from "react";
import { useAuthStore } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

const Settings = () => {
  const { user } = useAuthStore();
  
  // Profile settings state
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    avatar: user?.avatar || "",
  });
  
  // Preference settings state
  const [preferences, setPreferences] = useState({
    currency: "USD",
    theme: "light",
    notifications: {
      budgetAlerts: true,
      weeklyReports: true,
      savingTips: true,
      unusualActivity: true
    },
    defaultView: "dashboard"
  });
  
  const [isLoading, setIsLoading] = useState(false);
  
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePreferencesUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast.success("Preferences updated successfully");
    } catch (error) {
      toast.error("Failed to update preferences");
      console.error("Error updating preferences:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExportData = async () => {
    setIsLoading(true);
    
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Data exported successfully. Check your email for the download link.");
    } catch (error) {
      toast.error("Failed to export data");
      console.error("Error exporting data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and app preferences</p>
      </div>
      
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="data">Data & Privacy</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={profile.name} 
                    onChange={(e) => setProfile({...profile, name: e.target.value})} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={profile.email} 
                    onChange={(e) => setProfile({...profile, email: e.target.value})} 
                    disabled
                  />
                  <p className="text-sm text-muted-foreground">Email address cannot be changed</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="avatar">Profile Picture URL</Label>
                  <Input 
                    id="avatar" 
                    value={profile.avatar} 
                    onChange={(e) => setProfile({...profile, avatar: e.target.value})} 
                    placeholder="https://example.com/avatar.png"
                  />
                </div>
                
                <div className="pt-4">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Application Preferences</CardTitle>
              <CardDescription>Customize how the app works for you</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePreferencesUpdate} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select 
                    value={preferences.currency} 
                    onValueChange={(value) => setPreferences({...preferences, currency: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="JPY">JPY (¥)</SelectItem>
                      <SelectItem value="CAD">CAD ($)</SelectItem>
                      <SelectItem value="AUD">AUD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select 
                    value={preferences.theme} 
                    onValueChange={(value) => setPreferences({...preferences, theme: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="defaultView">Default View</Label>
                  <Select 
                    value={preferences.defaultView} 
                    onValueChange={(value) => setPreferences({...preferences, defaultView: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select default view" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dashboard">Dashboard</SelectItem>
                      <SelectItem value="transactions">Transactions</SelectItem>
                      <SelectItem value="budgets">Budgets</SelectItem>
                      <SelectItem value="reports">Reports</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Notification Preferences</h3>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="budgetAlerts" className="cursor-pointer">Budget Alert Notifications</Label>
                    <Switch 
                      id="budgetAlerts" 
                      checked={preferences.notifications.budgetAlerts}
                      onCheckedChange={(checked) => setPreferences({
                        ...preferences, 
                        notifications: {...preferences.notifications, budgetAlerts: checked}
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="weeklyReports" className="cursor-pointer">Weekly Report Notifications</Label>
                    <Switch 
                      id="weeklyReports" 
                      checked={preferences.notifications.weeklyReports}
                      onCheckedChange={(checked) => setPreferences({
                        ...preferences, 
                        notifications: {...preferences.notifications, weeklyReports: checked}
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="savingTips" className="cursor-pointer">Saving Tips Notifications</Label>
                    <Switch 
                      id="savingTips" 
                      checked={preferences.notifications.savingTips}
                      onCheckedChange={(checked) => setPreferences({
                        ...preferences, 
                        notifications: {...preferences.notifications, savingTips: checked}
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="unusualActivity" className="cursor-pointer">Unusual Activity Alerts</Label>
                    <Switch 
                      id="unusualActivity" 
                      checked={preferences.notifications.unusualActivity}
                      onCheckedChange={(checked) => setPreferences({
                        ...preferences, 
                        notifications: {...preferences.notifications, unusualActivity: checked}
                      })}
                    />
                  </div>
                </div>
                
                <div>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Preferences
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Data & Privacy</CardTitle>
              <CardDescription>Manage your data and privacy settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-medium">Export Your Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Download all your financial data in CSV format for your records
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={handleExportData}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      "Export Data"
                    )}
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Data Storage & Privacy</h3>
                  <p className="text-sm text-muted-foreground">
                    We store your financial data securely and do not share it with third parties.
                    Read our privacy policy for more details.
                  </p>
                  <Button variant="link" className="p-0 h-auto">
                    Privacy Policy
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium text-red-600">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground">
                    These actions are permanent and cannot be undone.
                  </p>
                  
                  <div className="space-y-4 pt-2">
                    <Button variant="destructive">
                      Delete All Transactions
                    </Button>
                    
                    <Button variant="destructive">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
