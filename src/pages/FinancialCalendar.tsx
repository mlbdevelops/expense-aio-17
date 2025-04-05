
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client-extended";
import { formatCurrency } from "@/lib/utils";
import { Loader2, CalendarIcon, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { toast } from "sonner";

type CalendarTransaction = {
  id: string;
  description: string;
  amount: number;
  date: Date;
  is_income: boolean;
};

type CalendarBudget = {
  id: string;
  category: string;
  amount: number;
  period: string;
  due_date: Date;
};

type CalendarSavingsGoal = {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: Date | null;
};

const FinancialCalendar = () => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [month, setMonth] = useState<Date>(new Date());
  const [transactions, setTransactions] = useState<CalendarTransaction[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<CalendarSavingsGoal[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date());
  const [transactionsForDay, setTransactionsForDay] = useState<CalendarTransaction[]>([]);
  const [savingsGoalsForDay, setSavingsGoalsForDay] = useState<CalendarSavingsGoal[]>([]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      try {
        // Fetch transactions for the month
        const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
        const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);
        
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .select('*')
          .gte('date', startOfMonth.toISOString().split('T')[0])
          .lte('date', endOfMonth.toISOString().split('T')[0]);
        
        if (transactionsError) throw transactionsError;
        
        // Fetch savings goals with target dates in this month
        const { data: savingsData, error: savingsError } = await supabase
          .from('savings_goals')
          .select('*')
          .not('target_date', 'is', null)
          .gte('target_date', startOfMonth.toISOString().split('T')[0])
          .lte('target_date', endOfMonth.toISOString().split('T')[0]);
        
        if (savingsError) throw savingsError;
        
        // Format data for calendar
        const formattedTransactions = transactionsData.map((transaction) => ({
          ...transaction,
          date: new Date(transaction.date),
        }));
        
        const formattedSavingsGoals = savingsData.map((goal) => ({
          ...goal,
          target_date: goal.target_date ? new Date(goal.target_date) : null,
        }));
        
        setTransactions(formattedTransactions);
        setSavingsGoals(formattedSavingsGoals);
        
        // If a day is selected, update the transactions for that day
        if (selectedDay) {
          updateSelectedDayData(selectedDay, formattedTransactions, formattedSavingsGoals);
        }
      } catch (error: any) {
        console.error('Error fetching calendar data:', error);
        toast.error('Failed to load calendar data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user, month]);

  // Update selected day data
  const updateSelectedDayData = (
    day: Date, 
    allTransactions = transactions, 
    allSavingsGoals = savingsGoals
  ) => {
    const dayTransactions = allTransactions.filter(
      (t) => t.date.toDateString() === day.toDateString()
    );
    
    const daySavingsGoals = allSavingsGoals.filter(
      (g) => g.target_date && g.target_date.toDateString() === day.toDateString()
    );
    
    setTransactionsForDay(dayTransactions);
    setSavingsGoalsForDay(daySavingsGoals);
  };

  // Handle day selection
  const handleDaySelect = (day: Date | undefined) => {
    setSelectedDay(day);
    if (day) {
      updateSelectedDayData(day);
    }
  };

  // Get date class for styling calendar days
  const getDayClass = (day: Date) => {
    const dayString = day.toDateString();
    
    const hasTransaction = transactions.some(t => 
      t.date.toDateString() === dayString
    );
    
    const hasSavingsGoal = savingsGoals.some(g => 
      g.target_date && g.target_date.toDateString() === dayString
    );
    
    if (hasTransaction && hasSavingsGoal) {
      return "bg-amber-100 dark:bg-amber-900 rounded-md";
    } else if (hasTransaction) {
      return "bg-blue-100 dark:bg-blue-900 rounded-md";
    } else if (hasSavingsGoal) {
      return "bg-green-100 dark:bg-green-900 rounded-md";
    }
    
    return "";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financial Calendar</h1>
        <p className="text-muted-foreground">View and plan your financial activities by date</p>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
              <CardDescription>Visualize your transactions and goals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDay}
                    onSelect={handleDaySelect}
                    month={month}
                    onMonthChange={setMonth}
                    className="rounded-md border"
                    modifiers={{
                      hasActivity: (date) => {
                        const dateStr = date.toDateString();
                        return transactions.some(t => t.date.toDateString() === dateStr) ||
                          savingsGoals.some(g => g.target_date && g.target_date.toDateString() === dateStr);
                      }
                    }}
                    modifiersClassNames={{
                      hasActivity: "font-bold"
                    }}
                    components={{
                      Day: (props) => {
                        const customClass = getDayClass(props.date);
                        return (
                          <div className={customClass}>
                            {props.children}
                          </div>
                        );
                      }
                    }}
                  />
                </div>
                
                <div className="flex gap-4 justify-center text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>Transactions</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Savings Goals</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span>Both</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Day details */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDay ? (
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    {selectedDay.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                ) : (
                  "Select a date"
                )}
              </CardTitle>
              <CardDescription>
                {selectedDay ? "Activities scheduled for this day" : "Click on a date to see details"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDay && (
                <Tabs defaultValue="transactions">
                  <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                    <TabsTrigger value="goals">Savings Goals</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="transactions">
                    {transactionsForDay.length > 0 ? (
                      <div className="space-y-4">
                        {transactionsForDay.map((transaction) => (
                          <div key={transaction.id} className="flex items-center justify-between border-b pb-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-full ${transaction.is_income ? 'bg-green-100' : 'bg-red-100'}`}>
                                {transaction.is_income ? 
                                  <ArrowUpCircle className="h-4 w-4 text-green-500" /> : 
                                  <ArrowDownCircle className="h-4 w-4 text-red-500" />
                                }
                              </div>
                              <div>
                                <p className="font-medium">{transaction.description}</p>
                              </div>
                            </div>
                            <div className={`font-medium ${transaction.is_income ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.is_income ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        No transactions scheduled for this day
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="goals">
                    {savingsGoalsForDay.length > 0 ? (
                      <div className="space-y-4">
                        {savingsGoalsForDay.map((goal) => (
                          <div key={goal.id} className="border rounded-lg p-4">
                            <h3 className="font-medium">{goal.name}</h3>
                            <div className="mt-1 text-sm text-muted-foreground">
                              Target: {formatCurrency(goal.target_amount)}
                            </div>
                            <div className="mt-2">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progress</span>
                                <span>{Math.round((goal.current_amount / goal.target_amount) * 100)}%</span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary" 
                                  style={{ width: `${Math.min(100, (goal.current_amount / goal.target_amount) * 100)}%` }} 
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        No savings goals due on this day
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              )}
              
              {!selectedDay && (
                <div className="flex justify-center items-center h-[200px] text-muted-foreground">
                  <p>Select a day on the calendar to view scheduled activities</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FinancialCalendar;
