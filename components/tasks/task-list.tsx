'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ListTodo, Loader2, Sparkles } from 'lucide-react';
import type { PrioritizedTask, Task } from '@/lib/types';
import { TaskItem } from './task-item';
import { AddTaskDialog } from './add-task-dialog';

interface TaskListProps {
  tasks: (Task | PrioritizedTask)[];
  onPrioritize: () => void;
  isPrioritizing: boolean;
  onAddTask: (task: Task) => void;
  onToggleTaskStatus: (taskId: string) => void;
}

export function TaskList({
  tasks,
  onPrioritize,
  isPrioritizing,
  onAddTask,
  onToggleTaskStatus,
}: TaskListProps) {
  const sortedTasks = [...tasks].sort((a, b) => {
    // Completed tasks go to the bottom
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    
    // Then sort by priority score if available
    if ('priorityScore' in a && 'priorityScore' in b) {
        return (b.priorityScore ?? 0) - (a.priorityScore ?? 0);
    }
    // Fallback to due date
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ListTodo className="h-5 w-5" />
              Task Orchestrator
            </CardTitle>
            <CardDescription>
              Manage, prioritize, and schedule your tasks with AI.
            </CardDescription>
          </div>
          <div className="flex-shrink-0 flex gap-2">
            <Button
              variant="outline"
              onClick={onPrioritize}
              disabled={isPrioritizing || tasks.filter(t => t.status !== 'completed').length === 0}
            >
              {isPrioritizing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Prioritize with AI
            </Button>
            <AddTaskDialog onAddTask={onAddTask} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {sortedTasks.length > 0 ? (
          <div className="space-y-3">
            {sortedTasks.map((task) => (
              <TaskItem key={task.id} task={task} onToggleStatus={onToggleTaskStatus} />
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-12">
            <p className="font-semibold">No tasks yet!</p>
            <p>Click "New Task" to add your first item.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

    