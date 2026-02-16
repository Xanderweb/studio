'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/claim-guard-fraud-explanation.ts';
import '@/ai/flows/claim-coach-chatbot-guidance-flow.ts';
import '@/ai/flows/snap-claim-damage-summary.ts';
import '@/ai/flows/transcribe-audio-flow.ts';
