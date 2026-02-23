import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-weaknesses.ts';
import '@/ai/flows/explain-concept.ts';
import '@/ai/flows/generate-study-schedule.ts';
import '@/ai/flows/process-notes-flow.ts';
import '@/ai/flows/generate-motivation.ts';
