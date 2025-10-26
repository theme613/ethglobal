import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const PYUSDOnlyWallet = () => {
  const [account, setAccount] = useState(null);
  const [pyusdBalance, setPyusdBalance] = useState('0');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // PYUSD contract details
  const PYUSD_ADDRESS = getPYUSDAddress();
  const PYUSD_ABI = [
    {
      "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
      "name": "balanceOf",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "decimals",
      "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [{"internalType": "string", "name": "", "type": "string"}],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  // Connect wallet
  const connectWallet = async () => {
    try {
      setIsLoading(true);
      
      if (!window.ethereum) {
        throw new Error("MetaMask not detected!");
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        await getPYUSDBalance(accounts[0]);
      }

    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert(`Error connecting wallet: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Get PYUSD balance
  const getPYUSDBalance = async (address) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const pyusdContract = new ethers.Contract(PYUSD_ADDRESS, PYUSD_ABI, provider);
      
      const balance = await pyusdContract.balanceOf(address);
      const decimals = await pyusdContract.decimals();
      const symbol = await pyusdContract.symbol();
      
      const formattedBalance = ethers.utils.formatUnits(balance, decimals);
      setPyusdBalance(formattedBalance);
      
    } catch (error) {
      console.error("Error getting PYUSD balance:", error);
      setPyusdBalance('0');
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setPyusdBalance('0');
    setIsConnected(false);
  };

  // Format address
  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          getPYUSDBalance(accounts[0]);
        } else {
          disconnectWallet();
        }
      });
    }
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      {!isConnected ? (
        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🦊</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Connect Your Wallet
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              Connect to view your PYUSD balance
            </p>
          </div>
          <button
            onClick={connectWallet}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </div>
      ) : (
        <div>
          {/* Wallet Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-lg">🦊</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {formatAddress(account)}
                </p>
                <p className="text-xs text-gray-500">PYUSD Wallet</p>
              </div>
            </div>
            <button
              onClick={disconnectWallet}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* PYUSD Balance - ONLY PYUSD, NO ETH */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">PYUSD Balance</p>
              <p className="text-3xl font-bold text-blue-900">
                {parseFloat(pyusdBalance).toFixed(6)} PYUSD
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Sepolia Testnet
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={() => navigator.clipboard.writeText(account)}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy Address</span>
            </button>
            
            <button
              onClick={() => getPYUSDBalance(account)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh Balance</span>
            </button>
          </div>

          {/* Network Info */}
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs text-green-800 text-center">
              ✅ Connected to Sepolia Testnet<br/>
              💰 PYUSD Only - No ETH Display
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PYUSDOnlyWallet;
