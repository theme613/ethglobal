"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useKYC } from "@/hooks/useKYC";

/**
 * KYC Verification Modal Component
 * @description Collects user KYC data and submits it to the Bridge API and smart contract
 */
export const KYCModal = ({ isOpen, onClose }) => {
  const { address } = useAccount();
  const router = useRouter();
  const { updateKYCStatus } = useKYC();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    countryOfResidence: "",
    documentType: "",
    documentNumber: "",
    email: "",
    phoneNumber: "",
    selfieImage: "",
    documentImage: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);

  /**
   * @notice Handles form input changes
   * @param {Object} e - Form input event
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  /**
   * @notice Submits KYC data to Bridge API and smart contract
   */
  const handleSubmitKYC = async () => {
    setIsSubmitting(true);
    setVerificationStatus("PENDING");

    try {
      // In a real implementation, we would call the Bridge API here
      // const bridgeApiKey = "YOUR_BRIDGE_API_KEY";
      // const response = await submitKYCToBridgeAPI(
      //   address,
      //   formData,
      //   bridgeApiKey
      // );

      // For this demo, we'll use mock data
      const mockResponse = {
        referenceId: `BRIDGE-${Date.now()}`,
        status: "PENDING",
        riskScore: Math.floor(Math.random() * 30),
        amlStatus: "PENDING",
      };

      // Store verification on-chain
      // await storeKYCVerificationOnChain(
      //   "0xYourKYCContractAddress",
      //   address,
      //   mockResponse.referenceId,
      //   JSON.stringify({
      //     ...formData,
      //     riskScore: mockResponse.riskScore,
      //     amlStatus: mockResponse.amlStatus,
      //   })
      // );

      setVerificationStatus("APPROVED");
      
      // Update KYC status
      updateKYCStatus({
        isVerified: true,
        status: "APPROVED",
        expiryTime: Date.now() + (365 * 24 * 60 * 60 * 1000), // Expires in 1 year
        riskScore: mockResponse.riskScore,
        referenceId: mockResponse.referenceId
      });
      
      onClose();
      router.push("/app");
    } catch (error) {
      setVerificationStatus("REJECTED");
      console.error("KYC submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -100 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-black/90 p-8 rounded-xl border border-white/10 w-11/12 max-w-md"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">KYC Verification</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        
        {verificationStatus === "APPROVED" && (
          <div className="text-green-500 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
            <p className="font-medium">KYC Verification Approved</p>
            <p className="text-sm mt-2">You can now access the DeFi Social Hub</p>
          </div>
        )}

        {verificationStatus === "REJECTED" && (
          <div className="text-red-500 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
            <p className="font-medium">KYC Verification Rejected</p>
            <p className="text-sm mt-2">Please try again or contact support</p>
          </div>
        )}

        {!verificationStatus && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmitKYC();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-white/5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-white/5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-white/5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Country of Residence</label>
              <input
                type="text"
                name="countryOfResidence"
                value={formData.countryOfResidence}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-white/5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Identity Document Type</label>
              <select
                name="documentType"
                value={formData.documentType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-white/5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Document Type</option>
                <option value="passport">Passport</option>
                <option value="driverLicense">Driver's License</option>
                <option value="nationalID">National ID</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1">Identity Document Number</label>
              <input
                type="text"
                name="documentNumber"
                value={formData.documentNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-white/5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-white/5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-white/5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Selfie Image (Base64)</label>
              <input
                type="text"
                name="selfieImage"
                value={formData.selfieImage}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-white/5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Paste base64 encoded image here"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Document Image (Base64)</label>
              <input
                type="text"
                name="documentImage"
                value={formData.documentImage}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-white/5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Paste base64 encoded image here"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-white text-black hover:bg-white/90 transition-colors duration-300 rounded-md font-semibold disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit KYC Verification"}
            </button>

            <p className="text-sm text-gray-400">
              {isSubmitting
                ? "Please wait while we process your verification..."
                : "All fields are required for verification"}
            </p>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
};
