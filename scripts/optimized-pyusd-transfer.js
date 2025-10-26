const { ethers } = require('ethers');

// Pre-configured for speed - REPLACE THESE VALUES
const PRIVATE_KEY = "YOUR_PRIVATE_KEY_HERE";
const RPC_URL = "YOUR_SEPOLIA_RPC_URL";

// Hardcoded values for speed
const PYUSD_ADDRESS = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9";
const RECIPIENT_ADDRESS = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";
const AMOUNT_WEI = "10000000000000000000"; // 10 PYUSD

// Minimal ABI - only what we need
const TRANSFER_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

async function fastTransfer() {
  const startTime = Date.now();
  
  try {
    // Fast setup
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(PYUSD_ADDRESS, TRANSFER_ABI, wallet);
    
    // Quick balance check
    const balance = await contract.balanceOf(wallet.address);
    if (balance.lt(AMOUNT_WEI)) {
      throw new Error("Insufficient PYUSD balance");
    }
    
    // Execute transfer
    const tx = await contract.transfer(RECIPIENT_ADDRESS, AMOUNT_WEI, {
      gasLimit: 80000,
      value: 0
    });
    
    const receipt = await tx.wait();
    const endTime = Date.now();
    
    console.log(`✅ Transfer completed in ${endTime - startTime}ms`);
    console.log(`Hash: ${tx.hash}`);
    console.log(`Etherscan: https://sepolia.etherscan.io/tx/${tx.hash}`);
    
  } catch (error) {
    console.error(`❌ Failed in ${Date.now() - startTime}ms:`, error.message);
  }
}

fastTransfer();
