const { supabase } = require('../config/supabase');

// Tipos para o módulo fiscal
const InvoiceType = {
  NFE: 'nfe',
  NFCE: 'nfce',
  NFSE: 'nfse'
};

const InvoiceStatus = {
  DRAFT: 'draft',
  SENT: 'sent',
  AUTHORIZED: 'authorized',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
};

const CertificateType = {
  A1: 'a1',
  A3: 'a3'
};

const CertificateStatus = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  REVOKED: 'revoked'
};

// Criar nota fiscal
const createInvoice = async (req, res) => {
  try {
    const {
      type,
      clientId,
      issueDate,
      items,
      observations,
      additionalInfo
    } = req.body;

    // Validações básicas
    if (!type || !clientId || !issueDate || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Dados obrigatórios não fornecidos'
      });
    }

    // Verificar se o cliente existe
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    // Calcular total da nota
    const totalValue = items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);

    // Gerar número da nota fiscal (sequencial)
    const { data: lastInvoice } = await supabase
      .from('invoices')
      .select('number')
      .eq('type', type)
      .order('number', { ascending: false })
      .limit(1)
      .single();

    const nextNumber = lastInvoice ? 
      String(parseInt(lastInvoice.number) + 1).padStart(6, '0') : 
      '000001';

    // Criar a nota fiscal
    const invoiceData = {
      number: nextNumber,
      type,
      status: InvoiceStatus.DRAFT,
      client_id: clientId,
      total_value: totalValue,
      issue_date: issueDate,
      observations: observations || null,
      additional_info: additionalInfo || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert(invoiceData)
      .select()
      .single();

    if (invoiceError) {
      console.error('Erro ao criar nota fiscal:', invoiceError);
      return res.status(500).json({
        success: false,
        message: 'Erro ao criar nota fiscal'
      });
    }

    // Criar itens da nota fiscal
    const invoiceItems = items.map(item => ({
      invoice_id: invoice.id,
      product_id: item.productId || null,
      product_name: item.productName,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.quantity * item.unitPrice,
      ncm: item.ncm || null,
      cfop: item.cfop || null,
      icms_base: item.icms?.base || null,
      icms_rate: item.icms?.rate || null,
      icms_value: item.icms?.value || null,
      ipi_rate: item.ipi?.rate || null,
      ipi_value: item.ipi?.value || null,
      created_at: new Date().toISOString()
    }));

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(invoiceItems);

    if (itemsError) {
      console.error('Erro ao criar itens da nota fiscal:', itemsError);
      // Deletar a nota fiscal criada
      await supabase.from('invoices').delete().eq('id', invoice.id);
      return res.status(500).json({
        success: false,
        message: 'Erro ao criar itens da nota fiscal'
      });
    }

    // Buscar a nota fiscal completa
    const { data: completeInvoice, error: fetchError } = await supabase
      .from('invoices')
      .select(`
        *,
        clients (
          id,
          name,
          cnpj,
          cpf,
          email,
          phone
        ),
        invoice_items (*)
      `)
      .eq('id', invoice.id)
      .single();

    if (fetchError) {
      console.error('Erro ao buscar nota fiscal completa:', fetchError);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar nota fiscal criada'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Nota fiscal criada com sucesso',
      data: completeInvoice
    });

  } catch (error) {
    console.error('Erro no createInvoice:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Listar notas fiscais
const getInvoices = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      type = '',
      status = '',
      dateFrom = '',
      dateTo = '',
      clientId = ''
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Construir query base
    let query = supabase
      .from('invoices')
      .select(`
        *,
        clients (
          id,
          name,
          cnpj,
          cpf,
          email,
          phone
        )
      `, { count: 'exact' });

    // Aplicar filtros
    if (search) {
      query = query.or(`number.ilike.%${search}%,clients.name.ilike.%${search}%,access_key.ilike.%${search}%`);
    }

    if (type) {
      query = query.eq('type', type);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (dateFrom) {
      query = query.gte('issue_date', dateFrom);
    }

    if (dateTo) {
      query = query.lte('issue_date', dateTo);
    }

    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    // Aplicar paginação e ordenação
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    const { data: invoices, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar notas fiscais:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar notas fiscais'
      });
    }

    res.json({
      success: true,
      data: invoices,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Erro no getInvoices:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Buscar nota fiscal por ID
const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        clients (
          id,
          name,
          cnpj,
          cpf,
          email,
          phone,
          address
        ),
        invoice_items (*)
      `)
      .eq('id', id)
      .single();

    if (error || !invoice) {
      return res.status(404).json({
        success: false,
        message: 'Nota fiscal não encontrada'
      });
    }

    res.json({
      success: true,
      data: invoice
    });

  } catch (error) {
    console.error('Erro no getInvoiceById:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atualizar nota fiscal
const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Verificar se a nota fiscal existe
    const { data: existingInvoice, error: fetchError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingInvoice) {
      return res.status(404).json({
        success: false,
        message: 'Nota fiscal não encontrada'
      });
    }

    // Não permitir edição de notas autorizadas
    if (existingInvoice.status === InvoiceStatus.AUTHORIZED) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível editar nota fiscal autorizada'
      });
    }

    // Atualizar dados da nota fiscal
    const invoiceUpdateData = {
      ...updateData,
      updated_at: new Date().toISOString()
    };

    const { data: updatedInvoice, error: updateError } = await supabase
      .from('invoices')
      .update(invoiceUpdateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Erro ao atualizar nota fiscal:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar nota fiscal'
      });
    }

    res.json({
      success: true,
      message: 'Nota fiscal atualizada com sucesso',
      data: updatedInvoice
    });

  } catch (error) {
    console.error('Erro no updateInvoice:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Cancelar nota fiscal
const cancelInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Verificar se a nota fiscal existe
    const { data: existingInvoice, error: fetchError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingInvoice) {
      return res.status(404).json({
        success: false,
        message: 'Nota fiscal não encontrada'
      });
    }

    // Verificar se pode ser cancelada
    if (existingInvoice.status !== InvoiceStatus.AUTHORIZED) {
      return res.status(400).json({
        success: false,
        message: 'Apenas notas autorizadas podem ser canceladas'
      });
    }

    // Atualizar status para cancelada
    const { data: cancelledInvoice, error: updateError } = await supabase
      .from('invoices')
      .update({
        status: InvoiceStatus.CANCELLED,
        cancellation_reason: reason,
        cancellation_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Erro ao cancelar nota fiscal:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Erro ao cancelar nota fiscal'
      });
    }

    res.json({
      success: true,
      message: 'Nota fiscal cancelada com sucesso',
      data: cancelledInvoice
    });

  } catch (error) {
    console.error('Erro no cancelInvoice:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Enviar nota fiscal para SEFAZ
const sendInvoiceToSEFAZ = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se a nota fiscal existe
    const { data: existingInvoice, error: fetchError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingInvoice) {
      return res.status(404).json({
        success: false,
        message: 'Nota fiscal não encontrada'
      });
    }

    // Verificar se pode ser enviada
    if (existingInvoice.status !== InvoiceStatus.DRAFT) {
      return res.status(400).json({
        success: false,
        message: 'Apenas notas em rascunho podem ser enviadas'
      });
    }

    // TODO: Integração com API fiscal (FiscalAPI, NFe.io, etc.)
    // Por enquanto, simular envio
    const mockResponse = {
      status: 'authorized',
      authorizationCode: '12345678901234567890123456789012345678901234',
      accessKey: '35240114200166000187550010000000011234567890',
      authorizationDate: new Date().toISOString(),
      xmlUrl: 'https://example.com/invoice.xml',
      pdfUrl: 'https://example.com/invoice.pdf'
    };

    // Atualizar nota fiscal com dados da autorização
    const { data: updatedInvoice, error: updateError } = await supabase
      .from('invoices')
      .update({
        status: mockResponse.status,
        authorization_code: mockResponse.authorizationCode,
        access_key: mockResponse.accessKey,
        authorization_date: mockResponse.authorizationDate,
        xml_url: mockResponse.xmlUrl,
        pdf_url: mockResponse.pdfUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Erro ao atualizar nota fiscal:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar nota fiscal'
      });
    }

    res.json({
      success: true,
      message: 'Nota fiscal enviada e autorizada com sucesso',
      data: updatedInvoice
    });

  } catch (error) {
    console.error('Erro no sendInvoiceToSEFAZ:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Carregar certificado digital
const uploadCertificate = async (req, res) => {
  try {
    const {
      name,
      password,
      type = CertificateType.A1
    } = req.body;

    // Validações básicas
    if (!name || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nome e senha do certificado são obrigatórios'
      });
    }

    // TODO: Processar arquivo do certificado
    // Por enquanto, simular upload
    const mockCertificate = {
      name,
      type,
      serialNumber: '1234567890123456789012345678901234567890',
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 ano
      status: CertificateStatus.ACTIVE,
      uploaded_at: new Date().toISOString()
    };

    // Salvar certificado no banco
    const { data: certificate, error } = await supabase
      .from('certificates')
      .insert({
        name: mockCertificate.name,
        type: mockCertificate.type,
        serial_number: mockCertificate.serialNumber,
        expiry_date: mockCertificate.expiryDate,
        status: mockCertificate.status,
        uploaded_at: mockCertificate.uploaded_at
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar certificado:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao salvar certificado'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Certificado digital carregado com sucesso',
      data: certificate
    });

  } catch (error) {
    console.error('Erro no uploadCertificate:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Listar certificados digitais
const getCertificates = async (req, res) => {
  try {
    const { data: certificates, error } = await supabase
      .from('certificates')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar certificados:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar certificados'
      });
    }

    res.json({
      success: true,
      data: certificates
    });

  } catch (error) {
    console.error('Erro no getCertificates:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter estatísticas fiscais
const getFiscalStats = async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    // Calcular datas baseadas no período
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Buscar estatísticas
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('type, status, total_value, issue_date')
      .gte('issue_date', startDate.toISOString())
      .lte('issue_date', now.toISOString());

    if (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar estatísticas'
      });
    }

    // Calcular estatísticas
    const stats = {
      totalInvoices: invoices.length,
      authorizedInvoices: invoices.filter(i => i.status === InvoiceStatus.AUTHORIZED).length,
      totalValue: invoices
        .filter(i => i.status === InvoiceStatus.AUTHORIZED)
        .reduce((sum, i) => sum + parseFloat(i.total_value), 0),
      byType: {
        nfe: invoices.filter(i => i.type === InvoiceType.NFE).length,
        nfce: invoices.filter(i => i.type === InvoiceType.NFCE).length,
        nfse: invoices.filter(i => i.type === InvoiceType.NFSE).length
      },
      byStatus: {
        draft: invoices.filter(i => i.status === InvoiceStatus.DRAFT).length,
        sent: invoices.filter(i => i.status === InvoiceStatus.SENT).length,
        authorized: invoices.filter(i => i.status === InvoiceStatus.AUTHORIZED).length,
        rejected: invoices.filter(i => i.status === InvoiceStatus.REJECTED).length,
        cancelled: invoices.filter(i => i.status === InvoiceStatus.CANCELLED).length
      }
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Erro no getFiscalStats:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  cancelInvoice,
  sendInvoiceToSEFAZ,
  uploadCertificate,
  getCertificates,
  getFiscalStats
};
