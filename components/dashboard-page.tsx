'use client';

import React, { useState, useTransition } from 'react';
import type { CalendarEvent, Notification, Task } from '@/lib/types';
import { TaskList } from '@/components/tasks/task-list';
import { SchedulePanel } from '@/components/schedule/schedule-panel';
import { NotificationsPanel } from '@/components/notifications/notifications-panel';
import { UnifiedCalendarView } from './dashboard/unified-calendar-view';
import {
  generateSchedule,
  type GenerateScheduleInput,
} from '@/ai/flows/automated-task-scheduling';
import { rescheduleTasks } from '@/ai/flows/real-time-rescheduling';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Bot, Calendar, ListChecks, Bell, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { PrioritizeTasksOutput } from '@/ai/flows/intelligent-task-prioritization';
import { TaskItem } from './tasks/task-item';

const initialTasks: Task[] = [
  {
    id: 'task-1',
    description: 'Finish Q3 project proposal draft',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
    urgency: 'high',
    location: 'Home Office',
    userImportance: 9,
    duration: 120,
    status: 'pending',
  },
  {
    id: 'task-2-optional',
    description: 'Organize cloud storage files',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(),
    urgency: 'low',
    location: 'Home Office',
    userImportance: 3,
    duration: 45,
    status: 'pending',
  },
  {
    id: 'task-3',
    description: 'Pick up groceries for the week',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
    urgency: 'medium',
    location: 'Supermarket',
    userImportance: 7,
    duration: 60,
    status: 'pending',
  },
  {
    id: 'task-4',
    description: 'Schedule annual dental check-up',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(),
    urgency: 'medium',
    location: 'Anywhere',
    userImportance: 6,
    duration: 15,
    status: 'pending',
  },
   {
    id: 'task-5',
    description: 'Drop off dry cleaning',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
    urgency: 'low',
    location: 'Sahakar Nagar',
    userImportance: 4,
    duration: 10,
    status: 'pending',
  },
  {
    id: 'task-6',
    description: 'Buy a birthday gift for Alex',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
    urgency: 'medium',
    location: 'Orion Mall',
    userImportance: 8,
    duration: 45,
    status: 'pending',
  },
];

const initialEvents: CalendarEvent[] = [
    { id: 'evt-1', title: 'Team Standup', startTime: new Date(new Date().setHours(9, 0, 0)), endTime: new Date(new Date().setHours(9, 15, 0)), source: 'google'},
    { id: 'evt-2', title: 'Design Review', startTime: new Date(new Date().setHours(11, 0, 0)), endTime: new Date(new Date().setHours(12, 30, 0)), source: 'outlook'},
    { id: 'evt-3', title: 'Focus Work: API Integration', startTime: new Date(new Date().setHours(14, 0, 0)), endTime: new Date(new Date().setHours(16, 0, 0)), source: 'lifesync'},
];

const initialNotifications: Notification[] = [
  {
    id: 'notif-1',
    icon: 'bell',
    title: 'Reminder: Team Standup',
    description: 'Your daily standup starts in 5 minutes.',
    time: '8:55 AM',
  },
  {
    id: 'notif-2',
    icon: 'voice',
    title: 'Traffic Alert',
    description: 'Heavy traffic reported on your route. Consider leaving 15 minutes earlier for your 2 PM meeting.',
    time: '1:10 PM',
  },
];

const TABS = ['Tasks', 'Schedule', 'Insights'];
const CURRENT_LOCATION = 'Sahakar Nagar';

