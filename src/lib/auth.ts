
import { create } from 'zustand';
import { toast } from 'sonner';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

export type Profile = {
  id: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
};

type AuthStore = {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (error) throw error;
          
          set({ 
            user: data.user, 
            session: data.session,
            isAuthenticated: true 
          });
          
          // Fetch the user's profile
          if (data.user) {
            await get().refreshProfile();
          }
          
          toast.success('Logged in successfully');
        } catch (error: any) {
          toast.error(error.message || 'Failed to login');
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true });
        
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name
              }
            }
          });
          
          if (error) throw error;
          
          set({ 
            user: data.user, 
            session: data.session,
            isAuthenticated: !!data.session 
          });
          
          // If user was created and we have a session, refresh the profile
          if (data.user && data.session) {
            await get().refreshProfile();
          }
          
          toast.success('Account created successfully');
          
          // Note: With email confirmation enabled, the user won't be signed in automatically
          if (!data.session) {
            toast.info('Please check your email to confirm your account');
          }
        } catch (error: any) {
          toast.error(error.message || 'Failed to register');
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      logout: async () => {
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          
          set({ user: null, profile: null, session: null, isAuthenticated: false });
          toast.success('Logged out successfully');
        } catch (error: any) {
          toast.error(error.message || 'Failed to logout');
        }
      },
      
      refreshProfile: async () => {
        const { user } = get();
        if (!user) return;
        
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (error) throw error;
          
          set({ profile: data });
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        profile: state.profile,
        session: state.session,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

// Set up auth state listener
if (typeof window !== 'undefined') {
  // Check for existing session
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      const authStore = useAuthStore.getState();
      authStore.refreshProfile();
      useAuthStore.setState({ 
        user: session.user, 
        session: session,
        isAuthenticated: true 
      });
    }
  });

  // Listen for auth changes
  supabase.auth.onAuthStateChange((event, session) => {
    const authStore = useAuthStore.getState();
    
    if (event === 'SIGNED_IN' && session) {
      useAuthStore.setState({ 
        user: session.user, 
        session: session,
        isAuthenticated: true 
      });
      
      // Use setTimeout to avoid Supabase auth deadlocks
      setTimeout(() => {
        authStore.refreshProfile();
      }, 0);
    }
    
    if (event === 'SIGNED_OUT') {
      useAuthStore.setState({ 
        user: null, 
        profile: null,
        session: null,
        isAuthenticated: false 
      });
    }
  });
}
