const axios = require('axios');
const crypto = require('crypto');

class MpesaService {
  constructor() {
    this.consumerKey = process.env.MPESA_CONSUMER_KEY;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    this.businessShortCode = process.env.MPESA_BUSINESS_SHORTCODE;
    this.passkey = process.env.MPESA_PASSKEY;
    this.callbackUrl = process.env.MPESA_CALLBACK_URL;
    this.environment = process.env.MPESA_ENVIRONMENT;
    
    this.baseURL = this.environment === 'production' 
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';
  }

  /**
   * Generate M-Pesa access token
   */
  async generateAccessToken() {
    try {
      const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
      
      const response = await axios.get(`${this.baseURL}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      });

      return response.data.access_token;
    } catch (error) {
      console.error('M-Pesa Access Token Error:', error.response?.data || error.message);
      throw new Error('Failed to generate M-Pesa access token');
    }
  }

  /**
   * Generate Lipa Na M-Pesa Online password
   */
  generatePassword() {
    const timestamp = this.getTimestamp();
    const password = Buffer.from(`${this.businessShortCode}${this.passkey}${timestamp}`).toString('base64');
    return { password, timestamp };
  }

  /**
   * Get current timestamp in YYYYMMDDHHmmss format
   */
  getTimestamp() {
    const now = new Date();
    return [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
      String(now.getHours()).padStart(2, '0'),
      String(now.getMinutes()).padStart(2, '0'),
      String(now.getSeconds()).padStart(2, '0'),
    ].join('');
  }

  /**
   * Initiate STK Push (Lipa Na M-Pesa Online)
   */
  async initiateSTKPush(phoneNumber, amount, accountReference, transactionDesc = 'Food Order Payment') {
    try {
      const accessToken = await this.generateAccessToken();
      const { password, timestamp } = this.generatePassword();

      // Format phone number (2547...)
      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      const requestBody = {
        BusinessShortCode: this.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount), // M-Pesa requires integer amount
        PartyA: formattedPhone,
        PartyB: this.businessShortCode,
        PhoneNumber: formattedPhone,
        CallBackURL: this.callbackUrl,
        AccountReference: accountReference.substring(0, 12), // Max 12 chars
        TransactionDesc: transactionDesc.substring(0, 13), // Max 13 chars
      };

      const response = await axios.post(
        `${this.baseURL}/mpesa/stkpush/v1/processrequest`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        data: response.data,
        checkoutRequestID: response.data.CheckoutRequestID,
        merchantRequestID: response.data.MerchantRequestID,
      };
    } catch (error) {
      console.error('STK Push Error:', error.response?.data || error.message);
      
      // Handle specific M-Pesa error codes
      const mpesaError = error.response?.data;
      if (mpesaError && mpesaError.errorCode) {
        return {
          success: false,
          error: this.getMpesaErrorMessage(mpesaError.errorCode),
          errorCode: mpesaError.errorCode,
        };
      }

      return {
        success: false,
        error: 'Failed to initiate M-Pesa payment',
        details: error.response?.data || error.message,
      };
    }
  }

  /**
   * Format phone number to 2547... format
   */
  formatPhoneNumber(phone) {
    // Remove any non-digit characters
    let cleaned = phone.replace(/\D/g, '');

    // Handle different formats
    if (cleaned.startsWith('0')) {
      return '254' + cleaned.substring(1);
    } else if (cleaned.startsWith('+254')) {
      return cleaned.substring(1);
    } else if (cleaned.startsWith('254')) {
      return cleaned;
    } else if (cleaned.startsWith('7') && cleaned.length === 9) {
      return '254' + cleaned;
    }

    return cleaned;
  }

  /**
   * Get user-friendly error messages for common M-Pesa errors
   */
  getMpesaErrorMessage(errorCode) {
    const errorMessages = {
      '1': 'Insufficient funds in your M-Pesa account',
      '2': 'Less than minimum transaction value',
      '3': 'More than maximum transaction value',
      '4': 'Would exceed account balance',
      '5': 'Would exceed daily transfer limit',
      '6': 'Would exceed minimum balance',
      '7': 'Would exceed balance',
      '8': 'Unresolved primary party',
      '10': 'Unable to validate phone number',
      '11': 'Agent/ Till not found',
      '12': 'General error',
      '13': 'Timeout',
      '14': 'Invalid security credential',
      '15': 'Unknown',
      '17': 'Wrong PIN entered',
      '18': 'Transaction cancelled by user',
      '20': 'Unsupported transaction type',
      '26': 'Transaction in progress',
    };

    return errorMessages[errorCode] || 'Payment failed. Please try again.';
  }

  /**
   * Query transaction status (for pending transactions)
   */
  async queryTransactionStatus(checkoutRequestID) {
    try {
      const accessToken = await this.generateAccessToken();
      const { password, timestamp } = this.generatePassword();

      const requestBody = {
        BusinessShortCode: this.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestID,
      };

      const response = await axios.post(
        `${this.baseURL}/mpesa/stkpushquery/v1/query`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Transaction Query Error:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = new MpesaService();