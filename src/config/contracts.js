// Contract addresses configuration for Sepolia Testnet only
export const CONTRACT_ADDRESSES = {
  // Sepolia Testnet - Primary PYUSD address
  SEPOLIA_PYUSD_ADDRESS: "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9",
  
  // Contract addresses (to be deployed to Sepolia)
  SBT_CONTRACT_ADDRESS: "0x...", // To be deployed - Please provide the actual deployed SBT contract address here.
  PYUSDKYC_SUBSCRIPTION_ADDRESS: "0x...", // To be deployed
  PYUSD_PAYMENT_GATEWAY_ADDRESS: "0x...", // To be deployed
  KYC_VERIFICATION_ADDRESS: "0x...", // To be deployed
  PAYMENTS_ADDRESS: "0x..." // To be deployed
};

// Network configuration - Sepolia Testnet only
export const NETWORK_CONFIG = {
  chainId: 11155111,
  name: "Ethereum Sepolia Testnet",
  rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY",
  blockExplorer: "https://sepolia.etherscan.io/"
};

// Get current network configuration - Sepolia only
export const getCurrentNetworkConfig = () => {
  return {
    network: "sepolia",
    ...NETWORK_CONFIG,
    contracts: CONTRACT_ADDRESSES
  };
};

// Get PYUSD address - Sepolia only
export const getPYUSDAddress = () => {
  return CONTRACT_ADDRESSES.SEPOLIA_PYUSD_ADDRESS;
};
