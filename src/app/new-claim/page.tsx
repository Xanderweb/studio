'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Bot, FileText, Image as ImageIcon, Send, Sparkles, Upload } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';

import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import Stepper from '@/components/claim/Stepper';
import FileUploader from '@/components/claim/FileUploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon } from 'lucide-react';
import { analyzeDamage, getChatbotResponse } from '@/lib/actions';
import type { DamageAnalysis, FullClaimDetails, ClaimStatus } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

const incidentDetailsSchema = z.object({
  description: z.string().min(10, { message: 'Please provide a detailed description.' }),
  incidentDate: z.date({ required_error: 'An incident date is required.' }),
  location: z.string().min(3, { message: 'Please provide a location.' }),
});

const evidenceSchema = z.object({
  photos: z.array(z.instanceof(File)).min(1, 'At least one photo is required.'),
  documents: z.array(z.instanceof(File)),
});

type ChatMessage = {
  role: 'user' | 'model';
  content: string;
};

const STEPS = [
  { id: '01', name: 'Incident Details', fields: ['description', 'incidentDate', 'location'] },
  { id: '02', name: 'Upload Evidence', fields: ['photos', 'documents'] },
  { id: '03', name: 'AI Assistant', fields: [] },
  { id: '04', name: 'Review & Submit', fields: [] },
];

