import { useState, useEffect } from "react";
import { GoalBreakdown } from "@/components/GoalBreakdown";
import { TaskViews } from "@/components/TaskViews";
import { TeamWorkload } from "@/components/TeamWorkload";
import { ActionButtons } from "@/components/ActionButtons";
import { Task } from "@/types/task";

const Index = () => {
  const [implementedTasks, setImplementedTasks] = useState<Task[]>([]);

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('currentTasks');
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        // Only set tasks if it's a non-empty array
        if (Array.isArray(parsedTasks) && parsedTasks.length > 0) {
          setImplementedTasks(parsedTasks);
        }
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem('currentTasks');
      }
    }
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
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-text-primary">Command Deck</h1>
            <ActionButtons />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-12">
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
