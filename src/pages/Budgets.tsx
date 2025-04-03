
import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/auth";
import { useBudgetStore } from "@/lib/budgets";
import { CATEGORIES, TransactionCategory } from "@/lib/transactions";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Loader2, Plus, Trash } from "lucide-react";
import { useTransactionStore } from "@/lib/transactions";

const Budgets = () => {
  const { user } = useAuthStore();
  const { budgets, fetchBudgets, addBudget, deleteBudget, isLoading } = useBudgetStore();
  const { transactions, fetchTransactions } = useTransactionStore();
  
  const [newBudget, setNewBudget] = useState({
    category: "" as TransactionCategory,
    amount: "",
    period: "monthly" as "monthly" | "yearly"
  });

  const [budgetProgress, setBudgetProgress] = useState<Record<string, { spent: number, percentage: number }>>({});
  
  useEffect(() => {
    if (user?.id) {
      fetchBudgets(user.id);
      fetchTransactions(user.id);
    }
  }, [user?.id, fetchBudgets, fetchTransactions]);

  useEffect(() => {
    if (budgets.length && transactions.length) {
      calculateBudgetProgress();
    }
  }, [budgets, transactions]);

  const calculateBudgetProgress = () => {
    const progress: Record<string, { spent: number, percentage: number }> = {};
    
    // Get current month's data only
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const currentMonthTransactions = transactions.filter(transaction => {
      const txDate = new Date(transaction.date);
      return txDate.getMonth() === currentMonth && 
             txDate.getFullYear() === currentYear && 
             !transaction.isIncome; // Exclude income
    });

    // Calculate spending per category
    budgets.forEach(budget => {
      // Only calculate for monthly budgets for now (could expand to yearly)
      if (budget.period === 'monthly') {
        const categoryTransactions = currentMonthTransactions.filter(
          tx => tx.category === budget.category
        );
        
        const totalSpent = categoryTransactions.reduce(
          (sum, tx) => sum + tx.amount, 0
        );
        
        const percentage = Math.min(Math.round((totalSpent / budget.amount) * 100), 100);
        
        progress[budget.id] = {
          spent: totalSpent,
          percentage
        };
      }
    });
    
    setBudgetProgress(progress);
  };

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newBudget.category || !newBudget.amount) {
      toast.error("Please fill in all fields");
      return;
    }
    
    if (user?.id) {
      try {
        await addBudget({
          user_id: user.id,
          category: newBudget.category,
          amount: parseFloat(newBudget.amount),
          period: newBudget.period
        });
        
        // Reset form
        setNewBudget({
          category: "" as TransactionCategory,
          amount: "",
          period: "monthly"
        });
      } catch (error) {
        console.error("Error adding budget:", error);
      }
    }
  };

  const handleDeleteBudget = async (id: string) => {
    try {
      await deleteBudget(id);
      // Toast is handled in the store
    } catch (error) {
      console.error("Error deleting budget:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Budgets</h1>
        <p className="text-muted-foreground">Set and manage your monthly spending limits</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Your Budgets</CardTitle>
            <CardDescription>Track your spending against your budget goals</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : budgets.length > 0 ? (
              <div className="space-y-6">
                {budgets.map((budget) => {
                  const progress = budgetProgress[budget.id] || { spent: 0, percentage: 0 };
                  
                  return (
                    <div key={budget.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{CATEGORIES[budget.category]?.label || budget.category}</h3>
                          <p className="text-sm text-muted-foreground">
                            ${progress.spent.toFixed(2)} of ${budget.amount.toFixed(2)} per {budget.period}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteBudget(budget.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                      <Progress value={progress.percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No budgets set yet.</p>
                <p className="text-sm text-muted-foreground mt-1">Create a budget to start tracking your spending.</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Add New Budget</CardTitle>
            <CardDescription>Create a new spending limit</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddBudget} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">
                  Category
                </label>
                <Select 
                  value={newBudget.category} 
                  onValueChange={(value) => setNewBudget({...newBudget, category: value as TransactionCategory})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORIES).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="amount" className="text-sm font-medium">
                  Budget Amount
                </label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={newBudget.amount}
                  onChange={(e) => setNewBudget({...newBudget, amount: e.target.value})}
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="period" className="text-sm font-medium">
                  Period
                </label>
                <Select 
                  value={newBudget.period} 
                  onValueChange={(value) => setNewBudget({...newBudget, period: value as "monthly" | "yearly"})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Budget
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Budgets;
