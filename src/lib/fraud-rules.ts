import { differenceInDays, isAfter } from 'date-fns';
import type { FullClaimDetails, RiskLevel } from './types';

// ==================================
// Type-Specific Fraud Modules
// ==================================

function runMotorFraudRules(claimDetails: FullClaimDetails, currentScore: number, flags: string[]): { score: number, newFlags: string[] } {
  let riskScore = currentScore;
  const fraudFlags = [...flags];

  // Rule: Suspicious keywords for motor insurance
  const suspiciousKeywords = ['race', 'track', 'off-road competition', 'stunt'];
  if (suspiciousKeywords.some(keyword => claimDetails.incidentDetails.description.toLowerCase().includes(keyword))) {
    riskScore += 40;
    fraudFlags.push('Motor-Specific: Description contains keywords related to non-covered activities (e.g., racing).');
  }

  // Rule: Check for plate verification (mock)
  if (evidence.documents.length === 0 && !claimDetails.incidentDetails.description.toLowerCase().includes('plate number')) {
     riskScore += 15;
     fraudFlags.push('Motor-Specific: Vehicle license plate information appears to be missing from documents and description.');
  }

  return { score: riskScore, newFlags: fraudFlags };
}

function runHealthFraudRules(claimDetails: FullClaimDetails, currentScore: number, flags: string[]): { score: number, newFlags: string[] } {
  let riskScore = currentScore;
  const fraudFlags = [...flags];
  
  // Rule: High-cost treatment for minor incident
  const minorKeywords = ['check-up', 'routine', 'minor pain'];
  const expensiveKeywords = ['surgery', 'emergency room', 'intensive care'];
  if (minorKeywords.some(k => claimDetails.incidentDetails.description.toLowerCase().includes(k)) && expensiveKeywords.some(k => claimDetails.incidentDetails.description.toLowerCase().includes(k))) {
    riskScore += 50;
    fraudFlags.push('Health-Specific: Description mentions both minor issues and high-cost procedures, which is unusual.');
  }

  return { score: riskScore, newFlags: fraudFlags };
}

// Add more placeholder functions for other types as needed
function runPropertyFraudRules(claimDetails: FullClaimDetails, currentScore: number, flags: string[]): { score: number, newFlags: string[] } { return { score: currentScore, newFlags: flags }; }
function runLifeFraudRules(claimDetails: FullClaimDetails, currentScore: number, flags: string[]): { score: number, newFlags: string[] } { return { score: currentScore, newFlags: flags }; }
// ...etc.

// ==================================
// Core Fraud Detection Engine
// ==================================

export function runFraudDetection(claimDetails: FullClaimDetails): { riskScore: number; riskLevel: RiskLevel; fraudFlags: string[] } {
  let riskScore = 0;
  let fraudFlags: string[] = [];

  const { incidentDetails, evidence, createdAt, claimType } = claimDetails;
  const incidentDate = incidentDetails.incidentDate;

  // ==================================
  // 1. General Fraud Detection Model
  // ==================================

  // Rule: Time inconsistency (claim filed long after incident)
  if (incidentDate) {
    const daysBetween = differenceInDays(createdAt, incidentDate);
    if (daysBetween > 30) {
      riskScore += 40;
      fraudFlags.push(`General: Claim filed ${daysBetween} days after the incident.`);
    } else if (daysBetween > 7) {
      riskScore += 15;
    }
  } else {
    riskScore += 25;
    fraudFlags.push('General: The date of the incident was not provided.');
  }

  // Rule: Incident date is in the future
  if (incidentDate && isAfter(incidentDate, new Date())) {
      riskScore += 80;
      fraudFlags.push('General: The incident date is set in the future.');
  }

  // Rule: Missing evidence
  if (evidence.photos.length === 0) {
    riskScore += 30;
    fraudFlags.push('General: No photos were uploaded to substantiate the claim.');
  }
  if (evidence.documents.length === 0) {
    riskScore += 15;
    fraudFlags.push('General: No supporting documents were provided.');
  }
  
  // Rule: Vague description
  if (incidentDetails.description.length < 50) {
    riskScore += 10;
    fraudFlags.push('General: The incident description is very brief and may lack detail.');
  }

  // ==================================
  // 2. Type-Specific Fraud Modules
  // ==================================
  let specificResult = { score: riskScore, newFlags: fraudFlags };

  switch (claimType) {
    case 'Motor Insurance':
      specificResult = runMotorFraudRules(claimDetails, riskScore, fraudFlags);
      break;
    case 'Health Insurance':
      specificResult = runHealthFraudRules(claimDetails, riskScore, fraudFlags);
      break;
    case 'Property/Home Insurance':
      specificResult = runPropertyFraudRules(claimDetails, riskScore, fraudFlags);
       break;
    case 'Life Insurance':
       specificResult = runLifeFraudRules(claimDetails, riskScore, fraudFlags);
       break;
    // Add cases for other types...
    default:
      // No specific rules for this type yet
      break;
  }
  
  riskScore = specificResult.score;
  fraudFlags = specificResult.newFlags;


  // ==================================
  // Final Risk Scoring
  // ==================================
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