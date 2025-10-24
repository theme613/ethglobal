# MetaMask Integration Testing Guide

## ✅ Everything is Set Up!

Your contracts are deployed and the environment is configured. Here's how to test the MetaMask integration:

## 🚀 Step-by-Step Testing

### 1. Start Local Blockchain
```bash
npx hardhat node
```
Keep this running in a terminal.

### 2. Start Your Frontend
```bash
npm run dev
```
Your app should be running on http://localhost:3000

### 3. Configure MetaMask

#### Add Localhost Network:
1. Open MetaMask
2. Click on network dropdown (top of MetaMask)
3. Click "Add network" → "Add a network manually"
4. Fill in these details:
   - **Network Name**: Localhost 8545
   - **RPC URL**: http://localhost:8545
   - **Chain ID**: 31337
   - **Currency Symbol**: ETH
   - **Block Explorer URL**: (leave empty)

#### Import Test Account:
1. Click MetaMask account icon (top right)
2. Click "Import Account"
3. Select "Private Key"
4. Enter this private key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
5. Click "Import"

This account has 10,000 ETH for testing.

### 4. Test SBT Minting

1. Go to your app: http://localhost:3000
2. Connect MetaMask wallet
3. Navigate to the SBT minting page
4. Click "Mint SBT" button
5. **MetaMask popup should appear** asking for transaction confirmation
6. Click "Confirm" in MetaMask
7. Wait for transaction to complete
8. You should see "SBT minted successfully" message

### 5. Test PYUSD Payments

1. Navigate to the access control page
2. Click "Pay with PYUSD" button
3. **MetaMask popup should appear** asking for transaction confirmation
4. Click "Confirm" in MetaMask
5. Wait for transaction to complete
6. You should see "Payment completed successfully" message

## 🔍 What You Should See

### ✅ Success Indicators:
- MetaMask popup appears for each transaction
- Transaction is confirmed on blockchain
- Real transaction hash is displayed
- Block number is shown
- Gas fees are deducted from your wallet
- Transaction appears in MetaMask activity

### ❌ If Something Goes Wrong:

#### "MetaMask is not installed":
- Install MetaMask browser extension
- Refresh the page

#### "Contract address not configured":
- Check that `.env.local` file exists
- Restart your development server

#### "Transaction failed":
- Make sure local blockchain is running
- Check you have enough ETH for gas fees
- Verify MetaMask is connected to localhost network

#### "Origin not found on Allowlist":
- This should be fixed now with the updated configuration

## 📊 Contract Addresses

Your deployed contracts:
```
MockPYUSD: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
SoulBoundToken: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
PYUSDKYCSubscription: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
PYUSDPaymentGateway: 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
KYCVerification: 0x5FC8d32690cc91D4c39d9d3abcBD16989F875707
Payments: 0x0165878A594ca255338adfa4d48449f69242Eb8F
```

## 🎯 Expected Behavior

### SBT Minting Flow:
1. User clicks "Mint SBT"
2. MetaMask popup appears
3. User confirms transaction
4. Transaction is sent to blockchain
5. SBT is minted with real token ID
6. Success message is displayed

### PYUSD Payment Flow:
1. User clicks "Pay with PYUSD"
2. MetaMask popup appears
3. User confirms transaction
4. PYUSD payment is processed
5. Transaction is confirmed on blockchain
6. Success message is displayed

## 🔧 Troubleshooting

### Common Issues:

1. **"No signer available"**
   - Make sure MetaMask is connected
   - Check you're on the correct network

2. **"Transaction failed"**
   - Check gas fees and wallet balance
   - Verify contract addresses are correct

3. **"Contract not found"**
   - Make sure local blockchain is running
   - Verify contract addresses in `.env.local`

### Debug Steps:

1. Check browser console for error messages
2. Verify MetaMask network settings
3. Check that contracts are deployed
4. Verify environment variables

## 🎉 Success!

If everything works correctly, you should see:
- ✅ Real MetaMask transaction popups
- ✅ Actual blockchain transactions
- ✅ Transaction hashes and block numbers
- ✅ Gas fees deducted from wallet
- ✅ Real contract interactions

Your system is now using real MetaMask transactions instead of hardcoded simulations!
