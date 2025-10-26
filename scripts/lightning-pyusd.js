const { ethers } = require('ethers');

// Lightning-fast transfer - minimal code
const PRIVATE_KEY = "YOUR_PRIVATE_KEY_HERE";
const RPC_URL = "YOUR_SEPOLIA_RPC_URL";

async function lightningTransfer() {
  const start = Date.now();
  
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(
    "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9",
    ["function transfer(address,uint256) returns (bool)"],
    wallet
  );
  
  const tx = await contract.transfer(
    "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318",
    "10000000000000000000",
    { gasLimit: 50000, value: 0 }
  );
  
  await tx.wait();
  console.log(`⚡ Completed in ${Date.now() - start}ms`);
  console.log(`Hash: ${tx.hash}`);
}

lightningTransfer();
