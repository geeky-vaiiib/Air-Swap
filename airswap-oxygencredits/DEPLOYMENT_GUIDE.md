# OxygenCredits Contract Deployment Guide

## ✅ Pre-Deployment Checklist

### 1. **Wallet Setup**
- [ ] MetaMask or compatible wallet installed
- [ ] Wallet funded with MATIC tokens for Polygon Amoy testnet
- [ ] Get testnet MATIC from: https://faucet.polygon.technology/

### 2. **Network Configuration**
- [ ] Network: Polygon Amoy (Mumbai is deprecated)
- [ ] Chain ID: 80002
- [ ] RPC URL: https://rpc-amoy.polygon.technology/
- [ ] Block Explorer: https://amoy.polygonscan.com/

### 3. **Contract Verification**
- [ ] Contract compiled successfully ✅
- [ ] All extensions detected:
  - ERC1155
  - ERC1155Supply
  - ERC1155Burnable
  - ERC1155Enumerable
  - ERC1155Mintable
  - ERC1155BatchMintable
  - ERC1155SignatureMintable
  - Royalty
  - PrimarySale
  - Permissions
  - PermissionsEnumerable
  - ContractMetadata
  - Ownable
  - Fallback

---

## 🚀 Deployment Steps

### Step 1: Deploy Contract
```bash
cd airswap-oxygencredits
npm run deploy
```

### Step 2: During Deployment
The CLI will prompt you for:

1. **Select Network**: Choose "Polygon Amoy" or enter custom RPC
2. **Connect Wallet**: Scan QR code or follow CLI instructions
3. **Contract Parameters**:
   - `_defaultAdmin`: Your wallet address (admin)
   - `_name`: "AirSwap Oxygen Credits"
   - `_symbol`: "OXYCRED"
   - `_royaltyRecipient`: Your wallet address
   - `_royaltyBps`: 250 (2.5% royalty)
   - `_primarySaleRecipient`: Your wallet address

4. **Confirm Transaction**: Approve gas fee in wallet

### Step 3: Save Deployment Info
After successful deployment, save:
- ✅ Contract Address
- ✅ Transaction Hash
- ✅ Block Explorer Link
- ✅ ABI (auto-generated in `contracts/OxygenCredits.json`)

---

## 🔑 Post-Deployment Setup

### 1. Grant Verifier Role
After deployment, grant verifier role to authorized addresses:

```javascript
// Using thirdweb SDK
const contract = await sdk.getContract("YOUR_CONTRACT_ADDRESS");
await contract.call("grantVerifierRole", ["0xVERIFIER_ADDRESS"]);
```

### 2. Test Minting
```javascript
// Mint test credits
await contract.call("mintCredits", [
  "0xRECIPIENT_ADDRESS",
  100, // amount
  1500, // ndviDelta (1.5 scaled by 1000)
  "claim_123abc", // claimId
  '{"type":"Point","coordinates":[-73.935242,40.730610]}', // location
  "ipfs://QmTest..." // metadataURI
]);
```

### 3. Verify on Block Explorer
- Go to: https://amoy.polygonscan.com/address/YOUR_CONTRACT_ADDRESS
- Verify contract is deployed
- Check initial transactions

---

## 📝 Integration Checklist

### Frontend Integration
- [ ] Create `lib/blockchain/oxygenCredits.ts`
- [ ] Initialize thirdweb SDK with contract address
- [ ] Implement `mintCredits()` function
- [ ] Implement `getCredits()` function
- [ ] Implement `burnCredits()` function
- [ ] Implement `getCreditMetadata()` function

### Backend Integration
- [ ] Create `lib/blockchain/server/oxygenCreditsServer.ts`
- [ ] Store contract address in environment variables
- [ ] Add verifier role checking before minting
- [ ] Update claim verification workflow to mint credits
- [ ] Add IPFS metadata upload functionality

