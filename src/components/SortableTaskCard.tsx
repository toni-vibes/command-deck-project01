import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface SortableTaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onView: (task: Task) => void;
  removingTasks: Set<string>;
}

export const SortableTaskCard = ({ 
  task, 
  onEdit, 
  onDelete, 
  onView, 
  removingTasks 
}: SortableTaskCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-surface-elevated p-3 rounded-lg border cursor-pointer hover:bg-surface-elevated/80 transition-all duration-300 ${
        removingTasks.has(task.id) ? 'opacity-0 scale-95 translate-y-2' : 'opacity-100 scale-100 translate-y-0'
      } ${isDragging ? 'opacity-50' : ''}`}
      onClick={() => onView(task)}
    >
      <div className="flex justify-between items-start mb-1">
        <p className="text-sm font-medium">{task.title}</p>
        <div onClick={(e) => e.stopPropagation()} className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(task)}
            className="h-7 w-7 p-0"
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(task.id)}
            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <p className="text-xs text-text-secondary">
        {task.status === "To Do" ? `${task.priority} priority | ${task.assignee}` :
         task.status === "In Progress" ? `${task.assignee} | Due: ${task.dueDate}` :
         `Completed | ${task.assignee}`}
      </p>
    </div>
  );
};