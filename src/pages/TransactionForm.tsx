
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/lib/auth";
import { useTransactionStore, TransactionCategory } from "@/lib/transactions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const TransactionForm = () => {
  const { user } = useAuthStore();
  const { addTransaction, categorizeWithAI } = useTransactionStore();
  const navigate = useNavigate();
  
  const [transaction, setTransaction] = useState({
    amount: "",
    description: "",
    category: "other" as TransactionCategory,
    date: new Date().toISOString().split('T')[0],
    isIncome: false,
    notes: ""
  });
  
  const [isAutoCategorizing, setIsAutoCategorizing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTransaction((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setTransaction((prev) => ({ ...prev, category: value as TransactionCategory }));
  };
  
  const handleIsIncomeChange = (checked: boolean) => {
    const newIsIncome = checked;
    // If switched to income, automatically set category to income
    const newCategory = newIsIncome ? "income" as TransactionCategory : transaction.category;
    
    setTransaction((prev) => ({ 
      ...prev, 
      isIncome: newIsIncome,
      category: newCategory
    }));
  };
  
  const handleAutoCategorizeTry = async () => {
    if (!transaction.description) {
      toast.error("Please enter a description first");
      return;
    }
    
    setIsAutoCategorizing(true);
    try {
      const suggestedCategory = await categorizeWithAI(transaction.description);
      setTransaction(prev => ({ ...prev, category: suggestedCategory }));
      toast.success("Transaction categorized with AI");
    } catch (error) {
      toast.error("Failed to categorize transaction");
      console.error("Error categorizing transaction:", error);
    } finally {
      setIsAutoCategorizing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transaction.amount || !transaction.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (user?.id) {
        // Create the transaction object
        await addTransaction({
          userId: user.id,
          amount: parseFloat(transaction.amount),
          description: transaction.description,
          category: transaction.category,
          date: transaction.date,
          isIncome: transaction.isIncome,
          notes: transaction.notes
        });
        
        toast.success("Transaction added successfully");
        navigate("/transactions");
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error("Failed to add transaction");
    }
  };

  const categories = [
    { value: "food", label: "Food & Dining" },
    { value: "transportation", label: "Transportation" },
    { value: "housing", label: "Housing" },
    { value: "utilities", label: "Utilities" },
    { value: "entertainment", label: "Entertainment" },
    { value: "healthcare", label: "Healthcare" },
    { value: "shopping", label: "Shopping" },
    { value: "personal", label: "Personal" },
    { value: "education", label: "Education" },
    { value: "travel", label: "Travel" },
    { value: "income", label: "Income" },
    { value: "other", label: "Other" }
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Add Transaction</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
          <CardDescription>Enter the details for your new transaction</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center space-x-2 mb-2">
              <Switch 
                id="isIncome"
                checked={transaction.isIncome}
                onCheckedChange={handleIsIncomeChange}
              />
              <Label htmlFor="isIncome" className="font-medium">
                This is income
              </Label>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount" className="font-medium">
                Amount
              </Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={transaction.amount}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="font-medium">
                Description
              </Label>
              <div className="flex gap-2">
                <Input
                  id="description"
                  name="description"
                  placeholder="Enter a description"
                  value={transaction.description}
                  onChange={handleChange}
                  required
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleAutoCategorizeTry}
                  disabled={isAutoCategorizing || !transaction.description}
                >
                  {isAutoCategorizing ? "Categorizing..." : "AI Categorize"}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category" className="font-medium">
                Category
              </Label>
              <Select 
                value={transaction.category} 
                onValueChange={handleCategoryChange}
                disabled={transaction.isIncome} // Disable if it's income, since it will always be "income"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date" className="font-medium">
                Date
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={transaction.date}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes" className="font-medium">
                Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Add any additional notes"
                value={transaction.notes}
                onChange={handleChange}
                rows={3}
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" type="button" onClick={() => navigate("/transactions")}>
                Cancel
              </Button>
              <Button type="submit">Add Transaction</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionForm;
