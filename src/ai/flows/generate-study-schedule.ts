'use server';
/**
 * @fileOverview A Genkit flow for generating a personalized study schedule.
 *
 * - generateStudySchedule - A function that handles the study schedule generation process.
 * - GenerateStudyScheduleInput - The input type for the generateStudySchedule function.
 * - GenerateStudyScheduleOutput - The return type for the generateStudySchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStudyScheduleInputSchema = z.object({
  subjects: z
    .array(z.string())
    .describe('A list of subjects the student needs to study.'),
  examDate: z.string().describe('The date of the exam in YYYY-MM-DD format.'),
  dailyFreeTime: z
    .number()
    .describe('The number of hours the student has free each day to study.'),
});
export type GenerateStudyScheduleInput = z.infer<
  typeof GenerateStudyScheduleInputSchema
>;

const GenerateStudyScheduleOutputSchema = z.object({
  studySchedule: z.array(
    z.object({
      date: z.string().describe('The date for the study session in YYYY-MM-DD format.'),
      activities: z
        .array(z.string())
        .describe('A list of study activities for the day, e.g., "Study Math - 2 hours".'),
    })
  ).describe('A personalized daily study schedule.'),
  revisionPlan: z
    .array(z.string())
    .describe('A plan outlining when and what to revise.'),
  focusAreas: z
    .array(z.string())
    .describe('Key areas identified by the AI for the student to focus on.'),
});
export type GenerateStudyScheduleOutput = z.infer<
  typeof GenerateStudyScheduleOutputSchema
>;

export async function generateStudySchedule(
  input: GenerateStudyScheduleInput
): Promise<GenerateStudyScheduleOutput> {
  return generateStudyScheduleFlow(input);
}

const generateStudySchedulePrompt = ai.definePrompt({
  name: 'generateStudySchedulePrompt',
  input: {schema: GenerateStudyScheduleInputSchema},
  output: {schema: GenerateStudyScheduleOutputSchema},
  prompt: `You are an AI study assistant specialized in creating personalized study plans.

Generate a comprehensive study schedule, a revision plan, and identify focus areas for a student based on the provided information.

Subjects: {{{subjects}}}
Exam Date: {{{examDate}}}
Daily Free Time: {{{dailyFreeTime}}} hours

Create a daily study schedule until the exam date. For each day, list specific activities and allocate study time for each subject. Ensure the schedule is realistic given the daily free time.

The revision plan should specify when and which topics or subjects need to be revisited.

The focus areas should highlight specific topics or subjects that require more attention based on typical student struggles and the time available.

Respond only with a JSON object conforming to the output schema.`,
});

const generateStudyScheduleFlow = ai.defineFlow(
  {
    name: 'generateStudyScheduleFlow',
    inputSchema: GenerateStudyScheduleInputSchema,
    outputSchema: GenerateStudyScheduleOutputSchema,
  },
  async (input) => {
    const {output} = await generateStudySchedulePrompt(input);
    return output!;
  }
);
