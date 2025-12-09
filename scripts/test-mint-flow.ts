import { MongoClient, ObjectId } from 'mongodb';
import { ethers } from 'ethers';
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { PolygonAmoyTestnet } from "@thirdweb-dev/chains";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

// Fix __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to load .env.local manually
const loadEnv = () => {
    try {
        const envPath = path.resolve(__dirname, '../.env.local');
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf-8');
            const vars: Record<string, string> = {};
            content.split('\n').forEach(line => {
                const parts = line.split('=');
                if (parts.length >= 2) {
                    const key = parts[0].trim();
                    const value = parts.slice(1).join('=').trim();
                    if (key && !key.startsWith('#')) {
                        vars[key] = value;
                    }
                }
            });
            return vars;
        }
    } catch (e) { console.error("Could not load .env.local", e); }
    return {};
};

const env = { ...process.env, ...loadEnv() };
const MONGODB_URI = env.MONGODB_URI;
const CONTRACT_ADDRESS = "0x452BeCC3fc45ff371dD5B5287cAAe188d0FF398A"; // Fallback/Known
const CLIENT_ID = env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;

if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI missing");
    process.exit(1);
}

const API_BASE = "http://localhost:3000/api";

// Helper function to extract cookie
const getCookie = (res: any) => {
    const cookie = res.headers.get('set-cookie');
    return cookie ? cookie.split(';')[0] : '';
};

