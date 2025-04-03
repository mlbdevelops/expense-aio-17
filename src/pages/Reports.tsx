
import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/auth";
import { useTransactionStore, TransactionCategory } from "@/lib/transactions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { generateInsights, Insight } from "@/lib/ai-insights";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

const Reports = () => {
  const { user } = useAuthStore();
  const { transactions, fetchTransactions, isLoading } = useTransactionStore();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [timeframe, setTimeframe] = useState("month");
  const [selectedCategory, setSelectedCategory] = useState<TransactionCategory | "all">("all");
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  
  useEffect(() => {
    if (user?.id) {
      fetchTransactions(user.id);
    }
  }, [user?.id, fetchTransactions]);

  useEffect(() => {
    const loadInsights = async () => {
      if (user?.id && transactions.length > 0) {
        setIsLoadingInsights(true);
        try {
          const generatedInsights = await generateInsights(user.id, transactions);
          setInsights(generatedInsights);
        } catch (error) {
          console.error("Error generating insights:", error);
        } finally {
          setIsLoadingInsights(false);
        }
      }
    };

    loadInsights();
  }, [user?.id, transactions]);

  // Filter transactions based on timeframe
  const getFilteredTransactions = () => {
    if (!transactions.length) return [];
    
    const now = new Date();
    const filtered = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      
      switch (timeframe) {
        case "week":
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(now.getDate() - 7);
          return transactionDate >= oneWeekAgo;
        case "month":
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(now.getMonth() - 1);
          return transactionDate >= oneMonthAgo;
        case "year":
          const oneYearAgo = new Date();
          oneYearAgo.setFullYear(now.getFullYear() - 1);
          return transactionDate >= oneYearAgo;
        case "all":
        default:
          return true;
      }
    });
    
    // Further filter by category if selected
    if (selectedCategory !== "all") {
      return filtered.filter(t => t.category === selectedCategory);
    }
    
    return filtered;
  };

  // Prepare data for charts
  const prepareChartData = () => {
    const filteredTransactions = getFilteredTransactions();
    
    // Category spending data for pie chart
    const categoryData = filteredTransactions.reduce((acc, transaction) => {
      if (!transaction.isIncome) {
        const category = transaction.category;
        acc[category] = (acc[category] || 0) + transaction.amount;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const pieData = Object.entries(categoryData).map(([name, value]) => ({
      name,
      value
    }));

    // Monthly spending data for bar chart
    const monthlyData: Record<string, number> = {};
    filteredTransactions.forEach(transaction => {
      if (!transaction.isIncome) {
        const month = format(new Date(transaction.date), 'MMM yyyy');
        monthlyData[month] = (monthlyData[month] || 0) + transaction.amount;
      }
    });

    const barData = Object.entries(monthlyData).map(([name, amount]) => ({
      name,
      amount
    }));

    // Income vs Expense data for line chart
    const timeData: Record<string, { income: number; expense: number }> = {};
    filteredTransactions.forEach(transaction => {
      let timeKey;
      if (timeframe === "week") {
        timeKey = format(new Date(transaction.date), 'EEE');
      } else if (timeframe === "month") {
        timeKey = format(new Date(transaction.date), 'dd MMM');
      } else {
        timeKey = format(new Date(transaction.date), 'MMM yyyy');
      }
      
      if (!timeData[timeKey]) {
        timeData[timeKey] = { income: 0, expense: 0 };
      }
      
      if (transaction.isIncome) {
        timeData[timeKey].income += transaction.amount;
      } else {
        timeData[timeKey].expense += transaction.amount;
      }
    });

    const lineData = Object.entries(timeData).map(([date, data]) => ({
      date,
      income: data.income,
      expense: data.expense
    }));

    return { pieData, barData, lineData };
  };

  const { pieData, barData, lineData } = prepareChartData();
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#FF6B6B', '#67C23A', '#909399'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Financial Reports</h1>
          <p className="text-muted-foreground">Analyze your spending patterns and trends</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Select
            value={timeframe}
            onValueChange={setTimeframe}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Past Week</SelectItem>
              <SelectItem value="month">Past Month</SelectItem>
              <SelectItem value="year">Past Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory as (value: string) => void}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="food">Food & Dining</SelectItem>
              <SelectItem value="housing">Housing</SelectItem>
              <SelectItem value="transportation">Transportation</SelectItem>
              <SelectItem value="utilities">Utilities</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="entertainment">Entertainment</SelectItem>
              <SelectItem value="shopping">Shopping</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="travel">Travel</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="category">By Category</TabsTrigger>
          <TabsTrigger value="time">Over Time</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Spending</CardTitle>
                <CardDescription>Your spending over the past months</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : barData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Amount']} />
                      <Bar dataKey="amount" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex justify-center items-center h-full text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Income vs. Expenses</CardTitle>
                <CardDescription>Compare your earnings and spending</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : lineData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, '']} />
                      <Legend />
                      <Line type="monotone" dataKey="income" stroke="#4ade80" strokeWidth={2} />
                      <Line type="monotone" dataKey="expense" stroke="#f87171" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex justify-center items-center h-full text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="category">
          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
              <CardDescription>Breakdown of your expenses</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, '']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex justify-center items-center h-full text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="time">
          <Card>
            <CardHeader>
              <CardTitle>Expense Trends</CardTitle>
              <CardDescription>Track how your spending changes over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : barData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Amount']} />
                    <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex justify-center items-center h-full text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle>AI Financial Insights</CardTitle>
              <CardDescription>Smart analysis of your spending patterns</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingInsights ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : insights.length > 0 ? (
                <div className="space-y-4">
                  {insights.map((insight) => (
                    <div 
                      key={insight.id} 
                      className={`p-4 border rounded-lg ${
                        insight.importance === 'high' 
                          ? 'border-red-200 bg-red-50' 
                          : insight.importance === 'medium'
                            ? 'border-yellow-200 bg-yellow-50'
                            : 'border-blue-200 bg-blue-50'
                      }`}
                    >
                      <h3 className="font-medium text-lg">{insight.title}</h3>
                      <p className="mt-1">{insight.description}</p>
                      {insight.relevantCategories.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {insight.relevantCategories.map(category => (
                            <span 
                              key={category} 
                              className="px-2 py-1 bg-white rounded-full text-xs font-medium border"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Not enough transaction data to generate insights.</p>
                  <p className="text-sm mt-1">Add more transactions to get personalized financial advice.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
