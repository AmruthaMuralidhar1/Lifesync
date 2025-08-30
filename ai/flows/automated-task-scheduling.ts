'use server';

/**
 * @fileOverview An AI agent to generate an optimized daily schedule.
 *
 * - generateSchedule - A function that generates a schedule based on task priorities, durations, location, and user preferences.
 * - GenerateScheduleInput - The input type for the generateSchedule function.
 * - GenerateScheduleOutput - The return type for the generateSchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateScheduleInputSchema = z.object({
  tasks: z
    .array(
      z.object({
        name: z.string().describe('The name of the task.'),
        description: z.string().describe('A description of the task.'),
        priority: z.number().describe('The priority of the task (1-10, 1 being highest).'),
        duration: z
          .number()
          .describe('The estimated duration of the task in minutes.'),
        location: z.string().describe('The location of the task.'),
        deadline: z.string().describe('The deadline for the task (ISO format).'),
      })
    )
    .describe('A list of tasks to schedule.'),
  userPreferences: z
    .string()
    .describe('The user preferences for scheduling (e.g., early bird, night owl).'),
});
export type GenerateScheduleInput = z.infer<typeof GenerateScheduleInputSchema>;

const GenerateScheduleOutputSchema = z.object({
  schedule: z
    .string()
    .describe('A formatted daily schedule including task name, time, and location.'),
});
export type GenerateScheduleOutput = z.infer<typeof GenerateScheduleOutputSchema>;

export async function generateSchedule(input: GenerateScheduleInput): Promise<GenerateScheduleOutput> {
  return generateScheduleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSchedulePrompt',
  input: {schema: GenerateScheduleInputSchema},
  output: {schema: GenerateScheduleOutputSchema},
  prompt: `You are an AI assistant designed to generate optimized daily schedules for users.

  Consider the following tasks, their priorities, estimated durations, locations, deadlines, and the user's preferences to create a schedule.

  Tasks:
  {{#each tasks}}
  - Name: {{this.name}}
    Description: {{this.description}}
    Priority: {{this.priority}}
    Duration: {{this.duration}} minutes
    Location: {{this.location}}
    Deadline: {{this.deadline}}
  {{/each}}

  User Preferences: {{userPreferences}}

  Create a schedule that optimizes for priority, minimizes travel time between locations, and respects deadlines. Consider the user preferences when creating the schedule. The schedule should be in plain text.
  Include the task name, start time, end time, and location.
  `,
});

const generateScheduleFlow = ai.defineFlow(
  {
    name: 'generateScheduleFlow',
    inputSchema: GenerateScheduleInputSchema,
    outputSchema: GenerateScheduleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
