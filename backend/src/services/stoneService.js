const axios = require('axios');
require('dotenv').config();

/**
 * Serviço para integração com Stone Pagamentos
 * Documentação: https://online.stone.com.br/
 */
class StoneService {
  constructor() {
    this.baseURL = process.env.STONE_API_URL || 'https://api.stone.com.br/v1';
    this.apiKey = process.env.STONE_API_KEY;
    this.merchantKey = process.env.STONE_MERCHANT_KEY;
    this.environment = process.env.NODE_ENV || 'development';
    this.isSandbox = this.environment !== 'production';
  }

  /**
   * Obter headers de autenticação
   */
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'Merchant-Key': this.merchantKey
    };
  }

  /**
   * Criar transação de cartão de crédito/débito
   * @param {Object} paymentData - Dados do pagamento
   * @param {number} paymentData.amount - Valor em centavos
   * @param {string} paymentData.paymentMethod - credit_card ou debit_card
   * @param {string} paymentData.cardNumber - Número do cartão
   * @param {string} paymentData.cardHolder - Nome do portador
   * @param {string} paymentData.expirationDate - MM/AA
   * @param {string} paymentData.securityCode - CVV
   * @param {number} paymentData.installments - Número de parcelas (padrão: 1)
   * @param {Object} paymentData.customer - Dados do cliente
   * @param {string} paymentData.reference - Referência da transação (ID da venda)
   */
  async createPayment(paymentData) {
    try {
      if (!this.apiKey || !this.merchantKey) {
        throw new Error('Credenciais Stone não configuradas');
      }

      const {
        amount,
        paymentMethod,
        cardNumber,
        cardHolder,
        expirationDate,
        securityCode,
        installments = 1,
        customer,
        reference
      } = paymentData;

      // Preparar dados da transação
      const transactionData = {
        amount: Math.round(amount * 100), // Converter para centavos
        payment_method: paymentMethod === 'credit_card' ? 'credit' : 'debit',
        installments: paymentMethod === 'credit_card' ? parseInt(installments) : 1,
        reference_id: reference,
        customer: {
          name: customer?.name || 'Cliente',
          email: customer?.email || '',
          document: customer?.cpf?.replace(/\D/g, '') || '',
          phone: customer?.phone?.replace(/\D/g, '') || ''
        },
        card: {
          number: cardNumber.replace(/\D/g, ''),
          holder_name: cardHolder,
          expiration_month: expirationDate.split('/')[0],
          expiration_year: `20${expirationDate.split('/')[1]}`,
          security_code: securityCode
        }
      };

      const response = await axios.post(
        `${this.baseURL}/transactions`,
        transactionData,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: response.data,
        transactionId: response.data.id,
        status: response.data.status
      };
    } catch (error) {
      console.error('Erro ao processar pagamento Stone:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        details: error.response?.data
      };
    }
  }

  /**
   * Criar pagamento via Pix
   * @param {Object} paymentData - Dados do pagamento
   * @param {number} paymentData.amount - Valor em reais
   * @param {Object} paymentData.customer - Dados do cliente
   * @param {string} paymentData.reference - Referência da transação
   */
  async createPixPayment(paymentData) {
    try {
      if (!this.apiKey || !this.merchantKey) {
        throw new Error('Credenciais Stone não configuradas');
      }

      const { amount, customer, reference } = paymentData;

      const transactionData = {
        amount: Math.round(amount * 100), // Converter para centavos
        payment_method: 'pix',
        reference_id: reference,
        customer: {
          name: customer?.name || 'Cliente',
          email: customer?.email || '',
          document: customer?.cpf?.replace(/\D/g, '') || '',
          phone: customer?.phone?.replace(/\D/g, '') || ''
        }
      };

      const response = await axios.post(
        `${this.baseURL}/transactions`,
        transactionData,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: response.data,
        transactionId: response.data.id,
        qrCode: response.data.qr_code,
        pixCopyPaste: response.data.pix_copy_paste,
        expiresAt: response.data.expires_at
      };
    } catch (error) {
      console.error('Erro ao criar pagamento Pix:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        details: error.response?.data
      };
    }
  }

  /**
   * Consultar status de uma transação
   * @param {string} transactionId - ID da transação na Stone
   */
  async getTransactionStatus(transactionId) {
    try {
      if (!this.apiKey || !this.merchantKey) {
        throw new Error('Credenciais Stone não configuradas');
      }

      const response = await axios.get(
        `${this.baseURL}/transactions/${transactionId}`,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: response.data,
        status: response.data.status
      };
    } catch (error) {
      console.error('Erro ao consultar transação:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Cancelar uma transação
   * @param {string} transactionId - ID da transação
   * @param {number} amount - Valor a cancelar (total ou parcial)
   */
  async cancelTransaction(transactionId, amount = null) {
    try {
      if (!this.apiKey || !this.merchantKey) {
        throw new Error('Credenciais Stone não configuradas');
      }

      const cancelData = {};
      if (amount) {
        cancelData.amount = Math.round(amount * 100);
      }

      const response = await axios.post(
        `${this.baseURL}/transactions/${transactionId}/void`,
        cancelData,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: response.data,
        status: response.data.status
      };
    } catch (error) {
      console.error('Erro ao cancelar transação:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Capturar uma transação pré-autorizada
   * @param {string} transactionId - ID da transação
   * @param {number} amount - Valor a capturar
   */
  async captureTransaction(transactionId, amount = null) {
    try {
      if (!this.apiKey || !this.merchantKey) {
        throw new Error('Credenciais Stone não configuradas');
      }

      const captureData = {};
      if (amount) {
        captureData.amount = Math.round(amount * 100);
      }

      const response = await axios.post(
        `${this.baseURL}/transactions/${transactionId}/capture`,
        captureData,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: response.data,
        status: response.data.status
      };
    } catch (error) {
      console.error('Erro ao capturar transação:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Simular pagamento (modo sandbox/teste)
   */
  async simulatePayment(paymentData) {
    if (!this.isSandbox) {
      return {
        success: false,
        error: 'Simulação disponível apenas em ambiente de teste'
      };
    }

    // Simular uma transação bem-sucedida
    return {
      success: true,
      data: {
        id: `sim_${Date.now()}`,
        status: 'approved',
        amount: paymentData.amount,
        payment_method: paymentData.paymentMethod,
        created_at: new Date().toISOString()
      },
      transactionId: `sim_${Date.now()}`,
      status: 'approved'
    };
  }
}

module.exports = new StoneService();

