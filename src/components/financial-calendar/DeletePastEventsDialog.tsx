
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Trash2 } from "lucide-react";

interface DeletePastEventsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDeletePastEvents: () => void;
  isDeleting?: boolean;
}

export const DeletePastEventsDialog = ({ 
  isOpen, 
  onOpenChange, 
  onDeletePastEvents,
  isDeleting = false
}: DeletePastEventsDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={onDeletePastEvents}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>Delete</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const DeletePastEventsButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <Button variant="outline" size="sm" onClick={onClick}>
      <Trash2 className="mr-2 h-4 w-4" />
      Delete Past Events
    </Button>
  );
};
