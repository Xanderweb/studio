'use server';
/**
 * @fileOverview An AI chatbot that provides status updates for a given insurance claim.
 *
 * - claimStatusChatbot - A function that handles the AI chatbot's interaction.
 * - ClaimStatusChatbotInput - The input type for the claimStatusChatbot function.
 * - ClaimStatusChatbotOutput - The return type for the claimStatusChatbot function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { mockClaims } from '@/lib/mock-data';

const ClaimStatusChatbotInputSchema = z.object({
  claimId: z.string().describe('The unique identifier for the insurance claim.'),
  conversationHistory: z.array(
    z.object({
      role: z.enum(['user', 'model']),
      content: z.string(),
    })
  ).describe('The history of the conversation between the user and the chatbot.'),
  userMessage: z.string().describe('The current message from the user.'),
});
export type ClaimStatusChatbotInput = z.infer<typeof ClaimStatusChatbotInputSchema>;

const ClaimStatusChatbotOutputSchema = z.object({
  response: z.string().describe("The chatbot's response message regarding the claim status."),
});
export type ClaimStatusChatbotOutput = z.infer<typeof ClaimStatusChatbotOutputSchema>;

export async function claimStatusChatbot(input: ClaimStatusChatbotInput): Promise<ClaimStatusChatbotOutput> {
  return claimStatusChatbotFlow(input);
}

const claimStatusChatbotFlow = ai.defineFlow(
  {
    name: 'claimStatusChatbotFlow',
    inputSchema: ClaimStatusChatbotInputSchema,
    outputSchema: ClaimStatusChatbotOutputSchema,
  },
  async (input) => {
    const { claimId, conversationHistory, userMessage } = input;

    // For this MVP, we'll find the claim in our mock data.
    // In a real application, this would be a database lookup.
    const claim = mockClaims.find(c => c.id === claimId);

    const prompt = `You are an AI assistant for ClaimFlow, a futuristic insurance company. Your only role is to provide status updates on insurance claims. Be concise, professional, and helpful.

Here is the context for the current request:
- Claim ID: ${claimId}
- Claim Status: ${claim ? claim.status : 'Not Found'}
- Claim Description: ${claim ? claim.description : 'N/A'}

Here's the conversation history so far:
{{#each conversationHistory}}
  {{this.role}}: {{this.content}}
{{/each}}

User's current message: {{{userMessage}}}

Based on this, please provide a status update.
- If the claim is not found, politely inform the user and ask them to double-check the ID.
- If the claim is found, provide the status and a brief, friendly update. Do not offer to perform any other actions.
- Keep responses short and to the point.`;

    const { output } = await ai.generate({
        prompt: prompt,
        history: conversationHistory,
        model: 'googleai/gemini-1.5-flash-latest'
    });

    if (!output) {
      return { response: "I'm sorry, I wasn't able to process that request. Please try again." };
    }

    return { response: output.text() };
  }
);
