"use client";

import { useState } from 'react';
import PYUSDWalletButton from '../../components/PYUSDWalletButton';
import dynamic from "next/dynamic";

const PYUSDWalletModal = dynamic(() => import("../../components/PYUSDWalletModal"), {
  ssr: false,
});
import PYUSDOnlyWallet from '../../components/PYUSDOnlyWallet';

export default function PYUSDWalletPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            PYUSD Only Wallet
          </h1>
          <p className="text-lg text-gray-600">
            Display only PYUSD balance - No ETH shown
          </p>
        </div>

        {/* Wallet Button */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Wallet Button (PYUSD Only)
          </h2>
          <div className="flex justify-center">
            <PYUSDWalletButton />
          </div>
        </div>

        {/* Wallet Modal */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Wallet Modal (PYUSD Only)
          </h2>
          <div className="flex justify-center">
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
            >
              Open PYUSD Wallet Modal
            </button>
          </div>
        </div>

        {/* Full Wallet Component */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Full Wallet Component (PYUSD Only)
          </h2>
          <div className="flex justify-center">
            <PYUSDOnlyWallet />
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Features
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                ✅ What's Included
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• PYUSD balance display only</li>
                <li>• No ETH balance shown</li>
                <li>• Sepolia testnet only</li>
                <li>• Real-time balance updates</li>
                <li>• Copy address functionality</li>
                <li>• Disconnect option</li>
                <li>• Responsive design</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                🚫 What's Hidden
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• ETH balance completely hidden</li>
                <li>• ETH symbol not displayed</li>
                <li>• No ETH-related UI elements</li>
                <li>• Only PYUSD token shown</li>
                <li>• Clean, focused interface</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            How to Use
          </h3>
          <div className="space-y-2 text-blue-800">
            <p>1. <strong>Connect Wallet:</strong> Click "Connect PYUSD Wallet" button</p>
            <p>2. <strong>View Balance:</strong> See only your PYUSD balance (no ETH)</p>
            <p>3. <strong>Copy Address:</strong> Click to copy your wallet address</p>
            <p>4. <strong>Refresh:</strong> Update your PYUSD balance</p>
            <p>5. <strong>Disconnect:</strong> Disconnect when done</p>
          </div>
        </div>
      </div>

      {/* Modal */}
      <PYUSDWalletModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </div>
  );
}
