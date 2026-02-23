'use server';
/**
 * @fileOverview A Genkit flow for generating personalized daily study motivation.
 *
 * - generateMotivation - A function that handles the motivation generation process.
 * - GenerateMotivationInput - The input type for the generateMotivation function.
 * - GenerateMotivationOutput - The return type for the generateMotivation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMotivationInputSchema = z.object({
  subjects: z.array(z.string()).describe('List of subjects the student is currently studying.'),
  streak: z.number().describe('The current daily study streak.'),
});
export type GenerateMotivationInput = z.infer<typeof GenerateMotivationInputSchema>;

const GenerateMotivationOutputSchema = z.object({
  motivation: z.string().describe('A short, powerful motivational quote or message.'),
  dailyTip: z.string().describe('A specific study tip tailored to the subjects.'),
});
export type GenerateMotivationOutput = z.infer<typeof GenerateMotivationOutputSchema>;

export async function generateMotivation(
  input: GenerateMotivationInput
): Promise<GenerateMotivationOutput> {
  return generateMotivationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMotivationPrompt',
  input: {schema: GenerateMotivationInputSchema},
  output: {schema: GenerateMotivationOutputSchema},
  prompt: `You are a supportive AI study coach. 
Generate a motivational message and a practical study tip for a student.

Current Subjects: {{#each subjects}}{{{this}}}, {{/each}}
Current Streak: {{{streak}}} days

The motivation should be encouraging and the tip should be actionable and related to the subjects if possible.`,
});

const generateMotivationFlow = ai.defineFlow(
  {
    name: 'generateMotivationFlow',
    inputSchema: GenerateMotivationInputSchema,
    outputSchema: GenerateMotivationOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
