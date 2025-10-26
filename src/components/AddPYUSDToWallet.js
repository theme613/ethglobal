import { useState } from 'react';

const AddPYUSDToWallet = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const addPYUSDToMetaMask = async () => {
    try {
      setIsAdding(true);
      
      // Check if MetaMask is available
      if (!window.ethereum) {
        throw new Error("MetaMask not detected! Please install MetaMask first.");
      }

      // PYUSD token details on Sepolia
      const pyusdToken = {
        address: getPYUSDAddress(),
        symbol: "PYUSD",
        decimals: 6,
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
        setIsAdded(true);
        console.log("✅ PYUSD successfully added to MetaMask!");
      } else {
        throw new Error("Failed to add PYUSD to MetaMask");
      }

    } catch (error) {
      console.error("❌ Error adding PYUSD:", error.message);
      alert(`Error adding PYUSD: ${error.message}`);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-blue-900">
            🪙 Add PYUSD to Your Wallet
          </h3>
          <p className="text-sm text-blue-700 mt-1">
            Show PYUSD balance instead of just ETH in your wallet
          </p>
        </div>
        <button
          onClick={addPYUSDToMetaMask}
          disabled={isAdding || isAdded}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isAdded
              ? 'bg-green-100 text-green-800 border border-green-200'
              : isAdding
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isAdded ? '✅ Added' : isAdding ? 'Adding...' : 'Add PYUSD'}
        </button>
      </div>
      
      {isAdded && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✅ PYUSD added successfully! Your wallet will now show PYUSD balance.
            Refresh your wallet to see the changes.
          </p>
        </div>
      )}
      
      <div className="mt-3 text-xs text-blue-600">
        <p><strong>Token Details:</strong></p>
        <p>Address: {getPYUSDAddress()}</p>
        <p>Symbol: PYUSD | Decimals: 6 | Network: Sepolia</p>
      </div>
    </div>
  );
};

export default AddPYUSDToWallet;
