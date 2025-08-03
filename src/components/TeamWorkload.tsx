import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface TeamMember {
  name: string;
  workload: number;
  status: "underloaded" | "balanced" | "overloaded";
}

const teamMembers: TeamMember[] = [
  { name: "Sarah Chen", workload: 45, status: "underloaded" },
  { name: "Alex Johnson", workload: 75, status: "balanced" },
  { name: "Mike Rodriguez", workload: 92, status: "overloaded" },
  { name: "Emily Davis", workload: 68, status: "balanced" },
  { name: "James Wilson", workload: 34, status: "underloaded" },
];

const getStatusColor = (status: TeamMember["status"]) => {
  switch (status) {
    case "underloaded":
      return "bg-status-underloaded";
    case "balanced":
      return "bg-status-balanced";
    case "overloaded":
      return "bg-status-overloaded";
    default:
      return "bg-muted";
  }
};

const getStatusLabel = (status: TeamMember["status"]) => {
  switch (status) {
    case "underloaded":
      return "Underloaded";
    case "balanced":
      return "Balanced";
    case "overloaded":
      return "Overloaded";
    default:
      return "Unknown";
  }
};

export const TeamWorkload = () => {
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-medium text-text-primary">Team Workload</h2>
      
      <Card className="p-6 bg-surface border-border">
        <div className="space-y-4">
          {teamMembers.map((member) => (
            <div key={member.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-text-primary">{member.name}</h4>
                <span className="text-sm text-text-secondary">
                  {getStatusLabel(member.status)}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Progress 
                  value={member.workload} 
                  className="flex-1 h-2"
                  style={{
                    "--progress-background": `var(--${member.status === "underloaded" ? "status-underloaded" : member.status === "balanced" ? "status-balanced" : "status-overloaded"})`
                  } as React.CSSProperties}
                />
                <span className="text-sm text-text-secondary w-12 text-right">
                  {member.workload}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
};