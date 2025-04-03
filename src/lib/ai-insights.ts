
import { toast } from 'sonner';
import { Transaction } from './transactions';

// Types for insights
export type InsightType = 
  | 'spending-trend' 
  | 'budget-alert' 
  | 'saving-opportunity' 
  | 'unusual-spending';

export interface Insight {
  id: string;
  userId: string;
  type: InsightType;
  title: string;
  description: string;
  relevantCategories: string[];
  importance: 'low' | 'medium' | 'high';
  createdAt: string;
}

// Function to generate insights based on transaction data
export async function generateInsights(
  userId: string, 
  transactions: Transaction[]
): Promise<Insight[]> {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200));

    if (!transactions.length) {
      return [];
    }

    const insights: Insight[] = [];
    const now = new Date();
    
    // Group transactions by category
    const categorySums: Record<string, number> = {};
    const categoryTransactions: Record<string, Transaction[]> = {};
    
    transactions.forEach(transaction => {
      if (!categoryTransactions[transaction.category]) {
        categoryTransactions[transaction.category] = [];
        categorySums[transaction.category] = 0;
      }
      
      categoryTransactions[transaction.category].push(transaction);
      if (!transaction.isIncome) {
        categorySums[transaction.category] += transaction.amount;
      }
    });
    
    // Find the top spending category
    let topCategory = '';
    let topAmount = 0;
    
    Object.entries(categorySums).forEach(([category, sum]) => {
      if (sum > topAmount) {
        topAmount = sum;
        topCategory = category;
      }
    });
    
    if (topCategory) {
      insights.push({
        id: `insight-1-${Date.now()}`,
        userId,
        type: 'spending-trend',
        title: 'Highest Spending Category',
        description: `Your highest spending is in the ${topCategory} category. Consider reviewing these expenses to find potential savings.`,
        relevantCategories: [topCategory],
        importance: 'medium',
        createdAt: now.toISOString()
      });
    }
    
    // Check for potential savings in food category
    if (categoryTransactions.food && categoryTransactions.food.length > 3) {
      insights.push({
        id: `insight-2-${Date.now()}`,
        userId,
        type: 'saving-opportunity',
        title: 'Reduce Food Expenses',
        description: 'You might save money by meal prepping at home instead of eating out frequently.',
        relevantCategories: ['food'],
        importance: 'medium',
        createdAt: now.toISOString()
      });
    }
    
    // Check for subscription services in entertainment category
    if (categoryTransactions.entertainment && categoryTransactions.entertainment.length > 0) {
      insights.push({
        id: `insight-3-${Date.now()}`,
        userId,
        type: 'saving-opportunity',
        title: 'Review Subscriptions',
        description: 'Consider reviewing your entertainment subscriptions to identify services you might not be using enough.',
        relevantCategories: ['entertainment'],
        importance: 'low',
        createdAt: now.toISOString()
      });
    }
    
    // Unusual spending detection
    const allExpenses = transactions.filter(t => !t.isIncome);
    if (allExpenses.length > 5) {
      const totalSpent = allExpenses.reduce((sum, t) => sum + t.amount, 0);
      const avgSpent = totalSpent / allExpenses.length;
      
      const unusualTransactions = allExpenses.filter(t => t.amount > avgSpent * 2);
      
      if (unusualTransactions.length > 0) {
        insights.push({
          id: `insight-4-${Date.now()}`,
          userId,
          type: 'unusual-spending',
          title: 'Unusual Spending Detected',
          description: 'We noticed some unusually large transactions compared to your average spending.',
          relevantCategories: [...new Set(unusualTransactions.map(t => t.category))],
          importance: 'high',
          createdAt: now.toISOString()
        });
      }
    }

    // Income vs Expenses
    const incomeTransactions = transactions.filter(t => t.isIncome);
    const expenseTransactions = transactions.filter(t => !t.isIncome);
    
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    if (totalIncome > 0 && totalExpenses > totalIncome * 0.9) {
      insights.push({
        id: `insight-5-${Date.now()}`,
        userId,
        type: 'budget-alert',
        title: 'Spending Close to Income',
        description: 'Your expenses are approaching your income level. Consider budgeting to ensure you\'re saving enough.',
        relevantCategories: [],
        importance: 'high',
        createdAt: now.toISOString()
      });
    }
    
    return insights;
  } catch (error) {
    console.error('Error generating insights:', error);
    toast.error('Failed to generate AI insights');
    return [];
  }
}

