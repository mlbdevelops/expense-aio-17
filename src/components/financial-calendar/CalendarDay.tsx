
import { format } from "date-fns";
import { FinancialEvent } from "@/types/financial-calendar";

interface CalendarDayProps {
  day: Date;
  events: FinancialEvent[];
  onSelectDate: (date: Date) => void;
}

export const CalendarDay = ({ day, events, onSelectDate }: CalendarDayProps) => {
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

  const customClass = getDayClass(day);
  const dayNumber = day.getDate();
  
  return (
    <div className={customClass} onClick={() => onSelectDate(day)}>
      <div className="flex items-center justify-center h-9 w-9">
        {dayNumber}
      </div>
    </div>
  );
};
