import { differenceInDays, isAfter } from 'date-fns';
import type { FullClaimDetails, RiskLevel } from './types';

export function runFraudDetection(claimDetails: FullClaimDetails): { riskScore: number; riskLevel: RiskLevel; fraudFlags: string[] } {
  let riskScore = 0;
  const fraudFlags: string[] = [];

  const { incidentDetails, evidence, createdAt } = claimDetails;
  const incidentDate = incidentDetails.incidentDate;

  // Rule 1: Time inconsistency (claim filed long after incident)
  if (incidentDate) {
    const daysBetween = differenceInDays(createdAt, incidentDate);
    if (daysBetween > 30) {
      riskScore += 40;
      fraudFlags.push(`Delayed Reporting: Claim filed ${daysBetween} days after the incident.`);
    } else if (daysBetween > 7) {
      riskScore += 15;
    }
  } else {
    // No incident date is suspicious
    riskScore += 25;
    fraudFlags.push('Missing Information: The date of the incident was not provided.');
  }

  // Rule 2: Incident date is in the future
  if (incidentDate && isAfter(incidentDate, new Date())) {
      riskScore += 80;
      fraudFlags.push('Invalid Date: The incident date is set in the future.');
  }

  // Rule 3: Missing evidence
  if (evidence.photos.length === 0) {
    riskScore += 50;
    fraudFlags.push('Missing Evidence: No photos were uploaded to substantiate the claim.');
  }
  if (evidence.documents.length === 0) {
    riskScore += 25;
    fraudFlags.push('Missing Evidence: No supporting documents (e.g., police report) were provided.');
  }
  
  // Rule 4: Vague description
  if (incidentDetails.description.length < 50) {
    riskScore += 10;
    fraudFlags.push('Vague Description: The incident description is very brief and may lack detail.');
  }

  // Cap the score
  riskScore = Math.min(riskScore, 100);

  let riskLevel: RiskLevel;
  if (riskScore >= 75) {
    riskLevel = 'Red';
  } else if (riskScore >= 40) {
    riskLevel = 'Yellow';
  } else {
    riskLevel = 'Green';
  }

  return { riskScore, riskLevel, fraudFlags };
}
