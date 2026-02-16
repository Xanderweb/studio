'use server';
/**
 * @fileOverview This file implements a Genkit flow for SnapClaim, providing AI-generated damage summaries and estimated severity from vehicle photos.
 *
 * - snapClaimDamageSummary - A function that handles the AI damage detection process.
 * - SnapClaimDamageSummaryInput - The input type for the snapClaimDamageSummary function.
 * - SnapClaimDamageSummaryOutput - The return type for the snapClaimDamageSummary function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Part } from 'genkit/ai';

const SnapClaimDamageSummaryInputSchema = z.object({
  photoDataUris: z
    .array(z.string())
    .min(1, 'At least one photo data URI is required.')
    .describe(
      "An array of photos of a vehicle, each as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  incidentDescription: z
    .string()
    .optional()
    .describe(
      'A textual description of the incident and any observed damage. This is optional but can provide additional context.'
    ),
});
export type SnapClaimDamageSummaryInput = z.infer<typeof SnapClaimDamageSummaryInputSchema>;

const SnapClaimDamageSummaryOutputSchema = z.object({
  damageSummary: z
    .string()
    .describe(
      'A detailed, concise summary of the detected damage to the vehicle, including affected parts and a brief description of the damage to each. If no damage is visible, state "No visible damage detected."'
    ),
  estimatedSeverity: z
    .enum(['Minor', 'Moderate', 'Severe', 'Totaled', 'Undetermined'])
    .describe(
      'An estimation of the overall damage severity: Minor (cosmetic, easily repairable), Moderate (requires significant repair, but drivable), Severe (not drivable, major structural damage), Totaled (repair cost exceeds vehicle value), or Undetermined (not enough information).'
    ),
  affectedParts: z
    .array(z.string())
    .describe(
      'A list of vehicle parts identified as damaged (e.g., "front bumper", "driver-side door", "windshield", "side mirror"). If no damage is detected, this should be an empty array.'
    ),
});
export type SnapClaimDamageSummaryOutput = z.infer<typeof SnapClaimDamageSummaryOutputSchema>;

export async function snapClaimDamageSummary(
  input: SnapClaimDamageSummaryInput
): Promise<SnapClaimDamageSummaryOutput> {
  return snapClaimDamageSummaryFlow(input);
}

const snapClaimDamageSummaryFlow = ai.defineFlow(
  {
    name: 'snapClaimDamageSummaryFlow',
    inputSchema: SnapClaimDamageSummaryInputSchema,
    outputSchema: SnapClaimDamageSummaryOutputSchema,
  },
  async (input) => {
    const promptParts: Part[] = [];

    promptParts.push({
      text: `You are an expert vehicle damage assessor. Your task is to analyze the provided image(s) of a vehicle and the accompanying incident description to identify and detail any visible damage. Subsequently, you must estimate the overall severity of the damage.\n\nFollow these guidelines:\n1. Carefully examine each provided image for signs of damage on the vehicle.\n2. Consider the incident description for additional context regarding the damage.\n3. List all clearly identifiable damaged parts of the vehicle in the 'affectedParts' array.\n4. Provide a detailed summary in 'damageSummary' describing the nature of the damage for each identified part.\n5. Determine an overall severity level for the damage, choosing from 'Minor', 'Moderate', 'Severe', 'Totaled', or 'Undetermined'.\n6. If no damage is visible or detectable from the provided images and description, set 'damageSummary' to "No visible damage detected.", 'estimatedSeverity' to 'Minor', and 'affectedParts' to an empty array.\n7. Ensure your response strictly adheres to the JSON schema provided. Focus only on visible damage and do not hallucinate.`,
    });

    if (input.incidentDescription) {
      promptParts.push({
        text: `\nIncident Description: ${input.incidentDescription}\n`,
      });
    } else {
      promptParts.push({ text: `\nNo additional incident description provided.\n` });
    }

    input.photoDataUris.forEach((uri, index) => {
      promptParts.push({ text: `\nVehicle Photo ${index + 1} for analysis:` });
      promptParts.push({ media: { url: uri } });
    });

    const { output } = await ai.generate({
      prompt: promptParts,
      model: 'googleai/gemini-pro-vision',
      output: { schema: SnapClaimDamageSummaryOutputSchema },
      config: {
        safetySettings: [
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_NONE',
          },
        ],
      },
    });

    if (!output) {
      throw new Error(
        'Failed to generate damage summary. The AI model did not return a valid output.'
      );
    }
    return output;
  }
);
