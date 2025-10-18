"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArrowLeft, Shield, CheckCircle, FileText, Mail, Phone, Calendar, MapPin, Camera } from "lucide-react";

const KYCPage5 = () => {
  const { isConnected } = useAccount();
  const router = useRouter();
  const [allFormData, setAllFormData] = useState({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Redirect if not connected
  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  // Load all form data from localStorage
  useEffect(() => {
    const page1 = JSON.parse(localStorage.getItem('kyc_page1') || '{}');
    const page2 = JSON.parse(localStorage.getItem('kyc_page2') || '{}');
    const page3 = JSON.parse(localStorage.getItem('kyc_page3') || '{}');
    const page4 = JSON.parse(localStorage.getItem('kyc_page4') || '{}');
    
    setAllFormData({
      ...page1,
      ...page2,
      ...page3,
      ...page4
    });
  }, []);

  const handleSubmit = async () => {
    const newErrors = {};
    
    if (!termsAccepted) newErrors.termsAccepted = "You must accept the terms and conditions";
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      try {
        console.log("Submitting KYC data:", allFormData);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Clear localStorage
        localStorage.removeItem('kyc_page1');
        localStorage.removeItem('kyc_page2');
        localStorage.removeItem('kyc_page3');
        localStorage.removeItem('kyc_page4');
        
        router.push("/verification");
      } catch (error) {
        console.error("KYC submission failed:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handlePrevious = () => {
    router.push("/kyc/page4");
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

  const formFields = [
    { key: 'lastName', label: 'Last Name', icon: FileText },
    { key: 'dateOfBirth', label: 'Date of Birth', icon: Calendar },
    { key: 'country', label: 'Country', icon: MapPin },
    { key: 'email', label: 'Email', icon: Mail },
    { key: 'phoneNumber', label: 'Phone Number', icon: Phone },
    { key: 'documentType', label: 'Document Type', icon: FileText },
    { key: 'documentNumber', label: 'Document Number', icon: FileText },
    { key: 'documentImage', label: 'Document Image', icon: FileText, isUpload: true },
    { key: 'selfieImage', label: 'Selfie Image', icon: Camera, isUpload: true }
  ];

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black text-white">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-black" />
      </div>

      <Header />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4 py-4">
        <div className="max-w-2xl mx-auto w-full">
          <div className="bg-black/80 backdrop-blur-lg rounded-2xl border border-white/10 p-4">
            
            {/* Header */}
            <div className="mb-4">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Review & Consent</h1>
                  <p className="text-gray-400 text-xs">User reviews and confirms, then submits for KYC/AML processing.</p>
                </div>
              </div>
              
              <div className="flex justify-center mb-3">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div key={step} className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  ))}
                </div>
              </div>
              
              <div className="text-center mb-3">
                <span className="text-xs text-gray-400">Step 5 of 5</span>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-3 mb-4">
              <h4 className="font-semibold mb-3 flex items-center space-x-2 text-sm">
                <Shield className="w-3 h-3" />
                <span>Summary of Entered Data</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {formFields.map((field, index) => {
                  const IconComponent = field.icon;
                  const value = allFormData[field.key];
                  const displayValue = field.isUpload 
                    ? (value ? "✓ Uploaded" : "✗ Not uploaded")
                    : (value || "Not provided");
                  
                  return (
                    <div key={field.key} className="flex items-center space-x-2">
                      <IconComponent className="w-3 h-3 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-400">{field.label}</p>
                        <p className="font-medium text-sm">{displayValue}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Terms */}
            <div className="flex items-start space-x-3 mb-4">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                required
              />
              <div className="text-xs">
                <label className="text-gray-300">
                  I agree to the{" "}
                  <a href="#" className="text-blue-400 hover:underline">Terms of Service</a>
                  {" "}and{" "}
                  <a href="#" className="text-blue-400 hover:underline">Privacy Policy</a>
                </label>
                {errors.termsAccepted && <p className="text-red-500 text-xs mt-1">{errors.termsAccepted}</p>}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-between">
              <button
                onClick={handlePrevious}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg font-semibold hover:bg-white/20 transition-colors flex items-center space-x-2 text-xs"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Back</span>
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2 text-xs"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3 h-3" />
                    <span>Submit KYC</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default KYCPage5;