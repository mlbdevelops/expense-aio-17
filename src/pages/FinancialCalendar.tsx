
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";

// Define types
type FinancialEvent = {
  id: string;
  title: string;
  date: Date | string;
  amount: number;
  category: string;
  description?: string;
  is_recurring: boolean;
  recurrence_interval?: string;
  user_id?: string;
};

type CalendarView = "month" | "week" | "day";

const FinancialCalendar = () => {
  const [events, setEvents] = useState<FinancialEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<CalendarView>("month");
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<FinancialEvent>>({
    title: "",
    date: new Date(),
    amount: 0,
    category: "expense",
    description: "",
    is_recurring: false,
    recurrence_interval: "monthly"
  });

  // Fetch events from the database
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        // Using transactions table as a substitute for financial_events
        const { data, error } = await supabase
          .from('transactions')
          .select('*');
        
        if (error) {
          throw error;
        }
        
        // Map transactions to FinancialEvent format
        const formattedEvents: FinancialEvent[] = data.map(transaction => ({
          id: transaction.id,
          title: transaction.description,
          date: new Date(transaction.date),
          amount: transaction.amount,
          category: transaction.category,
          description: transaction.notes || undefined,
          is_recurring: false, // Assuming transactions don't have recurrence info
          user_id: transaction.user_id
        }));
        
        setEvents(formattedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
        toast({
          title: "Error",
          description: "Failed to load events. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvents();
  }, []);

  // Handle adding a new event
  const handleAddEvent = async () => {
    try {
      // Create event to insert into the transactions table
      const eventToAdd = {
        description: newEvent.title || '',
        amount: newEvent.amount || 0,
        category: newEvent.category || 'expense',
        notes: newEvent.description || null,
        date: newEvent.date instanceof Date
          ? newEvent.date.toISOString().split('T')[0]
          : new Date(newEvent.date as string).toISOString().split('T')[0],
        is_income: newEvent.category === 'income',
        user_id: '00000000-0000-0000-0000-000000000000' // Placeholder user_id - in real app, use auth.uid()
      };
      
      const { data, error } = await supabase
        .from('transactions')
        .insert(eventToAdd)
        .select();
      
      if (error) {
        throw error;
      }
      
      // Add new event to state
      const newFinancialEvent: FinancialEvent = {
        id: data[0].id,
        title: data[0].description,
        date: new Date(data[0].date),
        amount: data[0].amount,
        category: data[0].category,
        description: data[0].notes || undefined,
        is_recurring: false,
        user_id: data[0].user_id
      };
      
      setEvents([...events, newFinancialEvent]);
      
      // Reset form and close dialog
      setNewEvent({
        title: "",
        date: new Date(),
        amount: 0,
        category: "expense",
        description: "",
        is_recurring: false,
        recurrence_interval: "monthly"
      });
      setIsAddEventOpen(false);
      
      toast({
        title: "Success",
        description: "Event added successfully.",
      });
    } catch (error) {
      console.error('Error adding event:', error);
      toast({
        title: "Error",
        description: "Failed to add event. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: string | number | boolean | Date) => {
    setNewEvent({
      ...newEvent,
      [field]: value
    });
  };

  // Get events for the selected date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = event.date instanceof Date
        ? event.date
        : new Date(event.date as string);
      
      return eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear();
    });
  };

  // Get CSS class for calendar days based on events
  const getDayClass = (date: Date) => {
    const eventsForDate = getEventsForDate(date);
    
    if (eventsForDate.length === 0) {
      return "relative";
    }
    
    const hasExpense = eventsForDate.some(event => event.category === "expense");
    const hasIncome = eventsForDate.some(event => event.category === "income");
    
    if (hasExpense && hasIncome) {
      return "relative bg-amber-100 dark:bg-amber-950/30";
    } else if (hasExpense) {
      return "relative bg-red-100 dark:bg-red-950/30";
    } else if (hasIncome) {
      return "relative bg-green-100 dark:bg-green-950/30";
    }
    
    return "relative";
  };

  // Custom day rendering for the calendar
  const renderDay = (day: any) => {
    const date = day.date;
    const customClass = getDayClass(date);
    return (
      <div className={customClass}>
        {day.children}
      </div>
    );
  };

  // Filter events based on the selected date
  const selectedDateEvents = getEventsForDate(selectedDate);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financial Calendar</h1>
        <p className="text-muted-foreground">
          Track your financial events and recurring transactions
        </p>
      </div>

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setView("month")}
                className={view === "month" ? "bg-primary text-primary-foreground" : ""}
              >
                Month
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setView("week")}
                className={view === "week" ? "bg-primary text-primary-foreground" : ""}
              >
                Week
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setView("day")}
                className={view === "day" ? "bg-primary text-primary-foreground" : ""}
              >
                Day
              </Button>
            </div>
            
            <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Event
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Financial Event</DialogTitle>
                  <DialogDescription>
                    Create a new financial event or reminder.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                      Title
                    </Label>
                    <Input
                      id="title"
                      value={newEvent.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount" className="text-right">
                      Amount
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newEvent.amount}
                      onChange={(e) => handleInputChange("amount", parseFloat(e.target.value))}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">
                      Category
                    </Label>
                    <Select
                      value={newEvent.category}
                      onValueChange={(value) => handleInputChange("category", value)}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="transfer">Transfer</SelectItem>
                        <SelectItem value="reminder">Reminder</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Input
                      id="description"
                      value={newEvent.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Recurring?</Label>
                    <div className="flex items-center space-x-2 col-span-3">
                      <Switch
                        checked={newEvent.is_recurring}
                        onCheckedChange={(checked) => handleInputChange("is_recurring", checked)}
                      />
                      <Label>This is a recurring event</Label>
                    </div>
                  </div>
                  {newEvent.is_recurring && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="recurrence" className="text-right">
                        Recurrence
                      </Label>
                      <Select
                        value={newEvent.recurrence_interval}
                        onValueChange={(value) => handleInputChange("recurrence_interval", value)}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select recurrence" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button onClick={handleAddEvent}>Add Event</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Calendar</CardTitle>
                  <CardDescription>
                    View and manage your financial events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border"
                    components={{
                      Day: renderDay
                    }}
                  />
                  <div className="mt-4 flex gap-2 text-sm">
                    <div className="flex items-center">
                      <div className="mr-1 h-3 w-3 rounded-full bg-green-100 dark:bg-green-950/30"></div>
                      <span>Income</span>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-1 h-3 w-3 rounded-full bg-red-100 dark:bg-red-950/30"></div>
                      <span>Expense</span>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-1 h-3 w-3 rounded-full bg-amber-100 dark:bg-amber-950/30"></div>
                      <span>Both</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Events for {format(selectedDate, "MMMM d, yyyy")}</CardTitle>
                  <CardDescription>
                    {selectedDateEvents.length} events scheduled
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedDateEvents.length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground">No events scheduled for this day</p>
                  ) : (
                    <div className="space-y-4">
                      {selectedDateEvents.map((event) => (
                        <div key={event.id} className="flex items-center justify-between border-b pb-2">
                          <div>
                            <p className="font-medium">{event.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {event.description || event.category}
                              {event.is_recurring && ` • Recurring ${event.recurrence_interval}`}
                            </p>
                          </div>
                          <div className={`font-medium ${
                            event.category === "income" ? "text-green-600" : 
                            event.category === "expense" ? "text-red-600" : 
                            "text-blue-600"
                          }`}>
                            {event.category === "income" ? "+" : 
                             event.category === "expense" ? "-" : ""}
                            ${event.amount.toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Financial Events</CardTitle>
              <CardDescription>
                A comprehensive list of all your financial events
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : events.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No events found</p>
              ) : (
                <div className="space-y-4">
                  {events.sort((a, b) => {
                    const dateA = a.date instanceof Date ? a.date : new Date(a.date as string);
                    const dateB = b.date instanceof Date ? b.date : new Date(b.date as string);
                    return dateA.getTime() - dateB.getTime();
                  }).map((event) => (
                    <div key={event.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(event.date instanceof Date ? event.date : new Date(event.date as string), "MMMM d, yyyy")}
                          {" • "}{event.description || event.category}
                          {event.is_recurring && ` • Recurring ${event.recurrence_interval}`}
                        </p>
                      </div>
                      <div className={`font-medium ${
                        event.category === "income" ? "text-green-600" : 
                        event.category === "expense" ? "text-red-600" : 
                        "text-blue-600"
                      }`}>
                        {event.category === "income" ? "+" : 
                         event.category === "expense" ? "-" : ""}
                        ${event.amount.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialCalendar;
