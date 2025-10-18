# KYC Verification System - Complete Implementation Guide

## Overview

This document provides a complete guide to the KYC/AML verification system integrated with PYUSD payments using Soul Bound Tokens (SBTs). The system follows the 8-step architecture for compliance and access control.

## Architecture Overview

```
1. Privy Login (Embedded Wallet)
   ↓
2. KYC Form (Collect PII)
   ↓
3. Submit to Bridge API
   ↓
4. AML Screening
   ↓
5. Get Status
   ↓
6. Mint SBT (Non-transferable token)
   ↓
7. Gate PYUSD Payments (Only verified users)
   ↓
8. Ongoing Monitoring
```

## Smart Contracts

### 1. SoulBoundToken.sol (EIP-5192)

**Purpose**: Non-transferable tokens that prove KYC verification

**Key Features**:
- EIP-5192 standard implementation
- Non-transferable (soulbound) design
- Expiry management
- Risk scoring integration

**Key Functions**:
```solidity
// Mint KYC token for verified user
mintKYCToken(address user, uint256 expiryTime) → uint256 tokenId

// Revoke KYC verification
revokeKYC(address user)

// Check if user is verified
isKYCVerified(address user) → bool

// Get remaining expiry time
getKYCExpiryTime(address user) → uint256
```

### 2. KYCVerification.sol

**Purpose**: Manages KYC/AML verification workflow with Bridge API integration

**Key Features**:
- KYC provider management
- Verification submission tracking
- AML status recording
- Risk score management
- Expiry period configuration

**Key Functions**:
```solidity
// Add KYC provider
addKYCProvider(address provider, string memory providerName)

// Submit verification
submitVerification(address user, string referenceId, string verificationData)

// Approve verification
approveVerification(address user, string referenceId, uint8 riskScore, string amlStatus)

// Reject verification
rejectVerification(address user, string referenceId, string reason)

// Check if verified and active
isVerifiedAndActive(address user) → bool
```

### 3. PYUSDPaymentGateway.sol

**Purpose**: PYUSD payment processing with SBT gating

**Key Features**:
- KYC requirement enforcement
- Fee management
- Batch payment support
- Reentrancy protection
- Payment history tracking

**Key Functions**:
```solidity
// Send single payment (requires KYC)
sendPayment(address recipient, uint256 amount, string transactionId) → bool

// Send batch payments
sendBatchPayments(address[] recipients, uint256[] amounts) → bool

// Get user statistics
getUserStats(address user) → (paymentCount, totalAmount, hasKYC)

// Get payment history
getPaymentHistory(uint256 limit) → Payment[]
```

## Deployment Instructions

### Step 1: Install Dependencies

```bash
npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers @openzeppelin/contracts
```

### Step 2: Compile Contracts

```bash
npx hardhat compile
```

### Step 3: Deploy to Testnet

```bash
# Deploy to Hardhat local network
npx hardhat run scripts/deploy.js

# Deploy to specific network (e.g., Sepolia)
npx hardhat run scripts/deploy.js --network sepolia
```

### Step 4: Update Configuration

After deployment, update your frontend configuration with:
- `SoulBoundToken` contract address
- `KYCVerification` contract address
- `PYUSDPaymentGateway` contract address
- PYUSD token address (on your target network)

## KYC Verification Flow

### Frontend Integration (Next.js)

#### Step 1: KYC Form Component

```javascript
// src/components/KYCForm.js
import { useAccount } from 'wagmi';
import { submitKYCForm } from '@/services/kycService';

export function KYCForm() {
  const { address } = useAccount();
  
  const handleSubmit = async (formData) => {
    try {
      const result = await submitKYCForm(address, formData);
      // Handle success
    } catch (error) {
      console.error('KYC submission failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="firstName" placeholder="First Name" required />
      <input name="lastName" placeholder="Last Name" required />
      <input name="dateOfBirth" type="date" required />
      <select name="countryOfResidence" required>
        <option>Select Country</option>
        {/* Country options */}
      </select>
      <input name="email" type="email" required />
      <input name="phoneNumber" type="tel" required />
      {/* Document upload fields */}
      <button type="submit">Submit KYC</button>
    </form>
  );
}
```

#### Step 2: KYC Service Integration

```javascript
// src/services/kycService.js
import { submitKYCToBridgeAPI } from '@/utils/bridgeApi';

export async function submitKYCForm(userAddress, formData) {
  try {
    // 1. Submit to Bridge API
    const bridgeResponse = await submitKYCToBridgeAPI(userAddress, formData);
    
    // 2. Store in backend database with reference ID
    await fetch('/api/kyc/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userAddress,
        referenceId: bridgeResponse.referenceId,
        timestamp: new Date()
      })
    });

    // 3. Return reference ID for tracking
    return bridgeResponse;
  } catch (error) {
    throw new Error('KYC submission failed: ' + error.message);
  }
}
```

#### Step 3: Backend Processing

```javascript
// backend/routes/kyc.js
app.post('/api/kyc/approve', async (req, res) => {
  const { userAddress, referenceId, riskScore, amlStatus } = req.body;

  try {
    // 1. Get signer for contract interaction
    const signer = await ethers.getSigner();
    
    // 2. Approve verification on KYCVerification contract
    const kycVerification = await ethers.getContractAt(
      'KYCVerification',
      process.env.KYC_VERIFICATION_ADDRESS,
      signer
    );
    
    await kycVerification.approveVerification(
      userAddress,
      referenceId,
      riskScore,
      amlStatus
    );

    // 3. Mint SBT
    const soulBoundToken = await ethers.getContractAt(
      'SoulBoundToken',
      process.env.SOUL_BOUND_TOKEN_ADDRESS,
      signer
    );
    
    const expiryTime = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
    await soulBoundToken.mintKYCToken(userAddress, expiryTime);

    res.json({ success: true, message: 'KYC approved and SBT minted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Testing

### Run All Tests

```bash
npx hardhat test
```

### Run Specific Test Suite

```bash
# Test SoulBoundToken
npx hardhat test test/SoulBoundToken.test.js

