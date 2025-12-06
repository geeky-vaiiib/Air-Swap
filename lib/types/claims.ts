/**
 * Claims Types
 */

export type ClaimStatus = "pending" | "verified" | "rejected";

export interface Claim {
  id: string;
  user_id: string;
  location: string;
  polygon: any; // GeoJSON polygon
  evidence_cids?: string[]; // IPFS CIDs for evidence
  ndvi_before?: any; // NDVI data before
  ndvi_after?: any; // NDVI data after
  ndvi_delta?: number; // Percentage change
  area?: number; // Area in hectares
  status: ClaimStatus;
  credits?: number; // Credits earned (only for verified claims)
  verified_by?: string; // Verifier user_id
  verified_at?: string; // Timestamp
  created_at: string;
  updated_at: string;
}

export interface ClaimInput {
  user_id: string;
  location: string;
  polygon: any;
  evidence_cids?: string[];
  ndvi_before?: any;
  ndvi_after?: any;
  ndvi_delta?: number;
  area?: number;
}

export interface VerifyClaimInput {
  approved: boolean;
  credits?: number;
}

export interface ClaimResponse {
  success: boolean;
  data?: Claim | Claim[] | DemoClaim | DemoClaim[] | any;
  error?: string;
  message?: string;
}

// Demo claim type (simplified for UI)
export interface DemoClaim {
  id: string;
  location: string;
  area: string;
  status: ClaimStatus;
  creditsEarned: number;
  date: string;
  ndviDelta?: number;
  credits?: number;
}

