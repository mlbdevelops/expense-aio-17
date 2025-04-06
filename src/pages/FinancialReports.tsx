import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client-extended";
import { useAuthStore } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import { Loader2, Download, PieChart, BarChart as BarChartIcon, TrendingUp, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { toast } from "sonner";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Legend } from "recharts";
import { useMediaQuery } from "@/hooks/useMediaQuery";

type TransactionData = {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  is_income: boolean;
};

type CategoryTotal = {
  name: string;
  amount: number;
};

type MonthlyTotal = {
  month: string;
  income: number;
  expenses: number;
  savings: number;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

const FinancialReports = () => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [timeRange, setTimeRange] = useState("3months");
  const [categoryTotals, setCategoryTotals] = useState<CategoryTotal[]>([]);
  const [monthlyTotals, setMonthlyTotals] = useState<MonthlyTotal[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<CategoryTotal[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<CategoryTotal[]>([]);
  const [savingsRate, setSavingsRate] = useState(0);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      try {
        const now = new Date();
        let startDate: Date;
        
        switch (timeRange) {
          case "1month":
            startDate = startOfMonth(subMonths(now, 1));
            break;
          case "3months":
            startDate = startOfMonth(subMonths(now, 3));
            break;
          case "6months":
            startDate = startOfMonth(subMonths(now, 6));
            break;
          case "12months":
            startDate = startOfMonth(subMonths(now, 12));
            break;
          default:
            startDate = startOfMonth(subMonths(now, 3));
        }
        
        const endDate = endOfMonth(now);
        
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .gte('date', startDate.toISOString().split('T')[0])
          .lte('date', endDate.toISOString().split('T')[0])
          .order('date', { ascending: false });
        
        if (error) throw error;
        
        setTransactions(data || []);
        
        processTransactionsData(data || []);
      } catch (error: any) {
        console.error('Error fetching transactions for reports:', error);
        toast.error('Failed to load financial data for reports');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user, timeRange]);

  const processTransactionsData = (data: TransactionData[]) => {
    const expenseCategoryMap = new Map<string, number>();
    const incomeCategoryMap = new Map<string, number>();
    
    const monthlyMap = new Map<string, { income: number; expenses: number }>();
    
    let totalIncome = 0;
    let totalExpenses = 0;
    
    data.forEach(transaction => {
      const { amount, category, is_income, date } = transaction;
      const monthKey = format(new Date(date), 'MMM yyyy');
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { income: 0, expenses: 0 });
      }
      
      const monthData = monthlyMap.get(monthKey)!;
      
      if (is_income) {
        monthData.income += amount;
        totalIncome += amount;
        
        const currentAmount = incomeCategoryMap.get(category) || 0;
        incomeCategoryMap.set(category, currentAmount + amount);
      } else {
        monthData.expenses += amount;
        totalExpenses += amount;
        
        const currentAmount = expenseCategoryMap.get(category) || 0;
        expenseCategoryMap.set(category, currentAmount + amount);
      }
      
      monthlyMap.set(monthKey, monthData);
    });
    
    const expenseCategoryTotals: CategoryTotal[] = Array.from(expenseCategoryMap.entries())
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
    
    const incomeCategoryTotals: CategoryTotal[] = Array.from(incomeCategoryMap.entries())
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
    
    const monthlyData: MonthlyTotal[] = Array.from(monthlyMap.entries())
      .map(([month, { income, expenses }]) => ({
        month,
        income,
        expenses,
        savings: income - expenses
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
    
    const savingsRateValue = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    
    setExpenseCategories(expenseCategoryTotals);
    setIncomeCategories(incomeCategoryTotals);
    setMonthlyTotals(monthlyData);
    setSavingsRate(savingsRateValue);
  };

  const exportCSV = () => {
    if (transactions.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    const csvHeader = 'Date,Description,Category,Amount,Type\n';
    const csvContent = transactions.map(transaction => {
      return `${transaction.date},"${transaction.description}","${transaction.category}",${transaction.amount},${transaction.is_income ? 'Income' : 'Expense'}`;
    }).join('\n');
    
    const blob = new Blob([csvHeader + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `financial_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Report exported successfully');
  };

  const getChartHeight = () => {
    return isMobile ? 300 : 400;
  };

  return (
    <div className="space-y-6 pt-1.5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
          <p className="text-muted-foreground">Analyze your income, expenses and savings</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="12months">Last Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={exportCSV} variant="outline" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : transactions.length === 0 ? (
        <Card className="text-center p-8">
          <CardContent>
            <p className="text-muted-foreground">No transaction data available for the selected time period.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-green-600">
                  {formatCurrency(incomeCategories.reduce((sum, category) => sum + category.amount, 0))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-red-600">
                  {formatCurrency(expenseCategories.reduce((sum, category) => sum + category.amount, 0))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">
                  {savingsRate > 0 ? `${savingsRate.toFixed(1)}%` : '0%'}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="flex flex-wrap">
              <TabsTrigger value="overview" className="flex-grow md:flex-grow-0">
                <TrendingUp className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="income" className="flex-grow md:flex-grow-0">
                <BarChartIcon className="h-4 w-4 mr-2" />
                Income
              </TabsTrigger>
              <TabsTrigger value="expenses" className="flex-grow md:flex-grow-0">
                <PieChart className="h-4 w-4 mr-2" />
                Expenses
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Overview</CardTitle>
                  <CardDescription>Income, expenses and savings by month</CardDescription>
                </CardHeader>
                <CardContent className="w-full">
                  <div className="w-full overflow-x-auto">
                    <div style={{ height: getChartHeight(), minWidth: isMobile ? '500px' : '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart
                          data={monthlyTotals}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value: number) => formatCurrency(value)}
                            labelFormatter={(label) => `Month: ${label}`}
                          />
                          <Legend />
                          <Bar dataKey="income" name="Income" fill="#4ade80" />
                          <Bar dataKey="expenses" name="Expenses" fill="#f87171" />
                          <Bar dataKey="savings" name="Savings" fill="#60a5fa" />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="income">
              <Card>
                <CardHeader>
                  <CardTitle>Income by Category</CardTitle>
                  <CardDescription>Breakdown of income sources</CardDescription>
                </CardHeader>
                <CardContent className="w-full">
                  <div className="w-full overflow-x-auto">
                    <div style={{ height: getChartHeight(), minWidth: isMobile ? '300px' : '100%' }}>
                      {incomeCategories.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={incomeCategories}
                              cx="50%"
                              cy="50%"
                              labelLine={!isMobile}
                              outerRadius={isMobile ? 100 : 140}
                              fill="#8884d8"
                              dataKey="amount"
                              nameKey="name"
                              label={isMobile ? undefined : ({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {incomeCategories.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex justify-center items-center h-full">
                          <p className="text-muted-foreground">No income data to display</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="expenses">
              <Card>
                <CardHeader>
                  <CardTitle>Expenses by Category</CardTitle>
                  <CardDescription>Where your money is going</CardDescription>
                </CardHeader>
                <CardContent className="w-full">
                  <div className="w-full overflow-x-auto">
                    <div style={{ height: getChartHeight(), minWidth: isMobile ? '300px' : '100%' }}>
                      {expenseCategories.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={expenseCategories}
                              cx="50%"
                              cy="50%"
                              labelLine={!isMobile}
                              outerRadius={isMobile ? 100 : 140}
                              fill="#8884d8"
                              dataKey="amount"
                              nameKey="name"
                              label={isMobile ? undefined : ({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {expenseCategories.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex justify-center items-center h-full">
                          <p className="text-muted-foreground">No expense data to display</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default FinancialReports;
