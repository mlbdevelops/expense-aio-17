
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plus } from 'lucide-react';
import { Budget } from '@/lib/budgets';
import { Transaction, CATEGORIES } from '@/lib/transactions';

interface BudgetProgressProps {
  budgets: Budget[];
  transactions: Transaction[];
  isLoading: boolean;
}

export const BudgetProgress = ({ budgets, transactions, isLoading }: BudgetProgressProps) => {
  const navigate = useNavigate();
  const [budgetProgress, setBudgetProgress] = useState<Record<string, { spent: number, percentage: number }>>({});
  
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
  
  const getProgressColorClass = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500"; 
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Progress</CardTitle>
        <CardDescription>Your monthly budget tracking</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-16 bg-gray-100 animate-pulse rounded" />
            <div className="h-16 bg-gray-100 animate-pulse rounded" />
            <div className="h-16 bg-gray-100 animate-pulse rounded" />
          </div>
        ) : budgets.length > 0 ? (
          <div className="space-y-5">
            {budgets.map(budget => {
              const progress = budgetProgress[budget.id] || { spent: 0, percentage: 0 };
              const progressColor = getProgressColorClass(progress.percentage);
              
              return (
                <div key={budget.id} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="flex flex-col">
                      <span className="font-medium">{CATEGORIES[budget.category]?.label || budget.category}</span>
                      <span className="text-sm text-muted-foreground">
                        ${progress.spent.toFixed(2)} of ${budget.amount.toFixed(2)}
                      </span>
                    </div>
                    <span 
                      className={`font-medium ${progress.percentage >= 90 ? 'text-red-600' : ''}`}
                    >
                      {progress.percentage}%
                    </span>
                  </div>
                  <Progress 
                    value={progress.percentage} 
                    className="h-2" 
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p className="text-muted-foreground">No budgets set up yet</p>
            <p className="text-sm text-muted-foreground mt-1">Create a budget to track your spending</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={() => navigate("/budgets")}
        >
          {budgets.length > 0 ? (
            "View All Budgets"
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Create Budget
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