# Test KYCVerification
npx hardhat test test/KYCVerification.test.js

# Test PYUSDPaymentGateway
npx hardhat test test/PYUSDPaymentGateway.test.js
```

### Test Coverage

```bash
npx hardhat coverage
```

## Configuration

### Environment Variables

Create a `.env` file:

```env
# Network Configuration
PRIVATE_KEY=your_private_key
INFURA_API_KEY=your_infura_key

# Bridge API
BRIDGE_API_KEY=your_bridge_api_key

# Contract Addresses
SOUL_BOUND_TOKEN_ADDRESS=deployed_address
KYC_VERIFICATION_ADDRESS=deployed_address
PYUSD_PAYMENT_GATEWAY_ADDRESS=deployed_address

# PYUSD Token Address (on your network)
PYUSD_TOKEN_ADDRESS=pyusd_address

# Treasury
TREASURY_ADDRESS=treasury_address
```

### Hardhat Configuration

The `hardhat.config.js` includes:
- Solidity 0.8.20 compiler
- Optimizer settings (runs: 1000)
- Network configurations
- Gas reporter setup

## API Integration with Bridge API

### Bridge API Implementation

```javascript
// utils/bridgeApi.js
async function callBridgeAPI(endpoint, method, data) {
  const response = await fetch(`https://api.bridge.xyz${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.BRIDGE_API_KEY}`
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error(`Bridge API error: ${response.statusText}`);
  }

  return await response.json();
}

export async function submitKYCToBridge(userAddress, kycData) {
  // Prepare payload with encrypted PII
  const payload = {
    userAddress,
    firstName: encryptData(kycData.firstName),
    lastName: encryptData(kycData.lastName),
    // ... other fields
  };

  return await callBridgeAPI('/kyc/verify', 'POST', payload);
}

export async function getKYCStatus(referenceId) {
  return await callBridgeAPI(`/kyc/status/${referenceId}`, 'GET');
}
```

## Security Considerations

### 1. PII Encryption

All personally identifiable information (PII) should be encrypted before transmission:

```javascript
import crypto from 'crypto';

function encryptData(data) {
  const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}
```

### 2. Access Control

- Only authorized KYC providers can approve/reject verifications
- Only contract owner can update critical settings
- Users cannot transfer or approve their SBT tokens

### 3. Rate Limiting

Implement rate limiting on KYC submission endpoints to prevent abuse:

```javascript
import rateLimit from 'express-rate-limit';

const kycLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5, // 5 submissions per day
  message: 'Too many KYC submissions, please try again tomorrow'
});

app.post('/api/kyc/submit', kycLimiter, async (req, res) => {
  // ... KYC submission logic
});
```

### 4. Monitoring

Implement continuous AML monitoring for risk score changes:

```javascript
// backend/monitoring/amlMonitor.js
async function monitorUserRiskScores() {
  const kycVerification = await ethers.getContractAt(
    'KYCVerification',
    process.env.KYC_VERIFICATION_ADDRESS
  );

  // Periodically check for suspicious activity
  // Update risk scores if needed
  // Suspend accounts if necessary
}

// Run every hour
setInterval(monitorUserRiskScores, 60 * 60 * 1000);
```

## Compliance Features

### 1. Regulatory Compliance

- **KYC (Know Your Customer)**: Identity verification via Bridge API
- **AML (Anti-Money Laundering)**: Risk scoring and screening
- **Ongoing Monitoring**: Continuous risk assessment

### 2. Audit Trail

All verification events are logged on-chain:
- `VerificationSubmitted`
- `VerificationApproved`
- `VerificationRejected`
- `VerificationSuspended`

### 3. Data Retention

- KYC records retained for 7 years (regulatory requirement)
- Encrypted storage for PII
- Immutable blockchain records

## Troubleshooting

### Common Issues

#### 1. "User does not have KYC verification"

**Problem**: User tries to send PYUSD without KYC

**Solution**: 
- Ensure user has completed KYC
- Check SBT balance: `soulBoundToken.balanceOf(userAddress)`
- Verify KYC is not expired

#### 2. "Risk score exceeds maximum allowed"

**Problem**: Bridge API returned high risk score

**Solution**:
- Review user details for discrepancies
- Contact user for additional documentation
- Adjust max allowed risk score if policy changes

#### 3. "Insufficient token allowance"

**Problem**: User hasn't approved PYUSD transfers

**Solution**:
- Ensure user approves payment gateway: `pyusd.approve(gatewayAddress, amount)`
- Check allowance: `pyusd.allowance(userAddress, gatewayAddress)`

## Future Enhancements

1. **Multi-chain Support**: Deploy on multiple chains (Polygon, Arbitrum, etc.)
2. **Improved Analytics**: Dashboard for KYC metrics and compliance reporting
3. **Advanced Monitoring**: Machine learning for fraud detection
4. **DAO Governance**: Community-driven policy decisions
5. **Integration**: Support for more KYC providers beyond Bridge API

## Support & Resources

- **Bridge API Documentation**: https://docs.bridge.xyz
- **OpenZeppelin Contracts**: https://docs.openzeppelin.com/contracts/
- **Hardhat Documentation**: https://hardhat.org/docs
- **Solidity Documentation**: https://docs.soliditylang.org/

## License

This implementation is provided as-is for educational and development purposes.
