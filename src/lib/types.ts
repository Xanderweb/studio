import type { LucideIcon } from 'lucide-react';
import type { SnapClaimDamageSummaryOutput } from '@/ai/flows/snap-claim-damage-summary';

export type ClaimStatus = 'Pending' | 'Approved' | 'Rejected' | 'Under Review';
export type RiskLevel = 'Green' | 'Yellow' | 'Red';

export const CLAIM_TYPES = [
  { name: 'Motor Insurance', icon: 'Car' },
  { name: 'Health Insurance', icon: 'HeartPulse' },
  { name: 'Property/Home Insurance', icon: 'Home' },
  { name: 'Life Insurance', icon: 'User' },
  { name: 'Business/Commercial Insurance', icon: 'Briefcase' },
  { name: 'Marine/Cargo Insurance', icon: 'Ship' },
  { name: 'Agricultural Insurance', icon: 'Leaf' },
  { name: 'Liability Insurance', icon: 'Shield' },
] as const;

export type ClaimType = (typeof CLAIM_TYPES)[number]['name'];

export type Claim = {
  id: string;
  userId: string;
  claimType: ClaimType;
  description: string;
  incidentDate: Date | undefined;
  location: string;
  status: ClaimStatus;
  riskScore: number;
  createdAt: Date;
};

export type Evidence = {
  id: string;
  claimId: string;
  file: File;
  fileUrl: string; // Using data URL for client-side MVP
  fileType: 'image' | 'document';
  uploadedAt: Date;
};

export type DamageAnalysis = SnapClaimDamageSummaryOutput;

export type FraudReport = {
  riskLevel: RiskLevel;
  fraudFlags: string[];
  explanation: string;
};

export type FullClaimDetails = {
  id: string;
  claimType: ClaimType;
  incidentDetails: {
    description: string;
    incidentDate?: Date;
    location: string;
  };
  evidence: {
    photos: { name: string, url: string }[];
    documents: { name: string, url: string }[];
  };
  damageAnalysis?: DamageAnalysis;
  fraudReport?: FraudReport;
  status: ClaimStatus;
  createdAt: Date;
};