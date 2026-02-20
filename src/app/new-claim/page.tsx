'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Bot, FileText, Image as ImageIcon, Send, Sparkles, Upload, Mic, Square, Loader2, User } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon } from 'lucide-react';
import { analyzeDamage, getChatbotResponse, transcribeAudioAction } from '@/lib/actions';
import type { DamageAnalysis, FullClaimDetails, ClaimStatus, ClaimType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CLAIM_TYPES } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

const incidentDetailsSchema = z.object({
  claimType: z.string({ required_error: 'Please select a claim type.' }),
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
  { id: '01', name: 'Claim Details', fields: ['claimType', 'description', 'incidentDate', 'location'] },
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

  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  const form = useForm({
    resolver: zodResolver(currentStep === 0 ? incidentDetailsSchema : evidenceSchema),
    mode: 'onChange',
    defaultValues: {
      claimType: undefined,
      description: '',
      incidentDate: undefined,
      location: '',
      photos: [] as File[],
      documents: [] as File[],
    },
  });

  const photos = useFieldArray({ control: form.control, name: 'photos' });
  const documents = useFieldArray({ control: form.control, name: 'documents' });

  const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);
        recorder.ondataavailable = (e) => {
            setAudioChunks(prev => [...prev, e.data]);
        };
        recorder.start();
        setIsRecording(true);
        setAudioChunks([]);
    } catch (err) {
        toast({
            variant: 'destructive',
            title: 'Microphone access denied',
            description: 'Please enable microphone access in your browser settings.',
        });
    }
  };

  const stopRecording = () => {
      if (mediaRecorder) {
          mediaRecorder.stop();
          mediaRecorder.stream.getTracks().forEach(track => track.stop());
          setIsRecording(false);
      }
  };

  useEffect(() => {
      if (!isRecording && audioChunks.length > 0) {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          handleTranscription(audioBlob);
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioChunks, isRecording]);

  const handleTranscription = async (audioBlob: Blob) => {
      setIsTranscribing(true);
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      
      try {
          const result = await transcribeAudioAction(formData);
          if ('error' in result) throw new Error(result.error);
          const currentDescription = form.getValues('description');
          form.setValue('description', (currentDescription ? currentDescription + ' ' : '') + result.transcript, { shouldValidate: true });
          toast({ title: '✅ Transcription Complete', description: 'Your voice note has been added to the description.' });
      } catch (error) {
          toast({ variant: 'destructive', title: '❌ Transcription Failed', description: error instanceof Error ? error.message : "An unknown error occurred." });
      } finally {
          setIsTranscribing(false);
          setAudioChunks([]);
      }
  };

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
        claimType: values.claimType as ClaimType,
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
                  <Card className="holographic-card">
                    <CardHeader>
                      <CardTitle>Step 1: Claim Details</CardTitle>
                      <CardDescription>Tell us about what happened.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField
                            control={form.control}
                            name="claimType"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="relative">
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="peer">
                                                <SelectValue placeholder=" " />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {CLAIM_TYPES.map(type => (
                                                <SelectItem key={type.name} value={type.name}>{type.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Label htmlFor="claimType" className="absolute text-sm text-text-secondary duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-electric-cyan peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                                        Type of Insurance Claim
                                    </Label>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                       <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                             <div className="relative">
                                <FormControl>
                                  <Textarea placeholder=" " rows={5} {...field} />
                                </FormControl>
                                <Label htmlFor="description" className="absolute text-sm text-text-secondary duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-electric-cyan peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                                  Incident Description
                                </Label>
                                <div className="absolute bottom-2 right-2 flex gap-2">
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant={isRecording ? "destructive" : "ghost"}
                                        className='w-10 h-10 rounded-full border border-glass-border bg-glass-dark/50 hover:bg-electric-cyan/20'
                                        onClick={isRecording ? stopRecording : startRecording}
                                        disabled={isTranscribing}
                                    >
                                        {isTranscribing ? <Loader2 className="h-5 w-5 animate-spin text-electric-cyan" /> : isRecording ? <Square className="h-5 w-5 text-danger-red" /> : <Mic className="h-5 w-5 text-electric-cyan" />}
                                        <span className="sr-only">{isTranscribing ? "Transcribing..." : isRecording ? "Stop recording" : "Start recording"}</span>
                                    </Button>
                                </div>
                              </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid md:grid-cols-2 gap-8">
                        <FormField
                            control={form.control}
                            name="incidentDate"
                            render={({ field }) => (
                            <FormItem>
                                 <div className="relative">
                                <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                    <button
                                        className={cn(
                                        "peer block w-full appearance-none rounded-none border-b-2 border-glass-border bg-transparent px-0 py-2.5 text-left text-base text-text-primary focus:border-electric-cyan focus:outline-none focus:ring-0",
                                        !field.value && "text-text-secondary"
                                        )}
                                    >
                                        {field.value ? (
                                        format(field.value, "PPP")
                                        ) : (
                                        <span></span>
                                        )}
                                        <CalendarIcon className="absolute right-0 top-3 h-5 w-5 opacity-50" />
                                    </button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-bg-secondary border-glass-border" align="start">
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
                                 <Label htmlFor="incidentDate" className="absolute text-sm text-text-secondary duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-electric-cyan peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                                    Date of Incident
                                 </Label>
                                </div>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                            <FormItem>
                                <div className="relative">
                                <FormControl>
                                <Input placeholder=" " {...field} />
                                </FormControl>
                                 <Label htmlFor="location" className="absolute text-sm text-text-secondary duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-electric-cyan peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                                    Location of Incident
                                </Label>
                                </div>
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
                        <Card className="holographic-card">
                            <CardHeader>
                                <CardTitle>Upload Photos</CardTitle>
                                <CardDescription>Upload clear photos of the damage. At least one is required.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <FileUploader
                                    fieldArray={photos}
                                    icon={<ImageIcon className="h-8 w-8 text-electric-cyan" />}
                                    accept="image/*"
                                />
                                <FormMessage>{form.formState.errors.photos?.message}</FormMessage>
                            </CardContent>
                        </Card>
                         <Card className="holographic-card">
                            <CardHeader>
                                <CardTitle>Upload Documents</CardTitle>
                                <CardDescription>Optional: Add supporting documents like a police report.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <FileUploader
                                    fieldArray={documents}
                                    icon={<FileText className="h-8 w-8 text-electric-cyan" />}
                                    accept=".pdf,.doc,.docx"
                                />
                            </CardContent>
                        </Card>
                    </div>
                )}
                
                {currentStep === 2 && (
                    <Card className="holographic-card">
                        <CardHeader>
                            <CardTitle>Step 3: AI Assistant (ClaimCoach)</CardTitle>
                            <CardDescription>Chat with our AI to ensure you have all necessary information.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-lg h-[500px] flex flex-col bg-glass-dark border-glass-border">
                                <ScrollArea className="flex-1 p-4">
                                    <div className="space-y-6">
                                    {chatHistory.map((msg, i) => (
                                        <div key={i} className={cn("flex items-start gap-3 w-full", msg.role === 'user' && 'justify-end')}>
                                            {msg.role === 'model' && <div className="p-2 bg-bg-tertiary rounded-full border border-glass-border"><Bot className="h-5 w-5 text-electric-cyan"/></div>}
                                            <div className={cn("max-w-[80%] rounded-xl p-4 text-sm", msg.role === 'model' ? 'bg-bg-secondary border border-glass-border message-ai' : 'message-user')}>
                                                <p>{msg.content}</p>
                                            </div>
                                             {msg.role === 'user' && <div className="p-2 bg-bg-tertiary rounded-full border border-glass-border"><User className="h-5 w-5 text-electric-magenta"/></div>}
                                        </div>
                                    ))}
                                    {isChatting && (
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-bg-tertiary rounded-full border border-glass-border"><Bot className="h-5 w-5 text-electric-cyan"/></div>
                                            <div className="bg-bg-secondary border border-glass-border rounded-lg p-4 text-sm typing-indicator">
                                                <div className="typing-dot"></div><div className="typing-dot"></div><div className="typing-dot"></div>
                                            </div>
                                        </div>
                                    )}
                                    </div>
                                </ScrollArea>
                                <div className="border-t border-glass-border p-4">
                                    <form onSubmit={handleChatSubmit} className="flex gap-4 items-center">
                                         <div className="relative w-full">
                                             <Input id="chat-input" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder=" " disabled={isChatting} className="peer pr-12" />
                                              <Label htmlFor="chat-input" className="absolute text-sm text-text-secondary duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-electric-cyan peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                                                Ask a question...
                                            </Label>
                                         </div>
                                        <Button type="submit" size="icon" variant="magnetic" className="w-12 h-12 rounded-full flex-shrink-0" disabled={!chatInput.trim() || isChatting}>
                                            <Send className="h-5 w-5"/>
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {currentStep === 3 && (
                    <Card className="holographic-card">
                        <CardHeader>
                            <CardTitle>Step 4: Review & Submit</CardTitle>
                            <CardDescription>Please review all information before submitting your claim.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 text-text-secondary">
                            <div>
                                <h3 className="font-headline text-lg font-semibold mb-2 text-text-primary">Claim Details</h3>
                                <div className="space-y-2 text-sm">
                                    <p><strong className="text-text-primary font-medium">Claim Type:</strong> {form.getValues('claimType')}</p>
                                    <p><strong className="text-text-primary font-medium">Date:</strong> {form.getValues('incidentDate') ? format(form.getValues('incidentDate')!, 'PPP') : 'N/A'}</p>
                                    <p><strong className="text-text-primary font-medium">Location:</strong> {form.getValues('location')}</p>
                                    <p className="whitespace-pre-wrap"><strong className="text-text-primary font-medium">Description:</strong> {form.getValues('description')}</p>
                                </div>
                            </div>
                            <Separator className="bg-glass-border" />
                            <div>
                                <h3 className="font-headline text-lg font-semibold mb-2 text-text-primary">Evidence</h3>
                                <ul className="text-sm list-disc pl-5 space-y-1">
                                    <li>{form.getValues('photos').length} photo(s) uploaded.</li>
                                    <li>{form.getValues('documents').length} document(s) uploaded.</li>
                                </ul>
                            </div>
                             <Separator className="bg-glass-border" />
                            <div>
                                <h3 className="font-headline text-lg font-semibold mb-2 flex items-center gap-2 text-text-primary"><Sparkles className="h-5 w-5 text-electric-cyan" />AI Damage Analysis</h3>
                                {isAnalyzing ? <p className="text-sm">Analyzing images...</p> : (
                                    damageAnalysis ? (
                                        <div className="text-sm space-y-1">
                                            <p><strong className="text-text-primary font-medium">Severity:</strong> {damageAnalysis.estimatedSeverity}</p>
                                            <p><strong className="text-text-primary font-medium">Summary:</strong> {damageAnalysis.damageSummary}</p>
                                        </div>
                                    ) : <p className="text-sm">No analysis performed yet.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </form>
        </Form>
        
        <div className="flex justify-between items-center mt-4">
          <Button variant="outline" onClick={handlePrev} disabled={currentStep === 0}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          {currentStep < STEPS.length - 1 ? (
            <Button onClick={handleNext} variant="magnetic" disabled={isAnalyzing}>
              {isAnalyzing ? "Analyzing..." : "Next"} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={onSubmit} variant="magnetic">
              <Upload className="mr-2 h-4 w-4" /> Submit Claim
            </Button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
