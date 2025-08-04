import { useState } from "react";
import { GoalBreakdown } from "@/components/GoalBreakdown";
import { TaskViews } from "@/components/TaskViews";
import { TeamWorkload } from "@/components/TeamWorkload";
import { ActionButtons } from "@/components/ActionButtons";
import { Task } from "@/types/task";

const Index = () => {
  const [implementedTasks, setImplementedTasks] = useState<Task[]>([]);

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
          <GoalBreakdown onPlanImplemented={handlePlanImplemented} />

          {/* Section 2: Task Views */}
          <TaskViews tasks={implementedTasks} onTasksChange={setImplementedTasks} />

          {/* Section 3: Team Workload */}
          <TeamWorkload />
        </div>
      </main>
    </div>
  );
};

export default Index;
