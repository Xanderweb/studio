'use server';
/**
 * @fileOverview An AI chatbot that guides users through the insurance claim reporting process.
 *
 * - claimCoachChatbotGuidance - A function that handles the AI chatbot's interaction.
 * - ClaimCoachChatbotGuidanceInput - The input type for the claimCoachChatbotGuidance function.
 * - ClaimCoachChatbotGuidanceOutput - The return type for the claimCoachChatbotGuidance function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ClaimCoachChatbotGuidanceInputSchema = z.object({
  conversationHistory: z.array(
    z.object({
      role: z.enum(['user', 'model']),
      content: z.string(),
    })
  ).describe('The history of the conversation between the user and the chatbot.'),
  userMessage: z.string().describe('The current message from the user.'),
});
export type ClaimCoachChatbotGuidanceInput = z.infer<typeof ClaimCoachChatbotGuidanceInputSchema>;

const ClaimCoachChatbotGuidanceOutputSchema = z.object({
  response: z.string().describe('The chatbot\'s response message.'),
  suggestedEvidence: z.array(z.string()).optional().describe('Suggested evidence or next steps for the user.'),
});
export type ClaimCoachChatbotGuidanceOutput = z.infer<typeof ClaimCoachChatbotGuidanceOutputSchema>;

export async function claimCoachChatbotGuidance(input: ClaimCoachChatbotGuidanceInput): Promise<ClaimCoachChatbotGuidanceOutput> {
  return claimCoachChatbotGuidanceFlow(input);
}

const claimCoachChatbotGuidancePrompt = ai.definePrompt({
  name: 'claimCoachChatbotGuidancePrompt',
  input: { schema: ClaimCoachChatbotGuidanceInputSchema },
  output: { schema: ClaimCoachChatbotGuidanceOutputSchema },
  prompt: `You are an AI-powered insurance claims coach named ClaimCoach. Your role is to guide users through the incident reporting process by asking relevant questions and suggesting necessary evidence to ensure they accurately and completely submit their claim.

Maintain a helpful, empathetic, and professional tone. Your goal is to make the claims process as clear and straightforward as possible for the user.

Here's the conversation history so far:
{{#each conversationHistory}}
  {{this.role}}: {{this.content}}
{{/each}}

User's current message: {{{userMessage}}}

Please respond to the user, keeping the conversation history in mind. If appropriate, suggest what evidence (documents, photos, etc.) might be needed next.`,
});

const claimCoachChatbotGuidanceFlow = ai.defineFlow(
  {
    name: 'claimCoachChatbotGuidanceFlow',
    inputSchema: ClaimCoachChatbotGuidanceInputSchema,
    outputSchema: ClaimCoachChatbotGuidanceOutputSchema,
  },
  async (input) => {
    const { output } = await claimCoachChatbotGuidancePrompt(input);
    return output!;
  }
);
