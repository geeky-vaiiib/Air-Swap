# Security Audit Plan & Bug Bounty Program

## 1. Project Overview
Project: OxygenCredits (AirSwap Growth)
Description: A platform for verifying vegetation growth and issuing oxygen credits on-chain.

## 2. Audit Goals
- Verify the integrity of `OxygenCredits.sol` smart contract.
- Ensure the Claims API correctly validates user inputs and prevents double-spending or unauthorized credit issuance.
- Verify access controls on Verifier and Admin roles.
- Prevent re-entrancy, overflow/underflow, and other common vulnerabilities.

## 3. Automated Security Checks
We are currently running automated analysis tools to catch low-hanging fruit:

*   **Slither**: Static analysis framework for Solidity. (Status: Running)
*   **Mythril**: Security analysis tool for EVM bytecode. (Recommended next step)
*   **Echidna**: Property-based fuzzing. (Recommended for deeper testing)

## 4. Professional Audit Strategy
We recommend engaging at least one reputable audit firm before mainnet deployment.

### Recommended Firms:
1.  **OpenZeppelin**:
    *   *Pros*: Authors of the libraries we use, gold standard in security.
    *   *Cons*: High cost, long wait times.
2.  **CertiK**:
    *   *Pros*: Widely recognized, "Skynet" monitoring.
    *   *Cons*: High volume, mixed reviews on depth vs breadth.
3.  **Trail of Bits**:
    *   *Pros*: Excellent reputation, deep research.
    *   *Cons*: Very expensive.
4.  **Halborn**:
    *   *Pros*: Strong focus on penetration testing and offensive security.
    *   *Cons*: Emerging player compared to OZ.
5.  **Quantstamp**:
    *   *Pros*: Good balance of speed and quality.

### Phased Approach:
1.  **Internal Review**: Conducted by team (current phase).
2.  **Automated Analysis**: Resolve all Slither/Mythril warnings.
3.  **Preliminary Audit**: Engage a smaller firm or independent researcher (e.g., via Sherlock or Code4rena) for a contest.
4.  **Full Audit**: Engage a top-tier firm for final sign-off.

## 5. Bug Bounty Program
Post-audit, we will launch a bug bounty program to incentivize continuous security research.

### Platform
*   **Immunefi**: Web3 focused, high visibility among whitehats. (Recommended)
*   **HackerOne**: General purpose, broader audience.

### Scope
*   **Smart Contracts**: `OxygenCredits.sol`, `Marketplace.sol` (if stored on-chain).
*   **API**: `/api/claims/*`, `/api/credits/*`, `/api/marketplace/*`.
*   **Frontend**: `dashboard/*` (low priority).

### Reward Tiers (Example)
*   **Critical ($50,000+)**: Direct theft of funds, unauthorized minting, permanent freezing of funds.
*   **High ($10,000 - $50,000)**: Temporary freezing, griefing attacks, manipulation of rewards.
*   **Medium ($2,000 - $10,000)**: API bypass, information leakage, partial disruption.
*   **Low ($500 - $2,000)**: UX bugs with security implications, non-critical failures.

## 6. Preparation Checklist
- [x] Remove all demo data.
- [x] Remove `isDemo` logic from production code.
- [x] Run `npm run build` to verify type safety.
- [ ] Run Slither and fix reported issues.
- [ ] Freeze code (create a release branch).
- [ ] Prepare documentation for auditors.
