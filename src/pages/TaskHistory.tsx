import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, User, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Task } from "@/types/task";

const TaskHistory = () => {
  const navigate = useNavigate();
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);

  useEffect(() => {
    // Load completed tasks from localStorage
    const savedHistory = localStorage.getItem('taskHistory');
    if (savedHistory) {
      setCompletedTasks(JSON.parse(savedHistory));
    }
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-destructive/10 text-destructive border-destructive/20";
      case "Medium": return "bg-secondary text-secondary-foreground";
      case "Low": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-divider bg-surface">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-semibold text-text-primary">Task History</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-text-secondary">
              View all your completed tasks and track your accomplishments.
            </p>
            <Badge variant="secondary" className="text-sm">
              {completedTasks.length} Completed
            </Badge>
          </div>

          {completedTasks.length === 0 ? (
            <Card className="p-12 bg-surface border-border">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-text-primary">No completed tasks yet</h3>
                <p className="text-text-secondary max-w-md mx-auto">
                  Your task history is currently empty. Complete some tasks in your current plan to see them here.
                </p>
                <Button onClick={() => navigate('/')} className="mt-4">
                  Go to Dashboard
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4">
              {completedTasks.map((task) => (
                <Card key={task.id} className="p-6 bg-surface border-border">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium text-text-primary">{task.title}</h3>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          Completed
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {task.description && (
                    <p className="text-text-secondary mb-4">{task.description}</p>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-text-secondary">
                      <User className="h-4 w-4" />
                      <span>Assignee: {task.assignee}</span>
                    </div>
                    <div className="flex items-center gap-2 text-text-secondary">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {task.dueDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-text-secondary">
                      <Clock className="h-4 w-4" />
                      <span>Estimate: {task.timeEstimate}</span>
                    </div>
                    {task.completedAt && (
                      <div className="flex items-center gap-2 text-text-secondary">
                        <Calendar className="h-4 w-4" />
                        <span>Completed: {new Date(task.completedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TaskHistory;