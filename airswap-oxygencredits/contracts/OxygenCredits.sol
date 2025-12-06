// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "@thirdweb-dev/contracts/base/ERC1155SignatureMint.sol";
import "@thirdweb-dev/contracts/extension/PermissionsEnumerable.sol";

contract OxygenCredits is ERC1155SignatureMint, PermissionsEnumerable {
    // Role for verified entities who can mint credits
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    // Struct to store credit metadata
    struct CreditMetadata {
        uint256 ndviDelta;           // NDVI improvement value (scaled by 1000)
        string claimId;              // MongoDB claim ID reference
        string location;             // GeoJSON or coordinates string
        uint256 verificationDate;    // Timestamp of verification
        string metadataURI;          // IPFS URI for full metadata
    }
    
    // Mapping from token ID to credit metadata
    mapping(uint256 => CreditMetadata) public creditMetadata;
    
    // Counter for token IDs
    uint256 private _nextTokenId;
    
    // Events
    event CreditsMinted(
        uint256 indexed tokenId,
        address indexed recipient,
        uint256 amount,
        string claimId,
        uint256 ndviDelta,
        string metadataURI
    );
    
    event CreditsBurned(
        uint256 indexed tokenId,
        address indexed owner,
        uint256 amount
    );

    constructor(
        address _defaultAdmin,
        string memory _name,
        string memory _symbol,
        address _royaltyRecipient,
        uint128 _royaltyBps,
        address _primarySaleRecipient
    )
        ERC1155SignatureMint(
            _defaultAdmin,
            _name,
            _symbol,
            _royaltyRecipient,
            _royaltyBps,
            _primarySaleRecipient
        )
    {
        _setupRole(DEFAULT_ADMIN_ROLE, _defaultAdmin);
        _setupRole(VERIFIER_ROLE, _defaultAdmin);
        _nextTokenId = 1;
    }
    
    /**
     * @notice Mint oxygen credits with associated metadata
     * @param recipient Address to receive the credits
     * @param amount Number of credits to mint
     * @param ndviDelta NDVI improvement value (scaled by 1000, e.g., 1500 = 1.5)
     * @param claimId MongoDB claim ID
     * @param location Geographic location data
     * @param metadataURI IPFS URI for full metadata
     */
    function mintCredits(
        address recipient,
        uint256 amount,
        uint256 ndviDelta,
        string memory claimId,
        string memory location,
        string memory metadataURI
    ) external onlyRole(VERIFIER_ROLE) returns (uint256) {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be greater than 0");
        require(bytes(claimId).length > 0, "Claim ID required");
        require(bytes(metadataURI).length > 0, "Metadata URI required");
        
        uint256 tokenId = _nextTokenId++;
        
        // Store metadata
        creditMetadata[tokenId] = CreditMetadata({
            ndviDelta: ndviDelta,
            claimId: claimId,
            location: location,
            verificationDate: block.timestamp,
            metadataURI: metadataURI
        });
        
        // Mint tokens
        _mint(recipient, tokenId, amount, "");
        
        emit CreditsMinted(tokenId, recipient, amount, claimId, ndviDelta, metadataURI);
        
        return tokenId;
    }
    
    /**
     * @notice Burn oxygen credits
     * @param tokenId Token ID to burn
     * @param amount Amount to burn
     */
    function burnCredits(uint256 tokenId, uint256 amount) external {
        _burn(msg.sender, tokenId, amount);
        
        emit CreditsBurned(tokenId, msg.sender, amount);
    }
    
    /**
     * @notice Get credit metadata for a token ID
     * @param tokenId Token ID to query
     */
    function getCreditMetadata(uint256 tokenId) external view returns (CreditMetadata memory) {
        require(_exists(tokenId), "Token does not exist");
        return creditMetadata[tokenId];
    }
    
    /**
     * @notice Check if a token exists
     * @param tokenId Token ID to check
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return tokenId > 0 && tokenId < _nextTokenId;
    }
    
    /**
     * @notice Grant verifier role to an address
     * @param verifier Address to grant verifier role
     */
    function grantVerifierRole(address verifier) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(VERIFIER_ROLE, verifier);
    }
    
    /**
     * @notice Revoke verifier role from an address
     * @param verifier Address to revoke verifier role from
     */
    function revokeVerifierRole(address verifier) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(VERIFIER_ROLE, verifier);
    }
}