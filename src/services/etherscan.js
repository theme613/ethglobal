export const getEtherscanTransactionUrl = (transactionHash) => {
  // Sepolia Testnet Etherscan URL
  const baseExplorerUrl = "https://sepolia.etherscan.io";
  return `${baseExplorerUrl}/tx/${transactionHash}`;
};

export const getEtherscanAddressUrl = (address) => {
  // Sepolia Testnet Etherscan URL
  const baseExplorerUrl = "https://sepolia.etherscan.io";
  return `${baseExplorerUrl}/address/${address}`;
};
