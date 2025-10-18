# DeFi Social Hub - KYC Verification System

A complete KYC verification system with 8-step architecture, implementing Soul Bound Tokens (SBT) and PYUSD payment gateway with compliance gating.

## 🏗️ Architecture (8-Step Flow)

1. **Login** - Privy wallet/identity (embedded wallets)
2. **PII Submission** - Name, DOB, Address, ID + images via Privy UI
3. **KYC API Submit** - Data sent to Bridge sandbox API
4. **AML Screening** - Automated off-chain compliance check
5. **Review** - Provider returns verification status
6. **SBT Issuance** - Mint Soul Bound Token via JSC Mizuhiki Protocol
7. **Access Control** - Smart contract gating based on SBT ownership
8. **Monitor/Renewal** - Ongoing compliance checks and status updates

## 🚀 Features

### Smart Contracts (Solidity)
- **SBT Contract** implementing EIP-5192 (non-transferable NFTs)
- **Access Control** modifiers checking SBT ownership
- **PYUSD Payment Contract** with compliance gating
- **Events** for monitoring and compliance tracking
- **Admin Functions** for minting/revoking SBTs
- **Deployed to Ethereum Sepolia testnet**

### Frontend (Next.js + React)
- **Multi-page KYC flow** with step-by-step verification
- **Real-time status updates** and progress tracking
- **Responsive design** with modern UI/UX
- **Wallet integration** with RainbowKit
- **Bridge API integration** for KYC verification

### Backend Services
- **Bridge API Service** for KYC verification
- **Smart Contract Service** for SBT operations
- **Payment Gateway Service** for PYUSD transactions
- **Monitoring Service** for compliance tracking

## 📁 Project Structure

```
├── contracts/                 # Smart contracts
│   ├── SoulBoundToken.sol    # SBT contract (EIP-5192)
│   ├── PYUSDPaymentGateway.sol # Payment gateway with KYC gating
│   └── KYCVerification.sol   # KYC verification contract
├── src/
│   ├── app/                  # Next.js app router
│   │   ├── login/           # Step 1: Login page
│   │   ├── kyc-submission/  # Step 2: KYC submission
│   │   ├── verification/    # Steps 3-5: API, AML, Review
│   │   ├── sbt-minting/     # Step 6: SBT minting
│   │   ├── access-control/  # Step 7: Access control
│   │   ├── monitoring/      # Step 8: Monitoring & renewal
│   │   └── app/             # Main application
│   ├── components/          # React components
│   ├── hooks/              # Custom React hooks
│   └── services/           # API and contract services
├── scripts/                # Deployment scripts
├── test/                   # Smart contract tests
└── hardhat.config.js      # Hardhat configuration
```

## 🛠️ Technical Requirements

### Smart Contracts
- **Solidity ^0.8.20**
- **OpenZeppelin Contracts ^5.4.0**
- **EIP-5192** compliance for non-transferable NFTs
- **Access control** with role-based permissions
- **Event logging** for monitoring and compliance

### Frontend
- **Next.js 15.5.5** with App Router
- **React 19.1.0** with hooks
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **RainbowKit** for wallet connection
- **Wagmi** for Ethereum interactions

### Backend Services
- **Bridge API** integration for KYC verification
- **Smart contract** interaction services
- **Payment processing** with PYUSD
- **Compliance monitoring** and renewal

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd ethglobal-1
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp env.example .env.local
# Edit .env.local with your configuration
```

4. **Deploy smart contracts**
```bash
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.js --network sepolia
```

5. **Start development server**
```bash
npm run dev
```

### Environment Variables

```env
# Bridge API Configuration
NEXT_PUBLIC_BRIDGE_API_KEY=your_bridge_api_key_here
NEXT_PUBLIC_BRIDGE_API_URL=https://api.bridge.com/v1

# Smart Contract Addresses
NEXT_PUBLIC_SBT_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_PAYMENT_GATEWAY_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_PYUSD_TOKEN_ADDRESS=0x...

# Network Configuration
NEXT_PUBLIC_NETWORK=sepolia
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/your_infura_key

# WalletConnect Configuration
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

## 🔧 Smart Contract Deployment

### Deploy to Sepolia Testnet

1. **Set up Hardhat configuration**
```javascript
// hardhat.config.js
module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```

2. **Deploy contracts**
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

3. **Verify contracts**
```bash
npx hardhat verify --network sepolia <contract-address> <constructor-args>
```

## 🧪 Testing

### Smart Contract Tests
```bash
npx hardhat test
```

### Frontend Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

## 📱 Usage

### KYC Verification Flow

1. **Connect Wallet** - User connects wallet or creates embedded wallet
2. **Submit KYC** - User fills out KYC form with personal information
3. **API Verification** - Data sent to Bridge API for verification
4. **AML Screening** - Automated compliance checks
5. **Review Process** - Manual review and approval
6. **SBT Minting** - Soul Bound Token minted for verified user
7. **Access Control** - Smart contract gating based on SBT ownership
8. **Monitoring** - Ongoing compliance and renewal management

### Payment Processing

- **PYUSD Payments** with KYC compliance gating
- **Transaction limits** based on verification status
- **Fee structure** with transparent pricing
- **Real-time monitoring** of payment status

## 🔒 Security Features

- **Non-transferable SBTs** prevent token trading
- **Access control** based on SBT ownership
- **Compliance monitoring** with automated checks
- **Secure API integration** with Bridge
- **Smart contract** security best practices

## 📊 Monitoring & Compliance

- **Real-time status** tracking
- **Compliance history** logging
- **Risk assessment** scoring
- **AML screening** results
- **Renewal management** system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔗 Links

- **Demo**: [Live Demo URL]
- **Documentation**: [Documentation URL]
- **Smart Contracts**: [Etherscan URLs]
- **Bridge API**: [Bridge API Documentation]

---

**Built for ETHGlobal Hackathon** 🚀