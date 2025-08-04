import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Task } from "@/types/task";
import { Pencil, Trash2, Plus, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EditTaskForm } from "./EditTaskForm";
import { AddTaskForm } from "./AddTaskForm";
import { SortableTaskCard } from "./SortableTaskCard";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type ViewType = "timeline" | "kanban" | "table";

interface TaskViewsProps {
  tasks?: Task[];
  onTasksChange?: (tasks: Task[]) => void;
}

export const TaskViews = ({ tasks = [], onTasksChange }: TaskViewsProps) => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<ViewType>("timeline");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [removingTasks, setRemovingTasks] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleStatusChange = (taskId: string, newStatus: Task["status"]) => {
    const updatedTasks = displayTasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    );

    // Check if task was marked as "Done" and handle automatic removal
    if (newStatus === "Done") {
      const completedTask = updatedTasks.find(task => task.id === taskId);
      if (completedTask) {
        setRemovingTasks(prev => new Set(prev.add(taskId)));
        
        // Add fade out animation and then remove after delay
        setTimeout(() => {
          const tasksWithoutCompleted = updatedTasks.filter(task => task.id !== taskId);
          if (onTasksChange) {
            onTasksChange(tasksWithoutCompleted);
          }
          setRemovingTasks(prev => {
            const newSet = new Set(prev);
            newSet.delete(taskId);
            return newSet;
          });
        }, 300);
      }
    } else {
      if (onTasksChange) {
        onTasksChange(updatedTasks);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find tasks
    const activeTask = displayTasks.find(task => task.id === activeId);

    if (!activeTask) return;

    // Check if we're dropping over a column header or task
    let targetStatus: Task["status"] | null = null;
    
    // If dropping over a task, get its status
    const overTask = displayTasks.find(task => task.id === overId);
    if (overTask) {
      targetStatus = overTask.status;
    } else {
      // If dropping over column area, determine status from drop zone
      const dropZone = over.data?.current?.sortable?.containerId;
      if (dropZone === "To Do" || dropZone === "In Progress" || dropZone === "Done") {
        targetStatus = dropZone as Task["status"];
      }
    }

    if (!targetStatus) return;

    // If status changed, update the task status
    if (activeTask.status !== targetStatus) {
      handleStatusChange(activeId, targetStatus);
    } else {
      // If dropping in the same status, reorder
      const tasksInStatus = displayTasks.filter(task => task.status === activeTask.status);
      const oldIndex = tasksInStatus.findIndex(task => task.id === activeId);
      const newIndex = tasksInStatus.findIndex(task => task.id === overId);

      if (oldIndex !== newIndex) {
        const reorderedTasks = arrayMove(tasksInStatus, oldIndex, newIndex);
        
        // Rebuild the full task list with reordered tasks
        const otherTasks = displayTasks.filter(task => task.status !== activeTask.status);
        const updatedTasks = [...otherTasks, ...reorderedTasks];

        if (onTasksChange) {
          onTasksChange(updatedTasks);
        }
      }
    }
  };

  const TaskActions = ({ task }: { task: Task }) => (
    <div className="flex gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setEditingTask(task)}
        className="h-7 w-7 p-0"
      >
        <Pencil className="h-3 w-3" />
      </Button>
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

  const StatusSelector = ({ task }: { task: Task }) => (
    <Select value={task.status} onValueChange={(value: Task["status"]) => handleStatusChange(task.id, value)}>
      <SelectTrigger className="w-32 h-7 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="To Do">To Do</SelectItem>
        <SelectItem value="In Progress">In Progress</SelectItem>
        <SelectItem value="Done">Done</SelectItem>
      </SelectContent>
    </Select>
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
              <div className="flex justify-between items-center">
                <p className="text-sm text-text-secondary">
                  Due: {task.dueDate} | {task.assignee} | {task.timeEstimate}
                </p>
                <div onClick={(e) => e.stopPropagation()}>
                  <StatusSelector task={task} />
                </div>
              </div>
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
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-text-primary">To Do</h4>
            <SortableContext items={todoTasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
              <div 
                className="space-y-2 min-h-[200px] p-3 border-2 border-dashed border-border/30 rounded-lg transition-colors"
                data-status="To Do"
              >
                {todoTasks.map(task => (
                  <SortableTaskCard
                    key={task.id}
                    task={task}
                    onEdit={setEditingTask}
                    onDelete={handleDeleteTask}
                    onView={setViewingTask}
                    removingTasks={removingTasks}
                  />
                ))}
              </div>
            </SortableContext>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-text-primary">In Progress</h4>
            <SortableContext items={inProgressTasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
              <div 
                className="space-y-2 min-h-[200px] p-3 border-2 border-dashed border-border/30 rounded-lg transition-colors"
                data-status="In Progress"
              >
                {inProgressTasks.map(task => (
                  <SortableTaskCard
                    key={task.id}
                    task={task}
                    onEdit={setEditingTask}
                    onDelete={handleDeleteTask}
                    onView={setViewingTask}
                    removingTasks={removingTasks}
                  />
                ))}
              </div>
            </SortableContext>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-text-primary">Done</h4>
            <SortableContext items={doneTasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
              <div 
                className="space-y-2 min-h-[200px] p-3 border-2 border-dashed border-border/30 rounded-lg transition-colors"
                data-status="Done"
              >
                {doneTasks.map(task => (
                  <SortableTaskCard
                    key={task.id}
                    task={task}
                    onEdit={setEditingTask}
                    onDelete={handleDeleteTask}
                    onView={setViewingTask}
                    removingTasks={removingTasks}
                  />
                ))}
              </div>
            </SortableContext>
          </div>
        </div>
      </DndContext>
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
              <td className="py-3 px-2" onClick={(e) => e.stopPropagation()}>
                <StatusSelector task={task} />
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
              <Button
                variant="outline"
                onClick={() => navigate('/task-history')}
                className="flex items-center gap-2"
                size="sm"
              >
                <History className="h-4 w-4" />
                Task History
              </Button>
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

      {/* Edit Task Dialog */}
      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <EditTaskForm task={editingTask} onSave={handleEditTask} />
          )}
        </DialogContent>
      </Dialog>

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