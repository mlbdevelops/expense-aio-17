
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { TransactionCategory, CATEGORIES } from './transactions';
import { supabase } from '@/integrations/supabase/client';

export interface Budget {
  id: string;
  user_id: string;
  category: TransactionCategory;
  amount: number;
  period: 'monthly' | 'yearly';
  created_at: string;
  updated_at: string;
}

interface BudgetStore {
  budgets: Budget[];
  isLoading: boolean;
  error: string | null;
  fetchBudgets: (userId: string) => Promise<void>;
  addBudget: (budget: Omit<Budget, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateBudget: (id: string, updates: Partial<Omit<Budget, 'id' | 'created_at' | 'updated_at'>>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
}

export const useBudgetStore = create<BudgetStore>()(
  persist(
    (set, get) => ({
      budgets: [],
      isLoading: false,
      error: null,
      fetchBudgets: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('budgets')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          
          set({ budgets: data as Budget[] });
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to fetch budgets';
          set({ error: errorMessage });
          toast.error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },
      addBudget: async (budgetData) => {
        set({ isLoading: true, error: null });
        try {
          // Check if budget for this category already exists
          const existingBudget = get().budgets.find(
            b => b.category === budgetData.category && b.user_id === budgetData.user_id
          );
          
          if (existingBudget) {
            throw new Error(`A budget for ${CATEGORIES[budgetData.category].label} already exists`);
          }
          
          const { data, error } = await supabase
            .from('budgets')
            .insert(budgetData)
            .select()
            .single();
          
          if (error) throw error;
          
          set(state => ({
            budgets: [...state.budgets, data as Budget]
          }));
          
          toast.success('Budget added successfully');
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to add budget';
          set({ error: errorMessage });
          toast.error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },
      updateBudget: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('budgets')
            .update({
              ...updates,
              updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();
          
          if (error) throw error;
          
          set(state => ({
            budgets: state.budgets.map(budget => 
              budget.id === id ? (data as Budget) : budget
            )
          }));
          
          toast.success('Budget updated successfully');
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to update budget';
          set({ error: errorMessage });
          toast.error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },
      deleteBudget: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase
            .from('budgets')
            .delete()
            .eq('id', id);
          
          if (error) throw error;
          
          set(state => ({
            budgets: state.budgets.filter(budget => budget.id !== id)
          }));
          
          toast.success('Budget deleted successfully');
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to delete budget';
          set({ error: errorMessage });
          toast.error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'budget-storage',
      partialize: (state) => ({ budgets: state.budgets })
    }
  )
);
