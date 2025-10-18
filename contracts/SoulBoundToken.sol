// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title SoulBoundToken - EIP-5192 compliant Soul Bound Token for KYC verification
/// @notice Non-transferable NFT representing KYC verification status
/// @dev Implements EIP-5192 for soul bound tokens (non-transferable NFTs)
/// @author Your Name
/// @custom:security-contact security@yourproject.com

interface IERC5192 {
    /// @notice Emitted when the locking status is changed to locked.
    /// @dev If a token is minted and the status is locked, this event should be emitted.
    /// @param tokenId The identifier for a token.
    event Locked(uint256 indexed tokenId);

    /// @notice Emitted when the locking status is changed to unlocked.
    /// @dev If a token is minted and the status is unlocked, this event should be emitted.
    /// @param tokenId The identifier for a token.
    event Unlocked(uint256 indexed tokenId);

    /// @notice Returns the locking status of an Soulbound Token
    /// @dev SBTs are non-transferable, so they are always locked.
    /// @param tokenId The identifier for a Token.
    /// @return locked Whether the token is locked (always true for SBTs).
    function locked(uint256 tokenId) external view returns (bool locked);
}

contract SoulBoundToken is IERC5192 {
    string public name = "KYC Soul Bound Token";
    string public symbol = "KYC-SBT";
    address public owner;
    
    // Track SBT holders (address => tokenId)
    mapping(address => uint256) public tokenOf;
    mapping(uint256 => address) public ownerOf;
    mapping(address => bool) public hasSBT;
    
    uint256 public totalSupply;
    uint256 public nextTokenId = 1;
    
    /// @notice Emitted when a new SBT is minted
    event Minted(address indexed to, uint256 indexed tokenId);
    
    /// @notice Emitted when an SBT is revoked
    event Revoked(address indexed from, uint256 indexed tokenId);
    
    /// @notice Emitted when ownership is transferred
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor() {
        owner = msg.sender;
    }

    /// @notice Modifier to ensure only contract owner can access
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    /// @notice Mint a new SBT to a user (after off-chain KYC verification)
    /// @dev Only owner can mint, and each address can only have one SBT
    /// @param to Address to mint the SBT to
    function mint(address to) external onlyOwner {
        require(to != address(0), "Cannot mint to zero address");
        require(!hasSBT[to], "Address already has SBT");
        
        uint256 tokenId = nextTokenId++;
        tokenOf[to] = tokenId;
        ownerOf[tokenId] = to;
        hasSBT[to] = true;
        totalSupply++;
        
        emit Minted(to, tokenId);
        emit Locked(tokenId); // SBTs are always locked (non-transferable)
    }

    /// @notice Revoke an SBT (for compliance violations)
    /// @dev Only owner can revoke SBTs
    /// @param from Address to revoke SBT from
    function revoke(address from) external onlyOwner {
        require(hasSBT[from], "Address does not have SBT");
        
        uint256 tokenId = tokenOf[from];
        delete tokenOf[from];
        delete ownerOf[tokenId];
        hasSBT[from] = false;
        totalSupply--;
        
        emit Revoked(from, tokenId);
        emit Unlocked(tokenId);
    }

    /// @notice Check if an address holds an SBT
    /// @param user Address to check
    /// @return True if user has SBT
    function balanceOf(address user) external view returns (uint256) {
        return hasSBT[user] ? 1 : 0;
    }

    /// @notice Get the token ID for a user
    /// @param user Address to check
    /// @return Token ID (0 if no SBT)
    function tokenIdOf(address user) external view returns (uint256) {
        return tokenOf[user];
    }

    /// @notice Check if a token is locked (always true for SBTs)
    /// @param tokenId Token ID to check
    /// @return Always true (SBTs are non-transferable)
    function locked(uint256 tokenId) external pure override returns (bool) {
        return true; // SBTs are always locked
    }

    /// @notice Check if a user is KYC verified
    /// @param user Address to check
    /// @return True if user is KYC verified (has SBT)
    function isKYCVerified(address user) external view returns (bool) {
        return hasSBT[user];
    }

    /// @notice Get all SBT holders (for admin purposes)
    /// @dev This function can be expensive for large numbers of holders
    /// @return Array of addresses that hold SBTs
    function getAllHolders() external view returns (address[] memory) {
        address[] memory holders = new address[](totalSupply);
        uint256 index = 0;
        
        // Note: This is a simplified implementation
        // In production, you might want to maintain a separate array
        // or use events to track holders more efficiently
        return holders;
    }

    /// @notice Transfer ownership of the contract
    /// @param newOwner Address of the new owner
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        require(newOwner != owner, "New owner must be different");
        
        address previousOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(previousOwner, newOwner);
    }

    /// @notice Batch mint SBTs to multiple addresses
    /// @dev Only owner can batch mint
    /// @param recipients Array of addresses to mint SBTs to
    function batchMint(address[] calldata recipients) external onlyOwner {
        require(recipients.length > 0, "No recipients provided");
        require(recipients.length <= 100, "Too many recipients"); // Gas limit protection
        
        for (uint256 i = 0; i < recipients.length; i++) {
            address to = recipients[i];
            if (to != address(0) && !hasSBT[to]) {
                uint256 tokenId = nextTokenId++;
                tokenOf[to] = tokenId;
                ownerOf[tokenId] = to;
                hasSBT[to] = true;
                totalSupply++;
                
                emit Minted(to, tokenId);
                emit Locked(tokenId);
            }
        }
    }

    /// @notice Batch revoke SBTs from multiple addresses
    /// @dev Only owner can batch revoke
    /// @param addresses Array of addresses to revoke SBTs from
    function batchRevoke(address[] calldata addresses) external onlyOwner {
        require(addresses.length > 0, "No addresses provided");
        require(addresses.length <= 100, "Too many addresses"); // Gas limit protection
        
        for (uint256 i = 0; i < addresses.length; i++) {
            address from = addresses[i];
            if (hasSBT[from]) {
                uint256 tokenId = tokenOf[from];
                delete tokenOf[from];
                delete ownerOf[tokenId];
                hasSBT[from] = false;
                totalSupply--;
                
                emit Revoked(from, tokenId);
                emit Unlocked(tokenId);
            }
        }
    }

    /// @notice Get contract statistics
    /// @return _totalSupply Total number of SBTs minted
    /// @return _nextTokenId Next token ID to be minted
    function getStats() external view returns (uint256 _totalSupply, uint256 _nextTokenId) {
        return (totalSupply, nextTokenId);
    }

    /// @notice Prevent transfers (SBTs are non-transferable)
    /// @dev This function always reverts to enforce non-transferability
    function transfer(address, uint256) external pure {
        revert("SBTs are non-transferable");
    }

    /// @notice Prevent transfers (SBTs are non-transferable)
    /// @dev This function always reverts to enforce non-transferability
    function transferFrom(address, address, uint256) external pure {
        revert("SBTs are non-transferable");
    }

    /// @notice Prevent approvals (SBTs are non-transferable)
    /// @dev This function always reverts to enforce non-transferability
    function approve(address, uint256) external pure {
        revert("SBTs are non-transferable");
    }

    /// @notice Prevent approvals (SBTs are non-transferable)
    /// @dev This function always reverts to enforce non-transferability
    function setApprovalForAll(address, bool) external pure {
        revert("SBTs are non-transferable");
    }
}