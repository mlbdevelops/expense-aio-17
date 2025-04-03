
import { create } from 'zustand';
import { toast } from 'sonner';
import { persist } from 'zustand/middleware';

export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
};

type AuthStore = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

// Demo users
const DEMO_USERS: Record<string, { password: string; user: User }> = {
  'user@example.com': {
    password: 'password123',
    user: {
      id: '1',
      name: 'Demo User',
      email: 'user@example.com',
      avatar: 'https://avatars.githubusercontent.com/u/124599?v=4'
    }
  },
  'john@example.com': {
    password: 'password123',
    user: {
      id: '2',
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://avatars.githubusercontent.com/u/1?v=4'
    }
  }
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          const userRecord = DEMO_USERS[email];
          
          if (!userRecord || userRecord.password !== password) {
            throw new Error('Invalid email or password');
          }
          
          set({ user: userRecord.user, isAuthenticated: true });
          toast.success('Logged in successfully');
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Failed to login');
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true });
        
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          if (DEMO_USERS[email]) {
            throw new Error('Email already in use');
          }
          
          const newUser: User = {
            id: Math.random().toString(36).substring(2, 9),
            name,
            email
          };
          
          // In a real app, we would save this to a database
          DEMO_USERS[email] = { password, user: newUser };
          
          set({ user: newUser, isAuthenticated: true });
          toast.success('Account created successfully');
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Failed to register');
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
        toast.success('Logged out successfully');
      }
    }),
    {
      name: 'auth-storage'
    }
  )
);
