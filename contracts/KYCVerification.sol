// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title KYCVerification
 * @notice KYC/AML Verification contract for managing user verification status
 * @dev Integrates with Bridge API for KYC/AML screening
 * This contract manages:
 * - KYC verification requests
 * - KYC approval/rejection
 * - AML screening status
 * - Verification history
 * - Risk scoring
 */
contract KYCVerification {
    // Verification status enum
    enum VerificationStatus {
        PENDING,
        APPROVED,
        REJECTED,
        EXPIRED,
        SUSPENDED
    }

    // User verification record
    struct VerificationRecord {
        address userAddress;
        string bridgeReferenceId;
        VerificationStatus status;
        uint256 submissionTimestamp;
        uint256 approvalTimestamp;
        uint256 expiryTimestamp;
        string amlStatus;
        uint8 riskScore;
        string verificationData;
        bool documentVerified;
        bool faceVerified;
        string rejectionReason;
    }

    // KYC provider configuration
    struct KYCProvider {
        address providerAddress;
        string providerName;
        bool isActive;
        uint256 approvalCount;
        uint256 rejectionCount;
    }

    // Mapping of user address to verification record
    mapping(address => VerificationRecord) public verifications;

    // Mapping of reference ID to user address
    mapping(string => address) public referenceIdToUser;

    // Mapping of KYC providers
    mapping(address => KYCProvider) public kycProviders;

    // Array of all KYC provider addresses
    address[] public providersList;

    // Admin address
    address public admin;

    // Contract owner
    address public contractOwner;

    // Default verification expiry period (365 days)
    uint256 public verificationExpiryPeriod;

    // Maximum risk score allowed (0-100)
    uint8 public maxAllowedRiskScore;

    // Events
    event VerificationSubmitted(
        address indexed user,
        string referenceId,
        uint256 timestamp
    );

    event VerificationApproved(
        address indexed user,
        string referenceId,
        uint256 expiryTimestamp,
        uint8 riskScore
    );

    event VerificationRejected(
        address indexed user,
        string referenceId,
        string reason
    );

    event VerificationExpired(address indexed user, string referenceId);

    event VerificationSuspended(
        address indexed user,
        string referenceId,
        string reason
    );

    event KYCProviderAdded(address indexed provider, string providerName);

    event KYCProviderRemoved(address indexed provider);

    event KYCProviderActivated(address indexed provider);

    event KYCProviderDeactivated(address indexed provider);

    event RiskScoreUpdated(
        address indexed user,
        uint8 oldScore,
        uint8 newScore
    );

    event AMLStatusUpdated(address indexed user, string amlStatus);

    event VerificationExpiryPeriodUpdated(uint256 newPeriod);

    event MaxRiskScoreUpdated(uint8 newMaxScore);

    /**
     * @dev Constructor initializes the KYC verification contract
     */
    constructor() {
        admin = msg.sender;
        contractOwner = msg.sender;
        verificationExpiryPeriod = 365 days;
        maxAllowedRiskScore = 50; // Default max risk score
    }

    /**
     * @dev Modifier to check if caller is admin
     */
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    /**
     * @dev Modifier to check if caller is authorized KYC provider
     */
    modifier onlyKYCProvider() {
        require(
            kycProviders[msg.sender].isActive,
            "Only active KYC providers can call this function"
        );
        _;
    }

    /**
     * @dev Adds a new KYC provider
     * @param provider Address of the KYC provider
     * @param providerName Name of the KYC provider
     */
    function addKYCProvider(address provider, string memory providerName) external onlyAdmin {
        require(provider != address(0), "Invalid provider address");
        require(bytes(providerName).length > 0, "Provider name required");
        require(!kycProviders[provider].isActive, "Provider already exists");

        kycProviders[provider] = KYCProvider({
            providerAddress: provider,
            providerName: providerName,
            isActive: true,
            approvalCount: 0,
            rejectionCount: 0
        });

        providersList.push(provider);
        emit KYCProviderAdded(provider, providerName);
    }

    /**
     * @dev Removes a KYC provider
     * @param provider Address of the KYC provider to remove
     */
    function removeKYCProvider(address provider) external onlyAdmin {
        require(kycProviders[provider].isActive, "Provider does not exist");
        kycProviders[provider].isActive = false;
        emit KYCProviderRemoved(provider);
    }

    /**
     * @dev Activates a KYC provider
     * @param provider Address of the KYC provider
     */
    function activateKYCProvider(address provider) external onlyAdmin {
        require(kycProviders[provider].providerAddress != address(0), "Provider does not exist");
        kycProviders[provider].isActive = true;
        emit KYCProviderActivated(provider);
    }

    /**
     * @dev Deactivates a KYC provider
     * @param provider Address of the KYC provider
     */
    function deactivateKYCProvider(address provider) external onlyAdmin {
        require(kycProviders[provider].isActive, "Provider is not active");
        kycProviders[provider].isActive = false;
        emit KYCProviderDeactivated(provider);
    }

    /**
     * @dev Submits a KYC verification request
     * @param user User address to verify
     * @param referenceId Bridge API reference ID
     * @param verificationData Encrypted verification data
     */
    function submitVerification(
        address user,
        string memory referenceId,
        string memory verificationData
    ) external onlyKYCProvider returns (bool) {
        require(user != address(0), "Invalid user address");
        require(bytes(referenceId).length > 0, "Reference ID required");
        require(
            verifications[user].submissionTimestamp == 0 ||
                verifications[user].status == VerificationStatus.REJECTED,
            "User already has pending verification"
        );

        verifications[user] = VerificationRecord({
            userAddress: user,
            bridgeReferenceId: referenceId,
            status: VerificationStatus.PENDING,
            submissionTimestamp: block.timestamp,
            approvalTimestamp: 0,
            expiryTimestamp: 0,
            amlStatus: "PENDING",
            riskScore: 0,
            verificationData: verificationData,
            documentVerified: false,
            faceVerified: false,
            rejectionReason: ""
        });

        referenceIdToUser[referenceId] = user;

        emit VerificationSubmitted(user, referenceId, block.timestamp);
        return true;
    }

    /**
     * @dev Approves KYC verification
     * @param user User address to approve
     * @param referenceId Bridge API reference ID
     * @param riskScore Risk score from Bridge API (0-100)
     * @param amlStatus AML screening status
     */
    function approveVerification(
        address user,
        string memory referenceId,
        uint8 riskScore,
        string memory amlStatus
    ) external onlyKYCProvider returns (bool) {
        require(user != address(0), "Invalid user address");
        require(
            verifications[user].status == VerificationStatus.PENDING,
            "Verification is not pending"
        );
        require(
            keccak256(abi.encodePacked(verifications[user].bridgeReferenceId)) ==
                keccak256(abi.encodePacked(referenceId)),
            "Reference ID mismatch"
        );
        require(riskScore <= maxAllowedRiskScore, "Risk score exceeds maximum allowed");

        uint256 expiryTime = block.timestamp + verificationExpiryPeriod;

        verifications[user].status = VerificationStatus.APPROVED;
        verifications[user].approvalTimestamp = block.timestamp;
        verifications[user].expiryTimestamp = expiryTime;
        verifications[user].riskScore = riskScore;
        verifications[user].amlStatus = amlStatus;
        verifications[user].documentVerified = true;
        verifications[user].faceVerified = true;

        kycProviders[msg.sender].approvalCount++;

        emit VerificationApproved(user, referenceId, expiryTime, riskScore);
        emit AMLStatusUpdated(user, amlStatus);

        return true;
    }

    /**
     * @dev Rejects KYC verification
     * @param user User address to reject
     * @param referenceId Bridge API reference ID
     * @param reason Rejection reason
     */
    function rejectVerification(
        address user,
        string memory referenceId,
        string memory reason
    ) external onlyKYCProvider returns (bool) {
        require(user != address(0), "Invalid user address");
        require(
            verifications[user].status == VerificationStatus.PENDING,
            "Verification is not pending"
        );
        require(bytes(reason).length > 0, "Rejection reason required");

        verifications[user].status = VerificationStatus.REJECTED;
        verifications[user].rejectionReason = reason;

        kycProviders[msg.sender].rejectionCount++;

        emit VerificationRejected(user, referenceId, reason);

        return true;
    }

    /**
     * @dev Suspends a user's KYC verification (e.g., for AML violations)
     * @param user User address to suspend
     * @param reason Suspension reason
     */
    function suspendVerification(address user, string memory reason)
        external
        onlyKYCProvider
        returns (bool)
    {
        require(user != address(0), "Invalid user address");
        require(
            verifications[user].status == VerificationStatus.APPROVED,
            "Only approved verifications can be suspended"
        );
        require(bytes(reason).length > 0, "Suspension reason required");

        verifications[user].status = VerificationStatus.SUSPENDED;
        verifications[user].amlStatus = "SUSPICIOUS";

        emit VerificationSuspended(user, verifications[user].bridgeReferenceId, reason);
        return true;
    }

    /**
     * @dev Updates risk score for a user
     * @param user User address
     * @param newRiskScore New risk score
     */
    function updateRiskScore(address user, uint8 newRiskScore)
        external
        onlyKYCProvider
        returns (bool)
    {
        require(user != address(0), "Invalid user address");
        require(
            verifications[user].status == VerificationStatus.APPROVED,
            "Verification is not approved"
        );
        require(newRiskScore <= maxAllowedRiskScore, "Risk score exceeds maximum allowed");

        uint8 oldScore = verifications[user].riskScore;
        verifications[user].riskScore = newRiskScore;

        emit RiskScoreUpdated(user, oldScore, newRiskScore);
        return true;
    }

    /**
     * @dev Gets verification status for a user
     * @param user User address
     */
    function getVerificationStatus(address user)
        external
        view
        returns (
            VerificationStatus status,
            uint256 expiryTime,
            uint8 riskScore,
            string memory amlStatus
        )
    {
        VerificationRecord memory record = verifications[user];

        // Check if verification has expired
        VerificationStatus currentStatus = record.status;
        if (
            currentStatus == VerificationStatus.APPROVED &&
            block.timestamp > record.expiryTimestamp
        ) {
            currentStatus = VerificationStatus.EXPIRED;
        }

        return (currentStatus, record.expiryTimestamp, record.riskScore, record.amlStatus);
    }

    /**
     * @dev Gets full verification record for a user
     * @param user User address
     */
    function getVerificationRecord(address user)
        external
        view
        returns (VerificationRecord memory)
    {
        return verifications[user];
    }

    /**
     * @dev Checks if user is KYC verified and not expired
     * @param user User address
     */
    function isVerifiedAndActive(address user) external view returns (bool) {
        VerificationRecord memory record = verifications[user];

        if (record.status != VerificationStatus.APPROVED) {
            return false;
        }

        if (block.timestamp > record.expiryTimestamp) {
            return false;
        }

        return true;
    }

    /**
     * @dev Gets KYC provider information
     * @param provider Provider address
     */
    function getProviderInfo(address provider)
        external
        view
        returns (KYCProvider memory)
    {
        return kycProviders[provider];
    }

    /**
     * @dev Gets all KYC providers
     */
    function getAllProviders() external view returns (address[] memory) {
        return providersList;
    }

    /**
     * @dev Sets verification expiry period
     * @param newPeriod New expiry period in seconds
     */
    function setVerificationExpiryPeriod(uint256 newPeriod) external onlyAdmin {
        require(newPeriod > 0, "Expiry period must be greater than zero");
        verificationExpiryPeriod = newPeriod;
        emit VerificationExpiryPeriodUpdated(newPeriod);
    }

    /**
     * @dev Sets maximum allowed risk score
     * @param newMaxScore New maximum risk score (0-100)
     */
    function setMaxAllowedRiskScore(uint8 newMaxScore) external onlyAdmin {
        require(newMaxScore <= 100, "Risk score cannot exceed 100");
        maxAllowedRiskScore = newMaxScore;
        emit MaxRiskScoreUpdated(newMaxScore);
    }

    /**
     * @dev Updates admin address
     * @param newAdmin New admin address
     */
    function setAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid admin address");
        admin = newAdmin;
    }
}
