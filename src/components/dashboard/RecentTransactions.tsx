
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Transaction, CATEGORIES } from "@/lib/transactions";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { ArrowRight, ChevronRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RecentTransactionsProps {
  transactions: Transaction[];
  isLoading: boolean;
}

export function RecentTransactions({ transactions, isLoading }: RecentTransactionsProps) {
  const navigate = useNavigate();
  
  // Sort transactions by date (newest first) and take the most recent 5
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest financial activity</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (recentTransactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest financial activity</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[200px] text-center">
          <p className="text-muted-foreground mb-4">No transactions yet</p>
          <Button 
            onClick={() => navigate("/transactions/new")}
            className="expense-gradient"
          >
            Add your first transaction
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your latest financial activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="w-2 h-10 rounded"
                  style={{
                    backgroundColor: CATEGORIES[transaction.category].color,
                  }}
                />
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(transaction.date), "MMM d, yyyy")} • {CATEGORIES[transaction.category].label}
                  </p>
                </div>
              </div>
              <div className={`font-medium ${transaction.isIncome ? "text-green-500" : ""}`}>
                {transaction.isIncome ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <Separator />
      <CardFooter className="pt-4">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => navigate("/transactions")}
        >
          <span>View all transactions</span>
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}
