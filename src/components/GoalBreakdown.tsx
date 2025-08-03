import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

export const GoalBreakdown = () => {
  const [goal, setGoal] = useState("");
  const [planGenerated, setPlanGenerated] = useState(false);

  const handleGeneratePlan = () => {
    if (goal.trim()) {
      setPlanGenerated(true);
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
          <h3 className="font-medium text-text-primary mb-4">Plan Preview</h3>
          <div className="space-y-3 text-text-secondary">
            <div className="p-3 bg-muted rounded-md">
              <p className="font-medium text-text-primary">Phase 1: Research & Planning</p>
              <p className="text-sm">Market analysis and competitive research</p>
            </div>
            <div className="p-3 bg-muted rounded-md">
              <p className="font-medium text-text-primary">Phase 2: Development</p>
              <p className="text-sm">Build core features and MVP</p>
            </div>
            <div className="p-3 bg-muted rounded-md">
              <p className="font-medium text-text-primary">Phase 3: Launch</p>
              <p className="text-sm">Marketing campaign and user acquisition</p>
            </div>
          </div>
        </Card>
      )}
    </section>
  );
};