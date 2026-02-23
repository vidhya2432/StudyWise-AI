'use server';
/**
 * @fileOverview This file implements a Genkit flow for processing study notes.
 * It summarizes the notes, generates flashcards, and creates quiz questions.
 *
 * - processNotes - A function that handles the study notes processing.
 * - ProcessNotesInput - The input type for the processNotes function.
 * - ProcessNotesOutput - The return type for the processNotes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProcessNotesInputSchema = z.object({
  notesContent: z
    .string()
    .describe(
      'The raw text content of the study notes, which may have been extracted from a PDF or typed directly.'
    ),
  context: z
    .string()
    .optional()
    .describe(
      'Optional context or subject area for the notes (e.g., "History Chapter 5", "Calculus Derivatives").'
    ),
});
export type ProcessNotesInput = z.infer<typeof ProcessNotesInputSchema>;

const ProcessNotesOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the provided study notes.'),
  flashcards:
    z.array(
      z.object({
        front: z.string().describe('The question or term for the flashcard front.'),
        back: z.string().describe('The answer or definition for the flashcard back.'),
      })
    )
    .describe('An array of flashcards generated from the notes.'),
  quizQuestions:
    z.array(
      z.object({
        question: z.string().describe('The quiz question.'),
        options: z
          .array(z.string())
          .min(4) // Ensure at least four options for a multiple choice question
          .describe('An array of possible answers for the quiz question.'),
        correctAnswer:
          z.string().describe('The correct answer to the quiz question, which must be one of the options.'),
      })
    )
    .describe('An array of multiple-choice quiz questions generated from the notes.'),
});
export type ProcessNotesOutput = z.infer<typeof ProcessNotesOutputSchema>;

export async function processNotes(input: ProcessNotesInput): Promise<ProcessNotesOutput> {
  return processNotesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'processNotesPrompt',
  input: {schema: ProcessNotesInputSchema},
  output: {schema: ProcessNotesOutputSchema},
  prompt: `You are an AI-powered study assistant. Your goal is to help students review their study materials effectively.
You will be provided with study notes. Your tasks are:
1.  Summarize the provided notes concisely.
2.  Generate a set of flashcards (question/answer pairs) based on key concepts in the notes.
3.  Create 5 multiple-choice quiz questions based on the notes, each with at least 4 options and a clear correct answer. Ensure the correct answer is always one of the provided options.

Here are the study notes:
{{{notesContent}}}

{{#if context}}
Additional context: {{{context}}}
{{/if}}

Please provide the output in a structured JSON format as described by the output schema.
`,
});

const processNotesFlow = ai.defineFlow(
  {
    name: 'processNotesFlow',
    inputSchema: ProcessNotesInputSchema,
    outputSchema: ProcessNotesOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
