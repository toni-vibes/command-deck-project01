import { Button } from "@/components/ui/button";

export const ActionButtons = () => {
  const handleRecalibrate = () => {
    // Navigate to recalibrate screen
    console.log("Navigate to Recalibrate");
  };

  const handleLogHistory = () => {
    // Navigate to log history screen
    console.log("Navigate to Log History");
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
      <Button 
        onClick={handleRecalibrate}
        variant="outline"
        className="bg-surface border-border text-text-primary hover:bg-muted"
      >
        Recalibrate
      </Button>
      <Button 
        onClick={handleLogHistory}
        variant="outline"
        className="bg-surface border-border text-text-primary hover:bg-muted"
      >
        Log History
      </Button>
    </div>
  );
};