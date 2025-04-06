
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2, ArrowUpCircle, ArrowDownCircle, Trash2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO, isBefore } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/auth";

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
  canceled?: boolean;
};

type CalendarView = "month" | "week" | "day";

const FinancialCalendar = () => {
  const [events, setEvents] = useState<FinancialEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<CalendarView>("month");
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isDeletePastEventsDialogOpen, setIsDeletePastEventsDialogOpen] = useState(false);
  const { user } = useAuthStore();
  const [newEvent, setNewEvent] = useState<Partial<FinancialEvent>>({
    title: "",
    date: new Date(),
    amount: 0,
    category: "expense",
    description: "",
    is_recurring: false,
    recurrence_interval: "monthly"
  });

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*');
        
        if (error) {
          throw error;
        }
        
        const formattedEvents: FinancialEvent[] = data.map(transaction => {
          const dateStr = transaction.date;
          const parsedDate = parseISO(dateStr); // Use parseISO for ISO format strings
          
          return {
            id: transaction.id,
            title: transaction.description || "No Title",
            date: parsedDate,
            amount: transaction.amount || 0,
            category: transaction.category || "expense",
            description: transaction.notes || "",
            is_recurring: false,
            user_id: transaction.user_id
          };
        });
        
        setEvents(formattedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error("Failed to load events. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvents();
  }, []);

  useEffect(() => {
    setNewEvent(prev => ({
      ...prev,
      date: selectedDate
    }));
  }, [selectedDate]);

  const handleAddEvent = async () => {
    try {
      if (!newEvent.title || !newEvent.amount) {
        toast.error("Please fill in all required fields");
        return;
      }
      
      // Ensure we're working with a proper Date object
      const dateToStore = newEvent.date instanceof Date 
        ? newEvent.date
        : new Date(newEvent.date as string);
      
      const formattedDate = format(dateToStore, 'yyyy-MM-dd');
      
      const eventToAdd = {
        description: newEvent.title || '',
        amount: newEvent.amount || 0,
        category: newEvent.category || 'expense',
        notes: newEvent.description || null,
        date: formattedDate,
        is_income: newEvent.category === 'income',
        user_id: user?.id || null
      };
      
      const { data, error } = await supabase
        .from('transactions')
        .insert(eventToAdd)
        .select();
      
      if (error) {
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error('No data returned after insertion');
      }
      
      const newTransaction = data[0];
      const parsedDate = parseISO(newTransaction.date);
      
      const newFinancialEvent: FinancialEvent = {
        id: newTransaction.id,
        title: newTransaction.description || "No Title",
        date: parsedDate,
        amount: newTransaction.amount || 0,
        category: newTransaction.category || "expense",
        description: newTransaction.notes || "",
        is_recurring: false,
        user_id: newTransaction.user_id
      };
      
      setEvents([...events, newFinancialEvent]);
      
      setNewEvent({
        title: "",
        date: selectedDate,
        amount: 0,
        category: "expense",
        description: "",
        is_recurring: false,
        recurrence_interval: "monthly"
      });
      setIsAddEventOpen(false);
      
      toast.success("Event added successfully.");
    } catch (error) {
      console.error('Error adding event:', error);
      toast.error("Failed to add event. Please try again.");
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean | Date) => {
    setNewEvent({
      ...newEvent,
      [field]: value
    });
  };

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

  const renderDay = (day: Date, modifiers: any) => {
    const dayNumber = day.getDate();
    const customClass = getDayClass(day);
    
    return (
      <div className={customClass} onClick={() => setSelectedDate(day)}>
        <div className="flex items-center justify-center h-9 w-9">
          {dayNumber}
        </div>
      </div>
    );
  };

  const handleDeletePastEvents = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get all past events
      const pastEventIds = events
        .filter(event => {
          const eventDate = event.date instanceof Date 
            ? event.date 
            : new Date(event.date as string);
          return isBefore(eventDate, today) || event.canceled;
        })
        .map(event => event.id);
      
      if (pastEventIds.length === 0) {
        toast.info("No past or canceled events to delete");
        setIsDeletePastEventsDialogOpen(false);
        return;
      }
      
      // Delete from database
      const { error } = await supabase
        .from('transactions')
        .delete()
        .in('id', pastEventIds);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setEvents(events.filter(event => {
        const eventDate = event.date instanceof Date 
          ? event.date 
          : new Date(event.date as string);
        return !isBefore(eventDate, today) && !event.canceled;
      }));
      
      toast.success(`Successfully deleted ${pastEventIds.length} past or canceled event${pastEventIds.length !== 1 ? 's' : ''}`);
      setIsDeletePastEventsDialogOpen(false);
    } catch (error) {
      console.error('Error deleting past events:', error);
      toast.error("Failed to delete past events. Please try again.");
    }
  };

  const handleCancelEvent = async (eventId: string) => {
    try {
      // Mark event as canceled in database
      const { error } = await supabase
        .from('transactions')
        .update({ canceled: true })
        .eq('id', eventId);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setEvents(events.map(event => 
        event.id === eventId 
          ? { ...event, canceled: true } 
          : event
      ));
      
      toast.success("Event canceled successfully");
    } catch (error) {
      console.error('Error canceling event:', error);
      toast.error("Failed to cancel event. Please try again.");
    }
  };

  const selectedDateEvents = getEventsForDate(selectedDate);

  return (
    <div className="space-y-6 pt-1.5">
      <div>
        <h1 className="page-title">Financial Calendar</h1>
        <p className="text-muted-foreground">
          Track your financial events and recurring transactions
        </p>
      </div>

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-wrap gap-2">
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
            
            <div className="flex gap-2">
              <Dialog open={isDeletePastEventsDialogOpen} onOpenChange={setIsDeletePastEventsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Past Events
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Past Events</DialogTitle>
                    <DialogDescription>
                      This will permanently delete all events that have already passed and any canceled events. This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex items-center justify-center my-4">
                    <AlertCircle className="h-12 w-12 text-destructive" />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDeletePastEventsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="button" variant="destructive" onClick={handleDeletePastEvents}>
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
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
                      Create a new financial event for {format(selectedDate, "MMMM d, yyyy")}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">
                        Title
                      </Label>
                      <Input
                        id="title"
                        value={newEvent.title || ''}
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
                        value={newEvent.amount || 0}
                        onChange={(e) => handleInputChange("amount", parseFloat(e.target.value) || 0)}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="category" className="text-right">
                        Category
                      </Label>
                      <Select
                        value={newEvent.category || 'expense'}
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
                        value={newEvent.description || ''}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="recurring" className="text-right">
                        Recurring
                      </Label>
                      <div className="flex items-center space-x-2 col-span-3">
                        <Switch
                          id="recurring"
                          checked={newEvent.is_recurring || false}
                          onCheckedChange={(value) => handleInputChange("is_recurring", value)}
                        />
                        <Label htmlFor="recurring" className="text-sm">
                          This is a recurring event
                        </Label>
                      </div>
                    </div>
                    {newEvent.is_recurring && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="recurrence" className="text-right">
                          Repeat
                        </Label>
                        <Select
                          value={newEvent.recurrence_interval || 'monthly'}
                          onValueChange={(value) => handleInputChange("recurrence_interval", value)}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select interval" />
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
                    <Button type="button" variant="outline" onClick={() => setIsAddEventOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="button" onClick={handleAddEvent}>
                      Add Event
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>{format(selectedDate, "MMMM yyyy")}</CardTitle>
              <CardDescription>
                Select a date to view or add financial events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:mx-auto">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border"
                    components={{
                      Day: ({ date, ...props }) => renderDay(date, props),
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Events for {format(selectedDate, "MMMM d, yyyy")}
                  </h3>
                  {isLoading ? (
                    <div className="flex justify-center p-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : selectedDateEvents.length === 0 ? (
                    <p className="text-muted-foreground text-center p-4">
                      No events for this date. Add one to get started.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {selectedDateEvents.map((event) => (
                        <div key={event.id} className={`border rounded-md p-3 ${event.canceled ? 'bg-muted opacity-70' : ''}`}>
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium">
                              {event.title}
                              {event.canceled && <span className="ml-2 text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 px-2 py-1 rounded-full">Canceled</span>}
                            </h4>
                            <span className={`text-sm font-medium ${
                              event.category === 'income' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {event.category === 'income' ? '+' : '-'}${event.amount}
                            </span>
                          </div>
                          {event.description && (
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center">
                              <span className="text-xs bg-muted px-2 py-1 rounded-full">
                                {event.category}
                              </span>
                              {event.is_recurring && (
                                <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded-full ml-2">
                                  Repeats {event.recurrence_interval}
                                </span>
                              )}
                            </div>
                            {!event.canceled && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleCancelEvent(event.id)}
                                className="text-xs text-destructive hover:text-destructive/90"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-4">
                    <Button onClick={() => setIsAddEventOpen(true)} className="w-full">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Event for {format(selectedDate, "MMM d")}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="list">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center">
              <div>
                <CardTitle>All Financial Events</CardTitle>
                <CardDescription>
                  View all your upcoming and past financial events
                </CardDescription>
              </div>
              <Dialog open={isDeletePastEventsDialogOpen} onOpenChange={setIsDeletePastEventsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="mt-4 sm:mt-0">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Past Events
                  </Button>
                </DialogTrigger>
              </Dialog>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">You don't have any financial events yet.</p>
                  <Button onClick={() => setIsAddEventOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Your First Event
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.from(new Set(events.map(event => {
                    const date = event.date instanceof Date ? event.date : new Date(event.date as string);
                    return format(date, 'MMMM yyyy');
                  }))).sort((a, b) => {
                    const dateA = new Date(a);
                    const dateB = new Date(b);
                    return dateB.getTime() - dateA.getTime();
                  }).map(monthYear => (
                    <div key={monthYear}>
                      <h3 className="font-medium text-lg mb-2">{monthYear}</h3>
                      <div className="space-y-2">
                        {events
                          .filter(event => {
                            const date = event.date instanceof Date ? event.date : new Date(event.date as string);
                            return format(date, 'MMMM yyyy') === monthYear;
                          })
                          .sort((a, b) => {
                            const dateA = a.date instanceof Date ? a.date : new Date(a.date as string);
                            const dateB = b.date instanceof Date ? b.date : new Date(b.date as string);
                            return dateB.getTime() - dateA.getTime();
                          })
                          .map(event => {
                            const eventDate = event.date instanceof Date ? event.date : new Date(event.date as string);
                            return (
                              <div key={event.id} className={`flex items-center justify-between border-b pb-2 ${event.canceled ? 'opacity-70' : ''}`}>
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-full ${
                                    event.category === 'income' ? 'bg-green-100' : 'bg-red-100'
                                  }`}>
                                    {event.category === 'income' ? 
                                      <ArrowUpCircle className="h-4 w-4 text-green-500" /> : 
                                      <ArrowDownCircle className="h-4 w-4 text-red-500" />
                                    }
                                  </div>
                                  <div>
                                    <p className="font-medium">
                                      {event.title}
                                      {event.canceled && <span className="ml-2 text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 px-2 py-1 rounded-full">Canceled</span>}
                                    </p>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                      <span>{format(eventDate, 'MMMM d, yyyy')}</span>
                                      {event.is_recurring && (
                                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-1 rounded">
                                          Recurring
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className={`font-medium ${
                                    event.category === 'income' ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {event.category === 'income' ? '+' : '-'}${event.amount}
                                  </div>
                                  {!event.canceled && (
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => handleCancelEvent(event.id)}
                                      className="text-destructive hover:text-destructive/90"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
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