export default function NewClaimPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  const { toast } = useToast();
  const [damageAnalysis, setDamageAnalysis] = useState<DamageAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: 'model', content: "Hello! I'm ClaimCoach, your AI assistant. To get started, please describe what happened in the 'Incident Details' step." }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);


  const form = useForm({
    resolver: zodResolver(currentStep === 0 ? incidentDetailsSchema : evidenceSchema),
    mode: 'onChange',
    defaultValues: {
      description: '',
      incidentDate: undefined,
      location: '',
      photos: [] as File[],
      documents: [] as File[],
    },
  });

  const photos = useFieldArray({ control: form.control, name: 'photos' });
  const documents = useFieldArray({ control: form.control, name: 'documents' });

  const handleNext = async () => {
    const isStepValid = await form.trigger(STEPS[currentStep].fields as any);
    if (!isStepValid) return;

    if (currentStep === 1) { // After evidence upload
      setIsAnalyzing(true);
      const formData = new FormData();
      form.getValues('photos').forEach(photo => formData.append('photos', photo));
      formData.append('description', form.getValues('description'));
      
      try {
        const result = await analyzeDamage(formData);
        if ('error' in result) throw new Error(result.error);
        setDamageAnalysis(result);
        toast({ title: "✅ Damage Analysis Complete", description: "Our AI has analyzed your photos." });
      } catch (error) {
        toast({ variant: 'destructive', title: "❌ Analysis Failed", description: error instanceof Error ? error.message : "An unknown error occurred." });
      } finally {
        setIsAnalyzing(false);
      }
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(step => step + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(step => step - 1);
    }
  };
  
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatting) return;

    const userMessage: ChatMessage = { role: 'user', content: chatInput };
    setChatHistory(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatting(true);

    try {
      const res = await getChatbotResponse([...chatHistory, userMessage], chatInput);
      if ('error' in res) throw new Error(res.error);
      const modelMessage: ChatMessage = { role: 'model', content: res.response };
      setChatHistory(prev => [...prev, modelMessage]);
    } catch (error) {
       toast({ variant: 'destructive', title: "❌ Chat Error", description: "Could not get a response from the assistant." });
       setChatHistory(prev => prev.slice(0, -1)); // remove user message on error
    } finally {
      setIsChatting(false);
    }
  };

  const onSubmit = () => {
    const values = form.getValues();
    const claimId = `claim-${Date.now()}`;
    const claimData: FullClaimDetails = {
        id: claimId,
        incidentDetails: {
            description: values.description,
            incidentDate: values.incidentDate,
            location: values.location,
        },
        evidence: {
            photos: values.photos.map(p => ({ name: p.name, url: URL.createObjectURL(p) })),
            documents: values.documents.map(d => ({ name: d.name, url: URL.createObjectURL(d) })),
        },
        damageAnalysis: damageAnalysis ?? undefined,
        fraudReport: undefined, // Will be generated on the details page
        status: 'Under Review' as ClaimStatus,
        createdAt: new Date(),
    };
    
    // Using localStorage to pass data for this MVP
    localStorage.setItem(claimId, JSON.stringify(claimData));
    
    toast({ title: "🎉 Claim Submitted!", description: "Your claim is now being processed." });
    router.push(`/claim/${claimId}`);
  };

  return (
    <AppLayout>
      <PageHeader
        title="File a New Claim"
        description="Follow the steps to submit your insurance claim."
      />
      <div className="grid gap-8">
        <Stepper steps={STEPS} currentStep={currentStep} />
        
        <Form {...form}>
            <form>
                {currentStep === 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Step 1: Incident Details</CardTitle>
                      <CardDescription>Tell us about what happened.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Incident Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Describe the incident in detail..." rows={5} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="incidentDate"
                            render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Date of Incident</FormLabel>
                                <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                        )}
                                    >
                                        {field.value ? (
                                        format(field.value, "PPP")
                                        ) : (
                                        <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                        date > new Date() || date < new Date("1900-01-01")
                                    }
                                    initialFocus
                                    />
                                </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Location of Incident</FormLabel>
                                <FormControl>
                                <Input placeholder="e.g., 123 Main St, Anytown" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {currentStep === 1 && (
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Upload Photos</CardTitle>
                                <CardDescription>Upload clear photos of the damage. At least one is required.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <FileUploader
                                    fieldArray={photos}
                                    icon={<ImageIcon className="h-8 w-8 text-muted-foreground" />}
                                    accept="image/*"
                                />
                                <FormMessage>{form.formState.errors.photos?.message}</FormMessage>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle>Upload Documents</CardTitle>
                                <CardDescription>Optional: Add supporting documents like a police report.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <FileUploader
                                    fieldArray={documents}
                                    icon={<FileText className="h-8 w-8 text-muted-foreground" />}
                                    accept=".pdf,.doc,.docx"
                                />
                            </CardContent>
                        </Card>
                    </div>
                )}
                
                {currentStep === 2 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Step 3: AI Assistant (ClaimCoach)</CardTitle>
                            <CardDescription>Chat with our AI to ensure you have all necessary information.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-lg h-[500px] flex flex-col">
                                <ScrollArea className="flex-1 p-4">
                                    <div className="space-y-4">
                                    {chatHistory.map((msg, i) => (
                                        <div key={i} className={cn("flex items-start gap-3", msg.role === 'user' && 'justify-end')}>
                                            {msg.role === 'model' && <div className="p-2 bg-primary/10 rounded-full"><Bot className="h-5 w-5 text-primary"/></div>}
                                            <div className={cn("max-w-[75%] rounded-lg p-3 text-sm", msg.role === 'model' ? 'bg-muted' : 'bg-primary text-primary-foreground')}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    ))}
                                    {isChatting && (
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-primary/10 rounded-full"><Bot className="h-5 w-5 text-primary"/></div>
                                            <div className="bg-muted rounded-lg p-3 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 bg-primary rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                                    <div className="h-2 w-2 bg-primary rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                                    <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    </div>
                                </ScrollArea>
                                <div className="border-t p-2">
                                    <form onSubmit={handleChatSubmit} className="flex gap-2">
                                        <Input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Ask a question or provide more details..." disabled={isChatting}/>
                                        <Button type="submit" size="icon" disabled={!chatInput.trim() || isChatting}>
                                            <Send className="h-4 w-4"/>
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {currentStep === 3 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Step 4: Review & Submit</CardTitle>
                            <CardDescription>Please review all information before submitting your claim.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="font-semibold mb-2">Incident Details</h3>
                                <div className="text-sm space-y-1 text-muted-foreground">
                                    <p><strong className="text-foreground">Date:</strong> {form.getValues('incidentDate') ? format(form.getValues('incidentDate')!, 'PPP') : 'N/A'}</p>
                                    <p><strong className="text-foreground">Location:</strong> {form.getValues('location')}</p>
                                    <p><strong className="text-foreground">Description:</strong> {form.getValues('description')}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">Evidence</h3>
                                <ul className="text-sm list-disc pl-5 text-muted-foreground">
                                    <li>{form.getValues('photos').length} photo(s) uploaded.</li>
                                    <li>{form.getValues('documents').length} document(s) uploaded.</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2 flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" />AI Damage Analysis</h3>
                                {isAnalyzing ? <p className="text-sm text-muted-foreground">Analyzing images...</p> : (
                                    damageAnalysis ? (
                                        <div className="text-sm space-y-1 text-muted-foreground">
                                            <p><strong className="text-foreground">Severity:</strong> {damageAnalysis.estimatedSeverity}</p>
                                            <p><strong className="text-foreground">Summary:</strong> {damageAnalysis.damageSummary}</p>
                                        </div>
                                    ) : <p className="text-sm text-muted-foreground">No analysis performed yet.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </form>
        </Form>
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={handlePrev} disabled={currentStep === 0}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          {currentStep < STEPS.length - 1 ? (
            <Button onClick={handleNext} disabled={isAnalyzing}>
              {isAnalyzing ? "Analyzing..." : "Next"} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={onSubmit}>
              <Upload className="mr-2 h-4 w-4" /> Submit Claim
            </Button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
