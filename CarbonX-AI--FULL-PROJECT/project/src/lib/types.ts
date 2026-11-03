export type VerificationStatus = 'verified' | 'review' | 'suspicious' | 'rejected';
export type EcosystemType = 'Mangrove' | 'Seagrass' | 'Salt Marsh' | 'Kelp Forest';
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type PageKey =
  | 'overview'
  | 'projects'
  | 'project-details'
  | 'ai-verification'
  | 'geo-evidence'
  | 'carbon-analysis'
  | 'risk'
  | 'simulator'
  | 'verifier'
  | 'blockchain'
  | 'analytics'
  | 'reports'
  | 'settings';

export type Role = 'Project Owner' | 'Verifier' | 'Auditor';

export interface ProjectMarker {
  id: string;
  name: string;
  x: number;
  y: number;
  status: VerificationStatus;
  confidence: number;
}

export interface Project {
  id: string;
  name: string;
  organization: string;
  location: string;
  ecosystem: EcosystemType;
  claimedArea: number;
  evidenceArea: number;
  carbonBenefit: number;
  estimatedCarbon: number;
  status: VerificationStatus;
  aiConfidence: number;
  startDate: string;
  endDate: string;
  description: string;
  lat: number;
  lng: number;
  lastUpdated: string;
  evidenceFiles: EvidenceFile[];
  anomalies: Anomaly[];
  history: VerificationEvent[];
  blockchainHash: string;
  txRef: string;
  verifiedAt: string | null;
  verifier: string | null;
}

export interface EvidenceFile {
  id: string;
  name: string;
  type: 'satellite' | 'document' | 'image' | 'report';
  size: string;
  uploadedAt: string;
  status: 'consistent' | 'inconsistent' | 'pending';
}

export interface Anomaly {
  id: string;
  type: string;
  severity: Severity;
  confidence: number;
  detectedAt: string;
  status: 'open' | 'reviewing' | 'resolved';
  description: string;
}

export interface VerificationEvent {
  id: string;
  stage: string;
  actor: string;
  timestamp: string;
  status: 'complete' | 'pending' | 'flagged';
  note: string;
}

export interface AuditRecord {
  id: string;
  projectId: string;
  projectName: string;
  verificationId: string;
  hash: string;
  timestamp: string;
  status: 'verified' | 'pending' | 'flagged';
  txRef: string;
  recordType: string;
}

export interface AlertItem {
  id: string;
  type: string;
  message: string;
  severity: Severity;
  projectId: string;
  timestamp: string;
}