### Environment Variables
Add to `.env.local`:
```env
# Blockchain
NEXT_PUBLIC_OXYGEN_CREDITS_CONTRACT=0xYOUR_CONTRACT_ADDRESS
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id
THIRDWEB_SECRET_KEY=your_secret_key
POLYGON_AMOY_RPC=https://rpc-amoy.polygon.technology/

# IPFS (for metadata storage)
THIRDWEB_STORAGE_SECRET=your_storage_secret
```

---

## 🧪 Testing Plan

### 1. **Role Management Testing**
- [ ] Verify admin can grant/revoke verifier role
- [ ] Verify only verifiers can mint credits
- [ ] Verify non-verifiers cannot mint

### 2. **Minting Testing**
- [ ] Mint credits with valid parameters
- [ ] Verify credits appear in recipient's balance
- [ ] Verify metadata is stored correctly
- [ ] Check `CreditsMinted` event emission

### 3. **Burning Testing**
- [ ] Burn credits from owned balance
- [ ] Verify balance decreases
- [ ] Check `CreditsBurned` event emission
- [ ] Verify cannot burn more than owned

### 4. **Metadata Testing**
- [ ] Retrieve metadata for valid token ID
- [ ] Verify NDVI delta is correct
- [ ] Verify claim ID reference
- [ ] Verify location data
- [ ] Verify verification timestamp

---

## 🔒 Security Considerations

1. **Admin Key Security**
   - Store admin private key securely (hardware wallet recommended)
   - Never commit private keys to git
   - Use environment variables for production

2. **Verifier Role Management**
   - Only grant verifier role to trusted addresses
   - Regularly audit verifier list
   - Implement off-chain verification before minting

3. **Rate Limiting**
   - Implement backend rate limiting for mint requests
   - Monitor for suspicious minting patterns
   - Set up alerts for large mint operations

4. **Contract Upgradeability**
   - This contract is NOT upgradeable (for security)
   - Any changes require new deployment
   - Plan migration strategy if needed

---

## 📊 Monitoring

### On-Chain Monitoring
- Monitor contract events via Polygonscan
- Set up alerts for large transfers
- Track total supply growth

### Backend Integration
- Log all mint/burn operations
- Store blockchain transaction hashes in MongoDB
- Monitor gas costs

### Example Logging
```typescript
// In your claim verification API
await logBlockchainOperation({
  type: 'MINT_CREDITS',
  claimId: claim._id,
  tokenId: result.tokenId,
  amount: credits,
  txHash: result.transactionHash,
  gasUsed: result.receipt.gasUsed,
  timestamp: new Date()
});
```

---

## 🆘 Troubleshooting

### Deployment Fails
- **Insufficient funds**: Get more testnet MATIC
- **Network issues**: Try different RPC endpoint
- **Contract too large**: Optimize contract size (unlikely with current code)

### Minting Fails
- **Not verifier**: Grant verifier role first
- **Invalid parameters**: Check all required fields
- **Gas too low**: Increase gas limit

### Integration Issues
- **Wrong network**: Ensure using Polygon Amoy (Chain ID: 80002)
- **ABI mismatch**: Regenerate ABI after any contract changes
- **Client ID issues**: Get thirdweb client ID from dashboard

---

## 📚 Resources

- **thirdweb CLI Docs**: https://portal.thirdweb.com/cli
- **Polygon Amoy Docs**: https://docs.polygon.technology/pos/
- **Contract Standards**: https://portal.thirdweb.com/contracts
- **SDK Documentation**: https://portal.thirdweb.com/typescript/v5

---

## ✨ Next Steps After Deployment

1. **Update Frontend**
   - Add wallet connection
   - Display user's oxygen credits
   - Show credit metadata on dashboard

2. **Update Claim Verification Flow**
   - Auto-mint credits after NDVI verification
   - Store blockchain transaction hash in MongoDB
   - Display blockchain confirmation to users

3. **Create Marketplace Integration**
   - List credits for sale
   - Enable P2P transfers
   - Show transaction history

4. **Analytics Dashboard**
   - Total credits minted
   - Credits by region
   - Average NDVI improvement
   - Top credit holders

---

**Ready to deploy?** Run `npm run deploy` and follow the prompts! 🚀
