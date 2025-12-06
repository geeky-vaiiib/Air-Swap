/**
 * Frontend Integration for OxygenCredits Smart Contract
 * 
 * This module provides client-side functions to interact with the
 * OxygenCredits ERC-1155 contract deployed on Polygon Amoy testnet.
 * 
 * @requires @thirdweb-dev/react
 * @requires @thirdweb-dev/sdk
 */

import { ThirdwebSDK } from "@thirdweb-dev/sdk";

// Contract configuration
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_OXYGEN_CREDITS_CONTRACT || "";

// Types
export interface CreditMetadata {
  ndviDelta: string;
  claimId: string;
  location: string;
  verificationDate: string;
  metadataURI: string;
}

export interface MintCreditsParams {
  recipient: string;
  amount: number;
  ndviDelta: number;
  claimId: string;
  location: string;
  metadataURI: string;
}

export interface CreditBalance {
  tokenId: string;
  balance: string;
  metadata: CreditMetadata;
}

/**
 * Initialize the OxygenCredits contract instance
 * @param signer - The wallet signer (from useSDK or useContract)
 * @returns Contract instance
 */
export const getOxygenCreditsContract = async (sdk: ThirdwebSDK) => {
  if (!CONTRACT_ADDRESS) {
    throw new Error("Contract address not configured. Set NEXT_PUBLIC_OXYGEN_CREDITS_CONTRACT in .env.local");
  }
  
  return await sdk.getContract(CONTRACT_ADDRESS);
};

/**
 * Mint new oxygen credits (verifier role required)
 * @param sdk - ThirdwebSDK instance
 * @param params - Minting parameters
 * @returns Transaction result with token ID
 */
export const mintOxygenCredits = async (
  sdk: ThirdwebSDK,
  params: MintCreditsParams
) => {
  try {
    const contract = await getOxygenCreditsContract(sdk);
    
    const result = await contract.call("mintCredits", [
      params.recipient,
      params.amount,
      params.ndviDelta,
      params.claimId,
      params.location,
      params.metadataURI,
    ]);
    
    // Extract token ID from events
    const event = result.receipt.events?.find(
      (e: any) => e.event === "CreditsMinted"
    );
    
    return {
      success: true,
      tokenId: event?.args?.tokenId?.toString(),
      transactionHash: result.receipt.transactionHash,
      receipt: result.receipt,
    };
  } catch (error: any) {
    console.error("Error minting credits:", error);
    throw new Error(error.message || "Failed to mint credits");
  }
};

/**
 * Get user's oxygen credit balances
 * @param sdk - ThirdwebSDK instance
 * @param address - User wallet address
 * @returns Array of credit balances with metadata
 */
export const getUserCredits = async (
  sdk: ThirdwebSDK,
  address: string
): Promise<CreditBalance[]> => {
  try {
    const contract = await getOxygenCreditsContract(sdk);
    
    // Get all owned tokens
    const ownedNFTs = await contract.erc1155.getOwned(address);
    
    // Fetch metadata for each token
    const creditsWithMetadata = await Promise.all(
      ownedNFTs.map(async (nft) => {
        const metadata = await contract.call("getCreditMetadata", [
          nft.metadata.id,
        ]);
        
        return {
          tokenId: nft.metadata.id,
          balance: nft.quantityOwned || "0",
          metadata: {
            ndviDelta: metadata.ndviDelta.toString(),
            claimId: metadata.claimId,
            location: metadata.location,
            verificationDate: metadata.verificationDate.toString(),
            metadataURI: metadata.metadataURI,
          },
        };
      })
    );
    
    return creditsWithMetadata;
  } catch (error: any) {
    console.error("Error fetching user credits:", error);
    throw new Error(error.message || "Failed to fetch user credits");
  }
};

/**
 * Get metadata for a specific credit token
 * @param sdk - ThirdwebSDK instance
 * @param tokenId - Token ID to query
 * @returns Credit metadata
 */
export const getCreditMetadata = async (
  sdk: ThirdwebSDK,
  tokenId: string
): Promise<CreditMetadata> => {
  try {
    const contract = await getOxygenCreditsContract(sdk);
    
    const metadata = await contract.call("getCreditMetadata", [tokenId]);
    
    return {
      ndviDelta: metadata.ndviDelta.toString(),
      claimId: metadata.claimId,
      location: metadata.location,
      verificationDate: metadata.verificationDate.toString(),
      metadataURI: metadata.metadataURI,
    };
  } catch (error: any) {
    console.error("Error fetching credit metadata:", error);
    throw new Error(error.message || "Failed to fetch credit metadata");
  }
};

/**
 * Burn oxygen credits
 * @param sdk - ThirdwebSDK instance
 * @param tokenId - Token ID to burn
 * @param amount - Amount to burn
 * @returns Transaction result
 */
