const { supabase } = require('../config/database');
const stoneService = require('../services/stoneService');

/**
 * @swagger
 * /api/v1/payments/process:
 *   post:
 *     summary: Processar pagamento
 *     tags: [Pagamentos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - saleId
 *               - paymentMethod
 *               - amount
 *             properties:
 *               saleId:
 *                 type: string
 *                 format: uuid
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, credit_card, debit_card, pix]
 *               amount:
 *                 type: number
 *               installments:
 *                 type: integer
 *               cardData:
 *                 type: object
 *               customer:
 *                 type: object
 *     responses:
 *       200:
 *         description: Pagamento processado com sucesso
 *       400:
 *         description: Dados inválidos
 */
const processPayment = async (req, res) => {
  try {
    const {
      saleId,
      paymentMethod,
      amount,
      installments = 1,
      cardData,
      customer
    } = req.body;

    // Validar dados
    if (!saleId || !paymentMethod || !amount) {
      return res.status(400).json({
        success: false,
        message: 'saleId, paymentMethod e amount são obrigatórios'
      });
    }

    // Buscar dados da venda
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .select('*, clients(*), users(*)')
      .eq('id', saleId)
      .single();

    if (saleError || !sale) {
      return res.status(404).json({
        success: false,
        message: 'Venda não encontrada'
      });
    }

    // Verificar se já foi paga
    if (sale.payment_status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Venda já está paga'
      });
    }

    // Preparar dados do cliente
    const customerData = customer || {
      name: sale.clients?.name || 'Cliente',
      email: sale.clients?.email || '',
      cpf: sale.clients?.cpf || '',
      phone: sale.clients?.phone || ''
    };

    // Processar pagamento
    let paymentResult;
    
    if (paymentMethod === 'cash') {
      // Pagamento em dinheiro não precisa passar pela Stone
      paymentResult = {
        success: true,
        status: 'paid',
        transactionId: `CASH-${Date.now()}`,
        data: {
          method: 'cash',
          amount,
          processedAt: new Date().toISOString()
        }
      };
    } else if (paymentMethod === 'pix') {
      paymentResult = await stoneService.createPixPayment({
        amount,
        customer: customerData,
        reference: saleId
      });
    } else if (paymentMethod === 'credit_card' || paymentMethod === 'debit_card') {
      if (!cardData) {
        return res.status(400).json({
          success: false,
          message: 'Dados do cartão são obrigatórios'
        });
      }

      paymentResult = await stoneService.createPayment({
        amount,
        paymentMethod,
        ...cardData,
        installments,
        customer: customerData,
        reference: saleId
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Método de pagamento inválido'
      });
    }

    if (!paymentResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Erro ao processar pagamento',
        error: paymentResult.error,
        details: paymentResult.details
      });
    }

    // Salvar transação no banco
    const transactionData = {
      sale_id: saleId,
      payment_method: paymentMethod,
      amount: amount,
      installments: paymentMethod === 'credit_card' ? parseInt(installments) : 1,
      stone_transaction_id: paymentResult.transactionId,
      status: paymentResult.status || 'pending',
      gateway_response: paymentResult.data,
      pix_qr_code: paymentResult.qrCode || null,
      pix_copy_paste: paymentResult.pixCopyPaste || null,
      pix_expires_at: paymentResult.expiresAt || null,
      created_at: new Date().toISOString()
    };

    const { data: transaction, error: transactionError } = await supabase
      .from('payment_transactions')
      .insert([transactionData])
      .select()
      .single();

    if (transactionError) {
      console.error('Erro ao salvar transação:', transactionError);
      // Mesmo com erro ao salvar, retornar sucesso se o pagamento foi processado
    }

    // Atualizar status da venda
    let paymentStatus = 'pending';
    if (paymentResult.status === 'approved' || paymentResult.status === 'paid') {
      paymentStatus = 'paid';
    } else if (paymentResult.status === 'partially_paid') {
      paymentStatus = 'partial';
    }

    await supabase
      .from('sales')
      .update({
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        installments: paymentMethod === 'credit_card' ? parseInt(installments) : 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', saleId);

    res.json({
      success: true,
      message: 'Pagamento processado com sucesso',
      data: {
        transaction: transaction || { stone_transaction_id: paymentResult.transactionId },
        paymentResult,
        saleStatus: paymentStatus
      }
    });
  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/v1/payments/transaction/{transactionId}:
 *   get:
 *     summary: Consultar status de transação
 *     tags: [Pagamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status da transação
 */
const getTransactionStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;

    // Buscar transação no banco
    const { data: transaction, error } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (error || !transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transação não encontrada'
      });
    }

    // Consultar status na Stone
    const stoneStatus = await stoneService.getTransactionStatus(
      transaction.stone_transaction_id
    );

    // Atualizar status no banco se mudou
    if (stoneStatus.success && stoneStatus.status !== transaction.status) {
      await supabase
        .from('payment_transactions')
        .update({
          status: stoneStatus.status,
          gateway_response: stoneStatus.data,
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId);

      // Atualizar status da venda
      let paymentStatus = 'pending';
      if (stoneStatus.status === 'approved' || stoneStatus.status === 'paid') {
        paymentStatus = 'paid';
      } else if (stoneStatus.status === 'cancelled') {
        paymentStatus = 'cancelled';
      }

      await supabase
        .from('sales')
        .update({
          payment_status: paymentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', transaction.sale_id);
    }

    res.json({
      success: true,
      data: {
        transaction,
        stoneStatus: stoneStatus.data
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao consultar transação',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/v1/payments/cancel/{transactionId}:
 *   post:
 *     summary: Cancelar transação
 *     tags: [Pagamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Transação cancelada
 */
const cancelTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { amount } = req.body;

    // Buscar transação
    const { data: transaction, error } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (error || !transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transação não encontrada'
      });
    }

    // Cancelar na Stone
    const cancelResult = await stoneService.cancelTransaction(
      transaction.stone_transaction_id,
      amount
    );

    if (!cancelResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Erro ao cancelar transação',
        error: cancelResult.error
      });
    }

    // Atualizar no banco
    await supabase
      .from('payment_transactions')
      .update({
        status: 'cancelled',
        gateway_response: cancelResult.data,
        updated_at: new Date().toISOString()
      })
      .eq('id', transactionId);

    await supabase
      .from('sales')
      .update({
        payment_status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', transaction.sale_id);

    res.json({
      success: true,
      message: 'Transação cancelada com sucesso',
      data: cancelResult.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao cancelar transação',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/v1/payments/sale/{saleId}:
 *   get:
 *     summary: Listar transações de uma venda
 *     tags: [Pagamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: saleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lista de transações
 */
const getSaleTransactions = async (req, res) => {
  try {
    const { saleId } = req.params;

    const { data: transactions, error } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('sale_id', saleId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar transações',
        error: error.message
      });
    }

    res.json({
      success: true,
      data: { transactions: transactions || [] }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

module.exports = {
  processPayment,
  getTransactionStatus,
  cancelTransaction,
  getSaleTransactions
};

