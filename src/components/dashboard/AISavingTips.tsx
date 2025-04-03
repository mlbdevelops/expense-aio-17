
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@/lib/transactions";
import { getSavingTips } from "@/lib/ai-insights";
import { useState, useEffect } from "react";
import { Loader2, RefreshCw, LightbulbIcon } from "lucide-react";

interface AISavingTipsProps {
  userId: string;
  transactions: Transaction[];
}

export function AISavingTips({ userId, transactions }: AISavingTipsProps) {
  const [tips, setTips] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTips = async () => {
    setIsLoading(true);
    try {
      const savingTips = await getSavingTips(userId, transactions);
      setTips(savingTips);
    } catch (error) {
      console.error("Error loading saving tips:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTips();
  }, [userId, transactions]);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <LightbulbIcon className="h-5 w-5 text-yellow-400" />
            <span>AI Saving Tips</span>
          </CardTitle>
          <CardDescription>Smart suggestions to save money</CardDescription>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={loadTips}
          disabled={isLoading}
          title="Refresh tips"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ul className="space-y-3">
            {tips.map((tip, index) => (
              <li key={index} className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-5 h-5 rounded-full bg-expense-primary flex items-center justify-center text-white text-xs">
                    {index + 1}
                  </div>
                </div>
                <p>{tip}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
