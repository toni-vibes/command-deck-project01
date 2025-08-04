import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Task } from "@/types/task";
import { Pencil, Trash2, Plus, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, parseISO, addDays, differenceInDays, isToday } from "date-fns";
import { EditTaskForm } from "./EditTaskForm";
import { AddTaskForm } from "./AddTaskForm";
import { SortableTaskCard } from "./SortableTaskCard";
import { DroppableColumn } from "./DroppableColumn";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

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
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
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
    
    // Handle task updates - let parent handle "Done" status and history
    if (onTasksChange) {
      onTasksChange(updatedTasks);
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

    // Handle task updates - let parent handle "Done" status and history
    if (onTasksChange) {
      onTasksChange(updatedTasks);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = displayTasks.find(task => task.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the active task
    const activeTask = displayTasks.find(task => task.id === activeId);
    if (!activeTask) return;

    // Check if we're over a droppable column
    const overStatus = overId as Task["status"];
    if (["To Do", "In Progress", "Done"].includes(overStatus)) {
      // If the task is not already in this status, move it
      if (activeTask.status !== overStatus) {
        const updatedTasks = displayTasks.map(task => 
          task.id === activeId ? { ...task, status: overStatus } : task
        );
        if (onTasksChange) {
          onTasksChange(updatedTasks);
        }
      }
    } else {
      // We're over another task, check if we should change status
      const overTask = displayTasks.find(task => task.id === overId);
      if (overTask && activeTask.status !== overTask.status) {
        const updatedTasks = displayTasks.map(task => 
          task.id === activeId ? { ...task, status: overTask.status } : task
        );
        if (onTasksChange) {
          onTasksChange(updatedTasks);
        }
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find tasks
    const activeTask = displayTasks.find(task => task.id === activeId);
    if (!activeTask) return;

    // Check if we're dropping over a column or task
    const overStatus = overId as Task["status"];
    if (["To Do", "In Progress", "Done"].includes(overStatus)) {
      // Dropping on a column
      if (activeTask.status !== overStatus) {
        if (overStatus === "Done") {
          handleStatusChange(activeId, overStatus);
        } else {
          const updatedTasks = displayTasks.map(task => 
            task.id === activeId ? { ...task, status: overStatus } : task
          );
          if (onTasksChange) {
            onTasksChange(updatedTasks);
          }
        }
      }
    } else {
      // Dropping on another task - handle reordering
      const overTask = displayTasks.find(task => task.id === overId);
      if (overTask && activeTask.status === overTask.status) {
        const tasksInStatus = displayTasks.filter(task => task.status === activeTask.status);
        const oldIndex = tasksInStatus.findIndex(task => task.id === activeId);
        const newIndex = tasksInStatus.findIndex(task => task.id === overId);

        if (oldIndex !== newIndex) {
          const reorderedTasks = arrayMove(tasksInStatus, oldIndex, newIndex);
          const otherTasks = displayTasks.filter(task => task.status !== activeTask.status);
          const updatedTasks = [...otherTasks, ...reorderedTasks];

          if (onTasksChange) {
            onTasksChange(updatedTasks);
          }
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

  const renderTimelineView = () => {
    console.log("Rendering timeline view...");
    console.log("Display tasks:", displayTasks);
    
    // If no tasks, show the default view with current month
    if (displayTasks.length === 0) {
      const today = new Date();
      const currentMonth = startOfMonth(today);
      const nextMonth = startOfMonth(addDays(today, 32));
      const months = [currentMonth, nextMonth];
      
      return (
        <div className="space-y-4">
          <div className="bg-surface-elevated border border-border rounded-lg overflow-hidden">
            <div className="flex">
              <div className="w-80 bg-muted border-r border-border flex-shrink-0">
                <div className="p-4 border-b border-border">
                  <div className="font-medium text-text-primary">Tasks</div>
                  <div className="text-xs text-text-secondary">0 records</div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="p-8 text-center text-text-secondary">
                    No tasks currently. Generate and implement a plan to see tasks here.
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div style={{ width: 400 }} className="relative">
                  <div className="flex border-b border-border bg-muted">
                    {months.map((month, index) => (
                      <div key={index} className="w-[200px] p-4 border-r border-border/30 text-center">
                        <div className="font-medium text-text-primary">
                          {format(month, 'MMMM')}
                        </div>
                        <div className="text-xs text-text-secondary">
                          {format(month, 'yyyy')}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="relative bg-surface h-32">
                    <div className="flex items-center justify-center h-full text-text-secondary">
                      Timeline will appear when tasks are added
                    </div>
                  </div>
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          </div>
        </div>
      );
    }
    
    // Helper function to parse task dates with fallbacks
    const parseTaskDate = (dueDate: string) => {
      const today = new Date();
      
      // Handle common date formats
      const normalized = dueDate.toLowerCase().trim();
      
      if (normalized === 'today') {
        return today;
      } else if (normalized === 'tomorrow') {
        return addDays(today, 1);
      } else if (normalized === 'next week') {
        return addDays(today, 7);
      } else if (normalized === 'this week') {
        return addDays(today, 3);
      } else {
        // Try to parse as ISO date or common date formats
        try {
          const parsed = parseISO(dueDate);
          if (!isNaN(parsed.getTime())) {
            return parsed;
          }
        } catch (e) {
          // Fallback to today if parsing fails
        }
        
        // Try parsing with Date constructor as fallback
        try {
          const fallback = new Date(dueDate);
          if (!isNaN(fallback.getTime())) {
            return fallback;
          }
        } catch (e) {
          // Ultimate fallback
        }
        
        return addDays(today, 7); // Default to next week
      }
    };

    // Calculate date range from all tasks
    const taskDates = displayTasks.map(task => parseTaskDate(task.dueDate));
    const today = new Date();
    
    // Add buffer months around task dates
    const allDates = [...taskDates, today, addDays(today, -30), addDays(today, 30)];
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
    
    // Generate months spanning the range
    const startMonth = startOfMonth(minDate);
    const endMonth = endOfMonth(maxDate);
    const months = eachMonthOfInterval({ start: startMonth, end: endMonth });
    
    // Calculate total timeline width (200px per month)
    const totalWidth = months.length * 200;
    
    const getTaskColor = (task: Task) => {
      const colors = {
        "Done": "from-emerald-500 to-emerald-600",
        "In Progress": "from-blue-500 to-blue-600", 
        "High": "from-red-500 to-red-600",
        "Medium": "from-amber-500 to-amber-600",
        "Low": "from-purple-500 to-purple-600"
      };
      
      if (task.status === "Done") return colors["Done"];
      if (task.status === "In Progress") return colors["In Progress"];
      return colors[task.priority] || colors["Low"];
    };

    const getTaskDuration = (task: Task) => {
      const estimate = task.timeEstimate.toLowerCase();
      if (estimate.includes('week')) {
        const weeks = parseInt(estimate) || 1;
        return weeks * 7;
      } else if (estimate.includes('day')) {
        return parseInt(estimate) || 1;
      }
      return 5; // Default 5 days
    };

    const getTaskPosition = (task: Task, months: Date[]) => {
      const taskDate = parseTaskDate(task.dueDate);
      const duration = getTaskDuration(task);
      
      // Find which month this task starts in
      const taskMonth = startOfMonth(taskDate);
      const monthIndex = months.findIndex(month => 
        month.getTime() === taskMonth.getTime()
      );
      
      if (monthIndex === -1) return null;
      
      // Calculate position within the month
      const dayOfMonth = taskDate.getDate();
      const daysInMonth = new Date(taskDate.getFullYear(), taskDate.getMonth() + 1, 0).getDate();
      const positionInMonth = (dayOfMonth / daysInMonth) * 200; // 200px per month
      
      return {
        left: monthIndex * 200 + positionInMonth,
        width: Math.max(duration * 6, 40), // Min 40px width
        monthIndex
      };
    };

    return (
      <div className="space-y-4">
        {/* Gantt Chart Container */}
        <div className="bg-surface-elevated border border-border rounded-lg overflow-hidden">
          {/* Fixed Task Names Column + Scrollable Timeline */}
          <div className="flex">
            {/* Fixed Task Names Column */}
            <div className="w-80 bg-muted border-r border-border flex-shrink-0">
              {/* Header */}
              <div className="p-4 border-b border-border">
                <div className="font-medium text-text-primary">Tasks</div>
                <div className="text-xs text-text-secondary">{displayTasks.length} records</div>
              </div>
              
              {/* Task List */}
              <div className="max-h-96 overflow-y-auto">
                {displayTasks.map((task) => (
                  <div 
                    key={task.id}
                    className={`p-4 border-b border-border/30 hover:bg-surface-elevated/50 transition-all duration-300 ${
                      removingTasks.has(task.id) ? 'opacity-0 scale-95 translate-y-2' : 'opacity-100 scale-100 translate-y-0'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div 
                        className="cursor-pointer flex-1"
                        onClick={() => setViewingTask(task)}
                      >
                        <div className="font-medium text-text-primary text-sm mb-1">{task.title}</div>
                        <div className="text-xs text-text-secondary">{task.assignee}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <div onClick={(e) => e.stopPropagation()}>
                            <StatusSelector task={task} />
                          </div>
                          <Badge variant="outline" className={`text-xs ${
                            task.priority === "High" ? "border-red-200 text-red-700" :
                            task.priority === "Medium" ? "border-amber-200 text-amber-700" :
                            "border-gray-200 text-gray-700"
                          }`}>
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                      <div onClick={(e) => e.stopPropagation()}>
                        <TaskActions task={task} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scrollable Timeline */}
            <ScrollArea className="flex-1">
              <div style={{ width: totalWidth }} className="relative">
                {/* Month Headers */}
                <div className="flex border-b border-border bg-muted">
                  {months.map((month, index) => (
                    <div key={index} className="w-[200px] p-4 border-r border-border/30 text-center">
                      <div className="font-medium text-text-primary">
                        {format(month, 'MMMM')}
                      </div>
                      <div className="text-xs text-text-secondary">
                        {format(month, 'yyyy')}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Timeline Grid */}
                <div className="relative bg-surface" style={{ height: `${displayTasks.length * 88}px` }}>
                  {/* Vertical Month Lines */}
                  {months.map((month, index) => (
                    <div 
                      key={index}
                      className="absolute top-0 bottom-0 w-px bg-border/30"
                      style={{ left: index * 200 }}
                    />
                  ))}
                  
                  {/* Today Line */}
                  {(() => {
                    const todayMonth = startOfMonth(new Date());
                    const monthIndex = months.findIndex(month => 
                      month.getTime() === todayMonth.getTime()
                    );
                    if (monthIndex !== -1) {
                      const today = new Date();
                      const dayOfMonth = today.getDate();
                      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
                      const todayPosition = monthIndex * 200 + (dayOfMonth / daysInMonth) * 200;
                      
                      return (
                        <div 
                          className="absolute top-0 bottom-0 w-0.5 bg-primary opacity-60 z-10"
                          style={{ left: todayPosition }}
                        >
                          <div className="absolute -top-6 -left-6 text-xs text-primary font-medium bg-background px-1 rounded">
                            Today
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Task Bars */}
                  {displayTasks.map((task, index) => {
                    const position = getTaskPosition(task, months);
                    if (!position) return null;

                    return (
                      <div
                        key={task.id}
                        className="absolute flex items-center"
                        style={{
                          top: index * 88 + 20,
                          left: position.left,
                          width: position.width,
                          height: 48
                        }}
                      >
                        <div 
                          className={`
                            h-8 rounded-lg bg-gradient-to-r ${getTaskColor(task)} 
                            shadow-sm hover:shadow-md transition-all duration-200 
                            cursor-pointer hover:scale-105 border border-white/20
                            flex items-center px-3 relative overflow-hidden
                          `}
                          onClick={() => setViewingTask(task)}
                        >
                          {/* Shimmer effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12" />
                          
                          <div className="relative z-10 flex items-center gap-2 w-full">
                            <div className="flex-1 text-white text-sm font-medium truncate">
                              {task.title}
                            </div>
                            <div className="text-white/80 text-xs">
                              {task.timeEstimate}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </div>
      </div>
    );
  };

  const renderKanbanView = () => {
    const todoTasks = displayTasks.filter(task => task.status === "To Do");
    const inProgressTasks = displayTasks.filter(task => task.status === "In Progress");
    const doneTasks = displayTasks.filter(task => task.status === "Done");

    return (
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DroppableColumn id="To Do" title="To Do">
            <SortableContext items={todoTasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
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
            </SortableContext>
          </DroppableColumn>

          <DroppableColumn id="In Progress" title="In Progress">
            <SortableContext items={inProgressTasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
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
            </SortableContext>
          </DroppableColumn>

          <DroppableColumn id="Done" title="Done">
            <SortableContext items={doneTasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
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
            </SortableContext>
          </DroppableColumn>
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="bg-surface-elevated p-3 rounded-lg border shadow-lg opacity-90 rotate-2">
              <p className="text-sm font-medium">{activeTask.title}</p>
              <p className="text-xs text-text-secondary">
                {activeTask.status === "To Do" ? `${activeTask.priority} priority | ${activeTask.assignee}` :
                 activeTask.status === "In Progress" ? `${activeTask.assignee} | Due: ${activeTask.dueDate}` :
                 `Completed | ${activeTask.assignee}`}
              </p>
            </div>
          ) : null}
        </DragOverlay>
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
            {renderActiveView()}
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