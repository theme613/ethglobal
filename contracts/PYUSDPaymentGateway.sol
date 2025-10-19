// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./SoulBoundToken.sol";

/**
 * @title PYUSDPaymentGateway
 * @notice Payment gateway with KYC compliance gating using SBT verification
 * @dev Integrates with SoulBoundToken for access control
 */
contract PYUSDPaymentGateway is Ownable, ReentrancyGuard {
    // PYUSD token contract
    IERC20 public pyusdToken;
    
    // SBT contract for KYC verification
    SoulBoundToken public sbtContract;
    
    // Payment structure
    struct Payment {
        address from;
        address to;
        uint256 amount;
        uint256 timestamp;
        string description;
        bool completed;
        string paymentId;
    }
    
    // Mapping from payment ID to payment details
    mapping(string => Payment) public payments;
    
    // Mapping from user to payment history
    mapping(address => string[]) public userPayments;
    
    // Fee structure
    uint256 public transactionFee = 25; // 0.25% in basis points
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    // Maximum payment limits
    uint256 public dailyLimit = 10000 * 10**6; // $10,000 in PYUSD (6 decimals)
    uint256 public monthlyLimit = 100000 * 10**6; // $100,000 in PYUSD
    
    // User daily/monthly spending tracking
    mapping(address => mapping(uint256 => uint256)) public dailySpending;
    mapping(address => mapping(uint256 => uint256)) public monthlySpending;
    
    // Events
    event PaymentInitiated(
        string indexed paymentId,
        address indexed from,
        address indexed to,
        uint256 amount,
        string description
    );
    
    event PaymentCompleted(
        string indexed paymentId,
        address indexed from,
        address indexed to,
        uint256 amount,
        uint256 fee
    );
    
    event PaymentFailed(
        string indexed paymentId,
        address indexed from,
        string reason
    );
    
    event LimitsUpdated(
        uint256 newDailyLimit,
        uint256 newMonthlyLimit
    );
    
    event FeeUpdated(uint256 newFee);
    
    modifier onlyVerifiedUser() {
        require(sbtContract.isKYCVerified(msg.sender), "KYC verification required");
        _;
    }
    
    modifier validPayment(string memory paymentId) {
        require(bytes(paymentId).length > 0, "Invalid payment ID");
        require(payments[paymentId].from == address(0), "Payment ID already exists");
        _;
    }
    
    constructor(
        address _pyusdToken,
        address _sbtContract
    ) Ownable(msg.sender) {
        pyusdToken = IERC20(_pyusdToken);
        sbtContract = SoulBoundToken(_sbtContract);
    }
    
    /**
     * @notice Initiate a payment
     * @param to Recipient address
     * @param amount Payment amount in PYUSD
     * @param description Payment description
     * @param paymentId Unique payment identifier
     */
    function initiatePayment(
        address to,
        uint256 amount,
        string memory description,
        string memory paymentId
    ) external onlyVerifiedUser validPayment(paymentId) nonReentrant {
        require(to != address(0), "Invalid recipient address");
        require(amount > 0, "Amount must be greater than 0");
        require(to != msg.sender, "Cannot pay yourself");
        
        // Check daily limit
        uint256 today = block.timestamp / 1 days;
        uint256 userDailySpending = dailySpending[msg.sender][today];
        require(userDailySpending + amount <= dailyLimit, "Daily limit exceeded");
        
        // Check monthly limit
        uint256 thisMonth = block.timestamp / (30 days);
        uint256 userMonthlySpending = monthlySpending[msg.sender][thisMonth];
        require(userMonthlySpending + amount <= monthlyLimit, "Monthly limit exceeded");
        
        // Calculate fee
        uint256 fee = (amount * transactionFee) / FEE_DENOMINATOR;
        uint256 totalAmount = amount + fee;
        
        // Check balance
        require(pyusdToken.balanceOf(msg.sender) >= totalAmount, "Insufficient balance");
        
        // Create payment record
        payments[paymentId] = Payment({
            from: msg.sender,
            to: to,
            amount: amount,
            timestamp: block.timestamp,
            description: description,
            completed: false,
            paymentId: paymentId
        });
        
        // Add to user payment history
        userPayments[msg.sender].push(paymentId);
        
        // Update spending tracking
        dailySpending[msg.sender][today] += amount;
        monthlySpending[msg.sender][thisMonth] += amount;
        
        emit PaymentInitiated(paymentId, msg.sender, to, amount, description);
    }
    
    /**
     * @notice Complete a payment
     * @param paymentId Payment identifier
     */
    function completePayment(string memory paymentId) external nonReentrant {
        Payment storage payment = payments[paymentId];
        require(payment.from != address(0), "Payment not found");
        require(!payment.completed, "Payment already completed");
        require(payment.from == msg.sender, "Only payer can complete payment");
        
        // Calculate fee
        uint256 fee = (payment.amount * transactionFee) / FEE_DENOMINATOR;
        uint256 totalAmount = payment.amount + fee;
        
        // Check balance again
        require(pyusdToken.balanceOf(msg.sender) >= totalAmount, "Insufficient balance");
        
        // Transfer PYUSD
        require(pyusdToken.transferFrom(msg.sender, payment.to, payment.amount), "Transfer failed");
        require(pyusdToken.transferFrom(msg.sender, owner(), fee), "Fee transfer failed");
        
        // Mark as completed
        payment.completed = true;
        
        emit PaymentCompleted(paymentId, payment.from, payment.to, payment.amount, fee);
    }
    
    /**
     * @notice Cancel a payment
     * @param paymentId Payment identifier
     */
    function cancelPayment(string memory paymentId) external {
        Payment storage payment = payments[paymentId];
        require(payment.from != address(0), "Payment not found");
        require(!payment.completed, "Payment already completed");
        require(payment.from == msg.sender, "Only payer can cancel payment");
        
        // Mark as failed
        payment.completed = false;
        
        emit PaymentFailed(paymentId, payment.from, "Payment cancelled by user");
    }
    
    /**
     * @notice Get payment details
     * @param paymentId Payment identifier
     */
    function getPayment(string memory paymentId) external view returns (Payment memory) {
        return payments[paymentId];
    }
    
    /**
     * @notice Get user payment history
     * @param user User address
     */
    function getUserPayments(address user) external view returns (string[] memory) {
        return userPayments[user];
    }
    
    /**
     * @notice Get user spending for a specific day
     * @param user User address
     * @param day Day timestamp
     */
    function getDailySpending(address user, uint256 day) external view returns (uint256) {
        return dailySpending[user][day];
    }
    
    /**
     * @notice Get user spending for a specific month
     * @param user User address
     * @param month Month timestamp
     */
    function getMonthlySpending(address user, uint256 month) external view returns (uint256) {
        return monthlySpending[user][month];
    }
    
    /**
     * @notice Check if user can make payment
     * @param user User address
     * @param amount Payment amount
     */
    function canMakePayment(address user, uint256 amount) external view returns (bool, string memory) {
        // Check KYC verification
        if (!sbtContract.isKYCVerified(user)) {
            return (false, "KYC verification required");
        }
        
        // Check daily limit
        uint256 today = block.timestamp / 1 days;
        uint256 userDailySpending = dailySpending[user][today];
        if (userDailySpending + amount > dailyLimit) {
            return (false, "Daily limit exceeded");
        }
        
        // Check monthly limit
        uint256 thisMonth = block.timestamp / (30 days);
        uint256 userMonthlySpending = monthlySpending[user][thisMonth];
        if (userMonthlySpending + amount > monthlyLimit) {
            return (false, "Monthly limit exceeded");
        }
        
        // Check balance
        uint256 fee = (amount * transactionFee) / FEE_DENOMINATOR;
        uint256 totalAmount = amount + fee;
        if (pyusdToken.balanceOf(user) < totalAmount) {
            return (false, "Insufficient balance");
        }
        
        return (true, "Payment allowed");
    }
    
    /**
     * @notice Update payment limits
     * @param newDailyLimit New daily limit
     * @param newMonthlyLimit New monthly limit
     */
    function updateLimits(uint256 newDailyLimit, uint256 newMonthlyLimit) external onlyOwner {
        require(newDailyLimit > 0, "Daily limit must be greater than 0");
        require(newMonthlyLimit > 0, "Monthly limit must be greater than 0");
        require(newMonthlyLimit >= newDailyLimit, "Monthly limit must be >= daily limit");
        
        dailyLimit = newDailyLimit;
        monthlyLimit = newMonthlyLimit;
        
        emit LimitsUpdated(newDailyLimit, newMonthlyLimit);
    }
    
    /**
     * @notice Update transaction fee
     * @param newFee New fee in basis points
     */
    function updateFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee cannot exceed 10%"); // Max 10%
        
        transactionFee = newFee;
        emit FeeUpdated(newFee);
    }
    
    /**
     * @notice Emergency function to update SBT contract
     * @param newSBTContract New SBT contract address
     */
    function updateSBTContract(address newSBTContract) external onlyOwner {
        require(newSBTContract != address(0), "Invalid SBT contract address");
        sbtContract = SoulBoundToken(newSBTContract);
    }
    
    /**
     * @notice Emergency function to update PYUSD token
     * @param newPYUSDToken New PYUSD token address
     */
    function updatePYUSDToken(address newPYUSDToken) external onlyOwner {
        require(newPYUSDToken != address(0), "Invalid PYUSD token address");
        pyusdToken = IERC20(newPYUSDToken);
    }
}