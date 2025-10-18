"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArrowRight, ArrowLeft, FileText } from "lucide-react";

const KYCPage3 = () => {
  const { isConnected } = useAccount();
  const router = useRouter();
  const [formData, setFormData] = useState({
    documentType: "",
    documentNumber: ""
  });
  const [errors, setErrors] = useState({});

  // Redirect if not connected
  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleNext = () => {
    const newErrors = {};
    
    if (!formData.documentType) newErrors.documentType = "Document type is required";
    if (!formData.documentNumber) newErrors.documentNumber = "Document number is required";
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      // Store data in localStorage for multi-page flow
      localStorage.setItem('kyc_page3', JSON.stringify(formData));
      router.push("/kyc/page4");
    }
  };

  const handlePrevious = () => {
    router.push("/kyc/page2");
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Wallet Not Connected</h2>
          <p className="text-gray-400">Please connect your wallet to continue</p>
        </div>
      </div>
    );
  }

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black text-white">
      {/* Optimized background - no heavy 3D components */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-black" />
      </div>

      <Header />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4 py-4">
        <div className="max-w-xl mx-auto w-full">
          <div className="bg-black/80 backdrop-blur-lg rounded-2xl border border-white/10 p-3">
            <div className="mb-4">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">Identity Document Details</h1>
                  <p className="text-gray-400 text-xs">Determines what document will be uploaded and enables validation.</p>
                </div>
              </div>
              
              {/* Progress indicator */}
              <div className="flex justify-center mb-3">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div
                      key={step}
                      className={`w-1.5 h-1.5 rounded-full ${
                        step <= 3 ? "bg-blue-500" : "bg-gray-600"
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="text-center mb-3">
                <span className="text-xs text-gray-400">Step 3 of 5</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Identity Document Type *</label>
                <select
                  name="documentType"
                  value={formData.documentType}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-white/10 rounded-lg border text-white ${
                    errors.documentType ? "border-red-500" : "border-white/20"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                >
                  <option value="" className="text-gray-400 bg-gray-800">Select Document Type</option>
                  <option value="passport" className="text-white bg-gray-800">Passport</option>
                  <option value="drivers_license" className="text-white bg-gray-800">Driver's License</option>
                  <option value="national_id" className="text-white bg-gray-800">National ID</option>
                  <option value="state_id" className="text-white bg-gray-800">State ID</option>
                  <option value="military_id" className="text-white bg-gray-800">Military ID</option>
                  <option value="student_id" className="text-white bg-gray-800">Student ID</option>
                </select>
                {errors.documentType && <p className="text-red-500 text-sm mt-1">{errors.documentType}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Identity Document Number *</label>
                <input
                  type="text"
                  name="documentNumber"
                  value={formData.documentNumber}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-white/5 rounded-lg border ${
                    errors.documentNumber ? "border-red-500" : "border-white/20"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter document number"
                  required
                />
                {errors.documentNumber && <p className="text-red-500 text-sm mt-1">{errors.documentNumber}</p>}
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <button
                onClick={handlePrevious}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg font-semibold hover:bg-white/20 transition-colors flex items-center space-x-2 text-sm"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Back</span>
              </button>
              
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm"
              >
                <span>Continue</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default KYCPage3;