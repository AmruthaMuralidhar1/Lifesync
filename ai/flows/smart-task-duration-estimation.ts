'use server';
/**
 * @fileOverview An AI agent for estimating task durations based on task type, historical data, and time of day.
 *
 * - estimateTaskDuration - A function that estimates the duration of a task.
 * - EstimateTaskDurationInput - The input type for the estimateTaskDuration function.
 * - EstimateTaskDurationOutput - The return type for the estimateTaskDuration function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimateTaskDurationInputSchema = z.object({
  taskType: z.string().describe('The type of task (e.g., meeting, errand, project work).'),
  taskDescription: z.string().describe('A detailed description of the task.'),
  timeOfDay: z.string().describe('The time of day the task will be performed (e.g., morning, afternoon, evening).'),
  historicalData: z.string().optional().describe('Optional historical data about the user performance on similar tasks.'),
});
export type EstimateTaskDurationInput = z.infer<typeof EstimateTaskDurationInputSchema>;

const EstimateTaskDurationOutputSchema = z.object({
  estimatedDurationMinutes: z.number().describe('The estimated duration of the task in minutes.'),
  reasoning: z.string().describe('The reasoning behind the estimated duration.'),
});
export type EstimateTaskDurationOutput = z.infer<typeof EstimateTaskDurationOutputSchema>;

export async function estimateTaskDuration(input: EstimateTaskDurationInput): Promise<EstimateTaskDurationOutput> {
  return estimateTaskDurationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'estimateTaskDurationPrompt',
  input: {schema: EstimateTaskDurationInputSchema},
  output: {schema: EstimateTaskDurationOutputSchema},
  prompt: `You are an expert at estimating the duration of tasks.

You will receive the task type, a description of the task, the time of day it will be performed, and optional historical data about the user's performance on similar tasks.  Based on this information, you will estimate the duration of the task in minutes.  Provide the duration, and the reasoning behind that duration.

Task Type: {{{taskType}}}
Task Description: {{{taskDescription}}}
Time of Day: {{{timeOfDay}}}
Historical Data: {{{historicalData}}}

Please provide realistic estimates.
`,
});

const estimateTaskDurationFlow = ai.defineFlow(
  {
    name: 'estimateTaskDurationFlow',
    inputSchema: EstimateTaskDurationInputSchema,
    outputSchema: EstimateTaskDurationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
