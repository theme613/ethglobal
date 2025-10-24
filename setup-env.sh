#!/bin/bash

echo "🚀 Setting up environment for MetaMask integration..."

# Create .env.local file with contract addresses
cat > .env.local << EOF
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
EOF

echo "✅ Environment file created: .env.local"
echo ""
echo "📋 Contract Addresses:"
echo "====================="
echo "MockPYUSD: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
echo "SoulBoundToken: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
echo "PYUSDKYCSubscription: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
echo "PYUSDPaymentGateway: 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"
echo "KYCVerification: 0x5FC8d32690cc91D4c39d9d3abcBD16989F875707"
echo "Payments: 0x0165878A594ca255338adfa4d48449f69242Eb8F"
echo ""
echo "🎯 Next Steps:"
echo "1. Start local blockchain: npx hardhat node"
echo "2. Start your frontend: npm run dev"
echo "3. Connect MetaMask to localhost network"
echo "4. Test SBT minting and PYUSD payments"
echo ""
echo "✅ Setup complete!"
