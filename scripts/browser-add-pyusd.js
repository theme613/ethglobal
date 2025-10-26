// Browser script to add PYUSD to MetaMask wallet
// Run this in your browser console on your dApp page

async function addPYUSDToMetaMask() {
  try {
    console.log("🪙 Adding PYUSD to MetaMask...");
    
    // Check if MetaMask is available
    if (!window.ethereum) {
      throw new Error("MetaMask not detected! Please install MetaMask first.");
    }

    // PYUSD token details on Sepolia
    const pyusdToken = {
      address: "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9",
      symbol: "PYUSD",
      decimals: 18,
      name: "PayPal USD"
    };

    // Add token to MetaMask
    const result = await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: pyusdToken.address,
          symbol: pyusdToken.symbol,
          decimals: pyusdToken.decimals,
        },
      },
    });

    if (result) {
      console.log("✅ PYUSD successfully added to MetaMask!");
      console.log("Now your wallet will show PYUSD balance instead of just ETH");
      console.log("You can see both ETH and PYUSD in your wallet");
    } else {
      console.log("❌ Failed to add PYUSD to MetaMask");
    }

  } catch (error) {
    console.error("❌ Error adding PYUSD:", error.message);
  }
}

// Run the function
addPYUSDToMetaMask();
