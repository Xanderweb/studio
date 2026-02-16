import Link from 'next/link';
import { format } from 'date-fns';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockClaims } from '@/lib/mock-data';
import type { ClaimStatus } from '@/lib/types';

const statusVariant: Record<ClaimStatus, 'approved' | 'pending' | 'review' | 'destructive'> = {
    'Approved': 'approved',
    'Pending': 'pending',
    'Under Review': 'review',
    'Rejected': 'destructive',
};


export default function Dashboard() {
  return (
    <AppLayout>
      <PageHeader
        title="Dashboard"
        description="Review your recent insurance claims."
      >
        <Button variant="primary" size="lg" asChild>
            <Link href="/new-claim">File New Claim</Link>
        </Button>
      </PageHeader>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mockClaims.map((claim) => (
            <Card key={claim.id} className="claim-card h-full flex flex-col">
              <CardHeader>
                  <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-lg font-semibold font-headline">Claim #{claim.id.split('_')[1]}</CardTitle>
                      <Badge variant={statusVariant[claim.status]}>{claim.status}</Badge>
                  </div>
                  <CardDescription className="text-xs text-muted-foreground">{claim.incidentDate ? format(claim.incidentDate, 'PPP') : 'N/A'}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-2">{claim.description}</p>
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
