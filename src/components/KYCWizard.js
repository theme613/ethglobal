"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Camera, 
  FileText, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin,
  Shield,
  AlertCircle
} from "lucide-react";

// Step Components - Each step is a separate functional component
const Step1PersonalInfo = ({ formData, handleInputChange, errors }) => (
  <div className="space-y-6">
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
      <label className="block text-sm font-medium mb-2">Country of Residence *</label>
      <select
        name="country"
        value={formData.country}
        onChange={handleInputChange}
        className={`w-full px-4 py-3 bg-white/5 rounded-lg border ${
          errors.country ? "border-red-500" : "border-white/20"
        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
        required
      >
        <option value="">Select Country</option>
        <option value="US">United States</option>
        <option value="CA">Canada</option>
        <option value="GB">United Kingdom</option>
        <option value="AU">Australia</option>
        <option value="DE">Germany</option>
        <option value="FR">France</option>
        <option value="JP">Japan</option>
        <option value="SG">Singapore</option>
      </select>
      {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
    </div>
  </div>
);

const Step2ContactInfo = ({ formData, handleInputChange, errors }) => (
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-medium mb-2">Email *</label>
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleInputChange}
        className={`w-full px-4 py-3 bg-white/5 rounded-lg border ${
          errors.email ? "border-red-500" : "border-white/20"
        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
        placeholder="Enter your email"
        required
      />
      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
    </div>
    
    <div>
      <label className="block text-sm font-medium mb-2">Phone Number *</label>
      <input
        type="tel"
        name="phoneNumber"
        value={formData.phoneNumber}
        onChange={handleInputChange}
        className={`w-full px-4 py-3 bg-white/5 rounded-lg border ${
          errors.phoneNumber ? "border-red-500" : "border-white/20"
        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
        placeholder="Enter your phone number"
        required
      />
      {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
    </div>
  </div>
);

const Step3DocumentInfo = ({ formData, handleInputChange, errors }) => (
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-medium mb-2">Identity Document Type *</label>
      <select
        name="documentType"
        value={formData.documentType}
        onChange={handleInputChange}
        className={`w-full px-4 py-3 bg-white/5 rounded-lg border ${
          errors.documentType ? "border-red-500" : "border-white/20"
        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
        required
      >
        <option value="">Select Document Type</option>
        <option value="passport">Passport</option>
        <option value="drivers_license">Driver's License</option>
        <option value="national_id">National ID</option>
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
);

const Step4DocumentUpload = ({ formData, handleImageUpload, errors }) => (
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
);

const Step5ReviewAndSubmit = ({ formData, handleInputChange, errors }) => (
  <div className="space-y-6">
    <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-6">
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
              <p className="font-medium">{formData.lastName || "Not provided"}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-400">Date of Birth</p>
              <p className="font-medium">{formData.dateOfBirth || "Not provided"}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <MapPin className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-400">Country</p>
              <p className="font-medium">{formData.country || "Not provided"}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Mail className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-400">Email</p>
              <p className="font-medium">{formData.email || "Not provided"}</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Phone className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-400">Phone Number</p>
              <p className="font-medium">{formData.phoneNumber || "Not provided"}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <FileText className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-400">Document Type</p>
              <p className="font-medium">{formData.documentType || "Not provided"}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <FileText className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-400">Document Number</p>
              <p className="font-medium">{formData.documentNumber || "Not provided"}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <FileText className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-400">Document Image</p>
              <p className="font-medium">{formData.documentImage ? "✓ Uploaded" : "✗ Not uploaded"}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Camera className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-400">Selfie Image</p>
              <p className="font-medium">{formData.selfieImage ? "✓ Uploaded" : "✗ Not uploaded"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div className="flex items-start space-x-3">
      <input
        type="checkbox"
        name="termsAccepted"
        checked={formData.termsAccepted}
        onChange={handleInputChange}
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
);

const KYCWizard = () => {
  const { isConnected } = useAccount();
  const router = useRouter();
  
  // Main wizard state - tracks current step (1-5)
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form data state - stores all form data across steps
  const [formData, setFormData] = useState({
    // Step 1: Personal Information
    lastName: "",
    dateOfBirth: "",
    country: "",
    // Step 2: Contact Information
    email: "",
    phoneNumber: "",
    // Step 3: Document Information
    documentType: "",
    documentNumber: "",
    // Step 4: Document Uploads
    documentImage: null,
    selfieImage: null,
    // Step 5: Review & Consent
    termsAccepted: false
  });
  
  // Error state for validation
  const [errors, setErrors] = useState({});
  
  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not connected
  useEffect(() => {
    if (!isConnected) {
      router.push("/login");
    }
  }, [isConnected, router]);

  // Handle input changes and clear errors
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Handle image uploads for step 4
  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          [type]: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Per-step validation - user cannot proceed without filling required fields
  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1: // Personal Information
        if (!formData.lastName) newErrors.lastName = "Last name is required";
        if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
        if (!formData.country) newErrors.country = "Country is required";
        break;
      case 2: // Contact Information
        if (!formData.email) newErrors.email = "Email is required";
        if (!formData.phoneNumber) newErrors.phoneNumber = "Phone number is required";
        break;
      case 3: // Document Information
        if (!formData.documentType) newErrors.documentType = "Document type is required";
        if (!formData.documentNumber) newErrors.documentNumber = "Document number is required";
        break;
      case 4: // Document Uploads
        if (!formData.documentImage) newErrors.documentImage = "Document image is required";
        if (!formData.selfieImage) newErrors.selfieImage = "Selfie image is required";
        break;
      case 5: // Review & Consent
        if (!formData.termsAccepted) newErrors.termsAccepted = "You must accept the terms and conditions";
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Next button - advances if current inputs are valid
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  // Back button - goes to previous step
  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  // Final submission - collects all data for API call
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setIsSubmitting(true);
    try {
      console.log("Submitting KYC data:", formData);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      router.push("/verification");
    } catch (error) {
      console.error("KYC submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step configuration with titles, descriptions, and icons
  const steps = [
    {
      number: 1,
      title: "Basic Personal Information",
      description: "Get the foundational identity info to start building a profile.",
      icon: <MapPin className="w-6 h-6" />
    },
    {
      number: 2,
      title: "Contact Information", 
      description: "For communication and account recovery, plus contact verification.",
      icon: <Mail className="w-6 h-6" />
    },
    {
      number: 3,
      title: "Identity Document Details",
      description: "Determines what document will be uploaded and enables validation.",
      icon: <FileText className="w-6 h-6" />
    },
    {
      number: 4,
      title: "Document Uploads",
      description: "Required for doc verification (OCR, fraud checks) and face match.",
      icon: <Camera className="w-6 h-6" />
    },
    {
      number: 5,
      title: "Review & Consent",
      description: "User reviews and confirms, then submits for KYC/AML processing.",
      icon: <Shield className="w-6 h-6" />
    }
  ];

  // Render current step - ONLY show fields for current step, hide others
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1PersonalInfo formData={formData} handleInputChange={handleInputChange} errors={errors} />;
      case 2:
        return <Step2ContactInfo formData={formData} handleInputChange={handleInputChange} errors={errors} />;
      case 3:
        return <Step3DocumentInfo formData={formData} handleInputChange={handleInputChange} errors={errors} />;
      case 4:
        return <Step4DocumentUpload formData={formData} handleImageUpload={handleImageUpload} errors={errors} />;
      case 5:
        return <Step5ReviewAndSubmit formData={formData} handleInputChange={handleInputChange} errors={errors} />;
      default:
        return <Step1PersonalInfo formData={formData} handleInputChange={handleInputChange} errors={errors} />;
    }
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
    <div className="max-w-4xl mx-auto w-full">
      <div className="bg-black/80 backdrop-blur-lg rounded-2xl border border-white/10 p-8">
        {/* Header with current step info */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              {steps[currentStep - 1].icon}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{steps[currentStep - 1].title}</h1>
              <p className="text-gray-400">{steps[currentStep - 1].description}</p>
            </div>
          </div>
          
          {/* Progress Bar - shows completed steps */}
          <div className="flex justify-center mb-6">
            <div className="flex space-x-2">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    step.number <= currentStep ? "bg-blue-500" : "bg-gray-600"
                  }`}
                />
              ))}
            </div>
          </div>
          
          {/* Step Counter - Step X of Y */}
          <div className="text-center mb-6">
            <span className="text-sm text-gray-400">Step {currentStep} of {steps.length}</span>
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {renderCurrentStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation - Next and Back buttons */}
        <div className="flex justify-between mt-8">
          {/* Back button - goes to previous step */}
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="px-6 py-3 bg-white/10 border border-white/20 rounded-lg font-semibold hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          
          {/* Next button - advances if current inputs are valid */}
          {currentStep < steps.length ? (
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            /* Submit button - final submission collects all data for API call */
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
          )}
        </div>
      </div>
    </div>
  );
};

export default KYCWizard;
