
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client-extended";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// Define types
type Budget = {
  id: string;
  category: string;
  amount: number;
};

type Transaction = {
  id: string;
  category: string;
  amount: number;
  is_income: boolean;
};

type CategoryTotal = {
  name: string;
  budgeted: number;
  spent: number;
  remaining: number;
};

// COLORS for charts
const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A020F0", 
  "#40E0D0", "#FF6347", "#B0E0E6", "#FFA07A", "#20B2AA",
  "#FF69B4", "#7B68EE", "#32CD32", "#FF4500", "#4682B4"
];

const BudgetSummary = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalBudgeted, setTotalBudgeted] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState<CategoryTotal[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // Fetch budgets
      const { data: budgetsData, error: budgetsError } = await supabase
        .from('budgets')
        .select('id, category, amount');
      
      if (budgetsError) {
        console.error('Error fetching budgets:', budgetsError);
      } else {
        setBudgets(budgetsData || []);
        
        // Calculate total budgeted
        const total = budgetsData?.reduce((sum, b) => sum + Number(b.amount), 0) || 0;
        setTotalBudgeted(total);
      }
      
      // Fetch expense transactions (not including income)
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('id, category, amount, is_income')
        .eq('is_income', false);
      
      if (transactionsError) {
        console.error('Error fetching transactions:', transactionsError);
      } else {
        setTransactions(transactionsData || []);
        
        // Calculate total spent
        const total = transactionsData?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
        setTotalSpent(total);
      }
      
      setIsLoading(false);
    };
    
    fetchData();
  }, []);
  
  // Calculate category totals for comparison
  useEffect(() => {
    if (budgets.length === 0) return;
    
    const totals: CategoryTotal[] = [];
    
    // Group expenses by category
    const expensesByCategory: Record<string, number> = {};
    transactions.forEach(t => {
      if (!t.is_income) {
        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + Number(t.amount);
      }
    });
    
    // Create category totals
    budgets.forEach(budget => {
      const spent = expensesByCategory[budget.category] || 0;
      totals.push({
        name: budget.category,
        budgeted: Number(budget.amount),
        spent: spent,
        remaining: Number(budget.amount) - spent,
      });
    });
    
    // Sort by budget amount (descending)
    totals.sort((a, b) => b.budgeted - a.budgeted);
    
    setCategoryTotals(totals);
  }, [budgets, transactions]);
  
  // Prepare data for budget allocation pie chart
  const budgetPieData = budgets.map(budget => ({
    name: budget.category,
    value: Number(budget.amount),
  }));
  
  // Prepare data for spending by category pie chart
  const spendingByCategory: Record<string, number> = {};
  transactions.forEach(t => {
    if (!t.is_income) {
      spendingByCategory[t.category] = (spendingByCategory[t.category] || 0) + Number(t.amount);
    }
  });
  
  const spendingPieData = Object.entries(spendingByCategory).map(([name, value]) => ({
    name,
    value,
  }));
  
  // Custom tooltip for charts - fix the ValueType issue
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-2 border rounded shadow-sm">
          <p className="font-medium">{payload[0].name}</p>
          <p>{formatCurrency(Number(payload[0].value))}</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Budget Summary</h1>
        <p className="text-muted-foreground">Overview of your budget allocations and spending</p>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Budgeted
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalBudgeted)}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Spent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Remaining Budget
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${totalBudgeted - totalSpent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(totalBudgeted - totalSpent)}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Budget Allocation Chart */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Budget Allocation</CardTitle>
                <CardDescription>How your budget is distributed across categories</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {budgetPieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={budgetPieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {budgetPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend layout="vertical" verticalAlign="middle" align="right" />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No budget data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Spending by Category Chart */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
                <CardDescription>Where your money has been spent</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {spendingPieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={spendingPieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {spendingPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend layout="vertical" verticalAlign="middle" align="right" />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No spending data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Budget vs. Spending Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Budget vs. Actual Spending</CardTitle>
              <CardDescription>Compare your budgeted amounts with your actual spending</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              {categoryTotals.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryTotals}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                    <YAxis tickFormatter={(value) => formatCurrency(value).replace('$', '')} />
                    <Tooltip 
                      formatter={(value) => {
                        // Fix: Ensure value is treated as a number
                        return formatCurrency(Number(value));
                      }} 
                    />
                    <Legend />
                    <Bar dataKey="budgeted" name="Budgeted" fill="#0088FE" />
                    <Bar dataKey="spent" name="Spent" fill="#FF8042" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No comparison data available</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Category Details Table */}
          <Card>
            <CardHeader>
              <CardTitle>Category Details</CardTitle>
              <CardDescription>Detailed breakdown of budgets and spending by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Category</th>
                      <th className="text-right p-2">Budgeted</th>
                      <th className="text-right p-2">Spent</th>
                      <th className="text-right p-2">Remaining</th>
                      <th className="text-right p-2">% Used</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryTotals.map((category, index) => {
                      const percentUsed = category.budgeted > 0 
                        ? (category.spent / category.budgeted) * 100 
                        : 0;
                      
                      return (
                        <tr key={index} className="border-b">
                          <td className="p-2">{category.name}</td>
                          <td className="text-right p-2">{formatCurrency(category.budgeted)}</td>
                          <td className="text-right p-2">{formatCurrency(category.spent)}</td>
                          <td className={`text-right p-2 ${category.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(category.remaining)}
                          </td>
                          <td className={`text-right p-2 ${percentUsed > 100 ? 'text-red-600' : percentUsed > 80 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {percentUsed.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default BudgetSummary;
