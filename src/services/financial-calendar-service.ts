
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
      return [];
    }
    
    // Delete from database
    const { error } = await supabase
      .from('transactions')
      .delete()
      .in('id', pastEventIds);
    
    if (error) {
      throw error;
    }
    
    toast.success(`Successfully deleted ${pastEventIds.length} past or canceled event${pastEventIds.length !== 1 ? 's' : ''}`);
    return pastEventIds;
  } catch (error) {
    console.error('Error deleting past events:', error);
    toast.error("Failed to delete past events. Please try again.");
    return [];
  }
};
