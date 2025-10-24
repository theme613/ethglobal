# MetaMask Integration Guide

## Overview
This guide explains how to integrate real MetaMask transactions instead of hardcoded simulations in your KYC system.

## ✅ Changes Made

### 1. Updated Wallet Provider
- Configured proper WalletConnect project ID
- Updated app name to "PYUSD KYC System"

### 2. Updated Contract Service
- Replaced hardcoded ABIs with real contract ABIs from artifacts
- Added proper contract address configuration
- Implemented real MetaMask transaction calls
- Added proper error handling and transaction confirmation

### 3. Updated Frontend Pages
- **SBT Minting Page**: Now uses real `mint()` function calls
- **Access Control Page**: Now uses real `paySubscription()` function calls
- Added proper ethers.js integration
- Added transaction hash and block number tracking

## 🔧 Configuration Required

### 1. Environment Variables
Create a `.env.local` file with the following variables:

```bash
# WalletConnect Project ID (get from https://cloud.walletconnect.com/)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here

# Contract Addresses (update these with your deployed contract addresses)
NEXT_PUBLIC_SBT_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_SUBSCRIPTION_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_PAYMENT_GATEWAY_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_MOCK_PYUSD_ADDRESS=0x0000000000000000000000000000000000000000

# Network Configuration
NEXT_PUBLIC_NETWORK=sepolia
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/your_infura_project_id
```

### 2. Deploy Contracts
Deploy your contracts and update the addresses in the environment variables:

```bash
# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia
```

### 3. Update Contract Addresses
After deployment, update the contract addresses in your `.env.local` file.

## 🚀 How It Works Now

### SBT Minting Process
1. User connects MetaMask wallet
2. User clicks "Mint SBT" button
3. MetaMask popup appears for transaction confirmation
4. Real blockchain transaction is sent to the SBT contract
5. Transaction is confirmed on the blockchain
6. SBT is minted and token ID is returned

### PYUSD Payment Process
1. User must have SBT (KYC verified)
2. User clicks "Pay with PYUSD" button
3. MetaMask popup appears for transaction confirmation
4. Real PYUSD transfer transaction is sent
5. Transaction is confirmed on the blockchain
6. Payment status is updated

## 🔍 Transaction Verification

### What You'll See Now
- **Real MetaMask popups** for transaction confirmation
- **Actual blockchain transactions** with real transaction hashes
- **Block confirmation** with block numbers
- **Gas fees** deducted from your wallet
- **Transaction receipts** with all details

### Transaction Details Stored
- Transaction hash
- Block number
- Gas used
- Timestamp
- Success/failure status

## 🛠️ Testing

### Before Testing
1. Make sure you have ETH in your wallet for gas fees
2. Make sure you have PYUSD tokens for payments
3. Deploy contracts to testnet first

### Test Flow
1. Connect MetaMask wallet
2. Complete KYC verification (if needed)
3. Mint SBT - you'll see MetaMask popup
4. Pay PYUSD subscription - you'll see MetaMask popup
5. Check transaction on blockchain explorer

## 🚨 Important Notes

### Security
- All transactions now require MetaMask confirmation
- No more hardcoded/simulated transactions
- Real blockchain state changes

### User Experience
- Users will see MetaMask popups for each transaction
- Transactions may take time to confirm
- Gas fees will be deducted from wallet

### Error Handling
- Proper error messages for failed transactions
- Wallet connection validation
- Contract interaction validation

## 🔧 Troubleshooting

### Common Issues
1. **"No signer available"** - Make sure MetaMask is connected
2. **"Transaction failed"** - Check gas fees and token balances
3. **"Contract not found"** - Verify contract addresses are correct

### Debug Steps
1. Check browser console for error messages
2. Verify contract addresses in environment variables
3. Check MetaMask network settings
4. Verify contract deployment

## 📱 MetaMask Requirements

### User Requirements
- MetaMask extension installed
- Wallet connected to the correct network
- Sufficient ETH for gas fees
- PYUSD tokens for payments (if applicable)

### Network Configuration
- Make sure MetaMask is connected to the correct network (Sepolia for testing)
- Add network if not already configured

## 🎯 Next Steps

1. **Deploy Contracts**: Deploy your contracts to testnet
2. **Update Addresses**: Update contract addresses in environment variables
3. **Test Transactions**: Test the real MetaMask integration
4. **Deploy to Mainnet**: When ready, deploy to mainnet

## 📊 Benefits of Real Integration

- ✅ **Real blockchain transactions**
- ✅ **MetaMask wallet integration**
- ✅ **Transaction confirmation**
- ✅ **Gas fee handling**
- ✅ **Error handling**
- ✅ **Transaction tracking**
- ✅ **Blockchain verification**
