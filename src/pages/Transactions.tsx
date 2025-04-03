
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/lib/auth";
import { useTransactionStore } from "@/lib/transactions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

const Transactions = () => {
  const { user } = useAuthStore();
  const { transactions, fetchTransactions, isLoading } = useTransactionStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      fetchTransactions(user.id);
    }
  }, [user?.id, fetchTransactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const getCategoryBadgeClass = (category: string) => {
    const baseClass = "px-2 py-1 rounded-full text-xs font-medium";
    switch (category) {
      case "food": return `${baseClass} bg-orange-100 text-orange-800`;
      case "transportation": return `${baseClass} bg-blue-100 text-blue-800`;
      case "housing": return `${baseClass} bg-indigo-100 text-indigo-800`;
      case "entertainment": return `${baseClass} bg-purple-100 text-purple-800`;
      case "shopping": return `${baseClass} bg-pink-100 text-pink-800`;
      case "healthcare": return `${baseClass} bg-green-100 text-green-800`;
      case "travel": return `${baseClass} bg-yellow-100 text-yellow-800`;
      case "education": return `${baseClass} bg-teal-100 text-teal-800`;
      case "income": return `${baseClass} bg-emerald-100 text-emerald-800`;
      default: return `${baseClass} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">View and manage your transactions</p>
        </div>
        <Button onClick={() => navigate('/transactions/new')} className="ml-auto">
          <Plus className="mr-2 h-4 w-4" /> Add Transaction
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-md" />
              ))}
            </div>
          ) : transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="flex items-center justify-between p-4 rounded-lg border hover:shadow-sm transition-shadow"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{transaction.description}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-muted-foreground">{formatDate(transaction.date)}</span>
                      <span className={getCategoryBadgeClass(transaction.category)}>
                        {transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className={`font-semibold ${transaction.category === 'income' ? 'text-green-600' : ''}`}>
                    {transaction.category === 'income' ? '+' : ''}{formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No transactions found.</p>
              <Button 
                variant="outline" 
                onClick={() => navigate('/transactions/new')} 
                className="mt-4"
              >
                Add your first transaction
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Transactions;
