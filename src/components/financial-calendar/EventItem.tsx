
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { ArrowUpCircle, ArrowDownCircle, Trash2 } from "lucide-react";
import { FinancialEvent } from "@/types/financial-calendar";

interface EventItemProps {
  event: FinancialEvent;
  isList?: boolean;
  onCancelEvent: (eventId: string) => void;
}

export const EventItem = ({ event, isList = false, onCancelEvent }: EventItemProps) => {
  const eventDate = event.date instanceof Date ? event.date : new Date(event.date as string);

  if (isList) {
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
              onClick={() => onCancelEvent(event.id)}
              className="text-destructive hover:text-destructive/90"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
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
            onClick={() => onCancelEvent(event.id)}
            className="text-xs text-destructive hover:text-destructive/90"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};
