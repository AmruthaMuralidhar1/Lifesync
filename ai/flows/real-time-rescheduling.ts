'use server';

/**
 * @fileOverview A real-time rescheduling AI agent that automatically adjusts schedules when disruptions occur.
 *
 * - rescheduleTasks - A function that handles the rescheduling process.
 * - RescheduleTasksInput - The input type for the rescheduleTasks function.
 * - RescheduleTasksOutput - The return type for the rescheduleTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RescheduleTasksInputSchema = z.object({
  currentSchedule: z
    .string()
    .describe('The user\'s current daily schedule as a string.'),
  disruptionDescription: z
    .string()
    .describe('A description of the disruption that occurred.'),
  predictedEta: z
    .string()
    .describe(
      'The predicted estimated time of arrival or completion after the disruption.'
    ),
  userPreferences: z
    .string()
    .describe('The user\'s preferences for task scheduling.'),
});
export type RescheduleTasksInput = z.infer<typeof RescheduleTasksInputSchema>;

const RescheduleTasksOutputSchema = z.object({
  rescheduledSchedule: z
    .string()
    .describe('The optimized daily schedule after rescheduling.'),
  summary: z
    .string()
    .describe(
      'A summary of the changes made to the schedule and the reasons for them.'
    ),
});

export type RescheduleTasksOutput = z.infer<typeof RescheduleTasksOutputSchema>;

export async function rescheduleTasks(
  input: RescheduleTasksInput
): Promise<RescheduleTasksOutput> {
  return rescheduleTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'rescheduleTasksPrompt',
  input: {schema: RescheduleTasksInputSchema},
  output: {schema: RescheduleTasksOutputSchema},
  prompt: `You are an AI assistant that helps users reschedule their tasks in real-time when disruptions occur.

  Current Schedule: {{{currentSchedule}}}
  Disruption Description: {{{disruptionDescription}}}
  Predicted ETA: {{{predictedEta}}}
  User Preferences: {{{userPreferences}}}

  Based on the information above, please provide a new optimized daily schedule and a summary of the changes made.
  Consider the user\'s preferences and the predicted ETA when rescheduling tasks.
  Ensure that the new schedule is realistic and takes into account the disruption that occurred.
  Return the rescheduled schedule and a summary of the changes.
  `,
});

const rescheduleTasksFlow = ai.defineFlow(
  {
    name: 'rescheduleTasksFlow',
    inputSchema: RescheduleTasksInputSchema,
    outputSchema: RescheduleTasksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
