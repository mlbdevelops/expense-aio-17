
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Budget } from "@/lib/budgets";
import { Transaction, CATEGORIES, TransactionCategory } from "@/lib/transactions";
import { formatCurrency } from "@/lib/utils";
import { useState, useMemo } from "react";
import { Button } from "../ui/button";
import { ChevronRight, Loader2, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Separator } from "../ui/separator";

interface BudgetProgressProps {
  budgets: Budget[];
  transactions: Transaction[];
  isLoading: boolean;
}

export function BudgetProgress({ budgets, transactions, isLoading }: BudgetProgressProps) {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);
  
  const budgetProgress = useMemo(() => {
    if (!budgets.length || !transactions.length) return [];
    
    return budgets.map(budget => {
      const categoryExpenses = transactions
        .filter(t => !t.isIncome && t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const percentage = Math.min(Math.round((categoryExpenses / budget.amount) * 100), 100);
      
      return {
        ...budget,
        spent: categoryExpenses,
        percentage,
        remaining: budget.amount - categoryExpenses,
        isOverBudget: categoryExpenses > budget.amount,
      };
    }).sort((a, b) => b.percentage - a.percentage); // Sort by percentage used (highest first)
  }, [budgets, transactions]);

  // Display all or just top 3 budgets
  const displayBudgets = showAll ? budgetProgress : budgetProgress.slice(0, 3);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Progress</CardTitle>
          <CardDescription>Track your spending against budgets</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (budgetProgress.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Progress</CardTitle>
          <CardDescription>Track your spending against budgets</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[200px] text-center">
          <p className="text-muted-foreground mb-4">No budgets created yet</p>
          <Button 
            onClick={() => navigate("/budgets")}
            className="expense-gradient"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Create your first budget
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Progress</CardTitle>
        <CardDescription>Track your spending against budgets</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayBudgets.map((budget) => (
            <div key={budget.id} className="space-y-1">
              <div className="flex justify-between">
                <div className="font-medium">{CATEGORIES[budget.category as TransactionCategory].label}</div>
                <div className="text-sm">
                  {formatCurrency(budget.spent)} of {formatCurrency(budget.amount)}
                </div>
              </div>
              <Progress
                value={budget.percentage}
                className={budget.isOverBudget ? "bg-red-200" : ""}
                indicatorClassName={budget.isOverBudget ? "bg-red-500" : (
                  budget.percentage > 80 ? "bg-orange-500" : "bg-green-500"
                )}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <div>
                  {budget.percentage}% used
                </div>
                <div>
                  {budget.isOverBudget ? (
                    <span className="text-red-500">
                      {formatCurrency(Math.abs(budget.remaining))} over budget
                    </span>
                  ) : (
                    <span>{formatCurrency(budget.remaining)} remaining</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {budgetProgress.length > 3 && (
          <Button
            variant="ghost"
            className="w-full mt-4"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "Show less" : `Show ${budgetProgress.length - 3} more`}
          </Button>
        )}
      </CardContent>
      <Separator />
      <CardFooter className="pt-4">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => navigate("/budgets")}
        >
          <span>Manage all budgets</span>
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}
