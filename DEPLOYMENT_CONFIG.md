# Deployment Configuration

## ✅ Contracts Successfully Deployed!

### Contract Addresses (Localhost Network)
```
MockPYUSD: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
SoulBoundToken: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
PYUSDKYCSubscription: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
PYUSDPaymentGateway: 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
KYCVerification: 0x5FC8d32690cc91D4c39d9d3abcBD16989F875707
Payments: 0x0165878A594ca255338adfa4d48449f69242Eb8F
```

### Environment Variables
Create a `.env.local` file in your project root with these values:

```bash
# Contract Addresses (deployed to localhost)
NEXT_PUBLIC_SBT_CONTRACT_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
NEXT_PUBLIC_SUBSCRIPTION_CONTRACT_ADDRESS=0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
NEXT_PUBLIC_PAYMENT_GATEWAY_ADDRESS=0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
NEXT_PUBLIC_MOCK_PYUSD_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
NEXT_PUBLIC_KYC_VERIFICATION_ADDRESS=0x5FC8d32690cc91D4c39d9d3abcBD16989F875707
NEXT_PUBLIC_PAYMENTS_ADDRESS=0x0165878A594ca255338adfa4d48449f69242Eb8F

# WalletConnect Project ID (for development)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=default_project_id

# Network Configuration
NEXT_PUBLIC_NETWORK=localhost
NEXT_PUBLIC_RPC_URL=http://localhost:8545
```

## 🚀 How to Test

### 1. Start Local Blockchain
```bash
npx hardhat node
```

### 2. Configure MetaMask
- Add network: http://localhost:8545
- Chain ID: 31337
- Currency: ETH

### 3. Import Test Account
- Import the deployer account: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- Private key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

### 4. Test the Integration
1. Connect MetaMask to localhost network
2. Go to your app and try minting SBT
3. Try making PYUSD payments
4. Check transactions in MetaMask

## 📊 Contract Details

### MockPYUSD
- **Address**: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`
- **Purpose**: Test PYUSD token for development
- **Decimals**: 6

### SoulBoundToken
- **Address**: `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0`
- **Purpose**: Non-transferable tokens for KYC verification
- **Standard**: EIP-5192

### PYUSDKYCSubscription
- **Address**: `0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9`
- **Purpose**: KYC-gated subscription payments
- **Fee**: 1 PYUSD

### PYUSDPaymentGateway
- **Address**: `0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9`
- **Purpose**: Payment gateway with KYC compliance

### KYCVerification
- **Address**: `0x5FC8d32690cc91D4c39d9d3abcBD16989F875707`
- **Purpose**: KYC/AML verification management

### Payments
- **Address**: `0x0165878A594ca255338adfa4d48449f69242Eb8F`
- **Purpose**: Basic PYUSD payment functionality

## 🎯 Next Steps

1. **Create `.env.local`** file with the contract addresses
2. **Start your frontend** application
3. **Connect MetaMask** to localhost network
4. **Test SBT minting** and PYUSD payments
5. **Verify transactions** in MetaMask

## 🔧 Troubleshooting

### If you see "Contract address not configured":
1. Make sure `.env.local` file exists
2. Check that contract addresses are correct
3. Restart your development server

### If MetaMask shows "Network not found":
1. Add localhost network manually
2. Use Chain ID: 31337
3. Use RPC URL: http://localhost:8545

### If transactions fail:
1. Make sure local blockchain is running
2. Check you have enough ETH for gas
3. Verify contract addresses are correct

The contracts are now deployed and ready for testing with real MetaMask transactions!
