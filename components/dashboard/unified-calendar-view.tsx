'use client';

import type { CalendarEvent } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar, Briefcase, Bot } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface UnifiedCalendarViewProps {
  events: CalendarEvent[];
}

const sourceIcons = {
  google: <Calendar className="h-4 w-4" />,
  outlook: <Briefcase className="h-4 w-4" />,
  lifesync: <Bot className="h-4 w-4" />,
};

const sourceColors = {
  google: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  outlook: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  lifesync: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
};

export function UnifiedCalendarView({ events }: UnifiedCalendarViewProps) {
  const today = new Date();
  const todaysEvents = events.filter(
    (event) =>
      event.startTime.getDate() === today.getDate() &&
      event.startTime.getMonth() === today.getMonth() &&
      event.startTime.getFullYear() === today.getFullYear()
  ).sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Today's Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        {todaysEvents.length > 0 ? (
          <div className="space-y-4">
            {todaysEvents.map((event) => (
              <div key={event.id} className="flex items-start gap-4">
                <div className="text-sm text-muted-foreground font-medium w-20 text-right">
                  {event.startTime.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
                <div className="relative flex-1">
                   <div className="absolute left-0 top-1.5 h-full w-px bg-border -translate-x-4"></div>
                   <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-primary -translate-x-[1.3rem]"></div>
                  <p className="font-semibold">{event.title}</p>
                  <Badge
                    variant="outline"
                    className={cn('mt-1 text-xs', sourceColors[event.source])}
                  >
                    {sourceIcons[event.source]}
                    <span className="ml-1 capitalize">{event.source}</span>
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">
            No events scheduled for today.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
