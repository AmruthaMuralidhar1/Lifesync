'use client';

import type { Notification } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Bell, Mic } from 'lucide-react';

interface NotificationsPanelProps {
  notifications: Notification[];
}

const notificationIcons = {
  bell: <Bell className="h-4 w-4" />,
  voice: <Mic className="h-4 w-4" />,
};

export function NotificationsPanel({ notifications }: NotificationsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Proactive Assistance
        </CardTitle>
        <CardDescription>
          Intelligent nudges and reminders from your AI assistant.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div key={notification.id} className="flex items-start gap-3">
              <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                {notificationIcons[notification.icon]}
              </div>
              <div>
                <p className="font-semibold">{notification.title}</p>
                <p className="text-sm text-muted-foreground">
                  {notification.description}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {notification.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
