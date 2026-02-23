'use server';
/**
 * @fileOverview An AI agent that explains academic concepts, provides examples, and generates practice questions.
 *
 * - explainConcept - A function that handles the concept explanation process.
 * - ExplainConceptInput - The input type for the explainConcept function.
 * - ExplainConceptOutput - The return type for the explainConcept function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainConceptInputSchema = z.object({
  concept: z.string().describe('The academic concept to be explained.'),
});
export type ExplainConceptInput = z.infer<typeof ExplainConceptInputSchema>;

const ExplainConceptOutputSchema = z.object({
  explanation: z
    .string()
    .describe('A simple and clear explanation of the concept.'),
  example: z.string().describe('A relevant and understandable example.'),
  practiceQuestion: z
    .string()
    .describe('A practice question to test understanding.'),
});
export type ExplainConceptOutput = z.infer<typeof ExplainConceptOutputSchema>;

export async function explainConcept(
  input: ExplainConceptInput
): Promise<ExplainConceptOutput> {
  return explainConceptFlow(input);
}

const explainConceptPrompt = ai.definePrompt({
  name: 'explainConceptPrompt',
  input: {schema: ExplainConceptInputSchema},
  output: {schema: ExplainConceptOutputSchema},
  prompt: `You are an expert academic tutor. Your task is to explain a difficult academic concept simply, provide a clear example, and then generate a practice question.

Concept: {{{concept}}}

Please provide your response in a structured JSON format with the following fields:
- explanation: A simple and clear explanation of the concept.
- example: A relevant and understandable example.
- practiceQuestion: A practice question to test understanding.`,
});

const explainConceptFlow = ai.defineFlow(
  {
    name: 'explainConceptFlow',
    inputSchema: ExplainConceptInputSchema,
    outputSchema: ExplainConceptOutputSchema,
  },
  async input => {
    const {output} = await explainConceptPrompt(input);
    return output!;
  }
);
