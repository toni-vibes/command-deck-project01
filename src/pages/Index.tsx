import { useState, useEffect } from "react";
import { GoalBreakdown } from "@/components/GoalBreakdown";
import { TaskViews } from "@/components/TaskViews";
import { TeamWorkload } from "@/components/TeamWorkload";
import { ActionButtons } from "@/components/ActionButtons";
import { Task } from "@/types/task";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const [implementedTasks, setImplementedTasks] = useState<Task[]>([]);

  // Task History management functions
  const saveTaskToHistory = (task: Task) => {
    const savedHistory = localStorage.getItem('taskHistory');
    const history = savedHistory ? JSON.parse(savedHistory) : [];
    const updatedHistory = [...history, { ...task, status: "Done" }];
    localStorage.setItem('taskHistory', JSON.stringify(updatedHistory));
  };

  const handleTaskStatusChange = (updatedTasks: Task[]) => {
    // Check for newly completed tasks and move them to history
    const currentTaskIds = new Set(implementedTasks.map(t => t.id));
    const newTaskIds = new Set(updatedTasks.map(t => t.id));
    
    // Find tasks that were removed (completed)
    const removedTasks = implementedTasks.filter(task => !newTaskIds.has(task.id));
    
    // Save completed tasks to history
    removedTasks.forEach(task => {
      if (task.status === "Done") {
        saveTaskToHistory(task);
      }
    });
    
    setImplementedTasks(updatedTasks);
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
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/task-history')}
                className="flex items-center gap-2"
              >
                <History className="h-4 w-4" />
                Task History
              </Button>
              <ActionButtons />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-12">
          {/* Section 1: Goal Breakdown */}
          <GoalBreakdown onPlanImplemented={handlePlanImplemented} currentTasks={implementedTasks} />

          {/* Section 2: Task Views */}
          <TaskViews tasks={implementedTasks} onTasksChange={handleTaskStatusChange} />

          {/* Section 3: Team Workload */}
          <TeamWorkload />
        </div>
      </main>
    </div>
  );
};

export default Index;
