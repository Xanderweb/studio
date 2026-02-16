'use server';

import { claimCoachChatbotGuidance } from '@/ai/flows/claim-coach-chatbot-guidance-flow';
import { claimGuardFraudExplanation } from '@/ai/flows/claim-guard-fraud-explanation.ts';
import { snapClaimDamageSummary } from '@/ai/flows/snap-claim-damage-summary';
import { transcribeAudio } from '@/ai/flows/transcribe-audio-flow';
import type { RiskLevel } from './types';

// Helper to convert file to data URI
async function fileToDataURI(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return `data:${file.type};base64,${buffer.toString('base64')}`;
}

export async function analyzeDamage(formData: FormData) {
  const photos = formData.getAll('photos') as File[];
  const incidentDescription = formData.get('description') as string;

  if (photos.length === 0) {
    throw new Error('No photos provided for analysis.');
  }

  try {
    const photoDataUris = await Promise.all(photos.map(fileToDataURI));

    const result = await snapClaimDamageSummary({
      photoDataUris,
      incidentDescription,
    });
    
    return result;
  } catch (error) {
    console.error('Error in analyzeDamage server action:', error);
    return { error: 'Failed to analyze damage. Please try again.' };
  }
}

export async function getFraudExplanation(
  riskLevel: RiskLevel,
  fraudFlags: string[],
  damageSummary: string,
  ocrText: string,
  incidentDate: string,
  claimDate: string,
  location: string,
) {
    try {
        const result = await claimGuardFraudExplanation({
            riskLevel,
            fraudFlags,
            damageSummary,
            ocrText,
            incidentDate,
            claimDate,
            location,
        });
        return result;
    } catch (error) {
        console.error('Error in getFraudExplanation server action:', error);
        return { error: 'Failed to generate fraud explanation.' };
    }
}

export async function getChatbotResponse(
    conversationHistory: { role: 'user' | 'model'; content: string }[],
    userMessage: string
) {
    try {
        const result = await claimCoachChatbotGuidance({
            conversationHistory,
            userMessage,
        });
        return result;
    } catch (error) {
        console.error('Error in getChatbotResponse server action:', error);
        return { error: 'Failed to get chatbot response.' };
    }
}

export async function transcribeAudioAction(formData: FormData) {
  const audio = formData.get('audio') as File;
  if (!audio) {
    throw new Error('No audio file provided.');
  }

  try {
    const audioDataUri = await fileToDataURI(audio);
    const result = await transcribeAudio({ audioDataUri });
    return result;
  } catch (error) {
    console.error('Error in transcribeAudioAction server action:', error);
    return { error: 'Failed to transcribe audio. Please try again.' };
  }
}
