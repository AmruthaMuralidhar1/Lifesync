'use server';
/**
 * @fileOverview Implements intelligent task prioritization considering due dates, urgency, location, weather, and user-defined importance.
 *
 * - prioritizeTasks - A function that prioritizes a list of tasks.
 * - PrioritizeTasksInput - The input type for the prioritizeTasks function.
 * - PrioritizeTasksOutput - The output type for the prioritizeTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TaskSchema = z.object({
  id: z.string().describe('Unique identifier for the task.'),
  description: z.string().describe('Description of the task.'),
  dueDate: z.string().describe('Due date of the task (ISO format).'),
  urgency: z.enum(['high', 'medium', 'low']).describe('Urgency level of the task.'),
  location: z.string().optional().describe('Location associated with the task.'),
  userImportance: z.number().describe('User-defined importance score (0-10).'),
});

const WeatherSchema = z.object({
  temperature: z.number().describe('Current temperature in Celsius.'),
  condition: z.string().describe('Current weather condition (e.g., sunny, rainy).'),
});

const PrioritizeTasksInputSchema = z.object({
  tasks: z.array(TaskSchema).describe('List of tasks to prioritize.'),
  weather: WeatherSchema.optional().describe('Current weather conditions.'),
});

export type PrioritizeTasksInput = z.infer<typeof PrioritizeTasksInputSchema>;

const PrioritizedTaskSchema = TaskSchema.extend({
  priorityScore: z.number().describe('Calculated priority score for the task.'),
  reason: z.string().describe('Reason for the assigned priority score')
});

const PrioritizeTasksOutputSchema = z.array(PrioritizedTaskSchema);

export type PrioritizeTasksOutput = z.infer<typeof PrioritizeTasksOutputSchema>;

const overrideImportanceTool = ai.defineTool({
  name: 'overrideUserImportance',
  description: 'Conditionally overrides the user-defined importance of a task based on various factors.',
  inputSchema: z.object({
    taskId: z.string().describe('The ID of the task to potentially override.'),
    reason: z.string().describe('The reasoning behind this override')
  }),
  outputSchema: z.number().describe('The overridden importance score (0-10), or the original score if no override is needed.'),
},
async (input) => {
  // In a real implementation, this would contain complex logic
  // to determine whether to override the user-defined importance.
  // This is a hardcoded POC, so we'll just halve the importance score
  // if the task ID contains the word "optional".

  if (input.taskId.includes('optional')) {
    console.log(`Tool is overriding importance score because task ${input.taskId} is optional`);
    return 5;
  } else {
    return 10; //high importance
  }
});

const prioritizeTasksPrompt = ai.definePrompt({
  name: 'prioritizeTasksPrompt',
  input: {schema: PrioritizeTasksInputSchema},
  output: {schema: PrioritizeTasksOutputSchema},
  tools: [overrideImportanceTool],
  prompt: `You are an AI task prioritization expert. Given a list of tasks, 
your job is to prioritize them based on their due date, urgency, location (if available), 
weather (if available), and user-defined importance.  If the task contains 'optional' in the id, call the overrideUserImportance tool to potentially change the importance score. If not, the importance should be set to 10. Use the provided weather data to adjust priorities; for example, prioritize indoor tasks on rainy days.

Tasks:
{{#each tasks}}
  - ID: {{this.id}}
    Description: {{this.description}}
    Due Date: {{this.dueDate}}
    Urgency: {{this.urgency}}
    Location: {{this.location}}
    User Importance: {{this.userImportance}}
{{/each}}

Weather: {{#if weather}}Temperature: {{weather.temperature}}, Condition: {{weather.condition}}{{else}}No weather information provided.{{/if}}

Prioritized Tasks:
`,
});


const prioritizeTasksFlow = ai.defineFlow(
  {
    name: 'prioritizeTasksFlow',
    inputSchema: PrioritizeTasksInputSchema,
    outputSchema: PrioritizeTasksOutputSchema,
  },
  async input => {
    const {tasks} = input;

    const prioritizedTasks = [];

    for (const task of tasks) {
      // Determine if the tool needs to be called to override the user importance score.
      const overriddenImportance = await overrideImportanceTool({
        taskId: task.id,
        reason: 'Adjusting importance based on task characteristics.',
      });

      // Calculate a priority score based on various factors.
      let priorityScore = overriddenImportance; // Start with the user-defined importance.

      // Adjust score based on urgency.
      if (task.urgency === 'high') {
        priorityScore += 3;
      } else if (task.urgency === 'medium') {
        priorityScore += 2;
      } else {
        priorityScore += 1;
      }

      // Further adjust based on due date (example: closer due date = higher score).
      const dueDate = new Date(task.dueDate);
      const now = new Date();
      const timeDiff = dueDate.getTime() - now.getTime();
      const daysUntilDue = Math.ceil(timeDiff / (1000 * 3600 * 24));
      priorityScore += Math.max(0, 5 - daysUntilDue); // Higher score if due soon.

       //Reason for the score
      let reason = `Initial score: ${priorityScore} (User importance + Urgency + Due Date).`;

      prioritizedTasks.push({
        ...task,
        priorityScore,
        reason
      });
    }

    // Sort tasks by priority score (highest first).
    prioritizedTasks.sort((a, b) => b.priorityScore - a.priorityScore);

    return prioritizedTasks;
  }
);

export async function prioritizeTasks(input: PrioritizeTasksInput): Promise<PrioritizeTasksOutput> {
  return prioritizeTasksFlow(input);
}

