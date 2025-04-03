
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction, CATEGORIES, TransactionCategory } from "@/lib/transactions";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BarChart3, PieChart as PieChartIcon, Loader2 } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

interface ExpenseChartProps {
  transactions: Transaction[];
  isLoading: boolean;
}

export function ExpenseChart({ transactions, isLoading }: ExpenseChartProps) {
  const { theme } = useTheme();
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  
  // Filter out income transactions and calculate expenses by category
  const expenseTransactions = transactions.filter(t => !t.isIncome);
  
  // Group expenses by category
  const expensesByCategory: Record<string, number> = {};
  
  expenseTransactions.forEach(transaction => {
    if (!expensesByCategory[transaction.category]) {
      expensesByCategory[transaction.category] = 0;
    }
    expensesByCategory[transaction.category] += transaction.amount;
  });
  
  // Convert to array for chart
  const chartData = Object.entries(expensesByCategory)
    .map(([category, amount]) => ({
      name: CATEGORIES[category as TransactionCategory].label,
      value: amount,
      color: CATEGORIES[category as TransactionCategory].color,
    }))
    .sort((a, b) => b.value - a.value);
  
  // For bar chart, limit to top 5 categories
  const barData = chartData.slice(0, 5);
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover p-2 border rounded-md shadow-sm">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
  
    return null;
  };

  if (isLoading) {
    return (
      <Card className="col-span-full h-[350px]">
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
          <CardDescription>Loading your expense data...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="col-span-full h-[350px]">
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
          <CardDescription>No expense data available</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px] text-muted-foreground">
          Add some expenses to see your spending breakdown
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center">
        <div className="flex-1">
          <CardTitle>Expense Breakdown</CardTitle>
          <CardDescription>How you're spending your money</CardDescription>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={chartType === 'pie' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setChartType('pie')}
          >
            <PieChartIcon className="h-4 w-4 mr-1" />
            Pie
          </Button>
          <Button
            variant={chartType === 'bar' ? 'secondary' : 'ghost'} 
            size="sm"
            onClick={() => setChartType('bar')}
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            Bar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'pie' ? (
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          ) : (
            <BarChart
              data={barData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#333' : '#eee'} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                stroke={theme === 'dark' ? '#888' : '#666'}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke={theme === 'dark' ? '#888' : '#666'}
                tickFormatter={(value) => {
                  if (value >= 1000) return `$${value / 1000}k`;
                  return `$${value}`;
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
