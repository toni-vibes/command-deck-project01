import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Task } from "@/types/task";

type ViewType = "timeline" | "kanban" | "table";

interface TaskViewsProps {
  tasks?: Task[];
}

export const TaskViews = ({ tasks = [] }: TaskViewsProps) => {
  const [activeView, setActiveView] = useState<ViewType>("timeline");

  // Default tasks if none provided
  const defaultTasks: Task[] = [
    {
      id: "default-1",
      title: "Complete user research",
      description: "Research target audience and user needs",
      assignee: "Sarah Chen",
      dueDate: "Today",
      timeEstimate: "2 days",
      status: "In Progress",
      priority: "High"
    },
    {
      id: "default-2",
      title: "Design wireframes",
      description: "Create initial wireframes and mockups",
      assignee: "Alex Johnson",
      dueDate: "Tomorrow",
      timeEstimate: "3 days",
      status: "To Do",
      priority: "Medium"
    },
    {
      id: "default-3",
      title: "Develop prototype",
      description: "Build working prototype",
      assignee: "Mike Rodriguez",
      dueDate: "Next week",
      timeEstimate: "1 week",
      status: "To Do",
      priority: "Medium"
    }
  ];

  const displayTasks = tasks.length > 0 ? tasks : defaultTasks;

  const renderTimelineView = () => (
    <div className="space-y-4">
      <div className="border-l-2 border-primary pl-4 space-y-4">
        {displayTasks.map((task, index) => (
          <div key={task.id} className="relative">
            <div className={`absolute -left-6 w-3 h-3 rounded-full ${
              task.status === "In Progress" ? "bg-primary" : "bg-muted"
            }`}></div>
            <div className="bg-surface-elevated p-4 rounded-lg border">
              <h4 className="font-medium text-text-primary">{task.title}</h4>
              <p className="text-sm text-text-secondary mt-1">
                Due: {task.dueDate} | {task.assignee} | {task.timeEstimate}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderKanbanView = () => {
    const todoTasks = displayTasks.filter(task => task.status === "To Do");
    const inProgressTasks = displayTasks.filter(task => task.status === "In Progress");
    const doneTasks = displayTasks.filter(task => task.status === "Done");

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-3">
          <h4 className="font-medium text-text-primary">To Do</h4>
          <div className="space-y-2">
            {todoTasks.map(task => (
              <div key={task.id} className="bg-surface-elevated p-3 rounded-lg border">
                <p className="text-sm font-medium">{task.title}</p>
                <p className="text-xs text-text-secondary mt-1">{task.priority} priority | {task.assignee}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <h4 className="font-medium text-text-primary">In Progress</h4>
          <div className="space-y-2">
            {inProgressTasks.map(task => (
              <div key={task.id} className="bg-surface-elevated p-3 rounded-lg border">
                <p className="text-sm font-medium">{task.title}</p>
                <p className="text-xs text-text-secondary mt-1">{task.assignee} | Due: {task.dueDate}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <h4 className="font-medium text-text-primary">Done</h4>
          <div className="space-y-2">
            {doneTasks.map(task => (
              <div key={task.id} className="bg-surface-elevated p-3 rounded-lg border">
                <p className="text-sm font-medium">{task.title}</p>
                <p className="text-xs text-text-secondary mt-1">Completed | {task.assignee}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress": return "bg-primary/10 text-primary";
      case "Done": return "bg-green-100 text-green-700";
      case "To Do": return "bg-muted text-text-secondary";
      default: return "bg-muted text-text-secondary";
    }
  };

  const renderTableView = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-divider">
            <th className="text-left py-3 px-2 font-medium text-text-primary">Task</th>
            <th className="text-left py-3 px-2 font-medium text-text-primary">Assignee</th>
            <th className="text-left py-3 px-2 font-medium text-text-primary">Status</th>
            <th className="text-left py-3 px-2 font-medium text-text-primary">Due Date</th>
            <th className="text-left py-3 px-2 font-medium text-text-primary">Time Est.</th>
          </tr>
        </thead>
        <tbody>
          {displayTasks.map(task => (
            <tr key={task.id} className="border-b border-divider">
              <td className="py-3 px-2 text-text-primary">{task.title}</td>
              <td className="py-3 px-2 text-text-secondary">{task.assignee}</td>
              <td className="py-3 px-2">
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
              </td>
              <td className="py-3 px-2 text-text-secondary">{task.dueDate}</td>
              <td className="py-3 px-2 text-text-secondary">{task.timeEstimate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderActiveView = () => {
    switch (activeView) {
      case "timeline":
        return renderTimelineView();
      case "kanban":
        return renderKanbanView();
      case "table":
        return renderTableView();
      default:
        return renderTimelineView();
    }
  };

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-medium text-text-primary">Your Current Plan</h2>
      
      <Card className="p-6 bg-surface border-border">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-divider pb-4">
            <h3 className="font-medium text-text-primary">Plan Views</h3>
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant={activeView === "timeline" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveView("timeline")}
                className="text-xs"
              >
                Timeline
              </Button>
              <Button
                variant={activeView === "kanban" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveView("kanban")}
                className="text-xs"
              >
                Kanban
              </Button>
              <Button
                variant={activeView === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveView("table")}
                className="text-xs"
              >
                Table
              </Button>
            </div>
          </div>
          
          <div className="min-h-[300px]">
            {renderActiveView()}
          </div>
        </div>
      </Card>
    </section>
  );
};