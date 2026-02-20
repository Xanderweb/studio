import Link from 'next/link';
import { format } from 'date-fns';
import { Car, HeartPulse, Home, User, Briefcase, Ship, Leaf, Shield, LucideIcon } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockClaims } from '@/lib/mock-data';
import type { ClaimStatus, ClaimType } from '@/lib/types';
import * as Lucide from 'lucide-react';

const statusVariant: Record<ClaimStatus, 'approved' | 'pending' | 'review' | 'destructive'> = {
    'Approved': 'approved',
    'Pending': 'pending',
    'Under Review': 'review',
    'Rejected': 'destructive',
};

const claimTypeIcons: Record<string, keyof typeof Lucide> = {
    'Motor Insurance': 'Car',
    'Health Insurance': 'HeartPulse',
    'Property/Home Insurance': 'Home',
    'Life Insurance': 'User',
    'Business/Commercial Insurance': 'Briefcase',
    'Marine/Cargo Insurance': 'Ship',
    'Agricultural Insurance': 'Leaf',
    'Liability Insurance': 'Shield',
};

const Icon = ({ name, ...props }: { name: keyof typeof Lucide } & Lucide.LucideProps) => {
    const LucideIcon = Lucide[name] as Lucide.LucideIcon;
    return <LucideIcon {...props} />;
};


export default function Dashboard() {
  return (
    <AppLayout>
      <PageHeader
        title="Dashboard"
        description="Review your recent insurance claims."
      >
        <Button variant="magnetic" size="lg" asChild>
            <Link href="/new-claim">File New Claim</Link>
        </Button>
      </PageHeader>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mockClaims.map((claim) => (
            <Card key={claim.id} className="claim-card holographic-card h-full flex flex-col">
              <CardHeader>
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-3">
                         <div className="p-2 bg-glass-dark rounded-full border border-glass-border">
                            <Icon name={claimTypeIcons[claim.claimType] || 'Shield'} className="w-5 h-5 text-electric-cyan" />
                         </div>
                        <div>
                             <CardTitle className="text-lg font-semibold font-headline">Claim #{claim.id.split('_')[1]}</CardTitle>
                             <CardDescription className="text-xs text-muted-foreground">{claim.claimType}</CardDescription>
                        </div>
                    </div>
                    <Badge variant={statusVariant[claim.status]}>{claim.status}</Badge>
                  </div>
              </CardHeader>
              <CardContent className="flex-grow">
                  <p className="text-sm text-text-secondary line-clamp-2">{claim.description}</p>
                   <p className="text-xs text-text-tertiary mt-2">{claim.incidentDate ? format(claim.incidentDate, 'PPP') : 'N/A'}</p>
              </CardContent>
              <div className="p-6 pt-0">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/claim/${claim.id}`}>View Details</Link>
                  </Button>
              </div>
            </Card>
        ))}
      </div>
    </AppLayout>
  );
}