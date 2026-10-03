export type TodoPriority = 'low' | 'medium' | 'high';

export interface Todo {
  _id: string;
  text: string;
  completed: boolean;
  dueDate: string | null; // calendar day, YYYY-MM-DD
  priority: TodoPriority;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export type DueFilter = 'overdue' | 'today';

export interface TodoStats {
  total: number;
  completed: number;
  dueToday: number;
  overdue: number;
}
