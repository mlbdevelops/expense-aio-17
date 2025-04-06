
export type FinancialEvent = {
  id: string;
  title: string;
  date: Date | string;
  amount: number;
  category: string;
  description?: string;
  is_recurring: boolean;
  recurrence_interval?: string;
  user_id?: string;
  canceled?: boolean;
};

export type CalendarView = "month" | "week" | "day";
