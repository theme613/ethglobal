"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArrowRight, MapPin } from "lucide-react";

const KYCPage1 = () => {
  const { isConnected } = useAccount();
  const router = useRouter();
  const [formData, setFormData] = useState({
    lastName: "",
    dateOfBirth: "",
    country: ""
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
    
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
    if (!formData.country) newErrors.country = "Country is required";
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      // Store data in localStorage for multi-page flow
      localStorage.setItem('kyc_page1', JSON.stringify(formData));
      router.push("/kyc/page2");
    }
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
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">Basic Personal Information</h1>
                  <p className="text-gray-400 text-xs">Get the foundational identity info to start building a profile.</p>
                </div>
              </div>
              
              {/* Progress indicator */}
              <div className="flex justify-center mb-3">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div
                      key={step}
                      className={`w-1.5 h-1.5 rounded-full ${
                        step === 1 ? "bg-blue-500" : "bg-gray-600"
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="text-center mb-3">
                <span className="text-xs text-gray-400">Step 1 of 5</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-white/5 rounded-lg border ${
                    errors.lastName ? "border-red-500" : "border-white/20"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter your last name"
                  required
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Date of Birth *</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-white/5 rounded-lg border ${
                    errors.dateOfBirth ? "border-red-500" : "border-white/20"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
                {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Country of Residence *</label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-white/10 rounded-lg border text-white ${
                    errors.country ? "border-red-500" : "border-white/20"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                >
                  <option value="" className="text-gray-400 bg-gray-800">Select Country</option>
                  <option value="US" className="text-white bg-gray-800">United States</option>
                  <option value="CA" className="text-white bg-gray-800">Canada</option>
                  <option value="GB" className="text-white bg-gray-800">United Kingdom</option>
                  <option value="AU" className="text-white bg-gray-800">Australia</option>
                  <option value="DE" className="text-white bg-gray-800">Germany</option>
                  <option value="FR" className="text-white bg-gray-800">France</option>
                  <option value="JP" className="text-white bg-gray-800">Japan</option>
                  <option value="SG" className="text-white bg-gray-800">Singapore</option>
                  <option value="MY" className="text-white bg-gray-800">Malaysia</option>
                  <option value="TH" className="text-white bg-gray-800">Thailand</option>
                  <option value="ID" className="text-white bg-gray-800">Indonesia</option>
                  <option value="PH" className="text-white bg-gray-800">Philippines</option>
                  <option value="VN" className="text-white bg-gray-800">Vietnam</option>
                  <option value="IT" className="text-white bg-gray-800">Italy</option>
                  <option value="ES" className="text-white bg-gray-800">Spain</option>
                  <option value="NL" className="text-white bg-gray-800">Netherlands</option>
                  <option value="CH" className="text-white bg-gray-800">Switzerland</option>
                  <option value="SE" className="text-white bg-gray-800">Sweden</option>
                  <option value="NO" className="text-white bg-gray-800">Norway</option>
                  <option value="DK" className="text-white bg-gray-800">Denmark</option>
                  <option value="FI" className="text-white bg-gray-800">Finland</option>
                  <option value="BE" className="text-white bg-gray-800">Belgium</option>
                  <option value="AT" className="text-white bg-gray-800">Austria</option>
                  <option value="IE" className="text-white bg-gray-800">Ireland</option>
                </select>
                {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
              </div>
            </div>

            <div className="flex justify-end mt-4">
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

export default KYCPage1;