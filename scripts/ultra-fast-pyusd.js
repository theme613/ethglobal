const { ethers } = require('ethers');

// Ultra-fast configuration
const CONFIG = {
  PRIVATE_KEY: "YOUR_PRIVATE_KEY_HERE",
  RPC_URL: "YOUR_SEPOLIA_RPC_URL",
  PYUSD_ADDRESS: "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9",
  RECIPIENT_ADDRESS: "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318",
  AMOUNT_WEI: "10000000000000000000"
};

// Minimal ABI for speed
const ABI = ["function transfer(address,uint256) returns (bool)"];

async function ultraFastTransfer() {
  const start = performance.now();
  
  try {
    // Optimized setup
    const provider = new ethers.providers.JsonRpcProvider(CONFIG.RPC_URL);
    const wallet = new ethers.Wallet(CONFIG.PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONFIG.PYUSD_ADDRESS, ABI, wallet);
    
    // Direct transfer without balance check for speed
    const tx = await contract.transfer(CONFIG.RECIPIENT_ADDRESS, CONFIG.AMOUNT_WEI, {
      gasLimit: 60000,
      value: 0
    });
    
    const receipt = await tx.wait();
    const end = performance.now();
    
    console.log(`⚡ Transfer completed in ${Math.round(end - start)}ms`);
    console.log(`Hash: ${tx.hash}`);
    console.log(`Link: https://sepolia.etherscan.io/tx/${tx.hash}`);
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

ultraFastTransfer();
