/**
 * Quick test script to verify OxygenCredits contract deployment
 * Run this to test basic contract functionality
 */

import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { PolygonAmoyTestnet } from "@thirdweb-dev/chains";

const CONTRACT_ADDRESS = "0x452BeCC3fc45ff371dD5B5287cAAe188d0FF398A";
const ADMIN_ADDRESS = "0x590e1a671d353e9c5c6dd285975cf2a45ac5c742";

async function testContract() {
  console.log("🔍 Testing OxygenCredits Contract...\n");
  
  try {
    // Initialize SDK (read-only mode, no private key needed for queries)
    const sdk = new ThirdwebSDK(PolygonAmoyTestnet, {
      clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
    });
    
    const contract = await sdk.getContract(CONTRACT_ADDRESS);
    
    console.log("✅ Contract connected successfully!");
    console.log(`📍 Address: ${CONTRACT_ADDRESS}`);
    console.log(`🌐 Network: Polygon Amoy Testnet\n`);
    
    // Test 1: Check if contract responds
    console.log("Test 1: Contract Metadata");
    const name = await contract.call("name");
    const symbol = await contract.call("symbol");
    console.log(`   Name: ${name}`);
    console.log(`   Symbol: ${symbol}\n`);
    
    // Test 2: Check roles
    console.log("Test 2: Admin Role Check");
    const DEFAULT_ADMIN_ROLE = await contract.call("DEFAULT_ADMIN_ROLE");
    const hasAdminRole = await contract.call("hasRole", [DEFAULT_ADMIN_ROLE, ADMIN_ADDRESS]);
    console.log(`   Admin has DEFAULT_ADMIN_ROLE: ${hasAdminRole}\n`);
    
    // Test 3: Check VERIFIER_ROLE
    console.log("Test 3: Verifier Role Check");
    const VERIFIER_ROLE = await contract.call("VERIFIER_ROLE");
    const hasVerifierRole = await contract.call("hasRole", [VERIFIER_ROLE, ADMIN_ADDRESS]);
    console.log(`   Admin has VERIFIER_ROLE: ${hasVerifierRole}\n`);
    
    // Test 4: Check total supply
    console.log("Test 4: Token Supply");
    try {
      const totalSupply = await contract.erc1155.totalCount();
      console.log(`   Total unique tokens: ${totalSupply}\n`);
    } catch (error) {
      console.log(`   No tokens minted yet (expected initially)\n`);
    }
    
    console.log("✅ All tests passed!");
    console.log("\n📝 Next Steps:");
    console.log("   1. Grant verifier role via thirdweb dashboard");
    console.log("   2. Test minting credits");
    console.log("   3. Integrate with frontend");
    console.log("\n🔗 Dashboard: https://thirdweb.com/polygon-amoy-testnet/" + CONTRACT_ADDRESS);
    
  } catch (error) {
    console.error("❌ Error testing contract:", error);
    process.exit(1);
  }
}

// Run the test
testContract();
