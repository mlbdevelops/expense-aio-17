
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/lib/auth";
import { CalendarView } from "@/components/financial-calendar/CalendarView";
import { ListView } from "@/components/financial-calendar/ListView";
import { ViewControls } from "@/components/financial-calendar/ViewControls";
import { AddEventDialog, AddEventButton } from "@/components/financial-calendar/AddEventDialog";
import { DeletePastEventsDialog, DeletePastEventsButton } from "@/components/financial-calendar/DeletePastEventsDialog";
import { CalendarView as CalendarViewType, FinancialEvent } from "@/types/financial-calendar";
import { fetchEvents, addEvent, cancelEvent, deletePastEvents } from "@/services/financial-calendar-service";

const FinancialCalendar = () => {
  const [events, setEvents] = useState<FinancialEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<CalendarViewType>("month");
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isDeletePastEventsDialogOpen, setIsDeletePastEventsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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
    const loadEvents = async () => {
      setIsLoading(true);
      const fetchedEvents = await fetchEvents();
      setEvents(fetchedEvents);
      setIsLoading(false);
    };
    
    loadEvents();
  }, []);

  useEffect(() => {
    setNewEvent(prev => ({
      ...prev,
      date: selectedDate
    }));
  }, [selectedDate]);

  const handleAddEvent = async () => {
    const addedEvent = await addEvent(newEvent, user?.id);
    
    if (addedEvent) {
      setEvents([...events, addedEvent]);
      
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

  const handleCancelEvent = async (eventId: string) => {
    const success = await cancelEvent(eventId);
    
    if (success) {
      setEvents(events.map(event => 
        event.id === eventId 
          ? { ...event, canceled: true } 
          : event
      ));
    }
  };

  const handleDeletePastEvents = async () => {
    setIsDeleting(true);
    try {
      console.log("Starting deletion process with events:", events);
      const deletedEventIds = await deletePastEvents(events);
      console.log("Deletion completed. Deleted IDs:", deletedEventIds);
      
      if (deletedEventIds && deletedEventIds.length > 0) {
        // Create a new array with the filtered events
        const updatedEvents = events.filter(event => !deletedEventIds.includes(event.id));
        console.log("Events after filtering:", updatedEvents);
        setEvents(updatedEvents);
      }
    } catch (error) {
      console.error("Error in delete operation:", error);
    } finally {
      setIsDeleting(false);
      setIsDeletePastEventsDialogOpen(false);
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
            <ViewControls view={view} onViewChange={setView} />
            
            <div className="flex gap-2">
              <DeletePastEventsButton onClick={() => setIsDeletePastEventsDialogOpen(true)} />
              <AddEventButton onClick={() => setIsAddEventOpen(true)} />
            </div>
          </div>
          
          <CalendarView
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            events={events}
            isLoading={isLoading}
            selectedDateEvents={selectedDateEvents}
            onCancelEvent={handleCancelEvent}
            onAddEventClick={() => setIsAddEventOpen(true)}
          />
        </TabsContent>
        
        <TabsContent value="list">
          <ListView 
            events={events}
            isLoading={isLoading}
            onCancelEvent={handleCancelEvent}
            onAddEventClick={() => setIsAddEventOpen(true)}
            onDeletePastEventsClick={() => setIsDeletePastEventsDialogOpen(true)}
          />
        </TabsContent>
      </Tabs>

      <AddEventDialog
        selectedDate={selectedDate}
        isOpen={isAddEventOpen}
        onOpenChange={setIsAddEventOpen}
        onAddEvent={handleAddEvent}
        newEvent={newEvent}
        onInputChange={handleInputChange}
      />

      <DeletePastEventsDialog
        isOpen={isDeletePastEventsDialogOpen}
        onOpenChange={setIsDeletePastEventsDialogOpen}
        onDeletePastEvents={handleDeletePastEvents}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default FinancialCalendar;
