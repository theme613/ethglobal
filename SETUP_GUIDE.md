# Quick Setup Guide

## 🚀 Getting Started

### 1. Start Development Server
```bash
npm run dev
```
The server will start at `http://localhost:3000`

### 2. Complete KYC Flow
1. **Login Page** (`/login`) - Connect wallet or create embedded wallet
2. **KYC Submission** (`/kyc-submission`) - Fill out personal information
3. **Verification** (`/verification`) - API submit, AML screening, review
4. **SBT Minting** (`/sbt-minting`) - Mint Soul Bound Token
5. **Access Control** (`/access-control`) - Smart contract gating
6. **Monitoring** (`/monitoring`) - Ongoing compliance checks

### 3. Smart Contract Deployment
```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia
```

## 🎯 Demo Flow for Judges

### Step 1: Login
- Navigate to `/login`
- Connect external wallet or create embedded wallet
- Proceed to KYC submission

### Step 2: KYC Submission
- Navigate to `/kyc-submission`
- Fill out all required fields:
  - Personal information
  - Address details
  - Identity documents
  - Contact information
- Submit KYC data

### Step 3: Verification Process
- Navigate to `/verification`
- Watch real-time verification steps:
  - KYC API Submit
  - AML Screening
  - Review Process
- See verification results

### Step 4: SBT Minting
- Navigate to `/sbt-minting`
- Mint Soul Bound Token
- View transaction details
- Verify SBT ownership

### Step 5: Access Control
- Navigate to `/access-control`
- See granted permissions
- Access to PYUSD payments
- Social features enabled

### Step 6: Monitoring
- Navigate to `/monitoring`
- View compliance status
- Check renewal options
- Monitor transaction history

## 🔧 Key Features to Highlight

### Smart Contracts
- **SoulBoundToken.sol** - EIP-5192 compliant non-transferable NFTs
- **PYUSDPaymentGateway.sol** - KYC-gated payment processing
- **Access Control** - SBT-based permission system

### Frontend
- **8-Step KYC Flow** - Complete verification process
- **Real-time Updates** - Live status tracking
- **Multi-page Architecture** - Clean user experience
- **English Interface** - International ready

### Integration
- **Bridge API** - Real KYC verification
- **Smart Contract** - On-chain verification
- **Payment Gateway** - PYUSD transactions
- **Monitoring** - Compliance tracking

## 📱 Navigation

- **Home**: `/` - Landing page
- **Login**: `/login` - Wallet connection
- **KYC**: `/kyc-submission` - Personal information
- **Verification**: `/verification` - API processing
- **SBT**: `/sbt-minting` - Token minting
- **Access**: `/access-control` - Permissions
- **Monitoring**: `/monitoring` - Compliance

## 🎯 Judge Demo Points

1. **Real KYC Verification** - Bridge API integration
2. **Smart Contract Gating** - SBT-based access control
3. **Complete 8-Step Flow** - End-to-end user experience
4. **Multi-page Architecture** - Clean separation of concerns
5. **English Interface** - International ready
6. **Deployment Ready** - Production ready code

## 🚀 Ready to Demo!

The system is now running and ready for judge demonstration. All 8 steps of the KYC verification flow are implemented and working.
