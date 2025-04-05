import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuthStore } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import { Loader2, CalendarIcon, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { toast } from "sonner";
import { DayContentProps } from "react-day-picker";

type CalendarTransaction = {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: 'income' | 'expense';
};

const FinancialCalendar = () => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [month, setMonth] = useState<Date>(new Date());
  const [transactions, setTransactions] = useState<CalendarTransaction[]>([]);
  const [selectedDateTransactions, setSelectedDateTransactions] = useState<CalendarTransaction[]>([]);
  
  // Mock data generator
  const generateMockTransactions = (month: Date): CalendarTransaction[] => {
    const transactions: CalendarTransaction[] = [];
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    
    // Generate 1-3 transactions for random days in the month
    for (let i = 1; i <= daysInMonth; i++) {
      // Randomly decide if this day has transactions (about 40% chance)
      if (Math.random() < 0.4) {
        const numTransactions = Math.floor(Math.random() * 3) + 1; // 1-3 transactions
        const date = new Date(month.getFullYear(), month.getMonth(), i);
        
        for (let j = 0; j < numTransactions; j++) {
          const isIncome = Math.random() < 0.3; // 30% chance of income
          const transaction: CalendarTransaction = {
            id: `transaction-${i}-${j}-${month.getMonth()}-${month.getFullYear()}`,
            date: new Date(date),
            description: isIncome 
              ? ['Salary', 'Freelance Payment', 'Investment Return', 'Gift Received'][Math.floor(Math.random() * 4)]
              : ['Groceries', 'Rent', 'Utilities', 'Dining', 'Shopping', 'Entertainment', 'Transport'][Math.floor(Math.random() * 7)],
            amount: isIncome 
              ? Math.floor(Math.random() * 1000) + 500 // Income: $500-$1500
              : Math.floor(Math.random() * 200) + 50, // Expense: $50-$250
            type: isIncome ? 'income' : 'expense'
          };
          transactions.push(transaction);
        }
      }
    }
    
    return transactions;
  };

  // Fetch transactions for the selected month
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // In a real app, you would fetch data from an API
        // For this example, we'll simulate a delay and use mock data
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockTransactions = generateMockTransactions(month);
        setTransactions(mockTransactions);
        
        // Update selected day data if needed
        if (selectedDate) {
          updateSelectedDayData(selectedDate, mockTransactions);
        }
      } catch (error) {
        console.error("Error fetching calendar data:", error);
        toast.error("Failed to load financial calendar data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user, month]);
  
  // Update selected day data
  const updateSelectedDayData = (
    date: Date,
    transactionsData: CalendarTransaction[] = transactions
  ) => {
    const dayTransactions = transactionsData.filter(
      (t) => t.date.getDate() === date.getDate() &&
      t.date.getMonth() === date.getMonth() &&
      t.date.getFullYear() === date.getFullYear()
    );
    setSelectedDateTransactions(dayTransactions);
  };

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      updateSelectedDayData(date);
    } else {
      setSelectedDateTransactions([]);
    }
  };

  // Handle month change
  const handleMonthChange = (newMonth: Date) => {
    setMonth(newMonth);
  };

  // Get CSS class for days with transactions
  const getDayClass = (date: Date): string => {
    const hasTransactions = transactions.some(
      (t) => t.date.getDate() === date.getDate() &&
      t.date.getMonth() === date.getMonth() &&
      t.date.getFullYear() === date.getFullYear()
    );
    
    if (hasTransactions) {
      // Check if there are any income transactions for this date
      const hasIncome = transactions.some(
        (t) => t.date.getDate() === date.getDate() &&
        t.date.getMonth() === date.getMonth() &&
        t.date.getFullYear() === date.getFullYear() &&
        t.type === 'income'
      );
      
      // Check if there are any expense transactions for this date
      const hasExpense = transactions.some(
        (t) => t.date.getDate() === date.getDate() &&
        t.date.getMonth() === date.getMonth() &&
        t.date.getFullYear() === date.getFullYear() &&
        t.type === 'expense'
      );
      
      if (hasIncome && hasExpense) {
        return "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-purple-500";
      } else if (hasIncome) {
        return "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-green-500";
      } else {
        return "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-red-500";
      }
    }
    
    return "";
  };

  // Custom day content renderer for the calendar
  const renderDayContent = (props: DayContentProps) => {
    const customClass = getDayClass(props.date);
    return (
      <div className={customClass}>
        {props.children}
      </div>
    );
  };

  const totalIncome = selectedDateTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpense = selectedDateTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const netAmount = totalIncome - totalExpense;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Financial Calendar</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Financial Events</CardTitle>
              <CardDescription>
                Track your income and expenses throughout the month
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-[400px]">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  onMonthChange={handleMonthChange}
                  className="rounded-md border"
                  components={{
                    DayContent: renderDayContent
                  }}
                />
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {selectedDate ? (
                    <span>
                      {new Intl.DateTimeFormat('en-US', { 
                        month: 'long', 
                        day: 'numeric',
                        year: 'numeric' 
                      }).format(selectedDate)}
                    </span>
                  ) : (
                    <span>Select a Date</span>
                  )}
                </CardTitle>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon">
                      <CalendarIcon className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <CardDescription>
                {selectedDateTransactions.length > 0 
                  ? `${selectedDateTransactions.length} transaction${selectedDateTransactions.length > 1 ? 's' : ''}`
                  : 'No transactions for this date'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDateTransactions.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Income</h3>
                      <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalIncome)}</p>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Expenses</h3>
                      <p className="text-xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totalExpense)}</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Net Amount</h3>
                    <p className={`text-2xl font-bold ${netAmount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatCurrency(netAmount)}
                    </p>
                  </div>
                  
                  <div className="border-t pt-4 mt-4">
                    <h3 className="font-medium mb-3">Transactions</h3>
                    <div className="space-y-3">
                      {selectedDateTransactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                          <div className="flex items-center">
                            {transaction.type === 'income' ? (
                              <ArrowUpCircle className="h-5 w-5 text-green-500 mr-2" />
                            ) : (
                              <ArrowDownCircle className="h-5 w-5 text-red-500 mr-2" />
                            )}
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Intl.DateTimeFormat('en-US', { 
                                  hour: 'numeric', 
                                  minute: 'numeric' 
                                }).format(transaction.date)}
                              </p>
                            </div>
                          </div>
                          <span className={`font-medium ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">Select a date with transactions or create a new transaction.</p>
                  <Button className="mt-4" variant="outline">Add Transaction</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FinancialCalendar;
