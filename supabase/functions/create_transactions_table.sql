
-- This function creates the transactions table and sets up RLS policies
CREATE OR REPLACE FUNCTION public.create_transactions_table()
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the table already exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'transactions') THEN
    RETURN true;
  END IF;

  -- Create the transactions table
  CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL NOT NULL,
    date DATE NOT NULL,
    category TEXT NOT NULL,
    is_income BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
  );

  -- Enable Row Level Security
  ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

  -- Create RLS policies
  -- Policy to allow users to SELECT their own transactions
  CREATE POLICY "Users can view their own transactions" 
    ON public.transactions 
    FOR SELECT 
    USING (auth.uid() = user_id);

  -- Policy to allow users to INSERT their own transactions
  CREATE POLICY "Users can create their own transactions" 
    ON public.transactions 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

  -- Policy to allow users to UPDATE their own transactions
  CREATE POLICY "Users can update their own transactions" 
    ON public.transactions 
    FOR UPDATE 
    USING (auth.uid() = user_id);

  -- Policy to allow users to DELETE their own transactions
  CREATE POLICY "Users can delete their own transactions" 
    ON public.transactions 
    FOR DELETE 
    USING (auth.uid() = user_id);

  RETURN true;
END;
$$;

-- Call the function to create the table (uncomment if you want to execute immediately)
-- SELECT create_transactions_table();
