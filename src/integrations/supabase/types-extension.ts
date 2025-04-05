
import { Database } from './types';

// Extend the Database type to include our new tables
export interface ExtendedDatabase extends Database {
  public: {
    Tables: {
      budgets: Database['public']['Tables']['budgets'];
      profiles: Database['public']['Tables']['profiles'];
      transactions: {
        Row: {
          id: string;
          user_id: string;
          description: string;
          amount: number;
          date: string;
          category: string;
          is_income: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          description: string;
          amount: number;
          date: string;
          category: string;
          is_income?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          description?: string;
          amount?: number;
          date?: string;
          category?: string;
          is_income?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      budget_categories: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      transaction_categories: {
        Row: {
          id: string;
          name: string;
          type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      savings_goals: Database['public']['Tables']['savings_goals'];
    };
    Views: Database['public']['Views'];
    Functions: Database['public']['Functions'];
    Enums: Database['public']['Enums'];
    CompositeTypes: Database['public']['CompositeTypes'];
  };
}

// Create an extended Supabase client type
export type ExtendedSupabaseClient = ReturnType<typeof import('@supabase/supabase-js').createClient<ExtendedDatabase>>;
