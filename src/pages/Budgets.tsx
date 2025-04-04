
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { Loader2, PlusCircle, Pencil, Trash2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

// Define types
type Budget = {
  id: string;
  category: string;
  amount: number;
  period: string;
  created_at: string;
};

type Category = {
  id: string;
  name: string;
};

// Define schemas for form validation
const budgetFormSchema = z.object({
  category: z.string().min(1, { message: "Category is required" }),
  amount: z.coerce.number().positive({ message: "Amount must be positive" }),
  period: z.string().min(1, { message: "Period is required" }),
});

type BudgetFormValues = z.infer<typeof budgetFormSchema>;

const Budgets = () => {
  const { user } = useAuthStore();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Initialize the form
  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      category: "",
      amount: 0,
      period: "Monthly",
    },
  });

  // Fetch budgets and categories
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // Fetch budget categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('budget_categories')
        .select('*')
        .order('name');
      
      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        toast.error('Failed to fetch categories');
      } else {
        setCategories(categoriesData || []);
      }
      
      // Fetch budgets
      const { data: budgetsData, error: budgetsError } = await supabase
        .from('budgets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (budgetsError) {
        console.error('Error fetching budgets:', budgetsError);
        toast.error('Failed to fetch budgets');
      } else {
        setBudgets(budgetsData || []);
      }
      
      setIsLoading(false);
    };
    
    fetchData();
  }, []);

  // Handle form submission
  const onSubmit = async (data: BudgetFormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      if (editingBudget) {
        // Update existing budget
        const { error } = await supabase
          .from('budgets')
          .update({
            category: data.category,
            amount: data.amount,
            period: data.period,
          })
          .eq('id', editingBudget.id);
        
        if (error) throw error;
        
        toast.success('Budget updated successfully');
        
        // Update local state
        setBudgets(budgets.map(budget => 
          budget.id === editingBudget.id 
            ? { ...budget, ...data } 
            : budget
        ));
      } else {
        // Create new budget
        const { data: newBudget, error } = await supabase
          .from('budgets')
          .insert({
            user_id: user.id,
            category: data.category,
            amount: data.amount,
            period: data.period,
          })
          .select()
          .single();
        
        if (error) throw error;
        
        toast.success('Budget created successfully');
        
        // Update local state
        if (newBudget) {
          setBudgets([newBudget, ...budgets]);
        }
      }
      
      // Reset form and close dialog
      setIsDialogOpen(false);
      setEditingBudget(null);
      form.reset({
        category: "",
        amount: 0,
        period: "Monthly",
      });
    } catch (error: any) {
      console.error('Error saving budget:', error);
      toast.error(error.message || 'Failed to save budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open dialog for editing
  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    form.reset({
      category: budget.category,
      amount: budget.amount,
      period: budget.period,
    });
    setIsDialogOpen(true);
  };

  // Delete a budget
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;
    
    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Budget deleted successfully');
      
      // Update local state
      setBudgets(budgets.filter(budget => budget.id !== id));
    } catch (error: any) {
      console.error('Error deleting budget:', error);
      toast.error(error.message || 'Failed to delete budget');
    }
  };

  // Reset form when dialog opens
  const handleDialogOpen = () => {
    if (!editingBudget) {
      form.reset({
        category: "",
        amount: 0,
        period: "Monthly",
      });
    }
    setIsDialogOpen(true);
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingBudget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">Manage your budget allocations</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleDialogOpen}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingBudget ? 'Edit Budget' : 'Create Budget'}</DialogTitle>
              <DialogDescription>
                {editingBudget 
                  ? 'Edit your budget allocation for this category.' 
                  : 'Set a budget for a specific category to help manage your spending.'}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
                  name="period"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Period</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a period" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Daily">Daily</SelectItem>
                          <SelectItem value="Weekly">Weekly</SelectItem>
                          <SelectItem value="Monthly">Monthly</SelectItem>
                          <SelectItem value="Yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingBudget ? 'Update Budget' : 'Create Budget'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : budgets.length === 0 ? (
        <Card className="text-center p-8">
          <CardContent>
            <p className="mb-4 text-muted-foreground">You haven't created any budgets yet.</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create your first budget
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((budget) => (
            <Card key={budget.id}>
              <CardHeader>
                <CardTitle>{budget.category}</CardTitle>
                <CardDescription>{budget.period}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{formatCurrency(budget.amount)}</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" onClick={() => handleEdit(budget)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(budget.id)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Budgets;
