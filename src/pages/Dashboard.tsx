
import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Loader2, PlusCircle, ArrowUpCircle, ArrowDownCircle, CreditCard, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

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

const Dashboard = () => {
  const { profile } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [availableBudget, setAvailableBudget] = useState(0);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false })
        .limit(5);
      
      if (transactionsError) {
        console.error('Error fetching transactions:', transactionsError);
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
      } else {
        setBudgets(budgetsData || []);
        
        // Calculate total budget
        const totalBudget = budgetsData?.reduce((sum, b) => sum + Number(b.amount), 0) || 0;
        setAvailableBudget(totalBudget - totalExpense);
      }
      
      setIsLoading(false);
    };
    
    fetchData();
  }, []);
  
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
        </>
      )}
    </div>
  );
};

export default Dashboard;
