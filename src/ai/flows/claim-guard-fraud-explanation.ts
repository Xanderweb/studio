'use server';
/**
 * @fileOverview This file implements a Genkit flow to generate an AI-powered explanation
 * for a claim's fraud risk score, based on detected fraud flags, damage analysis, and claim details.
 *
 * - claimGuardFraudExplanation - A function that handles the generation of the fraud explanation.
 * - ClaimGuardFraudExplanationInput - The input type for the claimGuardFraudExplanation function.
 * - ClaimGuardFraudExplanationOutput - The return type for the claimGuardFraudExplanation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClaimGuardFraudExplanationInputSchema = z.object({
  fraudFlags: z
    .array(z.string())
    .describe('A list of detected fraud indicators or red flags.'),
  damageSummary: z
    .string()
    .describe('A summary of the detected damage from image analysis.'),
  ocrText: z.string().describe('Extracted text from uploaded documents.'),
  incidentDate: z.string().describe('The date the incident occurred (e.g., YYYY-MM-DD).'),
  claimDate: z.string().describe('The date the claim was submitted (e.g., YYYY-MM-DD).'),
  location: z.string().describe('The location where the incident occurred.'),
  riskLevel: z
    .enum(['Green', 'Yellow', 'Red'])
    .describe('The overall fraud risk level (Green: Low, Yellow: Medium, Red: High).'),
});
export type ClaimGuardFraudExplanationInput = z.infer<
  typeof ClaimGuardFraudExplanationInputSchema
>;

const ClaimGuardFraudExplanationOutputSchema = z.object({
  explanation: z
    .string()
    .describe('A detailed AI-generated explanation for the assigned fraud risk score.'),
});
export type ClaimGuardFraudExplanationOutput = z.infer<
  typeof ClaimGuardFraudExplanationOutputSchema
>;

export async function claimGuardFraudExplanation(
  input: ClaimGuardFraudExplanationInput
): Promise<ClaimGuardFraudExplanationOutput> {
  return claimGuardFraudExplanationFlow(input);
}

const claimGuardFraudExplanationPrompt = ai.definePrompt({
  name: 'claimGuardFraudExplanationPrompt',
  input: {schema: ClaimGuardFraudExplanationInputSchema},
  output: {schema: ClaimGuardFraudExplanationOutputSchema},
  prompt: `You are an AI assistant for a claims agent, specialized in explaining fraud risk scores for insurance claims.
Your task is to provide a clear, concise, and helpful explanation for the assigned fraud risk level, detailing the factors that contributed to it.

Here is the claim information:

Risk Level: {{{riskLevel}}}
Damage Summary: {{{damageSummary}}}
Incident Date: {{{incidentDate}}}
Claim Date: {{{claimDate}}}
Incident Location: {{{location}}}

{{#if fraudFlags}}
Detected Fraud Flags:
{{#each fraudFlags}}
- {{{this}}}
{{/each}}
{{else}}
No specific fraud flags were detected.
{{/if}}

Extracted Document Text:
"""
{{{ocrText}}}
"""

Based on the information above, provide a comprehensive explanation for the assigned fraud risk score. Focus on how each piece of information (especially the fraud flags and any inconsistencies) influenced the final risk level. If there are no specific red flags, explain why the current risk level is justified (e.g., due to lack of suspicious activity).
`,
});

const claimGuardFraudExplanationFlow = ai.defineFlow(
  {
    name: 'claimGuardFraudExplanationFlow',
    inputSchema: ClaimGuardFraudExplanationInputSchema,
    outputSchema: ClaimGuardFraudExplanationOutputSchema,
  },
  async input => {
    const {output} = await claimGuardFraudExplanationPrompt(input);
    return output!;
  }
);
