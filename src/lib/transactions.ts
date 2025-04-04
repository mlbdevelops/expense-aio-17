import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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

// First, make sure the transactions table exists
async function ensureTransactionsTableExists() {
  try {
    // Call the function to create the transactions table if it doesn't exist
    const { error } = await supabase.rpc('create_transactions_table');
    
    if (error) {
      console.error('Failed to ensure transactions table exists:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring transactions table exists:', error);
    return false;
  }
}

// Call this function early to make sure the table exists
ensureTransactionsTableExists();

// Maps a database transaction to our app format
function mapDbTransactionToAppTransaction(dbTransaction: any): Transaction {
  return {
    id: dbTransaction.id,
    userId: dbTransaction.user_id,
    description: dbTransaction.description,
    amount: dbTransaction.amount,
    date: dbTransaction.date,
    category: dbTransaction.category as TransactionCategory,
    isIncome: dbTransaction.is_income,
    notes: dbTransaction.notes,
    createdAt: dbTransaction.created_at,
    updatedAt: dbTransaction.updated_at
  };
}

// Demo transactions data to use as fallback
function getDemoTransactions(userId: string): Transaction[] {
  const DEMO_TRANSACTIONS = [
    {
      id: '1',
      userId: userId,
      description: 'Grocery shopping at Whole Foods',
      amount: 89.74,
      date: '2023-04-01',
      category: 'food' as TransactionCategory,
      isIncome: false,
      notes: 'Weekly grocery run',
      createdAt: '2023-04-01T10:30:00Z',
      updatedAt: '2023-04-01T10:30:00Z'
    },
    {
      id: '2',
      userId: userId,
      description: 'Monthly rent payment',
      amount: 1200,
      date: '2023-04-01',
      category: 'housing' as TransactionCategory,
      isIncome: false,
      notes: '',
      createdAt: '2023-04-01T11:00:00Z',
      updatedAt: '2023-04-01T11:00:00Z'
    },
    {
      id: '3',
      userId: userId,
      description: 'Salary deposit',
      amount: 3500,
      date: '2023-03-25',
      category: 'income' as TransactionCategory,
      isIncome: true,
      notes: 'Monthly salary',
      createdAt: '2023-03-25T09:00:00Z',
      updatedAt: '2023-03-25T09:00:00Z'
    },
    {
      id: '4',
      userId: userId,
      description: 'Netflix subscription',
      amount: 14.99,
      date: '2023-03-20',
      category: 'entertainment' as TransactionCategory,
      isIncome: false,
      notes: '',
      createdAt: '2023-03-20T15:30:00Z',
      updatedAt: '2023-03-20T15:30:00Z'
    },
    {
      id: '5',
      userId: userId,
      description: 'Gas station fill-up',
      amount: 45.67,
      date: '2023-03-18',
      category: 'transportation' as TransactionCategory,
      isIncome: false,
      notes: '',
      createdAt: '2023-03-18T18:00:00Z',
      updatedAt: '2023-03-18T18:00:00Z'
    },
    {
      id: '6',
      userId: userId,
      description: 'Dinner at Italian restaurant',
      amount: 87.50,
      date: '2023-03-15',
      category: 'food' as TransactionCategory,
      isIncome: false,
      notes: 'Date night',
      createdAt: '2023-03-15T20:30:00Z',
      updatedAt: '2023-03-15T20:30:00Z'
    },
    {
      id: '7',
      userId: userId,
      description: 'Electric bill payment',
      amount: 124.33,
      date: '2023-03-10',
      category: 'utilities' as TransactionCategory,
      isIncome: false,
      notes: '',
      createdAt: '2023-03-10T14:45:00Z',
      updatedAt: '2023-03-10T14:45:00Z'
    },
    {
      id: '8',
      userId: userId,
      description: 'Freelance project payment',
      amount: 750,
      date: '2023-03-08',
      category: 'income' as TransactionCategory,
      isIncome: true,
      notes: 'Website design project',
      createdAt: '2023-03-08T11:15:00Z',
      updatedAt: '2023-03-08T11:15:00Z'
    },
    {
      id: '9',
      userId: userId,
      description: 'New laptop purchase',
      amount: 1299.99,
      date: '2023-03-05',
      category: 'shopping' as TransactionCategory,
      isIncome: false,
      notes: 'For work',
      createdAt: '2023-03-05T16:20:00Z',
      updatedAt: '2023-03-05T16:20:00Z'
    },
    {
      id: '10',
      userId: userId,
      description: 'Doctor\'s appointment',
      amount: 40,
      date: '2023-03-02',
      category: 'healthcare' as TransactionCategory,
      isIncome: false,
      notes: '',
      createdAt: '2023-03-02T09:30:00Z',
      updatedAt: '2023-03-02T09:30:00Z'
    },
    {
      id: '11',
      userId: userId,
      description: 'Monthly rent',
      amount: 1400,
      date: '2023-04-01',
      category: 'housing' as TransactionCategory,
      isIncome: false,
      createdAt: '2023-04-01T08:00:00Z',
      updatedAt: '2023-04-01T08:00:00Z'
    },
    {
      id: '12',
      userId: userId,
      description: 'Salary',
      amount: 4200,
      date: '2023-03-28',
      category: 'income' as TransactionCategory,
      isIncome: true,
      createdAt: '2023-03-28T10:00:00Z',
      updatedAt: '2023-03-28T10:00:00Z'
    }
  ];
  
  return DEMO_TRANSACTIONS;
}

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set, get) => ({
      transactions: [],
      isLoading: false,
      error: null,
      fetchTransactions: async (userId: string) => {
        set({ isLoading: true, error: null });
        
        // Make sure the table exists
        await ensureTransactionsTableExists();
        
        try {
          // Use the RPC function to query the table
          const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false });
          
          if (error) {
            throw error;
          } else {
            // Map the database format to our app format
            const mappedTransactions = data.map(mapDbTransactionToAppTransaction);
            set({ transactions: mappedTransactions });
          }
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to fetch transactions';
          console.error(errorMessage);
          set({ error: errorMessage });
          // Use demo data as fallback
          set({ transactions: getDemoTransactions(userId) });
        } finally {
          set({ isLoading: false });
        }
      },
      addTransaction: async (transactionData) => {
        set({ isLoading: true, error: null });
        try {
          // Make sure the table exists
          await ensureTransactionsTableExists();
          
          // Map app transaction to db transaction format
          const dbTransaction = {
            user_id: transactionData.userId,
            description: transactionData.description,
            amount: transactionData.amount,
            date: transactionData.date,
            category: transactionData.category,
            is_income: transactionData.isIncome,
            notes: transactionData.notes || null,
          };
          
          const { data, error } = await supabase
            .from('transactions')
            .insert(dbTransaction)
            .select()
            .single();
          
          if (error) throw error;
          
          // Map the returned DB transaction to our app format
          const newTransaction = mapDbTransactionToAppTransaction(data);
          
          set(state => ({
            transactions: [newTransaction, ...state.transactions]
          }));
          
          toast.success('Transaction added successfully');
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to add transaction';
          set({ error: errorMessage });
          toast.error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },
      updateTransaction: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          // Map app transaction updates to db format
          const dbUpdates: any = {};
          if (updates.description !== undefined) dbUpdates.description = updates.description;
          if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
          if (updates.date !== undefined) dbUpdates.date = updates.date;
          if (updates.category !== undefined) dbUpdates.category = updates.category;
          if (updates.isIncome !== undefined) dbUpdates.is_income = updates.isIncome;
          if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
          
          const { data, error } = await supabase
            .from('transactions')
            .update({
              ...dbUpdates,
              updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();
          
          if (error) throw error;
          
          // Map the returned DB transaction to our app format
          const updatedTransaction = mapDbTransactionToAppTransaction(data);
          
          set(state => ({
            transactions: state.transactions.map(transaction => 
              transaction.id === id ? updatedTransaction : transaction
            )
          }));
          
          toast.success('Transaction updated successfully');
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to update transaction';
          set({ error: errorMessage });
          toast.error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },
      deleteTransaction: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);
          
          if (error) throw error;
          
          set(state => ({
            transactions: state.transactions.filter(transaction => transaction.id !== id)
          }));
          
          toast.success('Transaction deleted successfully');
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to delete transaction';
          set({ error: errorMessage });
          toast.error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },
      categorizeWithAI: async (description: string) => {
        try {
          // Simple AI categorization with predefined mappings
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
      name: 'transaction-storage',
      partialize: (state) => ({ transactions: state.transactions })
    }
  )
);
