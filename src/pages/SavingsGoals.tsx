
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client-extended";
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
import { Loader2, PlusCircle, Pencil, Trash2, Target, Calendar } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

// Define types
type SavingsGoal = {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  category: string | null;
  created_at: string;
  updated_at: string;
};

type Category = {
  id: string;
  name: string;
};

// Define schemas for form validation
const savingsGoalFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  target_amount: z.coerce.number().positive({ message: "Target amount must be positive" }),
  current_amount: z.coerce.number().min(0, { message: "Current amount must be positive or zero" }),
  target_date: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
});

type SavingsGoalFormValues = z.infer<typeof savingsGoalFormSchema>;

const SavingsGoals = () => {
  const { user } = useAuthStore();
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Initialize the form
  const form = useForm<SavingsGoalFormValues>({
    resolver: zodResolver(savingsGoalFormSchema),
    defaultValues: {
      name: "",
      target_amount: 0,
      current_amount: 0,
      target_date: null,
      category: null,
    },
  });

  // Fetch savings goals and categories
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
      
      // Fetch savings goals
      const { data: savingsGoalsData, error: savingsGoalsError } = await supabase
        .from('savings_goals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (savingsGoalsError) {
        console.error('Error fetching savings goals:', savingsGoalsError);
        toast.error('Failed to fetch savings goals');
      } else {
        setSavingsGoals(savingsGoalsData || []);
      }
      
      setIsLoading(false);
    };
    
    fetchData();
  }, []);

  // Handle form submission
  const onSubmit = async (data: SavingsGoalFormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      if (editingGoal) {
        // Update existing goal
        const { error } = await supabase
          .from('savings_goals')
          .update({
            name: data.name,
            target_amount: data.target_amount,
            current_amount: data.current_amount,
            target_date: data.target_date,
            category: data.category,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingGoal.id);
        
        if (error) throw error;
        
        toast.success('Savings goal updated successfully');
        
        // Update local state
        setSavingsGoals(savingsGoals.map(goal => 
          goal.id === editingGoal.id 
            ? { ...goal, ...data, updated_at: new Date().toISOString() } 
            : goal
        ));
      } else {
        // Create new goal
        const { data: newGoal, error } = await supabase
          .from('savings_goals')
          .insert({
            user_id: user.id,
            name: data.name,
            target_amount: data.target_amount,
            current_amount: data.current_amount || 0,
            target_date: data.target_date,
            category: data.category,
          })
          .select()
          .single();
        
        if (error) throw error;
        
        toast.success('Savings goal created successfully');
        
        // Update local state
        if (newGoal) {
          setSavingsGoals([newGoal, ...savingsGoals]);
        }
      }
      
      // Reset form and close dialog
      setIsDialogOpen(false);
      setEditingGoal(null);
      form.reset({
        name: "",
        target_amount: 0,
        current_amount: 0,
        target_date: null,
        category: null,
      });
    } catch (error: any) {
      console.error('Error saving goal:', error);
      toast.error(error.message || 'Failed to save savings goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open dialog for editing
  const handleEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    form.reset({
      name: goal.name,
      target_amount: goal.target_amount,
      current_amount: goal.current_amount,
      target_date: goal.target_date,
      category: goal.category,
    });
    setIsDialogOpen(true);
  };

  // Delete a savings goal
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this savings goal?')) return;
    
    try {
      const { error } = await supabase
        .from('savings_goals')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Savings goal deleted successfully');
      
      // Update local state
      setSavingsGoals(savingsGoals.filter(goal => goal.id !== id));
    } catch (error: any) {
      console.error('Error deleting savings goal:', error);
      toast.error(error.message || 'Failed to delete savings goal');
    }
  };

  // Reset form when dialog opens
  const handleDialogOpen = () => {
    if (!editingGoal) {
      form.reset({
        name: "",
        target_amount: 0,
        current_amount: 0,
        target_date: null,
        category: null,
      });
    }
    setIsDialogOpen(true);
  };

  // Calculate progress percentage
  const calculateProgress = (current: number, target: number) => {
    if (target <= 0) return 0;
    const progress = (current / target) * 100;
    return Math.min(progress, 100); // Cap at 100%
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No target date';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Savings Goals</h1>
          <p className="text-muted-foreground">Track your progress towards financial goals</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleDialogOpen}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingGoal ? 'Edit Savings Goal' : 'Create Savings Goal'}</DialogTitle>
              <DialogDescription>
                {editingGoal 
                  ? 'Update your savings goal details.' 
                  : 'Set a new financial goal to track your savings progress.'}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal Name</FormLabel>
                      <FormControl>
                        <Input placeholder="New Car" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="target_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Amount</FormLabel>
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
                  name="current_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Amount</FormLabel>
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
                  name="target_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Date (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category (Optional)</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value || undefined}
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
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingGoal ? 'Update Goal' : 'Create Goal'}
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
      ) : savingsGoals.length === 0 ? (
        <Card className="text-center p-8">
          <CardContent>
            <p className="mb-4 text-muted-foreground">You haven't created any savings goals yet.</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create your first savings goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savingsGoals.map((goal) => (
            <Card key={goal.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{goal.name}</CardTitle>
                <CardDescription>{goal.category || 'No category'}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Progress</p>
                    <Progress value={calculateProgress(goal.current_amount, goal.target_amount)} className="h-2 mt-1" />
                    <div className="flex justify-between text-sm mt-1">
                      <span>{formatCurrency(goal.current_amount)}</span>
                      <span>{formatCurrency(goal.target_amount)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Target className="h-4 w-4 mr-2" />
                    <span>
                      {Math.round(calculateProgress(goal.current_amount, goal.target_amount))}% complete
                    </span>
                  </div>
                  
                  {goal.target_date && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Target: {formatDate(goal.target_date)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" onClick={() => handleEdit(goal)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(goal.id)}>
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

export default SavingsGoals;
