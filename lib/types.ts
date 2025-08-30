import type { PrioritizeTasksOutput } from "@/ai/flows/intelligent-task-prioritization";

export type Task = {
  id: string;
  description: string;
  dueDate: string;
  urgency: 'high' | 'medium' | 'low';
  location?: string;
  userImportance: number;
  duration?: number; // in minutes
  status: 'pending' | 'in-progress' | 'completed';
};

export type PrioritizedTask = PrioritizeTasksOutput[0];

export type CalendarEvent = {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  source: 'google' | 'outlook' | 'lifesync';
};

export type Notification = {
  id: string;
  icon: 'bell' | 'voice';
  title: string;
  description: string;
  time: string;
};
