'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Sparkles, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { estimateTaskDuration } from '@/ai/flows/smart-task-duration-estimation';
import type { Task } from '@/lib/types';

const taskFormSchema = z.object({
  description: z.string().min(3, 'Description must be at least 3 characters.'),
  urgency: z.enum(['low', 'medium', 'high']),
  location: z.string().optional(),
  duration: z.coerce.number().positive('Duration must be a positive number.').optional(),
  userImportance: z.coerce.number().min(0).max(10),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface AddTaskDialogProps {
  onAddTask: (task: Task) => void;
}

export function AddTaskDialog({ onAddTask }: AddTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [isEstimating, startEstimating] = useTransition();
  const [estimationReason, setEstimationReason] = useState<string | null>(null);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      description: '',
      urgency: 'medium',
      location: '',
      userImportance: 5,
    },
  });

  const handleEstimateDuration = () => {
    const description = form.getValues('description');
    if (!description) {
      form.setError('description', {
        type: 'manual',
        message: 'Please enter a description to estimate duration.',
      });
      return;
    }
    startEstimating(async () => {
      setEstimationReason(null);
      const result = await estimateTaskDuration({
        taskType: 'General',
        taskDescription: description,
        timeOfDay: new Date().getHours() < 12 ? 'morning' : 'afternoon',
        historicalData: 'User is generally on time with similar tasks.',
      });
      form.setValue('duration', result.estimatedDurationMinutes);
      setEstimationReason(result.reasoning);
      toast({
        title: 'AI Duration Estimated',
        description: `Task estimated to take ${result.estimatedDurationMinutes} minutes.`,
      });
    });
  };

  const onSubmit = (data: TaskFormValues) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(), // Default due date
      status: 'pending',
      ...data,
    };
    onAddTask(newTask);
    toast({
      title: 'Task Added',
      description: `"${data.description}" has been added to your list.`,
    });
    form.reset();
    setEstimationReason(null);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="-ml-1 mr-2 h-4 w-4" />
          New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add a New Task</DialogTitle>
          <DialogDescription>
            Fill in the details for your new task. Use the AI to estimate the duration.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., 'Organize office space'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="urgency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Urgency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select urgency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="userImportance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Importance (0-10)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 'Home Office'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                   <div className="flex gap-2">
                    <FormControl>
                      <Input type="number" placeholder="e.g., 60" {...field} />
                    </FormControl>
                    <Button type="button" variant="outline" onClick={handleEstimateDuration} disabled={isEstimating}>
                        {isEstimating ? <Loader2 className="h-4 w-4 animate-spin"/> : <Sparkles className="h-4 w-4"/>}
                        <span className="sr-only sm:not-sr-only sm:ml-2">Estimate</span>
                    </Button>
                   </div>
                  {estimationReason && <FormDescription>{estimationReason}</FormDescription>}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit">Add Task</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
