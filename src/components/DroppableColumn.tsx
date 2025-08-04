import { useDroppable } from "@dnd-kit/core";
import { Task } from "@/types/task";

interface DroppableColumnProps {
  id: Task["status"];
  children: React.ReactNode;
  title: string;
}

export const DroppableColumn = ({ id, children, title }: DroppableColumnProps) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-text-primary">{title}</h4>
      <div
        ref={setNodeRef}
        className={`space-y-2 min-h-[200px] p-3 border-2 border-dashed rounded-lg transition-all duration-200 ${
          isOver
            ? "border-primary/50 bg-primary/5 scale-[1.02]"
            : "border-border/30 hover:border-border/50"
        }`}
      >
        {children}
      </div>
    </div>
  );
};