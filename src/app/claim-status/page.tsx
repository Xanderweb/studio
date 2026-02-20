'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Search, Sparkles } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { getClaimStatusChatbotResponse } from '@/lib/actions';

type ChatMessage = {
  role: 'user' | 'model';
  content: string;
};

export default function ClaimStatusPage() {
  const { toast } = useToast();
  const [claimId, setClaimId] = useState('');
  const [submittedClaimId, setSubmittedClaimId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [chatHistory]);
  
  const handleClaimIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimId.trim()) {
        toast({
            variant: 'destructive',
            title: 'Claim ID Required',
            description: 'Please enter a claim ID to check its status.',
        });
        return;
    }
    setSubmittedClaimId(claimId);
    setChatHistory([
        { role: 'model', content: `Hello! I'm checking the status for Claim #${claimId.replace('clm_','')}. How can I help you today?` }
    ]);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatting || !submittedClaimId) return;

    const userMessage: ChatMessage = { role: 'user', content: chatInput };
    setChatHistory(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatting(true);

    try {
      const res = await getClaimStatusChatbotResponse(submittedClaimId, [...chatHistory, userMessage], chatInput);
      if ('error' in res) throw new Error(res.error);
      const modelMessage: ChatMessage = { role: 'model', content: res.response };
      setChatHistory(prev => [...prev, modelMessage]);
    } catch (error) {
       toast({ variant: 'destructive', title: "❌ Chat Error", description: "Could not get a response from the assistant." });
       setChatHistory(prev => prev.slice(0, -1));
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Claim Status Assistant"
        description="Use our AI assistant to get live updates on your claim."
      />
      
        {!submittedClaimId ? (
            <div className="flex items-center justify-center pt-16">
                 <Card className="w-full max-w-md bg-glass-dark border-glass-border backdrop-blur-lg shadow-glass-glow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Search /> Find Your Claim</CardTitle>
                        <CardDescription>Enter your claim ID to begin.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleClaimIdSubmit} className="space-y-6">
                            <div className="relative">
                                <Input 
                                    id="claimId"
                                    placeholder=" "
                                    value={claimId}
                                    onChange={(e) => setClaimId(e.target.value)}
                                    className="peer"
                                />
                                <Label htmlFor="claimId" className="absolute text-sm text-text-secondary duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-electric-cyan peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                                    Claim ID (e.g., clm_1a2b3c4d)
                                </Label>
                            </div>
                            <Button type="submit" variant="magnetic" className="w-full">
                                Check Status
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        ) : (
            <Card className="holographic-card">
                 <div className="h-[70vh] flex flex-col">
                    <div className="p-4 border-b border-glass-border flex justify-between items-center">
                        <div className='flex items-center gap-2'>
                             <Sparkles className="h-5 w-5 text-electric-cyan" />
                            <h3 className="font-headline text-lg">Claim Status: #{submittedClaimId.replace('clm_', '')}</h3>
                        </div>
                         <Button variant="ghost" size="sm" onClick={() => setSubmittedClaimId(null)}>
                            Check another ID
                        </Button>
                    </div>
                    <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                        <div className="space-y-6">
                        {chatHistory.map((msg, i) => (
                            <div key={i} className={cn("flex items-start gap-3 w-full", msg.role === 'user' && 'justify-end')}>
                                {msg.role === 'model' && (
                                     <div className="p-2 bg-bg-tertiary rounded-full border border-glass-border">
                                        <Bot className="h-5 w-5 text-electric-cyan"/>
                                    </div>
                                )}
                                <div className={cn(
                                    "max-w-[80%] rounded-xl p-4 text-sm", 
                                    msg.role === 'model' ? 'bg-bg-secondary border border-glass-border message-ai' : 'message-user'
                                )}>
                                    <p>{msg.content}</p>
                                </div>
                                 {msg.role === 'user' && (
                                     <div className="p-2 bg-bg-tertiary rounded-full border border-glass-border">
                                        <User className="h-5 w-5 text-electric-magenta"/>
                                    </div>
                                )}
                            </div>
                        ))}
                        {isChatting && (
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-bg-tertiary rounded-full border border-glass-border"><Bot className="h-5 w-5 text-electric-cyan"/></div>
                                <div className="bg-bg-secondary border border-glass-border rounded-lg p-4 text-sm typing-indicator">
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot"></div>
                                </div>
                            </div>
                        )}
                        </div>
                    </ScrollArea>
                    <div className="border-t border-glass-border p-4">
                        <form onSubmit={handleChatSubmit} className="flex gap-4 items-center">
                            <div className="relative w-full">
                                <Input 
                                    id="chatInput"
                                    value={chatInput} 
                                    onChange={e => setChatInput(e.target.value)} 
                                    placeholder="Ask about your claim..." 
                                    disabled={isChatting}
                                    className="peer pr-12 input-cyber"
                                />
                                 <Label htmlFor="chatInput" className="absolute text-sm text-text-secondary duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-electric-cyan peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                                    Your message
                                </Label>
                            </div>
                            <Button type="submit" size="icon" variant="magnetic" className="w-12 h-12 rounded-full flex-shrink-0" disabled={!chatInput.trim() || isChatting}>
                                <Send className="h-5 w-5"/>
                            </Button>
                        </form>
                    </div>
                </div>
            </Card>
        )}
    </AppLayout>
  );
}
