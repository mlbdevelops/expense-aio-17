
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/lib/auth";
import { useTransactionStore } from "@/lib/transactions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const TransactionForm = () => {
  const { user } = useAuthStore();
  const { addTransaction } = useTransactionStore();
  const navigate = useNavigate();
  
  const [transaction, setTransaction] = useState({
    amount: "",
    description: "",
    category: "other",
    date: new Date().toISOString().split('T')[0],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTransaction((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setTransaction((prev) => ({ ...prev, category: value }));
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
        const newTransaction = {
          id: crypto.randomUUID(),
          userId: user.id,
          amount: parseFloat(transaction.amount),
          description: transaction.description,
          category: transaction.category,
          date: transaction.date,
          createdAt: new Date().toISOString(),
        };
        
        await addTransaction(newTransaction);
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
    { value: "housing", label: "Housing & Utilities" },
    { value: "entertainment", label: "Entertainment" },
    { value: "shopping", label: "Shopping" },
    { value: "healthcare", label: "Healthcare" },
    { value: "travel", label: "Travel" },
    { value: "education", label: "Education" },
    { value: "income", label: "Income" },
    { value: "other", label: "Other" },
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
            <div className="space-y-2">
              <label htmlFor="amount" className="font-medium">
                Amount
              </label>
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
              <label htmlFor="description" className="font-medium">
                Description
              </label>
              <Input
                id="description"
                name="description"
                placeholder="Enter a description"
                value={transaction.description}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="category" className="font-medium">
                Category
              </label>
              <Select value={transaction.category} onValueChange={handleCategoryChange}>
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
              <label htmlFor="date" className="font-medium">
                Date
              </label>
              <Input
                id="date"
                name="date"
                type="date"
                value={transaction.date}
                onChange={handleChange}
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
