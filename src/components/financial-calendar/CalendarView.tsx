
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, PlusCircle } from "lucide-react";
import { CalendarDay } from "./CalendarDay";
import { EventItem } from "./EventItem";
import { AddEventButton } from "./AddEventDialog";
import { FinancialEvent } from "@/types/financial-calendar";

interface CalendarViewProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  events: FinancialEvent[];
  isLoading: boolean;
  selectedDateEvents: FinancialEvent[];
  onCancelEvent: (eventId: string) => void;
  onAddEventClick: () => void;
}

export const CalendarView = ({
  selectedDate,
  onSelectDate,
  events,
  isLoading,
  selectedDateEvents,
  onCancelEvent,
  onAddEventClick
}: CalendarViewProps) => {
  return (
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
              onSelect={(date) => date && onSelectDate(date)}
              className="rounded-md border"
              components={{
                Day: ({ date, ...props }) => (
                  <CalendarDay 
                    day={date} 
                    events={events} 
                    onSelectDate={onSelectDate}
                  />
                ),
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
                  <EventItem 
                    key={event.id} 
                    event={event} 
                    onCancelEvent={onCancelEvent} 
                  />
                ))}
              </div>
            )}
            <div className="mt-4">
              <AddEventButton onClick={onAddEventClick} selectedDate={selectedDate} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
