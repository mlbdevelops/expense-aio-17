
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle } from "lucide-react";
import { EventItem } from "./EventItem";
import { DeletePastEventsButton } from "./DeletePastEventsDialog";
import { FinancialEvent } from "@/types/financial-calendar";

interface ListViewProps {
  events: FinancialEvent[];
  isLoading: boolean;
  onCancelEvent: (eventId: string) => void;
  onAddEventClick: () => void;
  onDeletePastEventsClick: () => void;
}

export const ListView = ({
  events,
  isLoading,
  onCancelEvent,
  onAddEventClick,
  onDeletePastEventsClick
}: ListViewProps) => {
  // Group events by month/year
  const groupedEvents = Array.from(new Set(events.map(event => {
    const date = event.date instanceof Date ? event.date : new Date(event.date as string);
    return format(date, 'MMMM yyyy');
  }))).sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center">
        <div>
          <CardTitle>All Financial Events</CardTitle>
          <CardDescription>
            View all your upcoming and past financial events
          </CardDescription>
        </div>
        <DeletePastEventsButton onClick={onDeletePastEventsClick} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">You don't have any financial events yet.</p>
            <Button onClick={onAddEventClick}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Your First Event
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedEvents.map(monthYear => (
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
                    .map(event => (
                      <EventItem 
                        key={event.id} 
                        event={event} 
                        onCancelEvent={onCancelEvent} 
                        isList={true} 
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