export const burnOxygenCredits = async (
  sdk: ThirdwebSDK,
  tokenId: string,
  amount: number
) => {
  try {
    const contract = await getOxygenCreditsContract(sdk);
    
    const result = await contract.call("burnCredits", [tokenId, amount]);
    
    return {
      success: true,
      transactionHash: result.receipt.transactionHash,
      receipt: result.receipt,
    };
  } catch (error: any) {
    console.error("Error burning credits:", error);
    throw new Error(error.message || "Failed to burn credits");
  }
};

/**
 * Check if an address has verifier role
 * @param sdk - ThirdwebSDK instance
 * @param address - Address to check
 * @returns True if address has verifier role
 */
export const isVerifier = async (
  sdk: ThirdwebSDK,
  address: string
): Promise<boolean> => {
  try {
    const contract = await getOxygenCreditsContract(sdk);
    
    const VERIFIER_ROLE = await contract.call("VERIFIER_ROLE");
    const hasRole = await contract.call("hasRole", [VERIFIER_ROLE, address]);
    
    return hasRole;
  } catch (error: any) {
    console.error("Error checking verifier role:", error);
    return false;
  }
};

/**
 * Grant verifier role to an address (admin only)
 * @param sdk - ThirdwebSDK instance
 * @param verifierAddress - Address to grant verifier role
 * @returns Transaction result
 */
export const grantVerifierRole = async (
  sdk: ThirdwebSDK,
  verifierAddress: string
) => {
  try {
    const contract = await getOxygenCreditsContract(sdk);
    
    const result = await contract.call("grantVerifierRole", [verifierAddress]);
    
    return {
      success: true,
      transactionHash: result.receipt.transactionHash,
      receipt: result.receipt,
    };
  } catch (error: any) {
    console.error("Error granting verifier role:", error);
    throw new Error(error.message || "Failed to grant verifier role");
  }
};

/**
 * Revoke verifier role from an address (admin only)
 * @param sdk - ThirdwebSDK instance
 * @param verifierAddress - Address to revoke verifier role from
 * @returns Transaction result
 */
export const revokeVerifierRole = async (
  sdk: ThirdwebSDK,
  verifierAddress: string
) => {
  try {
    const contract = await getOxygenCreditsContract(sdk);
    
    const result = await contract.call("revokeVerifierRole", [verifierAddress]);
    
    return {
      success: true,
      transactionHash: result.receipt.transactionHash,
      receipt: result.receipt,
    };
  } catch (error: any) {
    console.error("Error revoking verifier role:", error);
    throw new Error(error.message || "Failed to revoke verifier role");
  }
};

/**
 * Get total supply of a specific credit token
 * @param sdk - ThirdwebSDK instance
 * @param tokenId - Token ID to query
 * @returns Total supply
 */
export const getCreditSupply = async (
  sdk: ThirdwebSDK,
  tokenId: string
): Promise<string> => {
  try {
    const contract = await getOxygenCreditsContract(sdk);
    
    const supply = await contract.erc1155.totalSupply(tokenId);
    
    return supply.toString();
  } catch (error: any) {
    console.error("Error fetching credit supply:", error);
    throw new Error(error.message || "Failed to fetch credit supply");
  }
};

/**
 * Transfer oxygen credits to another address
 * @param sdk - ThirdwebSDK instance
 * @param to - Recipient address
 * @param tokenId - Token ID to transfer
 * @param amount - Amount to transfer
 * @returns Transaction result
 */
export const transferOxygenCredits = async (
  sdk: ThirdwebSDK,
  to: string,
  tokenId: string,
  amount: number
) => {
  try {
    const contract = await getOxygenCreditsContract(sdk);
    
    const result = await contract.erc1155.transfer(to, tokenId, amount);
    
    return {
      success: true,
      transactionHash: result.receipt.transactionHash,
      receipt: result.receipt,
    };
  } catch (error: any) {
    console.error("Error transferring credits:", error);
    throw new Error(error.message || "Failed to transfer credits");
  }
};

/**
 * Get balance of a specific credit token for an address
 * @param sdk - ThirdwebSDK instance
 * @param address - Address to check
 * @param tokenId - Token ID to query
 * @returns Balance
 */
export const getCreditBalance = async (
  sdk: ThirdwebSDK,
  address: string,
  tokenId: string
): Promise<string> => {
  try {
    const contract = await getOxygenCreditsContract(sdk);
    
    const balance = await contract.erc1155.balanceOf(address, tokenId);
    
    return balance.toString();
  } catch (error: any) {
    console.error("Error fetching credit balance:", error);
    throw new Error(error.message || "Failed to fetch credit balance");
  }
};

// Export contract address for reference
export { CONTRACT_ADDRESS };