async function main() {
    console.log("🚀 Starting E2E Minting Flow Test...");

    // 1. Setup Wallet
    console.log("🔐 Generating test wallet...");
    const wallet = ethers.Wallet.createRandom();
    console.log(`   Address: ${wallet.address}`);

    // 2. Connect DB
    console.log("📦 Connecting to MongoDB...");
    const client = new MongoClient(MONGODB_URI as string);
    await client.connect();
    const db = client.db();
    console.log("   Connected.");

    try {
        // --- CONTRIBUTOR FLOW ---
        const contribEmail = `test_contrib_${Date.now()}@example.com`;
        const password = "password123";

        // 3. Signup Contributor
        console.log(`👤 Signing up Contributor: ${contribEmail}...`);
        const contribRes = await fetch(`${API_BASE}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: contribEmail,
                password,
                full_name: "Test Contributor",
                role: "contributor"
            })
        });

        if (!contribRes.ok) {
            const txt = await contribRes.text();
            throw new Error(`Contributor signup failed: ${contribRes.status} ${txt}`);
        }

        const contribData: any = await contribRes.json();
        const contribId = contribData.user.id;
        const contribToken = contribData.access_token;
        const contribCookie = getCookie(contribRes);
        console.log(`   ID: ${contribId}`);

        // 4. Set Wallet Address via DB (API Gap)
        console.log("🔧 Updating Contributor wallet in DB...");
        await db.collection('users').updateOne(
            { _id: new ObjectId(contribId) },
            { $set: { wallet_address: wallet.address } }
        );

        // 5. Submit Claim
        const claimPayload = {
            contributorName: "Test Contributor",
            contributorEmail: contribEmail,
            location: {
                country: "Testland",
                polygon: {
                    type: "Polygon",
                    coordinates: [[[-131.02, 33.45], [-131.02, 33.46], [-131.01, 33.46], [-131.01, 33.45], [-131.02, 33.45]]]
                }
            },
            description: "Automated test claim for blockchain minting verification",
            evidence: [{ name: "test_proof.jpg", type: "image", tmpId: "123" }]
        };

        console.log("📝 Submitting Claim...");
        // Use both headers to be safe
        const claimRes = await fetch(`${API_BASE}/claims`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${contribToken}`,
                'Cookie': contribCookie
            },
            body: JSON.stringify(claimPayload)
        });

        if (!claimRes.ok) {
            const txt = await claimRes.text();
            throw new Error(`Claim submission failed: ${claimRes.status} ${txt}`);
        }

        const claimData: any = await claimRes.json();
        const targetId = claimData.data._id || claimData.data.id || claimData.data.claimId;
        console.log(`   Claim Response ID: ${targetId}`);

        // DB Lookup for verification (optional/debug)
        const claimDoc = await db.collection('claims').findOne({ user_id: new ObjectId(contribId), status: 'pending' });
        const claimDbId = claimDoc?._id.toString();
        console.log(`   Claim DB ID: ${claimDbId}`);

        // Use the ID from response if available, otherwise fallback
        const finalClaimId = targetId || claimDbId;

        if (!finalClaimId) throw new Error("Could not determine Claim ID");


        // --- VERIFIER FLOW ---
        const verifierEmail = `test_verifier_${Date.now()}@example.com`;

        // 6. Signup Verifier
        console.log(`👮 Signing up Verifier: ${verifierEmail}...`);
        const verifierRes = await fetch(`${API_BASE}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: verifierEmail,
                password,
                full_name: "Test Verifier",
                role: "verifier"
            })
        });

        if (!verifierRes.ok) throw new Error("Verifier signup failed");
        const verifierData: any = await verifierRes.json();
        const verifierToken = verifierData.access_token;
        const verifierCookie = getCookie(verifierRes);

        // 7. Approve Claim
        console.log("✅ Verifying (Approving) Claim...");
        // Endpoint: /api/claims/[id]/verify (or verify-v2 based on route cleanup)
        // Previous cleanup used verify.ts for /api/claims/[id]/verify.
        // Or approve.ts uses /api/claims/[id]/approve ?
        // I updated BOTH. I'll use approve.ts since it definitely handled creation of credit record.
        // Wait, approve.ts creates listing. verify.ts creates credit record.
        // I added minting to both.
        // Let's use `verify` as it maps to the "Verify" button on Map Dashboard analysis drawer?
        // Actually map.tsx called /api/claims (POST).
        // Let's use `approve.ts`? No, `verifier.tsx` calls `verify.ts`.
        // I will call `verify` endpoint (PATCH or POST?).
        // Step 1231 view of verify.ts showed it's a PATCH/POST handler? 
        // "export default async function handler" checks validation.
        // Let's try calling `/api/claims/${claimDbId}/verify`.

        const verifyRes = await fetch(`${API_BASE}/claims/${finalClaimId}/verify`, { // Use finalClaimId
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${verifierToken}`,
                'Cookie': verifierCookie
            },
            body: JSON.stringify({
                approved: true,
                credits: 500, // Mint 500 tokens
                notes: "Automated verification"
            })
        });

        if (!verifyRes.ok) {
            const txt = await verifyRes.text();
            throw new Error(`Verification failed: ${verifyRes.status} ${txt}`);
        }
        console.log("   Claim Verified via API.");


        // 8. Blockchain Check
        console.log("🔗 Checking Blockchain Balance...");
        console.log(`   Querying contract: ${CONTRACT_ADDRESS}`);
        console.log(`   For user: ${wallet.address}`);

        // Wait a few seconds for block propagation (Amoy is fast but still)
        await new Promise(r => setTimeout(r, 5000));

        const sdk = new ThirdwebSDK(PolygonAmoyTestnet, {
            clientId: CLIENT_ID, // Might fail if empty, but try
        });
        const contract = await sdk.getContract(CONTRACT_ADDRESS);

        // Get all owned tokens
        const owned = await contract.erc1155.getOwned(wallet.address);

        console.log(`   Owned Tokens: ${owned.length}`);

        if (owned.length > 0) {
            console.log("🎉 SUCCESS! Tokens minted successfully.");
            console.log(`   Token ID: ${owned[0].metadata.id}`);
            console.log(`   Balance: ${owned[0].quantityOwned}`);
        } else {
            console.error("⚠️  FAILURE? No tokens found. Check server logs for minting errors.");
            // Check totalSupply
            const total = await contract.erc1155.totalCount();
            console.log(`   Total Supply in Contract: ${total}`);
        }

    } catch (error) {
        console.error("❌ Test Failed:", error);
    } finally {
        await client.close();
    }
}

main();
