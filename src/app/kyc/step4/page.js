"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AlertCircle, ArrowRight, ArrowLeft, Camera, FileText, CheckCircle } from "lucide-react";

const KYCStep4Page = () => {
  const { isConnected } = useAccount();
  const router = useRouter();
  const [formData, setFormData] = useState({
    documentImage: null,
    selfieImage: null
  });
  const [errors, setErrors] = useState({});

  // Redirect if not connected - optimized
  useEffect(() => {
    if (!isConnected) {
      router.push("/login");
    }
  }, [isConnected]);

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      // Optimized: Use URL.createObjectURL for better performance
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        [type]: imageUrl
      }));
    }
  };

  const handleNext = () => {
    const newErrors = {};
    
    if (!formData.documentImage) newErrors.documentImage = "Document image is required";
    if (!formData.selfieImage) newErrors.selfieImage = "Selfie image is required";
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      // Store data in localStorage for multi-page flow
      localStorage.setItem('kyc_step4', JSON.stringify(formData));
      router.push("/kyc/step5");
    }
  };

  const handlePrevious = () => {
    router.push("/kyc/step3");
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
                  <span className="text-white font-bold">4</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Document Uploads</h1>
                  <p className="text-gray-400">Required for doc verification (OCR, fraud checks) and face match (selfie to doc).</p>
                </div>
              </div>
              
              {/* Progress indicator */}
              <div className="flex justify-center mb-8">
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div
                      key={step}
                      className={`w-3 h-3 rounded-full ${
                        step <= 4 ? "bg-blue-500" : "bg-gray-600"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium mb-4">Document Image Upload *</label>
                <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "documentImage")}
                    className="hidden"
                    id="document-upload"
                  />
                  <label htmlFor="document-upload" className="cursor-pointer">
                    {formData.documentImage ? (
                      <div className="space-y-3">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                        <p className="text-green-500 font-medium">Document uploaded successfully</p>
                        <p className="text-sm text-gray-400">Click to change image</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto" />
                        <p className="text-gray-300">Click to upload document photo</p>
                        <p className="text-sm text-gray-500">Supports JPG, PNG, PDF</p>
                      </div>
                    )}
                  </label>
                </div>
                {errors.documentImage && <p className="text-red-500 text-sm mt-2">{errors.documentImage}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-4">Selfie Image Upload *</label>
                <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "selfieImage")}
                    className="hidden"
                    id="selfie-upload"
                  />
                  <label htmlFor="selfie-upload" className="cursor-pointer">
                    {formData.selfieImage ? (
                      <div className="space-y-3">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                        <p className="text-green-500 font-medium">Selfie uploaded successfully</p>
                        <p className="text-sm text-gray-400">Click to change image</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Camera className="w-12 h-12 text-gray-400 mx-auto" />
                        <p className="text-gray-300">Click to take selfie</p>
                        <p className="text-sm text-gray-500">Make sure your face is clearly visible</p>
                      </div>
                    )}
                  </label>
                </div>
                {errors.selfieImage && <p className="text-red-500 text-sm mt-2">{errors.selfieImage}</p>}
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrevious}
                className="px-6 py-3 bg-white/10 border border-white/20 rounded-lg font-semibold hover:bg-white/20 transition-colors flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default KYCStep4Page;
