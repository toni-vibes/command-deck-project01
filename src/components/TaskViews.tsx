import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Task } from "@/types/task";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EditTaskForm } from "./EditTaskForm";
import { AddTaskForm } from "./AddTaskForm";

type ViewType = "timeline" | "kanban" | "table";

interface TaskViewsProps {
  tasks?: Task[];
  onTasksChange?: (tasks: Task[]) => void;
}

export const TaskViews = ({ tasks = [], onTasksChange }: TaskViewsProps) => {
  const [activeView, setActiveView] = useState<ViewType>("timeline");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [removingTasks, setRemovingTasks] = useState<Set<string>>(new Set());

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

  const displayTasks = tasks;

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = displayTasks.filter(task => task.id !== taskId);
    if (onTasksChange) {
      onTasksChange(updatedTasks);
    }
  };

  const handleEditTask = (updatedTask: Task) => {
    const updatedTasks = displayTasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    );
    
    // Check if task was marked as "Done" and handle automatic removal
    if (updatedTask.status === "Done") {
      setRemovingTasks(prev => new Set(prev.add(updatedTask.id)));
      
      // Add fade out animation and then remove after delay
      setTimeout(() => {
        const tasksWithoutCompleted = updatedTasks.filter(task => task.id !== updatedTask.id);
        if (onTasksChange) {
          onTasksChange(tasksWithoutCompleted);
        }
        setRemovingTasks(prev => {
          const newSet = new Set(prev);
          newSet.delete(updatedTask.id);
          return newSet;
        });
      }, 300); // Match the fade animation duration
    } else {
      if (onTasksChange) {
        onTasksChange(updatedTasks);
      }
    }
    
    setEditingTask(null);
  };

  const handleAddTask = (newTask: Task) => {
    const updatedTasks = [...displayTasks, newTask];
    if (onTasksChange) {
      onTasksChange(updatedTasks);
    }
    setShowAddTask(false);
  };

  const TaskActions = ({ task }: { task: Task }) => (
    <div className="flex gap-1">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditingTask(task)}
            className="h-7 w-7 p-0"
          >
            <Pencil className="h-3 w-3" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <EditTaskForm task={editingTask || task} onSave={handleEditTask} />
        </DialogContent>
      </Dialog>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleDeleteTask(task.id)}
        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );

  const renderTimelineView = () => (
    <div className="space-y-4">
      <div className="border-l-2 border-primary pl-4 space-y-4">
        {displayTasks.map((task, index) => (
          <div 
            key={task.id} 
            className={`relative transition-all duration-300 ${
              removingTasks.has(task.id) ? 'opacity-0 scale-95 translate-y-2' : 'opacity-100 scale-100 translate-y-0'
            }`}
          >
            <div className={`absolute -left-6 w-3 h-3 rounded-full ${
              task.status === "In Progress" ? "bg-primary" : "bg-muted"
            }`}></div>
            <div 
              className="bg-surface-elevated p-4 rounded-lg border cursor-pointer hover:bg-surface-elevated/80 transition-colors"
              onClick={() => setViewingTask(task)}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-text-primary">{task.title}</h4>
                <div onClick={(e) => e.stopPropagation()}>
                  <TaskActions task={task} />
                </div>
              </div>
              <p className="text-sm text-text-secondary">
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
              <div 
                key={task.id} 
                className={`bg-surface-elevated p-3 rounded-lg border cursor-pointer hover:bg-surface-elevated/80 transition-all duration-300 ${
                  removingTasks.has(task.id) ? 'opacity-0 scale-95 translate-y-2' : 'opacity-100 scale-100 translate-y-0'
                }`}
                onClick={() => setViewingTask(task)}
              >
                <div className="flex justify-between items-start mb-1">
                  <p className="text-sm font-medium">{task.title}</p>
                  <div onClick={(e) => e.stopPropagation()}>
                    <TaskActions task={task} />
                  </div>
                </div>
                <p className="text-xs text-text-secondary">{task.priority} priority | {task.assignee}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <h4 className="font-medium text-text-primary">In Progress</h4>
          <div className="space-y-2">
            {inProgressTasks.map(task => (
              <div 
                key={task.id} 
                className={`bg-surface-elevated p-3 rounded-lg border cursor-pointer hover:bg-surface-elevated/80 transition-all duration-300 ${
                  removingTasks.has(task.id) ? 'opacity-0 scale-95 translate-y-2' : 'opacity-100 scale-100 translate-y-0'
                }`}
                onClick={() => setViewingTask(task)}
              >
                <div className="flex justify-between items-start mb-1">
                  <p className="text-sm font-medium">{task.title}</p>
                  <div onClick={(e) => e.stopPropagation()}>
                    <TaskActions task={task} />
                  </div>
                </div>
                <p className="text-xs text-text-secondary">{task.assignee} | Due: {task.dueDate}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <h4 className="font-medium text-text-primary">Done</h4>
          <div className="space-y-2">
            {doneTasks.map(task => (
              <div 
                key={task.id} 
                className={`bg-surface-elevated p-3 rounded-lg border cursor-pointer hover:bg-surface-elevated/80 transition-all duration-300 ${
                  removingTasks.has(task.id) ? 'opacity-0 scale-95 translate-y-2' : 'opacity-100 scale-100 translate-y-0'
                }`}
                onClick={() => setViewingTask(task)}
              >
                <div className="flex justify-between items-start mb-1">
                  <p className="text-sm font-medium">{task.title}</p>
                  <div onClick={(e) => e.stopPropagation()}>
                    <TaskActions task={task} />
                  </div>
                </div>
                <p className="text-xs text-text-secondary">Completed | {task.assignee}</p>
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
            <th className="text-left py-3 px-2 font-medium text-text-primary">Actions</th>
          </tr>
        </thead>
        <tbody>
          {displayTasks.map(task => (
            <tr 
              key={task.id} 
              className={`border-b border-divider cursor-pointer hover:bg-surface-elevated/50 transition-all duration-300 ${
                removingTasks.has(task.id) ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              }`}
              onClick={() => setViewingTask(task)}
            >
              <td className="py-3 px-2 text-text-primary">{task.title}</td>
              <td className="py-3 px-2 text-text-secondary">{task.assignee}</td>
              <td className="py-3 px-2">
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
              </td>
              <td className="py-3 px-2 text-text-secondary">{task.dueDate}</td>
              <td className="py-3 px-2 text-text-secondary">{task.timeEstimate}</td>
              <td className="py-3 px-2" onClick={(e) => e.stopPropagation()}>
                <TaskActions task={task} />
              </td>
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
            <div className="flex items-center gap-3">
              <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Task</DialogTitle>
                  </DialogHeader>
                  <AddTaskForm onSave={handleAddTask} onCancel={() => setShowAddTask(false)} />
                </DialogContent>
              </Dialog>
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
          </div>
          
          <div className="min-h-[300px]">
            {displayTasks.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-text-secondary">
                No tasks currently. Generate and implement a plan to see tasks here.
              </div>
            ) : (
              renderActiveView()
            )}
          </div>
        </div>
      </Card>

      {/* Task Details Dialog */}
      <Dialog open={!!viewingTask} onOpenChange={() => setViewingTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
          </DialogHeader>
          {viewingTask && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-text-primary text-lg">{viewingTask.title}</h4>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={`${
                    viewingTask.priority === "High" ? "bg-destructive/10 text-destructive border-destructive/20" :
                    viewingTask.priority === "Medium" ? "bg-secondary text-secondary-foreground" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {viewingTask.priority}
                  </Badge>
                  <Badge className={`${
                    viewingTask.status === "In Progress" ? "bg-primary/10 text-primary" :
                    viewingTask.status === "Done" ? "bg-green-100 text-green-700" :
                    "bg-muted text-text-secondary"
                  }`}>
                    {viewingTask.status}
                  </Badge>
                </div>
              </div>
              
              {viewingTask.description && (
                <div>
                  <h5 className="font-medium text-text-primary mb-2">Description</h5>
                  <p className="text-sm text-text-secondary">{viewingTask.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-text-primary">Assignee:</span>
                  <p className="text-text-secondary">{viewingTask.assignee}</p>
                </div>
                <div>
                  <span className="font-medium text-text-primary">Due Date:</span>
                  <p className="text-text-secondary">{viewingTask.dueDate}</p>
                </div>
                <div>
                  <span className="font-medium text-text-primary">Time Estimate:</span>
                  <p className="text-text-secondary">{viewingTask.timeEstimate}</p>
                </div>
                <div>
                  <span className="font-medium text-text-primary">Status:</span>
                  <p className="text-text-secondary">{viewingTask.status}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};