
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { Loader2, PlusCircle, ArrowUpCircle, ArrowDownCircle, Pencil, Trash2, Search } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

// Define types
type Transaction = {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  is_income: boolean;
  notes: string | null;
  created_at: string;
};

type Category = {
  id: string;
  name: string;
  type: string;
};

// Define schemas for form validation
const transactionFormSchema = z.object({
  description: z.string().min(1, { message: "Description is required" }),
  amount: z.coerce.number().positive({ message: "Amount must be positive" }),
  date: z.string().min(1, { message: "Date is required" }),
  category: z.string().min(1, { message: "Category is required" }),
  is_income: z.boolean().default(false),
  notes: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

const Transactions = () => {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Initialize the form
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      description: "",
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      category: "",
      is_income: false,
      notes: "",
    },
  });

  // Format date for form
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Fetch transactions and categories
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // Fetch transaction categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('transaction_categories')
        .select('*')
        .order('name');
      
      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        toast.error('Failed to fetch categories');
      } else {
        setCategories(categoriesData || []);
      }
      
      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
      
      if (transactionsError) {
        console.error('Error fetching transactions:', transactionsError);
        toast.error('Failed to fetch transactions');
      } else {
        setTransactions(transactionsData || []);
      }
      
      setIsLoading(false);
    };
    
    fetchData();
  }, []);

  // Handle form submission
  const onSubmit = async (data: TransactionFormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      if (editingTransaction) {
        // Update existing transaction
        const { error } = await supabase
          .from('transactions')
          .update({
            description: data.description,
            amount: data.amount,
            date: data.date,
            category: data.category,
            is_income: data.is_income,
            notes: data.notes,
          })
          .eq('id', editingTransaction.id);
        
        if (error) throw error;
        
        toast.success('Transaction updated successfully');
        
        // Update local state
        setTransactions(transactions.map(transaction => 
          transaction.id === editingTransaction.id 
            ? { ...transaction, ...data } as Transaction
            : transaction
        ));
      } else {
        // Create new transaction
        const { data: newTransaction, error } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            description: data.description,
            amount: data.amount,
            date: data.date,
            category: data.category,
            is_income: data.is_income,
            notes: data.notes,
          })
          .select()
          .single();
        
        if (error) throw error;
        
        toast.success('Transaction created successfully');
        
        // Update local state
        if (newTransaction) {
          setTransactions([newTransaction, ...transactions]);
        }
      }
      
      // Reset form and close dialog
      setIsDialogOpen(false);
      setEditingTransaction(null);
      form.reset({
        description: "",
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        category: "",
        is_income: false,
        notes: "",
      });
    } catch (error: any) {
      console.error('Error saving transaction:', error);
      toast.error(error.message || 'Failed to save transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open dialog for editing
  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    form.reset({
      description: transaction.description,
      amount: transaction.amount,
      date: formatDateForInput(transaction.date),
      category: transaction.category,
      is_income: transaction.is_income,
      notes: transaction.notes || "",
    });
    setIsDialogOpen(true);
  };

  // Delete a transaction
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Transaction deleted successfully');
      
      // Update local state
      setTransactions(transactions.filter(transaction => transaction.id !== id));
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      toast.error(error.message || 'Failed to delete transaction');
    }
  };

  // Reset form when dialog opens
  const handleDialogOpen = () => {
    if (!editingTransaction) {
      form.reset({
        description: "",
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        category: "",
        is_income: false,
        notes: "",
      });
    }
    setIsDialogOpen(true);
  };

  // Filter transactions based on search and type
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (transaction.notes && transaction.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = 
      typeFilter === "all" || 
      (typeFilter === "income" && transaction.is_income) || 
      (typeFilter === "expense" && !transaction.is_income);
    
    return matchesSearch && matchesType;
  });

  // Watch is_income to filter categories
  const isIncome = form.watch("is_income");
  const filteredCategories = categories.filter(
    category => isIncome ? category.type === "income" : category.type === "expense"
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">Manage your income and expenses</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleDialogOpen}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingTransaction ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
              <DialogDescription>
                {editingTransaction 
                  ? 'Update the details of your transaction.' 
                  : 'Record a new income or expense transaction.'}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="is_income"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          This is an income transaction
                        </FormLabel>
                        <FormDescription>
                          Check if this transaction represents money coming in
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Grocery shopping" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredCategories.length > 0 ? (
                            filteredCategories.map((category) => (
                              <SelectItem key={category.id} value={category.name}>
                                {category.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="" disabled>
                              No {isIncome ? 'income' : 'expense'} categories available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Add any additional notes" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search transactions..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Transactions</SelectItem>
            <SelectItem value="income">Income Only</SelectItem>
            <SelectItem value="expense">Expenses Only</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredTransactions.length === 0 ? (
        <Card className="text-center p-8">
          <CardContent>
            {transactions.length === 0 ? (
              <>
                <p className="mb-4 text-muted-foreground">You haven't recorded any transactions yet.</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add your first transaction
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground">No transactions match your search criteria.</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              Showing {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-start justify-between border-b pb-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${transaction.is_income ? 'bg-green-100' : 'bg-red-100'}`}>
                      {transaction.is_income ? 
                        <ArrowUpCircle className="h-4 w-4 text-green-500" /> : 
                        <ArrowDownCircle className="h-4 w-4 text-red-500" />
                      }
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                      </p>
                      {transaction.notes && (
                        <p className="text-sm text-muted-foreground mt-1 italic">
                          {transaction.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={`font-medium ${transaction.is_income ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.is_income ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEdit(transaction)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(transaction.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Transactions;
