export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  timeEstimate: string;
  status: "To Do" | "In Progress" | "Done";
  priority: "Low" | "Medium" | "High";
  completedAt?: string;
}