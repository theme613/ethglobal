// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title PYUSDKYCSubscription - KYC/SBT-gated fee contract for PayPal USD (PYUSD) payments
/// @notice Accepts PYUSD payments only from KYC-verified users (SBT holders)
/// @dev Integrates with official PYUSD ERC-20 proxy and custom SBT for access control
/// @author Your Name
/// @custom:security-contact security@yourproject.com

interface IERC20 {
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function transfer(address to, uint256 value) external returns (bool);
    function balanceOf(address owner) external view returns (uint256);
    function decimals() external view returns (uint8);
}

interface ISBT {
    function balanceOf(address owner) external view returns (uint256);
}

contract PYUSDKYCSubscription {
    address public owner;
    IERC20 public pyusd;
    ISBT public sbt;
    uint256 public feeAmount; // PYUSD fee amount (in wei)
    
    // Track payment and reimbursement status
    mapping(address => bool) public paid;
    mapping(address => bool) public reimbursed;
    
    // Statistics
    uint256 public totalPaid;
    uint256 public totalReimbursed;
    
    /// @notice Emitted when a user pays the subscription fee
    event FeePaid(address indexed payer, uint256 amount, uint256 timestamp);
    
    /// @notice Emitted when a user claims ETH gas reimbursement
    event GasReimbursed(address indexed user, uint256 ethAmount, uint256 timestamp);
    
    /// @notice Emitted when owner deposits ETH for reimbursements
    event ETHDeposited(address indexed depositor, uint256 amount);
    
    /// @notice Emitted when owner withdraws PYUSD fees
    event FeesWithdrawn(address indexed owner, uint256 amount);
    
    /// @notice Emitted when fee amount is updated
    event FeeAmountUpdated(uint256 oldAmount, uint256 newAmount);
    
    /// @notice Emitted when ownership is transferred
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /// @dev Constructor sets PYUSD ERC-20 and SBT contract addresses
    /// @param _pyusd Official PYUSD ERC-20 proxy address (0x6c3ea9036406852006290770bedfcaba0e23a0e8 on mainnet)
    /// @param _sbt SoulBound Token contract address for KYC verification
    /// @param _feeAmount Fee amount in PYUSD (use 1e6 for 1 PYUSD if 6 decimals)
    constructor(address _pyusd, address _sbt, uint256 _feeAmount) {
        require(_pyusd != address(0), "Invalid PYUSD address");
        require(_sbt != address(0), "Invalid SBT address");
        require(_feeAmount > 0, "Fee must be positive");
        
        owner = msg.sender;
        pyusd = IERC20(_pyusd);
        sbt = ISBT(_sbt);
        feeAmount = _feeAmount;
    }

    /// @notice Modifier to ensure only KYC-verified users (SBT holders) can access
    modifier onlyKYC() {
        require(sbt.balanceOf(msg.sender) > 0, "Not KYC-verified (no SBT)");
        _;
    }

    /// @notice Modifier to ensure only contract owner can access
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    /// @notice Pay the subscription/usage fee in PYUSD; only for verified SBT holders
    /// @dev User must first approve this contract to spend their PYUSD
    /// @dev Requires user to hold SBT (KYC verification)
    function paySubscription() external onlyKYC {
        require(!paid[msg.sender], "Already paid");
        require(pyusd.transferFrom(msg.sender, address(this), feeAmount), "PYUSD transfer failed");
        
        paid[msg.sender] = true;
        totalPaid += feeAmount;
        
        emit FeePaid(msg.sender, feeAmount, block.timestamp);
    }

    /// @notice Claim ETH as a gas reimbursement after successful payment
    /// @dev This helps cover gas costs for testnets/demos
    /// @param ethAmount Amount of ETH to claim (in wei)
    function claimEthGas(uint256 ethAmount) external onlyKYC {
        require(paid[msg.sender], "PYUSD payment required first");
        require(address(this).balance >= ethAmount, "Contract low on ETH");
        require(!reimbursed[msg.sender], "Already reimbursed");
        require(ethAmount > 0, "Amount must be positive");
        
        reimbursed[msg.sender] = true;
        totalReimbursed += ethAmount;
        
        payable(msg.sender).transfer(ethAmount);
        emit GasReimbursed(msg.sender, ethAmount, block.timestamp);
    }

    /// @notice Admin function to deposit ETH for reimbursement pool
    /// @dev Owner can fund the contract with ETH for gas reimbursements
    function depositETH() external payable onlyOwner {
        require(msg.value > 0, "Must send ETH");
        emit ETHDeposited(msg.sender, msg.value);
    }

    /// @notice Owner can withdraw collected PYUSD fees
    /// @dev Transfers all PYUSD balance to owner
    function withdrawFees() external onlyOwner {
        uint256 balance = pyusd.balanceOf(address(this));
        require(balance > 0, "No fees to withdraw");
        
        require(pyusd.transfer(owner, balance), "PYUSD transfer failed");
        emit FeesWithdrawn(owner, balance);
    }

    /// @notice Update the subscription fee amount
    /// @param _newFeeAmount New fee amount in PYUSD
    function updateFeeAmount(uint256 _newFeeAmount) external onlyOwner {
        require(_newFeeAmount > 0, "Fee must be positive");
        uint256 oldAmount = feeAmount;
        feeAmount = _newFeeAmount;
        emit FeeAmountUpdated(oldAmount, _newFeeAmount);
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

    /// @notice Check if a user has paid the subscription fee
    /// @param user Address to check
    /// @return True if user has paid
    function hasUserPaid(address user) external view returns (bool) {
        return paid[user];
    }

    /// @notice Check if a user has claimed ETH reimbursement
    /// @param user Address to check
    /// @return True if user has been reimbursed
    function hasUserBeenReimbursed(address user) external view returns (bool) {
        return reimbursed[user];
    }

    /// @notice Get contract statistics
    /// @return _totalPaid Total PYUSD collected
    /// @return _totalReimbursed Total ETH reimbursed
    /// @return _ethBalance Current ETH balance
    /// @return _pyusdBalance Current PYUSD balance
    function getStats() external view returns (
        uint256 _totalPaid,
        uint256 _totalReimbursed,
        uint256 _ethBalance,
        uint256 _pyusdBalance
    ) {
        return (
            totalPaid,
            totalReimbursed,
            address(this).balance,
            pyusd.balanceOf(address(this))
        );
    }

    /// @notice Emergency function to withdraw all ETH (owner only)
    /// @dev Use with caution - this drains the reimbursement pool
    function emergencyWithdrawETH() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        payable(owner).transfer(balance);
    }

    /// @notice Receive ETH (for deposits)
    receive() external payable {
        emit ETHDeposited(msg.sender, msg.value);
    }
}
