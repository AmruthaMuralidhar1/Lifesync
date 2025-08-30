'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, CalendarCheck, Loader2, Sparkles } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';

interface SchedulePanelProps {
  schedule: string | null;
  onGenerateSchedule: () => void;
  isScheduling: boolean;
  onReschedule: (disruption: string) => void;
  isRescheduling: boolean;
  tasksAvailable: boolean;
}

export function SchedulePanel({
  schedule,
  onGenerateSchedule,
  isScheduling,
  onReschedule,
  isRescheduling,
  tasksAvailable,
}: SchedulePanelProps) {
  const handleReschedule = () => {
    const disruptionText =
      (document.getElementById('disruption-description') as HTMLTextAreaElement)
        ?.value || 'A task took longer than expected.';
    onReschedule(disruptionText);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarCheck className="h-5 w-5" />
          AI Generated Schedule
        </CardTitle>
        <CardDescription>
          Your optimized daily plan, created by LifeSync AI.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[150px]">
        {schedule ? (
          <pre className="whitespace-pre-wrap rounded-md bg-secondary p-4 font-body text-sm text-secondary-foreground">
            {schedule}
          </pre>
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full p-4">
            <Bot className="h-8 w-8 mb-2" />
            <p>Your schedule will appear here once generated.</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col sm:flex-row gap-2">
        <Button
          onClick={onGenerateSchedule}
          disabled={isScheduling || !tasksAvailable}
          className="w-full sm:w-auto"
        >
          {isScheduling ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {schedule ? 'Regenerate Schedule' : 'Generate Schedule'}
        </Button>
        {schedule && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                {isRescheduling ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Disruption Occurred
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Real-time Rescheduling</AlertDialogTitle>
                <AlertDialogDescription>
                  Describe the disruption to your schedule, and the AI will
                  adjust your plan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Textarea
                id="disruption-description"
                placeholder="e.g., 'Meeting ran 30 minutes late', 'Heavy traffic on the way to the office'"
                defaultValue="Meeting ran 30 minutes late"
              />
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleReschedule}>
                  Reschedule
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardFooter>
    </Card>
  );
}
