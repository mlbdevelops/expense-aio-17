
import { Button } from "@/components/ui/button";
import { CalendarView } from "@/types/financial-calendar";

interface ViewControlsProps {
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
}

export const ViewControls = ({ view, onViewChange }: ViewControlsProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onViewChange("month")}
        className={view === "month" ? "bg-primary text-primary-foreground" : ""}
      >
        Month
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onViewChange("week")}
        className={view === "week" ? "bg-primary text-primary-foreground" : ""}
      >
        Week
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onViewChange("day")}
        className={view === "day" ? "bg-primary text-primary-foreground" : ""}
      >
        Day
      </Button>
    </div>
  );
};
