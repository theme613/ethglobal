"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import dynamic from "next/dynamic";

const ThreeScene = dynamic(() => import("@/components/ThreeScene"), {
  ssr: false,
});
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  TrendingUp, 
  Users, 
  CreditCard,
  Calendar,
  Bell
} from "lucide-react";

const MonitoringPage = () => {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const [monitoringData, setMonitoringData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [renewalStatus, setRenewalStatus] = useState("ACTIVE");

  // Redirect if not connected
  useEffect(() => {
    if (!isConnected) {
      router.push("/login");
    }
  }, [isConnected, router]);

  // Load monitoring data
  useEffect(() => {
    const loadMonitoringData = async () => {
      setIsLoading(true);
      
      // Simulate loading monitoring data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setMonitoringData({
        sbtStatus: "ACTIVE",
        expiryDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000), // 300 days from now
        riskScore: 15,
        amlStatus: "CLEAR",
        transactionCount: 47,
        totalVolume: 125000,
        lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        complianceChecks: [
          { date: new Date(), status: "PASSED", type: "AML Screening" },
          { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), status: "PASSED", type: "Risk Assessment" },
          { date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), status: "PASSED", type: "Identity Verification" }
        ]
      });
      
      setIsLoading(false);
    };

    if (isConnected) {
      loadMonitoringData();
    }
  }, [isConnected]);

  const handleRenewal = async () => {
    setRenewalStatus("RENEWING");
    
    // Simulate renewal process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setRenewalStatus("RENEWED");
    setMonitoringData(prev => ({
      ...prev,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
    }));
  };

  const handleComplete = () => {
    router.push("/app");
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Wallet Not Connected</h2>
          <p className="text-gray-400">Please connect your wallet to continue</p>
        </div>
      </div>
    );
  }

  const getDaysUntilExpiry = () => {
    if (!monitoringData) return 0;
    const now = new Date();
    const expiry = new Date(monitoringData.expiryDate);
    const diffTime = expiry - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE": return "text-green-500";
      case "EXPIRING": return "text-yellow-500";
      case "EXPIRED": return "text-red-500";
      case "RENEWING": return "text-blue-500";
      case "RENEWED": return "text-green-500";
      default: return "text-gray-500";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "ACTIVE": return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "EXPIRING": return <Clock className="w-5 h-5 text-yellow-500" />;
      case "EXPIRED": return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case "RENEWING": return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      case "RENEWED": return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black text-white">
      <ThreeScene />
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black" />
      </div>

      <Header />

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto w-full"
        >
          <div className="bg-black/80 backdrop-blur-lg rounded-2xl border border-white/10 p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-4">Monitoring & Renewal</h1>
              <p className="text-gray-400 mb-6">Step 8 of 8: Ongoing Compliance & Status Updates</p>
              
              {/* Progress bar */}
              <div className="flex justify-center mb-8">
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((step) => (
                    <div
                      key={step}
                      className="w-3 h-3 rounded-full bg-blue-500"
                    />
                  ))}
                </div>
              </div>
            </div>

            {isLoading && (
              <div className="text-center py-8">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold mb-4">Loading Monitoring Data...</h3>
                <p className="text-gray-400">
                  Setting up your compliance monitoring dashboard...
                </p>
              </div>
            )}

            {monitoringData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                {/* Status Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      {getStatusIcon(monitoringData.sbtStatus)}
                      <div>
                        <h4 className="font-semibold">SBT Status</h4>
                        <p className={`text-sm ${getStatusColor(monitoringData.sbtStatus)}`}>
                          {monitoringData.sbtStatus}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Days Until Expiry:</span>
                        <span>{getDaysUntilExpiry()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Risk Score:</span>
                        <span>{monitoringData.riskScore}/100</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <CreditCard className="w-8 h-8 text-green-500" />
                      <div>
                        <h4 className="font-semibold">Transaction Activity</h4>
                        <p className="text-sm text-gray-400">Payment Statistics</p>
                      </div>
                    </div>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Transactions:</span>
                        <span>{monitoringData.transactionCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Volume:</span>
                        <span>${monitoringData.totalVolume.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Last Activity:</span>
                        <span>{monitoringData.lastActivity.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <Shield className="w-8 h-8 text-purple-500" />
                      <div>
                        <h4 className="font-semibold">Compliance Status</h4>
                        <p className="text-sm text-gray-400">AML & Risk Monitoring</p>
                      </div>
                    </div>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">AML Status:</span>
                        <span className="text-green-500">{monitoringData.amlStatus}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Risk Level:</span>
                        <span className="text-green-500">Low</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Last Check:</span>
                        <span>Today</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Compliance History */}
                <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-6">
                  <h4 className="font-semibold mb-4 flex items-center space-x-2">
                    <Bell className="w-5 h-5" />
                    <span>Compliance Check History</span>
                  </h4>
                  <div className="space-y-3">
                    {monitoringData.complianceChecks.map((check, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-500/5 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <div>
                            <p className="font-medium">{check.type}</p>
                            <p className="text-sm text-gray-400">{check.date.toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className="text-green-500 text-sm font-medium">{check.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Renewal Section */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <Calendar className="w-8 h-8 text-yellow-500" />
                    <div>
                      <h4 className="font-semibold">SBT Renewal</h4>
                      <p className="text-sm text-gray-400">
                        Your SBT expires in {getDaysUntilExpiry()} days
                      </p>
                    </div>
                  </div>
                  
                  {renewalStatus === "ACTIVE" && (
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-400">
                          Renew your SBT to maintain access to all features
                        </p>
                      </div>
                      <button
                        onClick={handleRenewal}
                        className="px-6 py-2 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition-colors"
                      >
                        Renew SBT
                      </button>
                    </div>
                  )}

                  {renewalStatus === "RENEWING" && (
                    <div className="flex items-center space-x-4">
                      <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                      <span>Renewing your SBT...</span>
                    </div>
                  )}

                  {renewalStatus === "RENEWED" && (
                    <div className="flex items-center space-x-4">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-green-500">SBT renewed successfully!</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={handleComplete}
                    className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Complete Setup
                  </button>
                  
                  <button
                    onClick={() => router.push("/app")}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
};

export default MonitoringPage;
