'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import type { PrioritizedTask } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Calendar, Flag, MapPin, Tag, Award, Bot } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface TaskItemProps {
  task: PrioritizedTask;
  onToggleStatus: (taskId: string) => void;
}

const urgencyStyles = {
  high: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-200 dark:border-red-800',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-800',
  low: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-200 dark:border-green-800',
};

export function TaskItem({ task, onToggleStatus }: TaskItemProps) {
  const dueDate = new Date(task.dueDate);
  const isOverdue = new Date() > dueDate;
  const isCompleted = task.status === 'completed';

  return (
    <div className={cn(
        "rounded-lg border bg-card text-card-foreground p-4 transition-all hover:shadow-md",
        isCompleted && "bg-card/50"
        )}>
      <Accordion type="single" collapsible>
        <AccordionItem value={task.id} className="border-b-0">
          <div className="flex justify-between items-start gap-3">
             <Checkbox
                id={`task-check-${task.id}`}
                checked={isCompleted}
                onCheckedChange={() => onToggleStatus(task.id)}
                className="mt-1"
            />
            <div className="flex-1">
              <p className={cn(
                  "font-semibold text-card-foreground",
                  isCompleted && "line-through text-muted-foreground"
                  )}>
                {task.description}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span className={cn(isOverdue && !isCompleted && 'text-destructive font-medium')}>
                    Due {formatDistanceToNow(dueDate, { addSuffix: true })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Flag className="h-4 w-4" />
                  <Badge variant="outline" className={cn('capitalize', urgencyStyles[task.urgency])}>
                    {task.urgency}
                  </Badge>
                </div>
                {task.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    <span>{task.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Tag className="h-4 w-4" />
                  <span>Importance: {task.userImportance}/10</span>
                </div>
              </div>
            </div>
            {task.priorityScore !== undefined && (
              <AccordionTrigger className="py-0 pl-2" />
            )}
          </div>
          {task.priorityScore !== undefined && !isCompleted &&(
            <AccordionContent className="pt-4 pl-8">
              <div className="rounded-md border bg-secondary/50 p-3 text-sm">
                <div className="flex items-center gap-2 font-semibold text-primary">
                    <Bot className="h-4 w-4" />
                    <span>AI Prioritization Details</span>
                </div>
                <div className="mt-2 space-y-2 pl-6">
                    <p className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <strong>Priority Score:</strong> {task.priorityScore.toFixed(1)}
                    </p>
                    <p className="text-muted-foreground">{task.reason}</p>
                </div>
              </div>
            </AccordionContent>
          )}
        </AccordionItem>
      </Accordion>
    </div>
  );
}

    