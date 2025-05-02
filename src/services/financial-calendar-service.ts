
import { format, parseISO, isBefore } from "date-fns";
import { supabase } from "@/integrations/supabase/client-extended";
import { FinancialEvent } from "@/types/financial-calendar";
import { toast } from "sonner";

export const fetchEvents = async (): Promise<FinancialEvent[]> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    const formattedEvents: FinancialEvent[] = data.map(transaction => {
      const dateStr = transaction.date;
      const parsedDate = parseISO(dateStr);
      
      return {
        id: transaction.id,
        title: transaction.description || "No Title",
        date: parsedDate,
        amount: transaction.amount || 0,
        category: transaction.category || "expense",
        description: transaction.notes || "",
        is_recurring: false,
        user_id: transaction.user_id,
        canceled: transaction.canceled
      };
    });
    
    return formattedEvents;
  } catch (error) {
    console.error('Error fetching events:', error);
    toast.error("Failed to load events. Please try again later.");
    return [];
  }
};

export const addEvent = async (newEvent: Partial<FinancialEvent>, userId: string | undefined): Promise<FinancialEvent | null> => {
  try {
    if (!newEvent.title || !newEvent.amount) {
      toast.error("Please fill in all required fields");
      return null;
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
      user_id: userId || null
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
      user_id: newTransaction.user_id,
      canceled: newTransaction.canceled
    };
    
    toast.success("Event added successfully.");
    return newFinancialEvent;
  } catch (error) {
    console.error('Error adding event:', error);
    toast.error("Failed to add event. Please try again.");
    return null;
  }
};

export const cancelEvent = async (eventId: string): Promise<boolean> => {
  try {
    // Mark event as canceled in database
    const { error } = await supabase
      .from('transactions')
      .update({ canceled: true })
      .eq('id', eventId);
    
    if (error) {
      console.error('Error details:', error);
      throw error;
    }
    
    toast.success("Event canceled successfully");
    return true;
  } catch (error) {
    console.error('Error canceling event:', error);
    toast.error("Failed to cancel event. Please try again.");
    return false;
  }
};

export const deletePastEvents = async (events: FinancialEvent[]): Promise<string[]> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get all past events
    const pastEvents = events
      .filter(event => {
        const eventDate = event.date instanceof Date 
          ? event.date 
          : new Date(event.date as string);
        return isBefore(eventDate, today) || event.canceled;
      });
    
    if (pastEvents.length === 0) {
      toast.info("No past or canceled events to delete");
      return [];
    }
    
    // Extract IDs properly ensuring they're strings
    const pastEventIds = pastEvents.map(event => event.id);
    
    console.log("Filtered events to delete:", pastEvents);
    console.log("IDs to delete:", pastEventIds);
    
    if (pastEventIds.length === 0) {
      toast.info("No valid IDs found to delete");
      return [];
    }
    
    // Delete from database one by one to avoid IN operator issues
    let successfullyDeleted: string[] = [];
    let hasErrors = false;
    
    for (const id of pastEventIds) {
      console.log(`Attempting to delete ID: ${id}`);
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error(`Error deleting ID ${id}:`, error);
        hasErrors = true;
      } else {
        successfullyDeleted.push(id);
      }
    }
    
    if (hasErrors) {
      if (successfullyDeleted.length > 0) {
        toast.success(`Successfully deleted ${successfullyDeleted.length} out of ${pastEventIds.length} events`);
      } else {
        toast.error("Failed to delete events. Please try again.");
      }
    } else {
      toast.success(`Successfully deleted ${successfullyDeleted.length} past or canceled event${successfullyDeleted.length !== 1 ? 's' : ''}`);
    }
    
    return successfullyDeleted;
  } catch (error) {
    console.error('Error deleting past events:', error);
    toast.error("Failed to delete past events. Please try again.");
    return [];
  }
};
