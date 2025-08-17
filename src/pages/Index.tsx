import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { GoalBreakdown } from "@/components/GoalBreakdown";
import { TaskViews } from "@/components/TaskViews";
import { TeamWorkload } from "@/components/TeamWorkload";
import { ActionButtons } from "@/components/ActionButtons";
import { Task } from "@/types/task";

const Index = () => {
  const [implementedTasks, setImplementedTasks] = useState<Task[]>([]);

  // Clear all existing data and start fresh
  useEffect(() => {
    // Clear any existing task data to ensure empty start
    localStorage.removeItem('currentTasks');
    localStorage.removeItem('taskHistory');
    setImplementedTasks([]);
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('currentTasks', JSON.stringify(implementedTasks));
  }, [implementedTasks]);

  // Task History management functions
  const saveTaskToHistory = (task: Task) => {
    const savedHistory = localStorage.getItem('taskHistory');
    const history = savedHistory ? JSON.parse(savedHistory) : [];
    
    // Check if task already exists in history (avoid duplicates)
    const taskExists = history.some((historyTask: Task) => historyTask.id === task.id);
    if (!taskExists) {
      const completedTask = { 
        ...task, 
        status: "Done" as const,
        completedAt: new Date().toISOString()
      };
      const updatedHistory = [...history, completedTask];
      localStorage.setItem('taskHistory', JSON.stringify(updatedHistory));
    }
  };

  const handleTasksChange = (updatedTasks: Task[]) => {
    // Find tasks that were marked as "Done" and save them to history
    const doneTasks = updatedTasks.filter(task => task.status === "Done");
    doneTasks.forEach(task => {
      saveTaskToHistory(task);
    });

    // Remove "Done" tasks from current tasks (they're now in history)
    const activeTasks = updatedTasks.filter(task => task.status !== "Done");
    setImplementedTasks(activeTasks);
  };

  const handlePlanImplemented = (tasks: Task[]) => {
    setImplementedTasks(tasks);
  };
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-divider bg-surface">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-start">
            <Menu className="h-6 w-6 text-text-secondary" />
            <div className="flex-1 text-center">
              <h1 className="text-3xl font-semibold text-text-primary mb-2">Command Deck</h1>
              <p className="text-text-secondary">Monitor and manage your project progress in real-time</p>
            </div>
            <div className="w-6"></div> {/* Spacer for balance */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-12">
          {/* Action Buttons */}
          <div className="flex justify-end">
            <ActionButtons />
          </div>

          {/* Section 1: Goal Breakdown */}
          <GoalBreakdown onPlanImplemented={handlePlanImplemented} currentTasks={implementedTasks} />

          {/* Section 2: Task Views */}
          <TaskViews tasks={implementedTasks} onTasksChange={handleTasksChange} />

          {/* Section 3: Team Workload */}
          <TeamWorkload />
        </div>
      </main>
    </div>
  );
};

export default Index;
