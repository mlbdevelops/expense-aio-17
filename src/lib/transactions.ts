
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';

export type TransactionCategory = 
  | 'food' 
  | 'housing' 
  | 'transportation' 
  | 'entertainment' 
  | 'utilities' 
  | 'healthcare' 
  | 'shopping' 
  | 'personal' 
  | 'education' 
  | 'travel' 
  | 'income' 
  | 'other';

export const CATEGORIES: Record<TransactionCategory, { label: string; color: string }> = {
  food: { label: 'Food & Dining', color: '#4CAF50' },
  housing: { label: 'Housing', color: '#2196F3' },
  transportation: { label: 'Transportation', color: '#FF9800' },
  entertainment: { label: 'Entertainment', color: '#9C27B0' },
  utilities: { label: 'Utilities', color: '#607D8B' },
  healthcare: { label: 'Healthcare', color: '#F44336' },
  shopping: { label: 'Shopping', color: '#E91E63' },
  personal: { label: 'Personal', color: '#3F51B5' },
  education: { label: 'Education', color: '#009688' },
  travel: { label: 'Travel', color: '#673AB7' },
  income: { label: 'Income', color: '#8BC34A' },
  other: { label: 'Other', color: '#795548' }
};

export interface Transaction {
  id: string;
  userId: string;
  description: string;
  amount: number;
  date: string;
  category: TransactionCategory;
  isIncome: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface TransactionStore {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  fetchTransactions: (userId: string) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  categorizeWithAI: (description: string) => Promise<TransactionCategory>;
}

// Sample demo transactions data
const DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    userId: '1',
    description: 'Grocery shopping at Whole Foods',
    amount: 89.74,
    date: '2023-04-01',
    category: 'food',
    isIncome: false,
    notes: 'Weekly grocery run',
    createdAt: '2023-04-01T10:30:00Z',
    updatedAt: '2023-04-01T10:30:00Z'
  },
  {
    id: '2',
    userId: '1',
    description: 'Monthly rent payment',
    amount: 1200,
    date: '2023-04-01',
    category: 'housing',
    isIncome: false,
    createdAt: '2023-04-01T11:00:00Z',
    updatedAt: '2023-04-01T11:00:00Z'
  },
  {
    id: '3',
    userId: '1',
    description: 'Salary deposit',
    amount: 3500,
    date: '2023-03-25',
    category: 'income',
    isIncome: true,
    notes: 'Monthly salary',
    createdAt: '2023-03-25T09:00:00Z',
    updatedAt: '2023-03-25T09:00:00Z'
  },
  {
    id: '4',
    userId: '1',
    description: 'Netflix subscription',
    amount: 14.99,
    date: '2023-03-20',
    category: 'entertainment',
    isIncome: false,
    createdAt: '2023-03-20T15:30:00Z',
    updatedAt: '2023-03-20T15:30:00Z'
  },
  {
    id: '5',
    userId: '1',
    description: 'Gas station fill-up',
    amount: 45.67,
    date: '2023-03-18',
    category: 'transportation',
    isIncome: false,
    createdAt: '2023-03-18T18:00:00Z',
    updatedAt: '2023-03-18T18:00:00Z'
  },
  {
    id: '6',
    userId: '1',
    description: 'Dinner at Italian restaurant',
    amount: 87.50,
    date: '2023-03-15',
    category: 'food',
    isIncome: false,
    notes: 'Date night',
    createdAt: '2023-03-15T20:30:00Z',
    updatedAt: '2023-03-15T20:30:00Z'
  },
  {
    id: '7',
    userId: '1',
    description: 'Electric bill payment',
    amount: 124.33,
    date: '2023-03-10',
    category: 'utilities',
    isIncome: false,
    createdAt: '2023-03-10T14:45:00Z',
    updatedAt: '2023-03-10T14:45:00Z'
  },
  {
    id: '8',
    userId: '1',
    description: 'Freelance project payment',
    amount: 750,
    date: '2023-03-08',
    category: 'income',
    isIncome: true,
    notes: 'Website design project',
    createdAt: '2023-03-08T11:15:00Z',
    updatedAt: '2023-03-08T11:15:00Z'
  },
  {
    id: '9',
    userId: '1',
    description: 'New laptop purchase',
    amount: 1299.99,
    date: '2023-03-05',
    category: 'shopping',
    isIncome: false,
    notes: 'For work',
    createdAt: '2023-03-05T16:20:00Z',
    updatedAt: '2023-03-05T16:20:00Z'
  },
  {
    id: '10',
    userId: '1',
    description: 'Doctor\'s appointment',
    amount: 40,
    date: '2023-03-02',
    category: 'healthcare',
    isIncome: false,
    createdAt: '2023-03-02T09:30:00Z',
    updatedAt: '2023-03-02T09:30:00Z'
  },
  {
    id: '11',
    userId: '2',
    description: 'Monthly rent',
    amount: 1400,
    date: '2023-04-01',
    category: 'housing',
    isIncome: false,
    createdAt: '2023-04-01T08:00:00Z',
    updatedAt: '2023-04-01T08:00:00Z'
  },
  {
    id: '12',
    userId: '2',
    description: 'Salary',
    amount: 4200,
    date: '2023-03-28',
    category: 'income',
    isIncome: true,
    createdAt: '2023-03-28T10:00:00Z',
    updatedAt: '2023-03-28T10:00:00Z'
  }
];

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set, get) => ({
      transactions: [],
      isLoading: false,
      error: null,
      fetchTransactions: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // Filter transactions for the current user
          const userTransactions = DEMO_TRANSACTIONS.filter(t => t.userId === userId);
          set({ transactions: userTransactions });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch transactions';
          set({ error: errorMessage });
          toast.error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },
      addTransaction: async (transactionData) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 600));
          
          const newTransaction: Transaction = {
            ...transactionData,
            id: Math.random().toString(36).substring(2, 9),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          set(state => ({
            transactions: [...state.transactions, newTransaction]
          }));
          
          toast.success('Transaction added successfully');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to add transaction';
          set({ error: errorMessage });
          toast.error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },
      updateTransaction: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 600));
          
          set(state => ({
            transactions: state.transactions.map(transaction => 
              transaction.id === id 
                ? { 
                    ...transaction, 
                    ...updates, 
                    updatedAt: new Date().toISOString() 
                  } 
                : transaction
            )
          }));
          
          toast.success('Transaction updated successfully');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update transaction';
          set({ error: errorMessage });
          toast.error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },
      deleteTransaction: async (id) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 600));
          
          set(state => ({
            transactions: state.transactions.filter(transaction => transaction.id !== id)
          }));
          
          toast.success('Transaction deleted successfully');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete transaction';
          set({ error: errorMessage });
          toast.error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },
      categorizeWithAI: async (description: string) => {
        try {
          // Simulate AI categorization with predefined mappings
          const lowerDesc = description.toLowerCase();
          
          // Create a mapping of keywords to categories
          const categoryMapping: Record<string, TransactionCategory> = {
            'grocery': 'food',
            'restaurant': 'food',
            'dining': 'food',
            'café': 'food',
            'cafe': 'food',
            'coffee': 'food',
            'food': 'food',
            
            'rent': 'housing',
            'mortgage': 'housing',
            'apartment': 'housing',
            'house': 'housing',
            
            'gas': 'transportation',
            'uber': 'transportation',
            'lyft': 'transportation',
            'taxi': 'transportation',
            'subway': 'transportation',
            'train': 'transportation',
            'bus': 'transportation',
            'transport': 'transportation',
            
            'movie': 'entertainment',
            'netflix': 'entertainment',
            'spotify': 'entertainment',
            'hulu': 'entertainment',
            'disney': 'entertainment',
            'amazon prime': 'entertainment',
            'entertainment': 'entertainment',
            'game': 'entertainment',
            
            'electric': 'utilities',
            'electricity': 'utilities',
            'water': 'utilities',
            'gas bill': 'utilities',
            'phone': 'utilities',
            'internet': 'utilities',
            'wifi': 'utilities',
            'utility': 'utilities',
            
            'doctor': 'healthcare',
            'hospital': 'healthcare',
            'medical': 'healthcare',
            'pharmacy': 'healthcare',
            'medicine': 'healthcare',
            'dental': 'healthcare',
            'health': 'healthcare',
            
            'amazon': 'shopping',
            'walmart': 'shopping',
            'target': 'shopping',
            'purchase': 'shopping',
            'buy': 'shopping',
            'store': 'shopping',
            'mall': 'shopping',
            
            'haircut': 'personal',
            'spa': 'personal',
            'gym': 'personal',
            'fitness': 'personal',
            'personal': 'personal',
            
            'tuition': 'education',
            'school': 'education',
            'college': 'education',
            'university': 'education',
            'course': 'education',
            'class': 'education',
            'education': 'education',
            'book': 'education',
            
            'flight': 'travel',
            'hotel': 'travel',
            'airbnb': 'travel',
            'vacation': 'travel',
            'trip': 'travel',
            'travel': 'travel',
            
            'salary': 'income',
            'paycheck': 'income',
            'deposit': 'income',
            'dividend': 'income',
            'refund': 'income',
            'income': 'income',
            'payment received': 'income'
          };
          
          // Try to match the description to a category
          for (const [keyword, category] of Object.entries(categoryMapping)) {
            if (lowerDesc.includes(keyword)) {
              return category;
            }
          }
          
          // If no match is found, return 'other'
          return 'other';
        } catch (error) {
          console.error('Error categorizing transaction:', error);
          toast.error('Failed to categorize transaction');
          return 'other';
        }
      }
    }),
    {
      name: 'transaction-storage'
    }
  )
);