// Function to get personalized saving tips
export async function getSavingTips(
  userId: string, 
  transactions: Transaction[]
): Promise<string[]> {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generic saving tips
    const genericTips = [
      'Create a budget and stick to it',
      'Cook at home more often to save on food expenses',
      'Review and cancel unused subscriptions',
      'Use cashback credit cards for everyday purchases',
      'Set up automatic transfers to your savings account',
      'Consider a no-spend challenge for a week or month',
      'Look for free or low-cost entertainment options',
      'Use public transportation or carpooling when possible',
      'Buy in bulk for items you use frequently',
      'Compare prices before making major purchases'
    ];
    
    if (!transactions.length) {
      return genericTips.slice(0, 5);
    }
    
    // Analyze transactions for personalized tips
    const personalizedTips: string[] = [];
    
    // Group transactions by category
    const categorySums: Record<string, number> = {};
    
    transactions.forEach(transaction => {
      if (!transaction.isIncome) {
        categorySums[transaction.category] = (categorySums[transaction.category] || 0) + transaction.amount;
      }
    });
    
    // Check for specific categories with high spending
    if (categorySums.food && categorySums.food > 500) {
      personalizedTips.push('Your food spending is high. Try meal prepping to reduce restaurant expenses.');
    }
    
    if (categorySums.entertainment && categorySums.entertainment > 200) {
      personalizedTips.push('Consider reviewing your entertainment subscriptions and finding free alternatives.');
    }
    
    if (categorySums.shopping && categorySums.shopping > 300) {
      personalizedTips.push('Try implementing a 24-hour rule before making non-essential purchases.');
    }
    
    if (categorySums.transportation && categorySums.transportation > 250) {
      personalizedTips.push('Look into carpooling, public transit, or biking to reduce transportation costs.');
    }
    
    // Return a mix of personalized and generic tips
    const tips = [...personalizedTips, ...genericTips];
    return tips.slice(0, 5); // Return top 5 tips
    
  } catch (error) {
    console.error('Error generating saving tips:', error);
    toast.error('Failed to generate saving tips');
    return [];
  }
}

// Function to get expense predictions
export async function predictExpenses(
  userId: string, 
  transactions: Transaction[]
): Promise<Record<string, number>> {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!transactions.length) {
      return {};
    }
    
    // Group transactions by category and calculate average
    const categoryTotals: Record<string, number> = {};
    const categoryCount: Record<string, number> = {};
    
    transactions.forEach(transaction => {
      if (!transaction.isIncome) {
        if (!categoryTotals[transaction.category]) {
          categoryTotals[transaction.category] = 0;
          categoryCount[transaction.category] = 0;
        }
        
        categoryTotals[transaction.category] += transaction.amount;
        categoryCount[transaction.category]++;
      }
    });
    
    // Calculate predictions (simple average with slight increase)
    const predictions: Record<string, number> = {};
    
    Object.entries(categoryTotals).forEach(([category, total]) => {
      const count = categoryCount[category];
      const average = total / count;
      
      // Add slight variation to predictions (±10%)
      const randomFactor = 0.9 + (Math.random() * 0.2); // Between 0.9 and 1.1
      predictions[category] = Math.round((average * randomFactor) * 100) / 100;
    });
    
    return predictions;
    
  } catch (error) {
    console.error('Error predicting expenses:', error);
    toast.error('Failed to generate expense predictions');
    return {};
  }
}
