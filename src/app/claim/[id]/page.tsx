'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { format } from 'date-fns';
import { AlertTriangle, BadgeCheck, FileText, Image as ImageIcon, Shield, Sparkles, ThumbsDown, User } from 'lucide-react';

import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { runFraudDetection } from '@/lib/fraud-rules';
import { getFraudExplanation } from '@/lib/actions';
import type { FullClaimDetails, RiskLevel } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const riskLevelStyles: Record<RiskLevel, { text: string; bg: string; icon: React.ReactNode }> = {
    Green: {
        text: 'text-green-600',
        bg: 'bg-green-100 dark:bg-green-900/50',
        icon: <Shield className="h-8 w-8 text-green-600" />,
    },
    Yellow: {
        text: 'text-yellow-600',
        bg: 'bg-yellow-100 dark:bg-yellow-900/50',
        icon: <AlertTriangle className="h-8 w-8 text-yellow-600" />,
    },
    Red: {
        text: 'text-red-600',
        bg: 'bg-red-100 dark:bg-red-900/50',
        icon: <AlertTriangle className="h-8 w-8 text-red-600" />,
    },
};

export default function ClaimDetailPage() {
    const params = useParams();
    const router = useRouter();
    const claimId = params.id as string;
    const [claim, setClaim] = useState<FullClaimDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!claimId) return;
        
        const storedClaimData = localStorage.getItem(claimId);
        if (!storedClaimData) {
            // Handle case where claim is not found, maybe redirect
            router.push('/dashboard');
            return;
        }

        const parsedData = JSON.parse(storedClaimData);
        
        // Run fraud detection
        const fraudResult = runFraudDetection(parsedData);
        const finalStatus = fraudResult.riskLevel === 'Green' ? 'Approved' : fraudResult.riskLevel === 'Yellow' ? 'Under Review' : 'Rejected';

        const updatedClaim = { ...parsedData, status: finalStatus };
        
        // Fetch fraud explanation from AI
        getFraudExplanation(
            fraudResult.riskLevel,
            fraudResult.fraudFlags,
            updatedClaim.damageAnalysis?.damageSummary || 'No damage summary available.',
            'OCR text not implemented in this MVP.', // Placeholder for OCR
            updatedClaim.incidentDetails.incidentDate ? new Date(updatedClaim.incidentDetails.incidentDate).toISOString().split('T')[0] : 'N/A',
            new Date(updatedClaim.createdAt).toISOString().split('T')[0],
            updatedClaim.incidentDetails.location
        ).then(explanationResult => {
            setClaim({
                ...updatedClaim,
                fraudReport: {
                    ...fraudResult,
                    explanation: 'error' in explanationResult ? explanationResult.error : explanationResult.explanation,
                },
            });
            setIsLoading(false);
        });

    }, [claimId, router]);
    
    if (isLoading || !claim) {
        return (
            <AppLayout>
                <PageHeader title="Loading Claim..." />
                <div className="space-y-4">
                    <Skeleton className="h-32 w-full" />
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="lg:col-span-4">
                            <CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader>
                            <CardContent><Skeleton className="h-40 w-full" /></CardContent>
                        </Card>
                         <Card className="lg:col-span-3">
                            <CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader>
                            <CardContent><Skeleton className="h-40 w-full" /></CardContent>
                        </Card>
                    </div>
                </div>
            </AppLayout>
        );
    }
    
    const { riskLevel } = claim.fraudReport!;
    const styles = riskLevelStyles[riskLevel];

    return (
        <AppLayout>
            <PageHeader title={`Claim #${claimId.replace('claim-', '')}`} description={`Submitted on ${format(new Date(claim.createdAt), 'PPP')}`} />
            
            <Card className={cn("border-2", 
                claim.status === 'Approved' && 'border-accent', 
                claim.status === 'Rejected' && 'border-destructive',
                claim.status === 'Under Review' && 'border-yellow-500'
                )}>
                <CardHeader className="flex-row items-center gap-4 space-y-0">
                    {claim.status === 'Approved' && <BadgeCheck className="h-10 w-10 text-accent" />}
                    {claim.status === 'Rejected' && <ThumbsDown className="h-10 w-10 text-destructive" />}
                    {claim.status === 'Under Review' && <AlertTriangle className="h-10 w-10 text-yellow-500" />}
                    <div>
                        <CardTitle className="text-2xl font-headline">Claim {claim.status}</CardTitle>
                        <CardDescription>
                            {claim.status === 'Approved' ? 'This claim has been automatically approved. A payout will be simulated shortly.' : 
                             claim.status === 'Rejected' ? 'This claim has been rejected due to high fraud risk.' :
                             'This claim requires further manual review.'
                            }
                        </CardDescription>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="grid auto-rows-max items-start gap-4 lg:col-span-4 lg:gap-8">
                     <Card>
                        <CardHeader>
                            <CardTitle>Incident Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm">
                           <div className="grid gap-3">
                                <div className="font-semibold">Description</div>
                                <p className="text-muted-foreground">{claim.incidentDetails.description}</p>
                           </div>
                           <Separator className="my-4" />
                            <div className="grid gap-3">
                                <div className="font-semibold">Date & Location</div>
                                <dl className="grid gap-3">
                                    <div className="flex items-center justify-between">
                                        <dt className="text-muted-foreground">Date</dt>
                                        <dd>{claim.incidentDetails.incidentDate ? format(new Date(claim.incidentDetails.incidentDate), 'PPP') : 'N/A'}</dd>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <dt className="text-muted-foreground">Location</dt>
                                        <dd>{claim.incidentDetails.location}</dd>
                                    </div>
                                </dl>
                           </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>AI Damage Analysis (SnapClaim)</CardTitle>
                             <CardDescription>Generated by analyzing uploaded photos.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {claim.damageAnalysis ? (
                                <div className="space-y-4">
                                     <div>
                                        <span className="text-sm font-semibold">Estimated Severity: </span>
                                        <Badge variant={claim.damageAnalysis.estimatedSeverity === 'Severe' || claim.damageAnalysis.estimatedSeverity === 'Totaled' ? 'destructive' : 'secondary'}>
                                            {claim.damageAnalysis.estimatedSeverity}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{claim.damageAnalysis.damageSummary}</p>
                                    {claim.damageAnalysis.affectedParts.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-semibold mb-2">Affected Parts:</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {claim.damageAnalysis.affectedParts.map(part => <Badge key={part} variant="outline">{part}</Badge>)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No damage analysis was performed.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className="grid auto-rows-max items-start gap-4 lg:col-span-3 lg:gap-8">
                    <Card className={cn("transition-all", styles.bg)}>
                        <CardHeader>
                             <CardTitle className={cn("flex items-center gap-2", styles.text)}>
                                {styles.icon}
                                <span>Fraud Risk: {claim.fraudReport.riskLevel}</span>
                            </CardTitle>
                            <CardDescription className={styles.text}>
                                ClaimGuard AI has assessed this claim's fraud potential.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                {claim.fraudReport.fraudFlags.length > 0 && (
                                     <AccordionItem value="flags">
                                        <AccordionTrigger>Detected Flags ({claim.fraudReport.fraudFlags.length})</AccordionTrigger>
                                        <AccordionContent>
                                            <ul className="list-disc pl-5 text-sm space-y-1">
                                                {claim.fraudReport.fraudFlags.map((flag, i) => <li key={i}>{flag}</li>)}
                                            </ul>
                                        </AccordionContent>
                                    </AccordionItem>
                                )}
                                <AccordionItem value="explanation">
                                    <AccordionTrigger className="flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-primary" />
                                        <span>AI Explanation</span>
                                    </AccordionTrigger>
                                    <AccordionContent className="text-sm">
                                        {claim.fraudReport.explanation}
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Uploaded Evidence</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="grid gap-3">
                                {claim.evidence.photos.map(p => (
                                     <li key={p.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 truncate">
                                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                            <span className="truncate text-sm">{p.name}</span>
                                        </div>
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={p.url} target="_blank" rel="noopener noreferrer">View</a>
                                        </Button>
                                    </li>
                                ))}
                                {claim.evidence.documents.map(d => (
                                     <li key={d.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 truncate">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <span className="truncate text-sm">{d.name}</span>
                                        </div>
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={d.url} target="_blank" rel="noopener noreferrer">View</a>
                                        </Button>
                                    </li>
                                ))}
                                {claim.evidence.photos.length === 0 && claim.evidence.documents.length === 0 && (
                                    <p className="text-sm text-muted-foreground">No evidence was uploaded for this claim.</p>
                                )}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
