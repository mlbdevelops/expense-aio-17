
import { useState } from "react";
import { format } from "date-fns";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PlusCircle } from "lucide-react";
import { FinancialEvent } from "@/types/financial-calendar";

interface AddEventDialogProps {
  selectedDate: Date;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddEvent: () => void;
  newEvent: Partial<FinancialEvent>;
  onInputChange: (field: string, value: string | number | boolean | Date) => void;
}

export const AddEventDialog = ({ 
  selectedDate, 
  isOpen, 
  onOpenChange, 
  onAddEvent, 
  newEvent, 
  onInputChange 
}: AddEventDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
              onChange={(e) => onInputChange("title", e.target.value)}
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
              onChange={(e) => onInputChange("amount", parseFloat(e.target.value) || 0)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select
              value={newEvent.category || 'expense'}
              onValueChange={(value) => onInputChange("category", value)}
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
              onChange={(e) => onInputChange("description", e.target.value)}
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
                onCheckedChange={(value) => onInputChange("is_recurring", value)}
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
                onValueChange={(value) => onInputChange("recurrence_interval", value)}
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
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={onAddEvent}>
            Add Event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const AddEventButton = ({ 
  onClick, 
  selectedDate 
}: { 
  onClick: () => void, 
  selectedDate?: Date 
}) => {
  return (
    <Button onClick={onClick} className="w-full">
      <PlusCircle className="mr-2 h-4 w-4" />
      Add Event{selectedDate ? ` for ${format(selectedDate, "MMM d")}` : ""}
    </Button>
  );
};
