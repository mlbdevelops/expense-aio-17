
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { TransactionCategory, CATEGORIES } from './transactions';

export interface Budget {
  id: string;
  userId: string;
  category: TransactionCategory;
  amount: number;
  period: 'monthly' | 'yearly';
  createdAt: string;
  updatedAt: string;
}

interface BudgetStore {
  budgets: Budget[];
  isLoading: boolean;
  error: string | null;
  fetchBudgets: (userId: string) => Promise<void>;
  addBudget: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBudget: (id: string, updates: Partial<Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
}

// Sample budget data
const DEMO_BUDGETS: Budget[] = [
  {
    id: '1',
    userId: '1',
    category: 'food',
    amount: 500,
    period: 'monthly',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    userId: '1',
    category: 'housing',
    amount: 1500,
    period: 'monthly',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: '3',
    userId: '1',
    category: 'transportation',
    amount: 200,
    period: 'monthly',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: '4',
    userId: '1',
    category: 'entertainment',
    amount: 150,
    period: 'monthly',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: '5',
    userId: '1',
    category: 'utilities',
    amount: 300,
    period: 'monthly',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: '6',
    userId: '2',
    category: 'food',
    amount: 600,
    period: 'monthly',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  }
];

export const useBudgetStore = create<BudgetStore>()(
  persist(
    (set, get) => ({
      budgets: [],
      isLoading: false,
      error: null,
      fetchBudgets: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // Filter budgets for the current user
          const userBudgets = DEMO_BUDGETS.filter(b => b.userId === userId);
          set({ budgets: userBudgets });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch budgets';
          set({ error: errorMessage });
          toast.error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },
      addBudget: async (budgetData) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 600));
          
          // Check if budget for this category already exists
          const existingBudget = get().budgets.find(
            b => b.category === budgetData.category && b.userId === budgetData.userId
          );
          
          if (existingBudget) {
            throw new Error(`A budget for ${CATEGORIES[budgetData.category].label} already exists`);
          }
          
          const newBudget: Budget = {
            ...budgetData,
            id: Math.random().toString(36).substring(2, 9),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          set(state => ({
            budgets: [...state.budgets, newBudget]
          }));
          
          toast.success('Budget added successfully');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to add budget';
          set({ error: errorMessage });
          toast.error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },
      updateBudget: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 600));
          
          set(state => ({
            budgets: state.budgets.map(budget => 
              budget.id === id 
                ? { 
                    ...budget, 
                    ...updates, 
                    updatedAt: new Date().toISOString() 
                  } 
                : budget
            )
          }));
          
          toast.success('Budget updated successfully');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update budget';
          set({ error: errorMessage });
          toast.error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },
      deleteBudget: async (id) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 600));
          
          set(state => ({
            budgets: state.budgets.filter(budget => budget.id !== id)
          }));
          
          toast.success('Budget deleted successfully');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete budget';
          set({ error: errorMessage });
          toast.error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'budget-storage'
    }
  )
);
