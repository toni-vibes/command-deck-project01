import { Button } from "@/components/ui/button";

export const ActionButtons = () => {
  const handleRecalibrate = () => {
    // Navigate to recalibrate screen
    console.log("Navigate to Recalibrate");
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
    </div>
  );
};