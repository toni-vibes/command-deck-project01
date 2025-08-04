import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/types/task";

interface GoalBreakdownProps {
  onPlanImplemented?: (tasks: Task[]) => void;
}

export const GoalBreakdown = ({ onPlanImplemented }: GoalBreakdownProps) => {
  const [goal, setGoal] = useState("");
  const [planGenerated, setPlanGenerated] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<Task[]>([]);

  const generateTasksFromGoal = (goalText: string): Task[] => {
    // Simple goal analysis to generate tasks
    const teamMembers = ["Sarah Chen", "Alex Johnson", "Mike Rodriguez", "Emma Davis"];
    const words = goalText.toLowerCase();
    
    let tasks: Task[] = [];
    let taskId = 1;
    
    // Generate tasks based on common goal patterns
    if (words.includes("app") || words.includes("software") || words.includes("platform")) {
      tasks.push(
        {
          id: `task-${taskId++}`,
          title: "Research and Planning",
          description: "Conduct market research and define requirements",
          assignee: teamMembers[0],
          dueDate: "2024-01-15",
          timeEstimate: "1 week",
          status: "To Do",
          priority: "High"
        },
        {
          id: `task-${taskId++}`,
          title: "Design System",
          description: "Create wireframes and design mockups",
          assignee: teamMembers[1],
          dueDate: "2024-01-22",
          timeEstimate: "1.5 weeks",
          status: "To Do",
          priority: "High"
        },
        {
          id: `task-${taskId++}`,
          title: "Backend Development",
          description: "Set up database and API endpoints",
          assignee: teamMembers[2],
          dueDate: "2024-02-05",
          timeEstimate: "2 weeks",
          status: "To Do",
          priority: "Medium"
        },
        {
          id: `task-${taskId++}`,
          title: "Frontend Implementation",
          description: "Build user interface components",
          assignee: teamMembers[1],
          dueDate: "2024-02-19",
          timeEstimate: "2 weeks",
          status: "To Do",
          priority: "Medium"
        },
        {
          id: `task-${taskId++}`,
          title: "Testing & QA",
          description: "Comprehensive testing and bug fixes",
          assignee: teamMembers[3],
          dueDate: "2024-02-26",
          timeEstimate: "1 week",
          status: "To Do",
          priority: "High"
        }
      );
    } else if (words.includes("marketing") || words.includes("campaign") || words.includes("brand")) {
      tasks.push(
        {
          id: `task-${taskId++}`,
          title: "Market Analysis",
          description: "Analyze target audience and competitors",
          assignee: teamMembers[0],
          dueDate: "2024-01-12",
          timeEstimate: "3 days",
          status: "To Do",
          priority: "High"
        },
        {
          id: `task-${taskId++}`,
          title: "Content Strategy",
          description: "Develop content calendar and messaging",
          assignee: teamMembers[1],
          dueDate: "2024-01-19",
          timeEstimate: "1 week",
          status: "To Do",
          priority: "Medium"
        },
        {
          id: `task-${taskId++}`,
          title: "Creative Assets",
          description: "Design graphics and marketing materials",
          assignee: teamMembers[1],
          dueDate: "2024-01-26",
          timeEstimate: "1 week",
          status: "To Do",
          priority: "Medium"
        },
        {
          id: `task-${taskId++}`,
          title: "Campaign Launch",
          description: "Execute marketing campaign across channels",
          assignee: teamMembers[2],
          dueDate: "2024-02-02",
          timeEstimate: "1 week",
          status: "To Do",
          priority: "High"
        }
      );
    } else {
      // Generic tasks for any goal
      tasks.push(
        {
          id: `task-${taskId++}`,
          title: "Initial Planning",
          description: "Define scope and create project roadmap",
          assignee: teamMembers[0],
          dueDate: "2024-01-10",
          timeEstimate: "2 days",
          status: "To Do",
          priority: "High"
        },
        {
          id: `task-${taskId++}`,
          title: "Resource Allocation",
          description: "Assign team members and allocate budget",
          assignee: teamMembers[0],
          dueDate: "2024-01-15",
          timeEstimate: "1 day",
          status: "To Do",
          priority: "Medium"
        },
        {
          id: `task-${taskId++}`,
          title: "Execution Phase 1",
          description: "Begin implementation of core components",
          assignee: teamMembers[2],
          dueDate: "2024-01-29",
          timeEstimate: "2 weeks",
          status: "To Do",
          priority: "High"
        },
        {
          id: `task-${taskId++}`,
          title: "Review & Optimization",
          description: "Evaluate progress and optimize approach",
          assignee: teamMembers[3],
          dueDate: "2024-02-05",
          timeEstimate: "1 week",
          status: "To Do",
          priority: "Medium"
        }
      );
    }
    
    return tasks;
  };

  const handleGeneratePlan = () => {
    if (goal.trim()) {
      const tasks = generateTasksFromGoal(goal);
      setGeneratedTasks(tasks);
      setPlanGenerated(true);
    }
  };

  const handleImplementPlan = () => {
    if (onPlanImplemented && generatedTasks.length > 0) {
      onPlanImplemented(generatedTasks);
      // Reset the goal breakdown
      setGoal("");
      setPlanGenerated(false);
      setGeneratedTasks([]);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-destructive/10 text-destructive border-destructive/20";
      case "Medium": return "bg-secondary text-secondary-foreground";
      case "Low": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-medium text-text-primary">Set Your Mission</h2>
      
      <div className="space-y-4">
        <Textarea
          placeholder="Describe your big goal..."
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          className="min-h-[120px] resize-none bg-surface border-border text-base"
        />
        
        <Button 
          onClick={handleGeneratePlan}
          disabled={!goal.trim()}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Generate Plan
        </Button>
      </div>

      {planGenerated && (
        <Card className="p-6 bg-surface border-border">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-medium text-text-primary">Plan Preview</h3>
            <Button 
              onClick={handleImplementPlan}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Implement Plan
            </Button>
          </div>
          
          <div className="space-y-4">
            {generatedTasks.map((task, index) => (
              <div key={task.id} className="p-4 bg-surface-elevated rounded-lg border border-border">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-text-primary">{task.title}</h4>
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </div>
                
                <p className="text-sm text-text-secondary mb-3">{task.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-text-secondary">Assignee:</span>
                    <p className="font-medium text-text-primary">{task.assignee}</p>
                  </div>
                  <div>
                    <span className="text-text-secondary">Due Date:</span>
                    <p className="font-medium text-text-primary">{task.dueDate}</p>
                  </div>
                  <div>
                    <span className="text-text-secondary">Time Required:</span>
                    <p className="font-medium text-text-primary">{task.timeEstimate}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-text-secondary">
              <strong>Total Tasks:</strong> {generatedTasks.length} | 
              <strong> Estimated Duration:</strong> {Math.ceil(generatedTasks.length * 1.2)} weeks | 
              <strong> Team Members:</strong> {new Set(generatedTasks.map(t => t.assignee)).size}
            </p>
          </div>
        </Card>
      )}
    </section>
  );
};