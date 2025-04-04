
import { supabase as originalSupabase } from './client';
import type { ExtendedSupabaseClient } from './types-extension';

// Cast the original client to our extended type
export const supabase = originalSupabase as unknown as ExtendedSupabaseClient;
