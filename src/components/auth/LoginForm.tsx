
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../lib/auth";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

export function LoginForm() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    
    try {
      await login(email, password);
      // Redirect will happen automatically via the useEffect in Auth.tsx
    } catch (error: any) {
      setError(error.message || "Login failed. Please try again.");
    }
  };

  return (
    <Card className="w-full max-w-md glass-card">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Login</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start gap-2">
              <AlertCircle className="h-5 w-5 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={isLoading}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a
                href="#"
                className="text-sm font-medium text-expense-primary hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  toast.info("Reset password functionality will be available soon");
                }}
              >
                Forgot your password?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={isLoading}
              required
            />
          </div>
          <Button type="submit" className="w-full expense-gradient" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-center text-muted-foreground">
          Don't have an account?{" "}
          <a
            href="/register"
            className="font-medium text-expense-primary hover:underline"
            onClick={(e) => {
              e.preventDefault();
              navigate("/register");
            }}
          >
            Register
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
