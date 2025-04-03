
import { ExpenseSummaryCard } from "@/components/dashboard/ExpenseSummaryCard";
import { ExpenseChart } from "@/components/dashboard/ExpenseChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { BudgetProgress } from "@/components/dashboard/BudgetProgress";
import { AISavingTips } from "@/components/dashboard/AISavingTips";
import { useAuthStore } from "@/lib/auth";
import { useTransactionStore } from "@/lib/transactions";
import { useBudgetStore } from "@/lib/budgets";
import { useEffect } from "react";

const Dashboard = () => {
  const { user } = useAuthStore();
  const { transactions, fetchTransactions, isLoading: isLoadingTransactions } = useTransactionStore();
  const { budgets, fetchBudgets, isLoading: isLoadingBudgets } = useBudgetStore();
  
  useEffect(() => {
    if (user?.id) {
      fetchTransactions(user.id);
      fetchBudgets(user.id);
    }
  }, [user?.id, fetchTransactions, fetchBudgets]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}! Here's an overview of your finances.
        </p>
      </div>

      <ExpenseSummaryCard
        transactions={transactions}
        isLoading={isLoadingTransactions}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ExpenseChart 
          transactions={transactions}
          isLoading={isLoadingTransactions}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RecentTransactions 
          transactions={transactions}
          isLoading={isLoadingTransactions}
        />
        <BudgetProgress 
          budgets={budgets}
          transactions={transactions}
          isLoading={isLoadingBudgets || isLoadingTransactions}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {user && (
          <AISavingTips 
            userId={user.id} 
            transactions={transactions}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
