const { supabase } = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     Client:
 *       type: object
 *       required:
 *         - name
 *         - phone
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         cpf:
 *           type: string
 *         birthDate:
 *           type: string
 *           format: date
 *         gender:
 *           type: string
 *           enum: [M, F, O]
 *         address:
 *           type: object
 *         notes:
 *           type: string
 *         loyaltyPoints:
 *           type: integer
 *         totalPurchases:
 *           type: number
 *         lastPurchase:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/clients:
 *   get:
 *     summary: Listar clientes
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Itens por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nome, email ou telefone
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtrar por status ativo
 *     responses:
 *       200:
 *         description: Lista de clientes
 */
const getClients = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;

    const from = (parseInt(page) - 1) * parseInt(limit);
    const to = from + parseInt(limit) - 1;

    let query = supabase
      .from('clients')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (search) {
      // Busca por nome, email ou telefone (case-insensitive)
      query = query.or(
        `name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
      );
    }

    if (isActive !== undefined && isActive !== '') {
      const active = isActive === 'true' || isActive === true || isActive === 'active';
      query = query.eq('is_active', active);
    }

    const { data, error, count } = await query;

    if (error) {
      return res.status(500).json({ success: false, message: 'Erro ao listar clientes', error: error.message });
    }

    // Converter snake_case -> camelCase para o frontend
    const clients = (data || []).map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      cpf: c.cpf,
      birthDate: c.birth_date,
      gender: c.gender,
      address: c.address,
      notes: c.notes,
      isActive: c.is_active,
      loyaltyPoints: c.loyalty_points,
      totalPurchases: Number(c.total_purchases || 0),
      lastPurchase: c.last_purchase
    }));

    res.json({
      success: true,
      data: {
        clients,
        pagination: {
          total: count || clients.length,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil((count || clients.length) / parseInt(limit))
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/v1/clients/{id}:
 *   get:
 *     summary: Obter cliente por ID
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Dados do cliente
 *       404:
 *         description: Cliente não encontrado
 */
const getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findByPk(id, {
      include: [
        {
          model: Sale,
          as: 'sales',
          limit: 5,
          order: [['createdAt', 'DESC']]
        },
        {
          model: Prescription,
          as: 'prescriptions',
          limit: 5,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    res.json({
      success: true,
      data: client
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/v1/clients:
 *   post:
 *     summary: Criar novo cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Client'
 *     responses:
 *       201:
 *         description: Cliente criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
const createClient = async (req, res) => {
  try {
    const clientData = req.body;

    console.log('📝 Recebendo dados do cliente:', clientData);

    // Verificar se CPF já existe
    if (clientData.cpf) {
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('cpf', clientData.cpf)
        .single();

      if (existingClient) {
        return res.status(400).json({
          success: false,
          message: 'CPF já cadastrado'
        });
      }
    }

    // Mapear campos para o formato do banco (snake_case) e filtrar apenas colunas válidas
    const dbClientData = {
      name: clientData.name,
      email: clientData.email,
      phone: clientData.phone,
      cpf: clientData.cpf,
      birth_date: clientData.birthDate || clientData.birth_date || null,
      gender: clientData.gender,
      // Consolida endereço em JSONB
      address: (() => {
        if (!clientData) return null;
        const hasStructured = typeof clientData.address === 'object' && clientData.address !== null;
        if (hasStructured) return clientData.address;
        if (
          clientData.address ||
          clientData.neighborhood ||
          clientData.city ||
          clientData.state ||
          clientData.zipCode
        ) {
          return {
            street: clientData.address || null,
            neighborhood: clientData.neighborhood || null,
            city: clientData.city || null,
            state: clientData.state || null,
            zipCode: clientData.zipCode || null
          };
        }
        return null;
      })(),
      notes: clientData.notes ?? null
      // Campos como is_active, loyalty_points, total_purchases e last_purchase
      // possuem defaults no banco e não precisam ser enviados aqui
    };

    // Inserir cliente no Supabase com payload compatível
    const { data: newClient, error } = await supabase
      .from('clients')
      .insert([dbClientData])
      .select();

    if (error) {
      console.error('❌ Erro Supabase:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao criar cliente',
        error: error.message
      });
    }

    console.log('✅ Cliente criado:', newClient[0]);

    res.status(201).json({
      success: true,
      message: 'Cliente criado com sucesso',
      data: newClient[0]
    });
  } catch (error) {
    console.error('❌ Erro ao criar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/v1/clients/{id}:
 *   put:
 *     summary: Atualizar cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Client'
 *     responses:
 *       200:
 *         description: Cliente atualizado com sucesso
 *       404:
 *         description: Cliente não encontrado
 */
const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log('📝 Atualizando cliente:', id, updateData);

    // Verificar se cliente existe
    const { data: existingClient, error: fetchError } = await supabase
      .from('clients')
      .select('id, cpf')
      .eq('id', id)
      .single();

    if (fetchError || !existingClient) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    // Verificar se CPF já existe em outro cliente
    if (updateData.cpf && updateData.cpf !== existingClient.cpf) {
      const { data: cpfCheck } = await supabase
        .from('clients')
        .select('id')
        .eq('cpf', updateData.cpf)
        .neq('id', id)
        .single();

      if (cpfCheck) {
        return res.status(400).json({
          success: false,
          message: 'CPF já cadastrado em outro cliente'
        });
      }
    }

    // Mapear campos para o formato do banco (snake_case)
    const dbUpdateData = {
      name: updateData.name,
      email: updateData.email,
      phone: updateData.phone,
      cpf: updateData.cpf,
      birth_date: updateData.birthDate || updateData.birth_date || null,
      gender: updateData.gender,
      // Consolida endereço em JSONB
      address: (() => {
        if (!updateData) return null;
        const hasStructured = typeof updateData.address === 'object' && updateData.address !== null;
        if (hasStructured) return updateData.address;
        if (
          updateData.address ||
          updateData.neighborhood ||
          updateData.city ||
          updateData.state ||
          updateData.zipCode
        ) {
          return {
            street: updateData.address || null,
            neighborhood: updateData.neighborhood || null,
            city: updateData.city || null,
            state: updateData.state || null,
            zipCode: updateData.zipCode || null
          };
        }
        return null;
      })(),
      notes: updateData.notes ?? null,
      is_active: updateData.isActive !== undefined ? updateData.isActive : undefined,
      loyalty_points: updateData.loyaltyPoints !== undefined ? updateData.loyaltyPoints : undefined,
      total_purchases: updateData.totalPurchases !== undefined ? updateData.totalPurchases : undefined,
      last_purchase: updateData.lastPurchase || null
    };

    // Remover campos undefined
    Object.keys(dbUpdateData).forEach(key => {
      if (dbUpdateData[key] === undefined) {
        delete dbUpdateData[key];
      }
    });

    // Atualizar cliente no Supabase
    const { data: updatedClient, error } = await supabase
      .from('clients')
      .update(dbUpdateData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('❌ Erro Supabase:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar cliente',
        error: error.message
      });
    }

    if (!updatedClient || updatedClient.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    // Converter snake_case -> camelCase para o frontend
    const client = updatedClient[0];
    const formattedClient = {
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      cpf: client.cpf,
      birthDate: client.birth_date,
      gender: client.gender,
      address: client.address,
      notes: client.notes,
      isActive: client.is_active,
      loyaltyPoints: client.loyalty_points,
      totalPurchases: Number(client.total_purchases || 0),
      lastPurchase: client.last_purchase
    };

    console.log('✅ Cliente atualizado:', formattedClient);

    res.json({
      success: true,
      message: 'Cliente atualizado com sucesso',
      data: formattedClient
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/v1/clients/{id}:
 *   delete:
 *     summary: Excluir cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Cliente excluído com sucesso
 *       404:
 *         description: Cliente não encontrado
 */
const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🗑️ Excluindo cliente:', id);

    // Verificar se cliente existe
    const { data: existingClient, error: fetchError } = await supabase
      .from('clients')
      .select('id, name')
      .eq('id', id)
      .single();

    if (fetchError || !existingClient) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    // Verificar se cliente tem vendas ou prescrições
    const { data: salesCount } = await supabase
      .from('sales')
      .select('id', { count: 'exact' })
      .eq('client_id', id);

    const { data: prescriptionsCount } = await supabase
      .from('prescriptions')
      .select('id', { count: 'exact' })
      .eq('client_id', id);

    const hasSales = salesCount && salesCount.length > 0;
    const hasPrescriptions = prescriptionsCount && prescriptionsCount.length > 0;

    if (hasSales || hasPrescriptions) {
      // Desativar em vez de excluir
      const { error: updateError } = await supabase
        .from('clients')
        .update({ is_active: false })
        .eq('id', id);

      if (updateError) {
        console.error('❌ Erro ao desativar cliente:', updateError);
        return res.status(500).json({
          success: false,
          message: 'Erro ao desativar cliente',
          error: updateError.message
        });
      }

      console.log('✅ Cliente desativado:', existingClient.name);
      return res.json({
        success: true,
        message: 'Cliente desativado com sucesso (possui histórico de vendas/prescrições)'
      });
    }

    // Excluir cliente
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Erro Supabase:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao excluir cliente',
        error: error.message
      });
    }

    console.log('✅ Cliente excluído:', existingClient.name);

    res.json({
      success: true,
      message: 'Cliente excluído com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao excluir cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/v1/clients/{id}/stats:
 *   get:
 *     summary: Obter estatísticas do cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Estatísticas do cliente
 */
const getClientStats = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    // Estatísticas de vendas
    const salesStats = await Sale.findAll({
      where: { clientId: id },
      attributes: [
        'status',
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', col('total')), 'total']
      ],
      group: ['status']
    });

    // Estatísticas de prescrições
    const prescriptionsStats = await Prescription.findAll({
      where: { clientId: id },
      attributes: [
        'status',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['status']
    });

    res.json({
      success: true,
      data: {
        client: {
          id: client.id,
          name: client.name,
          loyaltyPoints: client.loyaltyPoints,
          totalPurchases: client.totalPurchases,
          lastPurchase: client.lastPurchase
        },
        sales: salesStats,
        prescriptions: prescriptionsStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/v1/clients/{id}/purchases:
 *   get:
 *     summary: Obter histórico de compras do cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Histórico de compras
 */
const getClientPurchases = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const { count, rows: sales } = await Sale.findAndCountAll({
      where: { clientId: id },
      include: [
        {
          model: SaleItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product'
            }
          ]
        },
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['saleDate', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        sales,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/v1/clients/{id}/prescriptions:
 *   get:
 *     summary: Obter histórico de prescrições do cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Histórico de prescrições
 */
const getClientPrescriptions = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const { count, rows: prescriptions } = await Prescription.findAndCountAll({
      where: { clientId: id },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['prescriptionDate', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        prescriptions,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/v1/clients/{id}/loyalty:
 *   put:
 *     summary: Atualizar pontos de fidelidade do cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - points
 *               - operation
 *             properties:
 *               points:
 *                 type: integer
 *               operation:
 *                 type: string
 *                 enum: [add, subtract, set]
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pontos atualizados com sucesso
 */
const updateLoyaltyPoints = async (req, res) => {
  try {
    const { id } = req.params;
    const { points, operation, reason } = req.body;

    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    let newPoints = client.loyaltyPoints;

    switch (operation) {
      case 'add':
        newPoints += points;
        break;
      case 'subtract':
        newPoints = Math.max(0, newPoints - points);
        break;
      case 'set':
        newPoints = points;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Operação inválida. Use: add, subtract ou set'
        });
    }

    await client.update({ loyaltyPoints: newPoints });

    res.json({
      success: true,
      message: 'Pontos de fidelidade atualizados com sucesso',
      data: {
        previousPoints: client.loyaltyPoints,
        newPoints,
        operation,
        reason
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/v1/clients/search:
 *   get:
 *     summary: Busca avançada de clientes
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Termo de busca
 *       - in: query
 *         name: filters
 *         schema:
 *           type: object
 *         description: Filtros adicionais
 *     responses:
 *       200:
 *         description: Resultados da busca
 */
const searchClients = async (req, res) => {
  try {
    const { q, filters = {} } = req.query;
    const where = {};

    // Busca por texto
    if (q) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${q}%` } },
        { email: { [Op.iLike]: `%${q}%` } },
        { phone: { [Op.iLike]: `%${q}%` } },
        { cpf: { [Op.iLike]: `%${q}%` } }
      ];
    }

    // Filtros adicionais
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive === 'true';
    }

    if (filters.minLoyaltyPoints) {
      where.loyaltyPoints = { [Op.gte]: parseInt(filters.minLoyaltyPoints) };
    }

    if (filters.minTotalPurchases) {
      where.totalPurchases = { [Op.gte]: parseFloat(filters.minTotalPurchases) };
    }

    if (filters.lastPurchaseFrom) {
      where.lastPurchase = { [Op.gte]: new Date(filters.lastPurchaseFrom) };
    }

    if (filters.lastPurchaseTo) {
      where.lastPurchase = { 
        ...where.lastPurchase,
        [Op.lte]: new Date(filters.lastPurchaseTo) 
      };
    }

    const clients = await Client.findAll({
      where,
      limit: 50,
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: clients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/v1/clients/sync:
 *   post:
 *     summary: Sincronizar cliente de sistema externo (VisionCare)
 *     description: Endpoint para integração com VisionCare via Webhook Supabase
 *     tags: [Clientes]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: Tipo do evento (INSERT, UPDATE, DELETE)
 *               table:
 *                 type: string
 *                 description: Nome da tabela
 *               record:
 *                 type: object
 *                 description: Dados do registro
 *               old_record:
 *                 type: object
 *                 description: Dados antigos (para UPDATE)
 *     responses:
 *       200:
 *         description: Cliente sincronizado com sucesso
 *       201:
 *         description: Novo cliente criado
 */
const syncClient = async (req, res) => {
  try {
    console.log('📥 Webhook recebido:', JSON.stringify(req.body, null, 2));

    const { type, table, record, old_record } = req.body;

    // Validação do webhook
    if (!type || !table || !record) {
      return res.status(400).json({
        success: false,
        message: 'Webhook inválido: type, table e record são obrigatórios'
      });
    }

    // Apenas processar eventos da tabela patients
    if (table !== 'patients') {
      return res.json({
        success: true,
        message: `Tabela ${table} ignorada (apenas patients é processada)`
      });
    }

    // Extrair dados do paciente (VisionCare)
    const {
      id: externalId,
      name,
      email,
      phone,
      cpf,
      birth_date,
      address,
      nome_pai,
      nome_mae
    } = record;

    // Validação básica
    if (!externalId || !name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Dados incompletos: id, name e phone são obrigatórios'
      });
    }

    // Processar DELETE
    if (type === 'DELETE') {
      const { error } = await supabase
        .from('clients')
        .update({ is_active: false })
        .eq('external_id', externalId)
        .eq('external_system', 'visioncare');

      if (error) {
        console.error('❌ Erro ao desativar cliente:', error);
        return res.status(500).json({
          success: false,
          message: 'Erro ao desativar cliente',
          error: error.message
        });
      }

      return res.json({
        success: true,
        message: 'Cliente desativado com sucesso',
        action: 'deactivated'
      });
    }

    // Montar notes com informações dos pais (se existir)
    let notes = '';
    if (nome_pai) notes += `Pai: ${nome_pai}\n`;
    if (nome_mae) notes += `Mãe: ${nome_mae}`;
    notes = notes.trim() || null;

    // Verificar se o cliente já existe pelo externalId
    const { data: existingClient, error: searchError } = await supabase
      .from('clients')
      .select('*')
      .eq('external_id', externalId)
      .eq('external_system', 'visioncare')
      .maybeSingle();

    if (searchError && searchError.code !== 'PGRST116') {
      console.error('❌ Erro ao buscar cliente:', searchError);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar cliente existente',
        error: searchError.message
      });
    }

    const clientData = {
      name,
      email: email || null,
      phone,
      cpf: cpf || null,
      birth_date: birth_date || null,
      gender: null, // VisionCare não tem gender
      address: address || null,
      notes: notes,
      external_id: externalId,
      external_system: 'visioncare',
      is_active: true,
      updated_at: new Date().toISOString()
    };

    let result;

    if (existingClient) {
      // Atualizar cliente existente
      const { data, error } = await supabase
        .from('clients')
        .update(clientData)
        .eq('id', existingClient.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar cliente:', error);
        return res.status(500).json({
          success: false,
          message: 'Erro ao atualizar cliente',
          error: error.message
        });
      }

      result = data;

      console.log('✅ Cliente atualizado:', result.name);

      return res.json({
        success: true,
        message: 'Cliente atualizado com sucesso',
        data: result,
        action: 'updated'
      });
    } else {
      // Criar novo cliente
      clientData.created_at = new Date().toISOString();
      clientData.loyalty_points = 0;
      clientData.total_purchases = 0;

      const { data, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar cliente:', error);
        return res.status(500).json({
          success: false,
          message: 'Erro ao criar cliente',
          error: error.message
        });
      }

      result = data;

      console.log('✅ Cliente criado:', result.name);

      return res.status(201).json({
        success: true,
        message: 'Cliente criado com sucesso',
        data: result,
        action: 'created'
      });
    }
  } catch (error) {
    console.error('❌ Erro ao sincronizar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

module.exports = {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getClientStats,
  getClientPurchases,
  getClientPrescriptions,
  updateLoyaltyPoints,
  searchClients,
  syncClient
};
