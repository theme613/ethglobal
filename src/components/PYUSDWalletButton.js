import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const PYUSDWalletButton = () => {
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
    }
  ];

  // Get PYUSD balance
  const getPYUSDBalance = async (address) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const pyusdContract = new ethers.Contract(PYUSD_ADDRESS, PYUSD_ABI, provider);
      
      const balance = await pyusdContract.balanceOf(address);
      const decimals = await pyusdContract.decimals();
      
      const formattedBalance = ethers.utils.formatUnits(balance, decimals);
      setPyusdBalance(formattedBalance);
      
    } catch (error) {
      console.error("Error getting PYUSD balance:", error);
      setPyusdBalance('0');
    }
  };

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
    <div className="relative">
      {!isConnected ? (
        <button
          onClick={connectWallet}
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <span className="text-lg">🦊</span>
          <span>{isLoading ? 'Connecting...' : 'Connect PYUSD Wallet'}</span>
        </button>
      ) : (
        <div className="flex items-center space-x-3">
          {/* PYUSD Balance Display - ONLY PYUSD, NO ETH */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg px-4 py-2 border border-blue-200">
            <div className="text-center">
              <p className="text-xs text-gray-600">PYUSD Balance</p>
              <p className="text-lg font-bold text-blue-900">
                {parseFloat(pyusdBalance).toFixed(4)} PYUSD
              </p>
            </div>
          </div>

          {/* Account Info */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-sm">🦊</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {formatAddress(account)}
              </p>
              <p className="text-xs text-gray-500">PYUSD Wallet</p>
            </div>
          </div>

          {/* Disconnect Button */}
          <button
            onClick={disconnectWallet}
            className="text-gray-400 hover:text-gray-600 p-1"
            title="Disconnect"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default PYUSDWalletButton;
