/**
 * Bridge API Integration Service
 * Handles KYC verification through Bridge API
 */

const BRIDGE_API_BASE_URL = "https://api.bridge.com/v1";
const BRIDGE_API_KEY = process.env.NEXT_PUBLIC_BRIDGE_API_KEY;

export class BridgeAPIService {
  constructor(apiKey = BRIDGE_API_KEY) {
    this.apiKey = apiKey;
    this.baseURL = BRIDGE_API_BASE_URL;
  }

  /**
   * Submit KYC data to Bridge API
   * @param {Object} kycData - KYC form data
   * @returns {Promise<Object>} - Bridge API response
   */
  async submitKYC(kycData) {
    try {
      const response = await fetch(`${this.baseURL}/kyc/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          // Personal Information
          firstName: kycData.firstName,
          lastName: kycData.lastName,
          dateOfBirth: kycData.dateOfBirth,
          
          // Address Information
          address: {
            street: kycData.address,
            city: kycData.city,
            country: kycData.country,
            postalCode: kycData.postalCode,
          },
          
          // Identity Documents
          document: {
            type: kycData.documentType,
            number: kycData.documentNumber,
            image: kycData.documentImage,
          },
          
          // Selfie
          selfie: kycData.selfieImage,
          
          // Contact Information
          email: kycData.email,
          phone: kycData.phoneNumber,
          
          // Metadata
          metadata: {
            source: "defi-social-hub",
            version: "1.0",
            timestamp: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Bridge API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        referenceId: result.referenceId,
        status: result.status,
        message: "KYC data submitted successfully",
      };
    } catch (error) {
      console.error("Bridge API submission failed:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to submit KYC data",
      };
    }
  }

  /**
   * Check KYC verification status
   * @param {string} referenceId - Bridge API reference ID
   * @returns {Promise<Object>} - Verification status
   */
  async checkVerificationStatus(referenceId) {
    try {
      const response = await fetch(`${this.baseURL}/kyc/status/${referenceId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Bridge API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        status: result.status,
        riskScore: result.riskScore,
        amlStatus: result.amlStatus,
        verificationDate: result.verificationDate,
        expiryDate: result.expiryDate,
        details: result.details,
      };
    } catch (error) {
      console.error("Bridge API status check failed:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to check verification status",
      };
    }
  }

  /**
   * Get KYC verification details
   * @param {string} referenceId - Bridge API reference ID
   * @returns {Promise<Object>} - Verification details
   */
  async getVerificationDetails(referenceId) {
    try {
      const response = await fetch(`${this.baseURL}/kyc/details/${referenceId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Bridge API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        details: result,
      };
    } catch (error) {
      console.error("Bridge API details fetch failed:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch verification details",
      };
    }
  }

  /**
   * Webhook handler for Bridge API callbacks
   * @param {Object} webhookData - Webhook payload
   * @returns {Object} - Processed webhook data
   */
  processWebhook(webhookData) {
    try {
      const {
        referenceId,
        status,
        riskScore,
        amlStatus,
        verificationDate,
        expiryDate,
        rejectionReason,
      } = webhookData;

      return {
        success: true,
        referenceId,
        status,
        riskScore,
        amlStatus,
        verificationDate,
        expiryDate,
        rejectionReason,
        processedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Webhook processing failed:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to process webhook",
      };
    }
  }

  /**
   * Mock KYC submission for development/testing
   * @param {Object} kycData - KYC form data
   * @returns {Promise<Object>} - Mock response
   */
  async mockSubmitKYC(kycData) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate mock response
    const referenceId = `BRIDGE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      success: true,
      referenceId,
      status: "PENDING",
      message: "KYC data submitted successfully (mock)",
    };
  }

  /**
   * Mock status check for development/testing
   * @param {string} referenceId - Bridge API reference ID
   * @returns {Promise<Object>} - Mock status
   */
  async mockCheckStatus(referenceId) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate mock response
    const statuses = ["PENDING", "APPROVED", "REJECTED"];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      success: true,
      status: randomStatus,
      riskScore: Math.floor(Math.random() * 30) + 5,
      amlStatus: randomStatus === "APPROVED" ? "CLEAR" : "PENDING",
      verificationDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      details: {
        documentVerified: randomStatus === "APPROVED",
        faceVerified: randomStatus === "APPROVED",
        amlScreening: randomStatus === "APPROVED" ? "PASSED" : "PENDING",
      },
    };
  }
}

// Export singleton instance
export const bridgeAPI = new BridgeAPIService();
