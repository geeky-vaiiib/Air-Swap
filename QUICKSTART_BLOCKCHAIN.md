# 🚀 Quick Start: Deploy & Integrate OxygenCredits

## Immediate Next Steps

### 1️⃣ Deploy Contract (10 minutes)
```bash
cd airswap-oxygencredits
npm run deploy
```
- Select network: **Polygon Amoy**
- Connect wallet via QR code
- Approve transaction (~0.05 MATIC)
- **Save contract address!**

### 2️⃣ Configure Environment
Add to `.env.local`:
```bash
NEXT_PUBLIC_OXYGEN_CREDITS_CONTRACT=0xYourContractAddress
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id
THIRDWEB_SECRET_KEY=your_secret_key
```

Get credentials: https://thirdweb.com/dashboard/settings

### 3️⃣ Install Frontend Dependencies
```bash
npm install @thirdweb-dev/sdk @thirdweb-dev/react @thirdweb-dev/chains
```

### 4️⃣ Test Minting
```bash
# Grant yourself verifier role (as admin)
# Then mint test credits via dashboard or API
```

---

## Key Files Created

| File | Purpose |
|------|---------|
| `airswap-oxygencredits/contracts/OxygenCredits.sol` | Smart contract |
| `lib/blockchain/oxygenCredits.ts` | Frontend helpers |
| `lib/blockchain/server/oxygenCreditsServer.ts` | Backend helpers |
| `airswap-oxygencredits/DEPLOYMENT_GUIDE.md` | Full deployment guide |
| `BLOCKCHAIN_IMPLEMENTATION_SUMMARY.md` | Complete documentation |

---

## Essential Commands

```bash
# Build contract
cd airswap-oxygencredits && npm run build

# Deploy contract
cd airswap-oxygencredits && npm run deploy

# Install frontend deps
npm install @thirdweb-dev/sdk @thirdweb-dev/react @thirdweb-dev/chains

# Get testnet MATIC
# Visit: https://faucet.polygon.technology/
```

---

## Quick Integration Example

### Frontend: Display Credits
```typescript
import { useSDK, useAddress } from "@thirdweb-dev/react";
import { getUserCredits } from "@/lib/blockchain/oxygenCredits";

const address = useAddress();
const sdk = useSDK();
const credits = await getUserCredits(sdk, address);
```

### Backend: Mint After Verification
```typescript
import { serverMintOxygenCredits } from "@/lib/blockchain/server/oxygenCreditsServer";

const result = await serverMintOxygenCredits({
  recipientAddress: claim.walletAddress,
  amount: 100,
  ndviDelta: 1500,
  claimId: claim._id.toString(),
  location: JSON.stringify(claim.geometry),
});
```

---

## Resources

- 📖 **Full Guide**: `airswap-oxygencredits/DEPLOYMENT_GUIDE.md`
- 📚 **Implementation Summary**: `BLOCKCHAIN_IMPLEMENTATION_SUMMARY.md`
- 🔧 **Contract**: `airswap-oxygencredits/contracts/OxygenCredits.sol`
- ⚡ **thirdweb CLI Docs**: https://portal.thirdweb.com/cli
- 🔍 **Block Explorer**: https://amoy.polygonscan.com/

---

## Need Help?

1. Check deployment guide for detailed steps
2. Review implementation summary for code examples
3. Verify testnet MATIC balance (get from faucet)
4. Ensure wallet connected to Polygon Amoy (Chain ID: 80002)

---

**Ready?** Run `cd airswap-oxygencredits && npm run deploy` 🚀
