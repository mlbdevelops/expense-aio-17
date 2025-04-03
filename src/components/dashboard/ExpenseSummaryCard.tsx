
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@/lib/transactions";
import { formatCurrency } from "@/lib/utils";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

interface ExpenseSummaryCardProps {
  transactions: Transaction[];
  isLoading: boolean;
}

export function ExpenseSummaryCard({ transactions, isLoading }: ExpenseSummaryCardProps) {
  // Calculate total income, expenses, and savings
  const totalIncome = transactions
    .filter((t) => t.isIncome)
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalExpenses = transactions
    .filter((t) => !t.isIncome)
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const savings = totalIncome - totalExpenses;
  
  // Calculate month-over-month change (simulated for demo)
  const previousMonthExpenses = totalExpenses * 0.9; // Simulated previous month (10% less)
  const expenseTrend = totalExpenses - previousMonthExpenses;
  const expenseTrendPercentage = (expenseTrend / previousMonthExpenses) * 100;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <ArrowUpIcon className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalIncome)}</div>
          <p className="text-xs text-muted-foreground">This month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <ArrowDownIcon className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
          <p className="text-xs text-muted-foreground">
            {expenseTrend > 0 ? (
              <span className="text-red-500">+{expenseTrendPercentage.toFixed(1)}% vs last month</span>
            ) : (
              <span className="text-green-500">{expenseTrendPercentage.toFixed(1)}% vs last month</span>
            )}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Savings</CardTitle>
          {savings >= 0 ? (
            <ArrowUpIcon className="h-4 w-4 text-green-500" />
          ) : (
            <ArrowDownIcon className="h-4 w-4 text-red-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${savings >= 0 ? "text-green-500" : "text-red-500"}`}>
            {formatCurrency(savings)}
          </div>
          <p className="text-xs text-muted-foreground">
            {savings >= 0 ? "You're saving money" : "You're spending more than earning"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
