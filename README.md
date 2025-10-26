# DeFi Social Hub - KYC Verification System


The DeFi Social Hub is a comprehensive KYC verification system that implements a multi-step architecture, including Soul Bound Tokens (SBT) and a PYUSD payment gateway with compliance gating. This project was built for the ETHGlobal Hackathon and aims to provide a secure and compliant way for users to participate in decentralized finance (DeFi) applications.

## Project Overview

The DeFi Social Hub is designed to address the challenges of KYC (Know Your Customer) verification in the DeFi space. By leveraging a combination of smart contracts, frontend components, and backend services, the system provides a seamless and secure user experience for KYC verification, access control, and payment processing.

Key Features:

- **8-Step KYC Verification Flow**: The system guides users through a multi-step process, including login, PII submission, API verification, AML screening, manual review, SBT issuance, access control, and ongoing monitoring.
- **Soul Bound Tokens (SBTs)**: The project utilizes non-transferable SBTs to represent a user's verified identity, enabling access control and compliance gating.
- **PYUSD Payment Gateway**: The system integrates a PYUSD-based payment gateway that enforces KYC compliance, with transaction limits and fee structures based on the user's verification status.
- **Monitoring and Compliance**: The DeFi Social Hub provides real-time status tracking, compliance history logging, risk assessment, and renewal management to ensure ongoing regulatory compliance.

## Technical Implementation

The DeFi Social Hub is built using a combination of cutting-edge technologies, including:

### Smart Contracts (Solidity)
- **SBT Contract**: Implements the EIP-5192 standard for non-transferable NFTs.
- **Access Control**: Utilizes smart contract modifiers to enforce access control based on SBT ownership.
- **PYUSD Payment Contract**: Integrates a payment gateway with compliance gating.
- **Events**: Logs events for monitoring and compliance tracking.
- **Admin Functions**: Provides functionality for minting and revoking SBTs.
- **Deployed to Ethereum Sepolia testnet**

### Frontend (Next.js + React)
- **Multi-page KYC Flow**: Guides users through the step-by-step verification process.
- **Real-time Status Updates**: Provides users with live progress tracking and feedback.
- **Responsive Design**: Offers a modern and intuitive user experience.
- **Wallet Integration**: Seamlessly connects with user wallets using RainbowKit.
- **Bridge API Integration**: Integrates with the Bridge API for KYC verification.

### Backend Services
- **Bridge API Service**: Handles the communication with the Bridge API for KYC verification.
- **Smart Contract Service**: Manages interactions with the deployed smart contracts.
- **Payment Gateway Service**: Processes PYUSD transactions with compliance gating.
- **Monitoring Service**: Tracks compliance and renewal status.

The project's modular architecture and use of industry-standard technologies ensure scalability, maintainability, and extensibility, making the DeFi Social Hub a robust and future-proof solution for KYC verification in the DeFi ecosystem.

## Getting Started

Detailed instructions for setting up the development environment, deploying the smart contracts, and running the application can be found in the [README](README.md) file.

## Contributions

Contributions to the DeFi Social Hub project are welcome. Please refer to the [CONTRIBUTING](CONTRIBUTING.md) guide for more information on how to get involved.

## License

This project is licensed under the [MIT License](LICENSE).
