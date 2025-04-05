
import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client-extended";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Loader2, PlusCircle, ArrowUpCircle, ArrowDownCircle, CreditCard, PieChart, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

// Define types for our data
type Transaction = {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  is_income: boolean;
};

type Budget = {
  id: string;
  category: string;
  amount: number;
  period: string;
};

type SavingsGoal = {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
};

const Dashboard = () => {
  const { profile } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [availableBudget, setAvailableBudget] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch transactions
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .select('*')
          .order('date', { ascending: false })
          .limit(5);
        
        if (transactionsError) {
          console.error('Error fetching transactions:', transactionsError);
          setError("Failed to load recent transactions");
          toast.error("Failed to load recent transactions");
        } else {
          setTransactions(transactionsData || []);
          
          // Calculate totals
          const income = transactionsData?.filter(t => t.is_income).reduce((sum, t) => sum + Number(t.amount), 0) || 0;
          const expense = transactionsData?.filter(t => !t.is_income).reduce((sum, t) => sum + Number(t.amount), 0) || 0;
          
          setTotalIncome(income);
          setTotalExpense(expense);
        }
        
        // Fetch budgets
        const { data: budgetsData, error: budgetsError } = await supabase
          .from('budgets')
          .select('*');
        
        if (budgetsError) {
          console.error('Error fetching budgets:', budgetsError);
          setError("Failed to load budget data");
          toast.error("Failed to load budget data");
        } else {
          setBudgets(budgetsData || []);
          
          // Calculate total budget
          const totalBudget = budgetsData?.reduce((sum, b) => sum + Number(b.amount), 0) || 0;
          setAvailableBudget(totalBudget - totalExpense);
        }
        
        // Fetch savings goals
        const { data: savingsGoalsData, error: savingsGoalsError } = await supabase
          .from('savings_goals')
          .select('*')
          .limit(3);
          
        if (savingsGoalsError) {
          console.error('Error fetching savings goals:', savingsGoalsError);
          setError("Failed to load savings goals");
          toast.error("Failed to load savings goals");
        } else {
          setSavingsGoals(savingsGoalsData || []);
        }
      } catch (e) {
        console.error("Dashboard data fetch error:", e);
        setError("An unexpected error occurred");
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Calculate progress percentage for savings goals
  const calculateProgress = (current: number, target: number) => {
    if (target <= 0) return 0;
    const progress = (current / target) * 100;
    return Math.min(progress, 100); // Cap at 100%
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {profile?.name || 'User'}!
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <p>{error}</p>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Financial Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Income
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <ArrowUpCircle className="h-4 w-4 text-green-500 mr-2" />
                  <div className="text-2xl font-bold">{formatCurrency(totalIncome)}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <ArrowDownCircle className="h-4 w-4 text-red-500 mr-2" />
                  <div className="text-2xl font-bold">{formatCurrency(totalExpense)}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Available Budget
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2 text-blue-500" />
                  <div className="text-2xl font-bold">{formatCurrency(availableBudget)}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest 5 transactions</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/transactions">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  View All
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No transactions yet. Add your first one!</p>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${transaction.is_income ? 'bg-green-100' : 'bg-red-100'}`}>
                          {transaction.is_income ? 
                            <ArrowUpCircle className="h-4 w-4 text-green-500" /> : 
                            <ArrowDownCircle className="h-4 w-4 text-red-500" />
                          }
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">{transaction.category} • {new Date(transaction.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className={`font-medium ${transaction.is_income ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.is_income ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Budgets Overview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Budget Overview</CardTitle>
                <CardDescription>Your current budget allocations</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/budgets">
                  <PieChart className="mr-2 h-4 w-4" />
                  Manage Budgets
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {budgets.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No budgets created yet. Set up your first budget!</p>
              ) : (
                <div className="space-y-4">
                  {budgets.map((budget) => (
                    <div key={budget.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{budget.category}</p>
                        <p className="text-sm text-muted-foreground">{budget.period}</p>
                      </div>
                      <div className="font-medium">{formatCurrency(budget.amount)}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Savings Goals */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Savings Goals</CardTitle>
                <CardDescription>Progress towards your financial targets</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/savings-goals">
                  <Target className="mr-2 h-4 w-4" />
                  View All Goals
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {savingsGoals.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No savings goals created yet. Set your first financial goal!</p>
              ) : (
                <div className="space-y-4">
                  {savingsGoals.map((goal) => (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="font-medium">{goal.name}</p>
                        <p className="text-sm">
                          {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
                        </p>
                      </div>
                      <Progress value={calculateProgress(goal.current_amount, goal.target_amount)} className="h-2" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Dashboard;
