import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ViewType = "timeline" | "kanban" | "table";

export const TaskViews = () => {
  const [activeView, setActiveView] = useState<ViewType>("timeline");

  const renderTimelineView = () => (
    <div className="space-y-4">
      <div className="border-l-2 border-primary pl-4 space-y-4">
        <div className="relative">
          <div className="absolute -left-6 w-3 h-3 bg-primary rounded-full"></div>
          <div className="bg-surface-elevated p-4 rounded-lg border">
            <h4 className="font-medium text-text-primary">Complete user research</h4>
            <p className="text-sm text-text-secondary mt-1">Due: Today</p>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -left-6 w-3 h-3 bg-muted rounded-full"></div>
          <div className="bg-surface-elevated p-4 rounded-lg border">
            <h4 className="font-medium text-text-primary">Design wireframes</h4>
            <p className="text-sm text-text-secondary mt-1">Due: Tomorrow</p>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -left-6 w-3 h-3 bg-muted rounded-full"></div>
          <div className="bg-surface-elevated p-4 rounded-lg border">
            <h4 className="font-medium text-text-primary">Develop prototype</h4>
            <p className="text-sm text-text-secondary mt-1">Due: Next week</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderKanbanView = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="space-y-3">
        <h4 className="font-medium text-text-primary">To Do</h4>
        <div className="space-y-2">
          <div className="bg-surface-elevated p-3 rounded-lg border">
            <p className="text-sm font-medium">Design wireframes</p>
            <p className="text-xs text-text-secondary mt-1">High priority</p>
          </div>
          <div className="bg-surface-elevated p-3 rounded-lg border">
            <p className="text-sm font-medium">Set up development environment</p>
            <p className="text-xs text-text-secondary mt-1">Medium priority</p>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <h4 className="font-medium text-text-primary">In Progress</h4>
        <div className="space-y-2">
          <div className="bg-surface-elevated p-3 rounded-lg border">
            <p className="text-sm font-medium">Complete user research</p>
            <p className="text-xs text-text-secondary mt-1">75% complete</p>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <h4 className="font-medium text-text-primary">Done</h4>
        <div className="space-y-2">
          <div className="bg-surface-elevated p-3 rounded-lg border">
            <p className="text-sm font-medium">Initial planning meeting</p>
            <p className="text-xs text-text-secondary mt-1">Completed</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTableView = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-divider">
            <th className="text-left py-3 px-2 font-medium text-text-primary">Task</th>
            <th className="text-left py-3 px-2 font-medium text-text-primary">Assignee</th>
            <th className="text-left py-3 px-2 font-medium text-text-primary">Status</th>
            <th className="text-left py-3 px-2 font-medium text-text-primary">Due Date</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-divider">
            <td className="py-3 px-2 text-text-primary">Complete user research</td>
            <td className="py-3 px-2 text-text-secondary">Sarah Chen</td>
            <td className="py-3 px-2">
              <span className="px-2 py-1 bg-status-balanced/10 text-status-balanced rounded-full text-xs">
                In Progress
              </span>
            </td>
            <td className="py-3 px-2 text-text-secondary">Today</td>
          </tr>
          <tr className="border-b border-divider">
            <td className="py-3 px-2 text-text-primary">Design wireframes</td>
            <td className="py-3 px-2 text-text-secondary">Alex Johnson</td>
            <td className="py-3 px-2">
              <span className="px-2 py-1 bg-muted text-text-secondary rounded-full text-xs">
                To Do
              </span>
            </td>
            <td className="py-3 px-2 text-text-secondary">Tomorrow</td>
          </tr>
          <tr className="border-b border-divider">
            <td className="py-3 px-2 text-text-primary">Develop prototype</td>
            <td className="py-3 px-2 text-text-secondary">Mike Rodriguez</td>
            <td className="py-3 px-2">
              <span className="px-2 py-1 bg-muted text-text-secondary rounded-full text-xs">
                To Do
              </span>
            </td>
            <td className="py-3 px-2 text-text-secondary">Next week</td>
          </tr>
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