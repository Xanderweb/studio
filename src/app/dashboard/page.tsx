import Link from 'next/link';
import { format } from 'date-fns';
import { MoreHorizontal } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { mockClaims } from '@/lib/mock-data';
import type { ClaimStatus } from '@/lib/types';

const statusVariant: Record<ClaimStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    'Approved': 'default',
    'Pending': 'secondary',
    'Under Review': 'outline',
    'Rejected': 'destructive',
};


export default function Dashboard() {
  return (
    <AppLayout>
      <PageHeader
        title="Dashboard"
        description="Review your recent insurance claims."
      />
      <Card>
        <CardHeader>
          <CardTitle>Your Claims</CardTitle>
          <CardDescription>
            An overview of all your submitted claims.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Claim ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">
                  Incident Date
                </TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockClaims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell className="font-medium">
                    <Link href={`/claim/${claim.id}`} className="hover:underline">
                      #{claim.id.split('_')[1]}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[claim.status]}>{claim.status}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {claim.incidentDate ? format(claim.incidentDate, 'PPP') : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <Link href={`/claim/${claim.id}`}>View Details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Contact Support</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
