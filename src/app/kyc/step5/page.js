"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AlertCircle, ArrowLeft, Shield, CheckCircle, FileText, Camera, Mail, Phone, Calendar, MapPin } from "lucide-react";

const KYCStep5Page = () => {
  const { isConnected } = useAccount();
  const router = useRouter();
  const [allFormData, setAllFormData] = useState({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Redirect if not connected - optimized
  useEffect(() => {
    if (!isConnected) {
      router.push("/login");
    }
  }, [isConnected]);

  // Load all form data from localStorage - optimized
  useEffect(() => {
    try {
      const step1 = JSON.parse(localStorage.getItem('kyc_step1') || '{}');
      const step2 = JSON.parse(localStorage.getItem('kyc_step2') || '{}');
      const step3 = JSON.parse(localStorage.getItem('kyc_step3') || '{}');
      const step4 = JSON.parse(localStorage.getItem('kyc_step4') || '{}');
      
      setAllFormData({
        ...step1,
        ...step2,
        ...step3,
        ...step4
      });
    } catch (error) {
      console.error('Error loading form data:', error);
    }
  }, []);

  const handleSubmit = async () => {
    const newErrors = {};
    
    if (!termsAccepted) newErrors.termsAccepted = "You must accept the terms and conditions";
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      try {
        // In a real implementation, this would submit to Bridge API
        console.log("Submitting KYC data:", allFormData);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Clear localStorage
        localStorage.removeItem('kyc_step1');
        localStorage.removeItem('kyc_step2');
        localStorage.removeItem('kyc_step3');
        localStorage.removeItem('kyc_step4');
        
        // Redirect to verification page
        router.push("/verification");
      } catch (error) {
        console.error("KYC submission failed:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handlePrevious = () => {
    router.push("/kyc/step4");
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
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

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <div className="max-w-4xl mx-auto w-full">
          <div className="bg-black/80 backdrop-blur-lg rounded-2xl border border-white/10 p-8">
            <div className="mb-8">
              <div className="flex items-center justify-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">5</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Review & Consent</h1>
                  <p className="text-gray-400">User reviews and confirms, then submits for actual KYC/AML processing.</p>
                </div>
              </div>
              
              {/* Progress indicator */}
              <div className="flex justify-center mb-8">
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div
                      key={step}
                      className={`w-3 h-3 rounded-full bg-blue-500`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-6 mb-8">
              <h4 className="font-semibold mb-6 flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Summary of Entered Data</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-400">Last Name</p>
                      <p className="font-medium">{allFormData.lastName || "Not provided"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-400">Date of Birth</p>
                      <p className="font-medium">{allFormData.dateOfBirth || "Not provided"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-400">Country</p>
                      <p className="font-medium">{allFormData.country || "Not provided"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="font-medium">{allFormData.email || "Not provided"}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-400">Phone Number</p>
                      <p className="font-medium">{allFormData.phoneNumber || "Not provided"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-400">Document Type</p>
                      <p className="font-medium">{allFormData.documentType || "Not provided"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-400">Document Number</p>
                      <p className="font-medium">{allFormData.documentNumber || "Not provided"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-400">Document Image</p>
                      <p className="font-medium">{allFormData.documentImage ? "✓ Uploaded" : "✗ Not uploaded"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Camera className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-400">Selfie Image</p>
                      <p className="font-medium">{allFormData.selfieImage ? "✓ Uploaded" : "✗ Not uploaded"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  required
                />
                <div className="text-sm">
                  <label className="text-gray-300">
                    I agree to the{" "}
                    <a href="#" className="text-blue-400 hover:underline">Terms of Service</a>
                    {" "}and{" "}
                    <a href="#" className="text-blue-400 hover:underline">Privacy Policy</a>
                  </label>
                  {errors.termsAccepted && <p className="text-red-500 text-sm mt-1">{errors.termsAccepted}</p>}
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={handlePrevious}
                className="px-6 py-3 bg-white/10 border border-white/20 rounded-lg font-semibold hover:bg-white/20 transition-colors flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
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

export default KYCStep5Page;
