const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("OxygenCredits", function () {
    let oxygenCredits;
    let owner;
    let verifier;
    let user1;
    let user2;

    beforeEach(async function () {
        [owner, verifier, user1, user2] = await ethers.getSigners();

        const OxygenCredits = await ethers.getContractFactory("OxygenCredits");
        oxygenCredits = await OxygenCredits.deploy(
            owner.address,           // _defaultAdmin
            "AirSwap Oxygen Credits", // _name
            "O2C",                    // _symbol
            owner.address,           // _royaltyRecipient
            250,                     // _royaltyBps (2.5%)
            owner.address            // _primarySaleRecipient
        );
        await oxygenCredits.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the correct owner", async function () {
            const DEFAULT_ADMIN_ROLE = await oxygenCredits.DEFAULT_ADMIN_ROLE();
            expect(await oxygenCredits.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
        });

        it("Should grant VERIFIER_ROLE to owner", async function () {
            const VERIFIER_ROLE = await oxygenCredits.VERIFIER_ROLE();
            expect(await oxygenCredits.hasRole(VERIFIER_ROLE, owner.address)).to.be.true;
        });

        it("Should initialize token counter", async function () {
            // First mint should create token ID 1
            await oxygenCredits.mintCredits(
                user1.address,
                100,
                1500,
                "claim-001",
                "Amazon Basin",
                "ipfs://QmTest123"
            );

            const metadata = await oxygenCredits.getCreditMetadata(1);
            expect(metadata.claimId).to.equal("claim-001");
        });
    });

    describe("Role Management", function () {
        it("Should allow admin to grant verifier role", async function () {
            const VERIFIER_ROLE = await oxygenCredits.VERIFIER_ROLE();

            await oxygenCredits.grantVerifierRole(verifier.address);
            expect(await oxygenCredits.hasRole(VERIFIER_ROLE, verifier.address)).to.be.true;
        });

        it("Should allow admin to revoke verifier role", async function () {
            const VERIFIER_ROLE = await oxygenCredits.VERIFIER_ROLE();

            await oxygenCredits.grantVerifierRole(verifier.address);
            await oxygenCredits.revokeVerifierRole(verifier.address);

            expect(await oxygenCredits.hasRole(VERIFIER_ROLE, verifier.address)).to.be.false;
        });

        it("Should prevent non-admin from granting verifier role", async function () {
            await expect(
                oxygenCredits.connect(user1).grantVerifierRole(verifier.address)
            ).to.be.reverted;
        });
    });

    describe("Minting Credits", function () {
        it("Should mint credits successfully", async function () {
            const tx = await oxygenCredits.mintCredits(
                user1.address,
                100,
                1500,
                "claim-001",
                "Amazon Basin",
                "ipfs://QmTest123"
            );

            await expect(tx)
                .to.emit(oxygenCredits, "CreditsMinted")
                .withArgs(
                    1, // tokenId
                    user1.address, // recipient
                    100, // amount
                    "claim-001", // claimId
                    1500, // ndviDelta
                    "ipfs://QmTest123" // metadataURI
                );
        });

        it("Should store metadata correctly", async function () {
            await oxygenCredits.mintCredits(
                user1.address,
                100,
                1500,
                "claim-001",
                "Amazon Basin",
                "ipfs://QmTest123"
            );

            const metadata = await oxygenCredits.getCreditMetadata(1);

            expect(metadata.ndviDelta).to.equal(1500);
            expect(metadata.claimId).to.equal("claim-001");
            expect(metadata.location).to.equal("Amazon Basin");
            expect(metadata.metadataURI).to.equal("ipfs://QmTest123");
            expect(metadata.verificationDate).to.be.gt(0);
        });

        it("Should increment token IDs", async function () {
            await oxygenCredits.mintCredits(
                user1.address, 100, 1500, "claim-001", "Location 1", "ipfs://1"
            );
            await oxygenCredits.mintCredits(
                user2.address, 200, 2000, "claim-002", "Location 2", "ipfs://2"
            );

            const metadata1 = await oxygenCredits.getCreditMetadata(1);
            const metadata2 = await oxygenCredits.getCreditMetadata(2);

            expect(metadata1.claimId).to.equal("claim-001");
            expect(metadata2.claimId).to.equal("claim-002");
        });

        it("Should prevent non-verifier from minting", async function () {
            await expect(
                oxygenCredits.connect(user1).mintCredits(
                    user2.address, 100, 1500, "claim-001", "Location", "ipfs://test"
                )
            ).to.be.reverted;
        });

        it("Should reject invalid recipient address", async function () {
            await expect(
                oxygenCredits.mintCredits(
                    ethers.ZeroAddress, 100, 1500, "claim-001", "Location", "ipfs://test"
                )
            ).to.be.revertedWith("Invalid recipient");
        });

        it("Should reject zero amount", async function () {
            await expect(
                oxygenCredits.mintCredits(
                    user1.address, 0, 1500, "claim-001", "Location", "ipfs://test"
                )
            ).to.be.revertedWith("Amount must be greater than 0");
        });

        it("Should reject empty claim ID", async function () {
            await expect(
                oxygenCredits.mintCredits(
                    user1.address, 100, 1500, "", "Location", "ipfs://test"
                )
            ).to.be.revertedWith("Claim ID required");
        });

        it("Should reject empty metadata URI", async function () {
            await expect(
                oxygenCredits.mintCredits(
                    user1.address, 100, 1500, "claim-001", "Location", ""
                )
            ).to.be.revertedWith("Metadata URI required");
        });
    });

    describe("Burning Credits", function () {
        beforeEach(async function () {
            await oxygenCredits.mintCredits(
                user1.address, 100, 1500, "claim-001", "Location", "ipfs://test"
            );
        });

        it("Should burn credits successfully", async function () {
            const balanceBefore = await oxygenCredits.balanceOf(user1.address, 1);

            await oxygenCredits.connect(user1).burnCredits(1, 50);

            const balanceAfter = await oxygenCredits.balanceOf(user1.address, 1);
            expect(balanceAfter).to.equal(balanceBefore - 50n);
        });

        it("Should emit CreditsBurned event", async function () {
            await expect(oxygenCredits.connect(user1).burnCredits(1, 50))
                .to.emit(oxygenCredits, "CreditsBurned")
                .withArgs(1, user1.address, 50);
        });

        it("Should prevent burning more than balance", async function () {
            await expect(
                oxygenCredits.connect(user1).burnCredits(1, 200)
            ).to.be.reverted;
        });
    });

    describe("Metadata Retrieval", function () {
        it("Should retrieve metadata for existing token", async function () {
            await oxygenCredits.mintCredits(
                user1.address, 100, 1500, "claim-001", "Amazon", "ipfs://test"
            );

            const metadata = await oxygenCredits.getCreditMetadata(1);
            expect(metadata.claimId).to.equal("claim-001");
        });

        it("Should revert for non-existent token", async function () {
            await expect(
                oxygenCredits.getCreditMetadata(999)
            ).to.be.revertedWith("Token does not exist");
        });
    });

    describe("ERC1155 Functionality", function () {
        beforeEach(async function () {
            await oxygenCredits.mintCredits(
                user1.address, 100, 1500, "claim-001", "Location", "ipfs://test"
            );
        });

        it("Should check balance correctly", async function () {
            const balance = await oxygenCredits.balanceOf(user1.address, 1);
            expect(balance).to.equal(100);
        });

        it("Should transfer credits between users", async function () {
            await oxygenCredits.connect(user1).safeTransferFrom(
                user1.address,
                user2.address,
                1,
                50,
                "0x"
            );

            const balance1 = await oxygenCredits.balanceOf(user1.address, 1);
            const balance2 = await oxygenCredits.balanceOf(user2.address, 1);

            expect(balance1).to.equal(50);
            expect(balance2).to.equal(50);
        });

        it("Should support batch balance queries", async function () {
            await oxygenCredits.mintCredits(
                user1.address, 200, 2000, "claim-002", "Location", "ipfs://test2"
            );

            const balances = await oxygenCredits.balanceOfBatch(
                [user1.address, user1.address],
                [1, 2]
            );

            expect(balances[0]).to.equal(100);
            expect(balances[1]).to.equal(200);
        });
    });

    describe("Multiple Verifiers", function () {
        it("Should allow multiple verifiers to mint", async function () {
            await oxygenCredits.grantVerifierRole(verifier.address);

            await oxygenCredits.connect(verifier).mintCredits(
                user1.address, 100, 1500, "claim-v1", "Location", "ipfs://test"
            );

            const balance = await oxygenCredits.balanceOf(user1.address, 1);
            expect(balance).to.equal(100);
        });
    });

    describe("Edge Cases", function () {
        it("Should handle large NDVI values", async function () {
            const largeNDVI = 999999;
            await oxygenCredits.mintCredits(
                user1.address, 100, largeNDVI, "claim-001", "Location", "ipfs://test"
            );

            const metadata = await oxygenCredits.getCreditMetadata(1);
            expect(metadata.ndviDelta).to.equal(largeNDVI);
        });

        it("Should handle large credit amounts", async function () {
            const largeAmount = ethers.parseEther("1000000");
            await oxygenCredits.mintCredits(
                user1.address, largeAmount, 1500, "claim-001", "Location", "ipfs://test"
            );

            const balance = await oxygenCredits.balanceOf(user1.address, 1);
            expect(balance).to.equal(largeAmount);
        });

        it("Should handle long location strings", async function () {
            const longLocation = "A".repeat(1000);
            await oxygenCredits.mintCredits(
                user1.address, 100, 1500, "claim-001", longLocation, "ipfs://test"
            );

            const metadata = await oxygenCredits.getCreditMetadata(1);
            expect(metadata.location).to.equal(longLocation);
        });
    });
});
