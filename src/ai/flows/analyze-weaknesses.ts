'use server';
/**
 * @fileOverview An AI agent that analyzes student performance to identify weak areas and suggest revisions.
 *
 * - analyzeWeaknesses - A function that handles the weakness analysis process.
 * - AnalyzeWeaknessesInput - The input type for the analyzeWeaknesses function.
 * - AnalyzeWeaknessesOutput - The return type for the analyzeWeaknesses function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeWeaknessesInputSchema = z.object({
  quizResults: z
    .array(
      z.object({
        topic: z.string().describe('The topic of the quiz question.'),
        isCorrect: z.boolean().describe('Whether the answer to the question was correct.'),
      })
    )
    .describe('An array of quiz results, indicating correctness for each topic.'),
  timeSpentPerSubject: z
    .record(z.string(), z.number().int().min(0))
    .describe('An object mapping subject names to time spent in minutes.'),
  mistakePatterns: z
    .string()
    .describe('A description of common mistake patterns observed during study.'),
});
export type AnalyzeWeaknessesInput = z.infer<typeof AnalyzeWeaknessesInputSchema>;

const AnalyzeWeaknessesOutputSchema = z.object({
  weakAreas: z
    .array(z.string())
    .describe('A list of specific weak areas or topics identified.'),
  revisionSuggestions: z
    .array(z.string())
    .describe('Specific suggestions for revision, e.g., "Revise Chapter 3 of Calculus on derivatives.", "Focus on balancing chemical equations."'),
});
export type AnalyzeWeaknessesOutput = z.infer<typeof AnalyzeWeaknessesOutputSchema>;

export async function analyzeWeaknesses(
  input: AnalyzeWeaknessesInput
): Promise<AnalyzeWeaknessesOutput> {
  return analyzeWeaknessesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeWeaknessesPrompt',
  input: {schema: AnalyzeWeaknessesInputSchema},
  output: {schema: AnalyzeWeaknessesOutputSchema},
  prompt: `You are an AI-powered study assistant specializing in identifying student weaknesses and providing targeted revision advice.

Analyze the provided student performance data and identify their weak areas. Then, provide specific and actionable revision suggestions.

Performance Data:

Quiz Results:
{{#each quizResults}}
- Topic: {{{topic}}}, Correct: {{{isCorrect}}}
{{/each}}

Time Spent Per Subject:
{{#each (objectEntries timeSpentPerSubject)}}
- Subject: {{{key}}}, Time Spent (minutes): {{{value}}}
{{/each}}

Mistake Patterns: {{{mistakePatterns}}}`,
});

const analyzeWeaknessesFlow = ai.defineFlow(
  {
    name: 'analyzeWeaknessesFlow',
    inputSchema: AnalyzeWeaknessesInputSchema,
    outputSchema: AnalyzeWeaknessesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
