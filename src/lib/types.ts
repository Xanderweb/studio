import type { SnapClaimDamageSummaryOutput } from '@/ai/flows/snap-claim-damage-summary';

export type ClaimStatus = 'Pending' | 'Approved' | 'Rejected' | 'Under Review';
export type RiskLevel = 'Green' | 'Yellow' | 'Red';

export type Claim = {
  id: string;
  userId: string;
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