export function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [prioritizedTasks, setPrioritizedTasks] =
    useState<PrioritizeTasksOutput | null>(null);
  const [schedule, setSchedule] = useState<string | null>(null);

  const [isPrioritizing, startPrioritizing] = useTransition();
  const [isScheduling, startScheduling] = useTransition();
  const [isRescheduling, startRescheduling] = useTransition();
  
  const [activeTab, setActiveTab] = useState(TABS[0]);

  const handleAddTask = (newTask: Task) => {
    setTasks((prev) => [...prev, newTask]);
    setPrioritizedTasks(null); // Invalidate prioritization
    setSchedule(null); // Invalidate schedule
  };

  const handleToggleTaskStatus = (taskId: string) => {
    const newTasks = tasks.map(task => {
      if (task.id === taskId) {
        return {...task, status: task.status === 'completed' ? 'pending' : 'completed'};
      }
      return task;
    })
    setTasks(newTasks);
    
    if (prioritizedTasks) {
      const newPrioritizedTasks = prioritizedTasks.map(task => {
         if (task.id === taskId) {
          return {...task, status: task.status === 'completed' ? 'pending' : 'completed'};
        }
        return task;
      });
      setPrioritizedTasks(newPrioritizedTasks as PrioritizeTasksOutput);
    }
  }

  const handlePrioritize = () => {
    startPrioritizing(() => {
      // Hardcoded prioritization logic
      const prioritized = tasks.map((task) => {
        let priorityScore = task.userImportance;
        
        // Adjust based on urgency
        if (task.urgency === 'high') priorityScore += 3;
        if (task.urgency === 'medium') priorityScore += 2;
        if (task.urgency === 'low') priorityScore += 1;

        // Adjust based on due date
        const dueDate = new Date(task.dueDate);
        const now = new Date();
        const daysUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 3600 * 24);
        if (daysUntilDue < 1) priorityScore += 4;
        else if (daysUntilDue < 3) priorityScore += 2;
        
        // Bonus for optional tasks being lower
        if (task.id.includes('optional')) priorityScore -= 5;

        return {
          ...task,
          priorityScore,
          reason: 'Prioritized based on due date, urgency, and importance.',
        };
      });

      prioritized.sort((a, b) => b.priorityScore - a.priorityScore);

      setPrioritizedTasks(prioritized);

      toast({
        title: 'Tasks Prioritized',
        description: 'Your task list has been reordered.',
      });
    });
  };

  const handleGenerateSchedule = () => {
    startScheduling(async () => {
      const tasksToSchedule = (prioritizedTasks || tasks).filter(t => t.status !== 'completed').map((t) => ({
        name: t.description,
        description: t.description,
        priority: (t as any).priorityScore ?? t.userImportance,
        duration: t.duration || 60,
        location: t.location || 'Anywhere',
        deadline: t.dueDate,
      }));

      const input: GenerateScheduleInput = {
        tasks: tasksToSchedule,
        userPreferences: 'Prefers to do focused work in the afternoon.',
      };

      const result = await generateSchedule(input);
      setSchedule(result.schedule);
      toast({
        title: 'Schedule Generated',
        description: 'Your AI-powered daily schedule is ready.',
      });
    });
  };

  const handleReschedule = (disruption: string) => {
    if (!schedule) return;
    startRescheduling(async () => {
      const result = await rescheduleTasks({
        currentSchedule: schedule,
        disruptionDescription: disruption,
        predictedEta: '30 minutes delay',
        userPreferences: 'Prefers to do focused work in the afternoon.',
      });
      setSchedule(result.rescheduledSchedule);
      toast({
        title: 'Schedule Rescheduled',
        description: result.summary,
      });
    });
  };

  const displayTasks = prioritizedTasks || tasks;
  const locationTasks = displayTasks.filter(task => task.location === CURRENT_LOCATION && task.status !== 'completed');

  const currentTabIndex = TABS.indexOf(activeTab);
  const goToNextTab = () => setActiveTab(TABS[currentTabIndex + 1]);
  const goToPrevTab = () => setActiveTab(TABS[currentTabIndex - 1]);


  return (
    <div className="container max-w-screen-2xl py-4 sm:py-8">
       {/* Mobile Tab Navigation */}
       <div className="sm:hidden mb-4">
          <div className="flex justify-between items-center bg-muted p-1 rounded-lg">
             {TABS.map(tab => (
                 <Button 
                    key={tab} 
                    variant={activeTab === tab ? 'default' : 'ghost'} 
                    size="sm"
                    className="flex-1"
                    onClick={() => setActiveTab(tab)}>
                    {tab}
                </Button>
             ))}
          </div>
       </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:col-span-3 xl:col-span-2 flex-col gap-4">
           <Card className="flex-1">
             <CardContent className="p-4">
                <nav className="flex flex-col gap-2">
                    <Button variant={activeTab === 'Tasks' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('Tasks')} className="justify-start"><ListChecks className="mr-2 h-4 w-4"/>Task Orchestrator</Button>
                    <Button variant={activeTab === 'Schedule' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('Schedule')} className="justify-start"><Calendar className="mr-2 h-4 w-4"/>AI Schedule</Button>
                    <Button variant={activeTab === 'Insights' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('Insights')} className="justify-start"><Bell className="mr-2 h-4 w-4"/>AI Insights</Button>
                </nav>
             </CardContent>
           </Card>
        </aside>

        {/* Content Area */}
        <main className="lg:col-span-9 xl:col-span-10">
          {activeTab === 'Tasks' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2">
                <TaskList
                  tasks={displayTasks}
                  onPrioritize={handlePrioritize}
                  isPrioritizing={isPrioritizing}
                  onAddTask={handleAddTask}
                  onToggleTaskStatus={handleToggleTaskStatus}
                />
              </div>
              <div className="xl:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Contextual Tasks
                    </CardTitle>
                    <CardDescription>
                      Tasks you can do here at{' '}
                      <span className="font-semibold text-primary">{CURRENT_LOCATION}</span>.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {locationTasks.length > 0 ? (
                      <div className="space-y-3">
                        {locationTasks.map((task) => (
                          <TaskItem key={task.id} task={task} onToggleStatus={handleToggleTaskStatus}/>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-12">
                        <p className="font-semibold">No tasks here!</p>
                        <p>You have no pending tasks for your current location.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'Schedule' && (
             <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <SchedulePanel
                    schedule={schedule}
                    onGenerateSchedule={handleGenerateSchedule}
                    isScheduling={isScheduling}
                    onReschedule={handleReschedule}
                    isRescheduling={isRescheduling}
                    tasksAvailable={tasks.filter(t => t.status !== 'completed').length > 0}
                />
                <UnifiedCalendarView events={initialEvents} />
             </div>
          )}

          {activeTab === 'Insights' && (
            <NotificationsPanel notifications={initialNotifications} />
          )}

          {/* Desktop Navigation Footer */}
          <footer className="hidden sm:flex justify-between items-center mt-8">
            <Button variant="outline" onClick={goToPrevTab} disabled={currentTabIndex === 0}>
                <ArrowLeft className="mr-2 h-4 w-4"/>
                Previous
            </Button>
            <div className="flex items-center gap-2">
                {TABS.map((tab, index) => (
                    <div key={tab} className={cn(
                        "h-2 w-8 rounded-full transition-colors",
                        index <= currentTabIndex ? "bg-primary" : "bg-muted"
                    )}></div>
                ))}
            </div>
            <Button variant="default" onClick={goToNextTab} disabled={currentTabIndex === TABS.length - 1}>
                Next
                <ArrowRight className="ml-2 h-4 w-4"/>
            </Button>
          </footer>
        </main>
      </div>
    </div>
  );
}

    