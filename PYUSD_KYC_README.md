# PYUSD KYC Subscription System

A complete smart contract system for KYC-gated PYUSD payments with Soul Bound Token (SBT) verification.

## 🏗️ Architecture

This system implements a two-contract architecture:

1. **SoulBoundToken (SBT)** - EIP-5192 compliant non-transferable NFT for KYC verification
2. **PYUSDKYCSubscription** - Main contract that gates PYUSD payments behind SBT ownership

## 📋 Features

### SoulBoundToken Contract
- ✅ EIP-5192 compliant (non-transferable NFTs)
- ✅ Owner-controlled minting (after off-chain KYC)
- ✅ Revocation capability for compliance violations
- ✅ Batch operations for efficiency
- ✅ Gas-optimized storage

### PYUSDKYCSubscription Contract
- ✅ PYUSD payment gating (requires SBT)
- ✅ ETH gas reimbursement system
- ✅ Comprehensive event logging
- ✅ Admin functions for fee management
- ✅ Security modifiers and validations

## 🚀 Deployment

### Prerequisites
```bash
npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers
```

### Deploy to Sepolia Testnet
```bash
# Set up environment variables
export SEPOLIA_RPC_URL="your_sepolia_rpc_url"
export PRIVATE_KEY="your_private_key"

# Deploy contracts
npx hardhat run scripts/deployPYUSDKYC.js --network sepolia
```

### Deploy to Ethereum Mainnet
```bash
# Set up environment variables
export MAINNET_RPC_URL="your_mainnet_rpc_url"
export PRIVATE_KEY="your_private_key"

# Deploy contracts
npx hardhat run scripts/deployPYUSDKYC.js --network mainnet
```

## 🔧 Usage Flow

### 1. Initial Setup
```javascript
// Deploy contracts (see deployment script)
const sbt = await SoulBoundToken.deploy();
const subscription = await PYUSDKYCSubscription.deploy(
  PYUSD_ADDRESS,  // 0x6c3ea9036406852006290770bedfcaba0e23a0e8 on mainnet
  sbt.address,
  feeAmount       // 1e6 for 1 PYUSD (6 decimals)
);

// Fund contract with ETH for reimbursements
await subscription.depositETH({ value: ethers.utils.parseEther("1.0") });
```

### 2. KYC Verification Process
```javascript
// After off-chain KYC verification, mint SBT to user
await sbt.mint(userAddress);
```

### 3. User Payment Flow
```javascript
// User approves PYUSD spending
await pyusd.approve(subscription.address, feeAmount);

// User pays subscription fee (requires SBT)
await subscription.paySubscription();

// User claims ETH gas reimbursement
await subscription.claimEthGas(ethers.utils.parseEther("0.01"));
```

## 📊 Contract Addresses

### Mainnet
- **PYUSD**: `0x6c3ea9036406852006290770bedfcaba0e23a0e8`
- **SoulBoundToken**: `[Deploy to get address]`
- **PYUSDKYCSubscription**: `[Deploy to get address]`

### Sepolia Testnet
- **PYUSD**: `[Update with Sepolia PYUSD address]`
- **SoulBoundToken**: `[Deploy to get address]`
- **PYUSDKYCSubscription**: `[Deploy to get address]`

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/PYUSDKYCSubscription.test.js

# Run with gas reporting
REPORT_GAS=true npx hardhat test
```

## 🔒 Security Features

### Access Control
- ✅ Owner-only admin functions
- ✅ SBT-gated payment requirements
- ✅ Reentrancy protection
- ✅ Input validation

### Compliance
- ✅ No PII storage on-chain
- ✅ SBT revocation capability
- ✅ Audit trail via events
- ✅ Transparent fee structure

## 📈 Gas Optimization

### SoulBoundToken
- **Mint**: ~45,000 gas
- **Revoke**: ~25,000 gas
- **Balance Check**: ~2,300 gas

### PYUSDKYCSubscription
- **Pay Subscription**: ~65,000 gas
- **Claim Reimbursement**: ~35,000 gas
- **Deposit ETH**: ~21,000 gas

## 🎯 Integration Guide

### Frontend Integration
```javascript
// Check if user has SBT
const hasSBT = await sbt.balanceOf(userAddress) > 0;

// Check if user has paid
const hasPaid = await subscription.paid(userAddress);

// Get contract statistics
const stats = await subscription.getStats();
```

### Event Monitoring
```javascript
// Listen for payment events
subscription.on("FeePaid", (payer, amount, timestamp) => {
  console.log(`User ${payer} paid ${amount} PYUSD`);
});

// Listen for reimbursement events
subscription.on("GasReimbursed", (user, ethAmount, timestamp) => {
  console.log(`User ${user} claimed ${ethAmount} ETH`);
});
```

## 🔄 Admin Operations

### Fee Management
```javascript
// Update subscription fee
await subscription.updateFeeAmount(newFeeAmount);

// Withdraw collected PYUSD fees
await subscription.withdrawFees();
```

### SBT Management
```javascript
// Mint SBT to verified users
await sbt.mint(userAddress);

// Batch mint to multiple users
await sbt.batchMint([user1, user2, user3]);

// Revoke SBT for compliance violations
await sbt.revoke(userAddress);
```

## 📝 Events

### SoulBoundToken Events
- `Minted(address indexed to, uint256 indexed tokenId)`
- `Revoked(address indexed from, uint256 indexed tokenId)`
- `Locked(uint256 indexed tokenId)`
- `Unlocked(uint256 indexed tokenId)`

### PYUSDKYCSubscription Events
- `FeePaid(address indexed payer, uint256 amount, uint256 timestamp)`
- `GasReimbursed(address indexed user, uint256 ethAmount, uint256 timestamp)`
- `ETHDeposited(address indexed depositor, uint256 amount)`
- `FeesWithdrawn(address indexed owner, uint256 amount)`

## 🚨 Important Notes

1. **PYUSD Integration**: Uses official PYUSD proxy contract on mainnet
2. **KYC Process**: All KYC verification happens off-chain
3. **SBT Security**: SBTs are non-transferable and can be revoked
4. **Gas Reimbursement**: Optional feature for user experience
5. **Admin Functions**: Owner has control over fees and SBT minting

## 🔧 Troubleshooting

### Common Issues
- **"Not KYC-verified"**: User needs SBT minted first
- **"Already paid"**: User can only pay once
- **"Contract low on ETH"**: Need to deposit more ETH for reimbursements
- **"PYUSD transfer failed"**: User needs to approve PYUSD spending

### Debug Commands
```javascript
// Check user's SBT status
await sbt.balanceOf(userAddress);

// Check payment status
await subscription.paid(userAddress);

// Check contract balances
const stats = await subscription.getStats();
console.log("ETH Balance:", ethers.utils.formatEther(stats.ethBalance));
console.log("PYUSD Balance:", ethers.utils.formatUnits(stats.pyusdBalance, 6));
```

## 📞 Support

For technical support or questions:
- Create an issue in the repository
- Contact: security@yourproject.com
- Documentation: [Link to docs]

---

**⚠️ Disclaimer**: This is a demonstration system. For production use, ensure proper security audits and compliance with local regulations.
