const { supabase } = require('../config/supabase');

// Criar novo TSO
const createTSO = async (req, res) => {
  try {
    const {
      clientId,
      emissionDate,
      deliveryDate,
      deliveryTime,
      vendedor,
      prescription,
      frame,
      lens,
      totalValue,
      laboratory,
      notes
    } = req.body;

    // Validar campos obrigatórios
    if (!clientId || !emissionDate || !deliveryDate || !deliveryTime || !vendedor) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: cliente, data de emissão, data de entrega, hora de entrega e vendedor'
      });
    }

    // Gerar número do TSO usando sequência progressiva
    const { data: tsoNumberResult, error: tsoNumberError } = await supabase
      .rpc('get_next_tso_number');

    if (tsoNumberError) {
      console.error('Erro ao gerar número TSO:', tsoNumberError);
      return res.status(500).json({
        success: false,
        message: 'Erro ao gerar número do TSO',
        error: tsoNumberError.message
      });
    }

    const tsoNumber = tsoNumberResult;

    // Criar prescrição primeiro
    let prescriptionId = null;
    if (prescription) {
      const prescriptionData = {
        client_id: clientId,
        doctor_name: 'Dr. Óptico', // Valor padrão
        doctor_crm: '',
        prescription_date: emissionDate,
        right_eye: {
          sphere: prescription.longe?.rightEye?.sphere || '',
          cylinder: prescription.longe?.rightEye?.cylinder || '',
          axis: prescription.longe?.rightEye?.axis || ''
        },
        left_eye: {
          sphere: prescription.longe?.leftEye?.sphere || '',
          cylinder: prescription.longe?.leftEye?.cylinder || '',
          axis: prescription.longe?.leftEye?.axis || ''
        },
        right_eye_longe: prescription.longe?.rightEye || {},
        right_eye_perto: prescription.perto?.rightEye || {},
        left_eye_longe: prescription.longe?.leftEye || {},
        left_eye_perto: prescription.perto?.leftEye || {},
        addition: prescription.addition || null
      };

      const { data: prescriptionResult, error: prescriptionError } = await supabase
        .from('prescriptions')
        .insert(prescriptionData)
        .select('id')
        .single();

      if (prescriptionError) {
        console.error('Erro ao criar prescrição:', prescriptionError);
        return res.status(500).json({
          success: false,
          message: 'Erro ao criar prescrição',
          error: prescriptionError.message
        });
      }

      prescriptionId = prescriptionResult.id;
    }

    // Resolver usuário responsável
    let resolvedUserId = req.user?.id || null;
    if (!resolvedUserId) {
      const { data: fallbackUser, error: fallbackUserError } = await supabase
        .from('users')
        .select('id')
        .eq('is_active', true)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (fallbackUserError) {
        return res.status(400).json({
          success: false,
          message: 'Nenhum usuário autenticado. Crie/ative um usuário para associar ao TSO.'
        });
      }
      resolvedUserId = fallbackUser.id;
    }

    // Criar venda (TSO)
    const saleData = {
      client_id: clientId,
      user_id: resolvedUserId, // usuário responsável pela venda/TSO
      prescription_id: prescriptionId,
      sale_number: tsoNumber,
      tso_number: tsoNumber,
      emission_date: `${emissionDate} ${deliveryTime}`,
      delivery_time: deliveryTime,
      laboratory: laboratory || '',
      status: 'pending',
      subtotal: parseFloat(totalValue) || 0,
      total: parseFloat(totalValue) || 0,
      notes: notes || '',
      delivery_date: deliveryDate
    };

    const { data: saleResult, error: saleError } = await supabase
      .from('sales')
      .insert(saleData)
      .select('id')
      .single();

    if (saleError) {
      console.error('Erro ao criar venda:', saleError);
      return res.status(500).json({
        success: false,
        message: 'Erro ao criar venda',
        error: saleError.message
      });
    }

    // Garantir produtos genéricos para vincular itens (evita erro de FK)
    const ensureGenericProduct = async (sku, name) => {
      const { data: found, error: findErr } = await supabase
        .from('products')
        .select('id')
        .eq('sku', sku)
        .single();

      if (!findErr && found) return found.id;

      const { data: created, error: createErr } = await supabase
        .from('products')
        .insert({
          name,
          sku,
          category: 'servicos',
          price: 0,
          is_active: true
        })
        .select('id')
        .single();

      if (createErr) throw new Error(`Falha ao criar produto genérico ${sku}: ${createErr.message}`);
      return created.id;
    };

    let genericFrameProductId = null;
    let genericLensProductId = null;
    if (frame && frame.type) {
      genericFrameProductId = await ensureGenericProduct('GEN_FRAME', 'Armação - Serviço');
    }
    if (lens && lens.type) {
      genericLensProductId = await ensureGenericProduct('GEN_LENS', 'Lente - Serviço');
    }

    // Criar itens da venda (armação e lente)
    const saleItems = [];

    // Item da armação
    if (frame && frame.type) {
      const frameItem = {
        sale_id: saleResult.id,
        product_id: genericFrameProductId,
        quantity: 1,
        unit_price: parseFloat(frame.value) || 0,
        subtotal: parseFloat(frame.value) || 0,
        item_type: 'frame',
        frame_specifications: {
          type: frame.type,
          client_reference: frame.type
        },
        frame_client_reference: frame.type
      };
      saleItems.push(frameItem);
    }

    // Item da lente
    if (lens && lens.type) {
      const lensItem = {
        sale_id: saleResult.id,
        product_id: genericLensProductId,
        quantity: 1,
        unit_price: parseFloat(lens.value) || 0,
        subtotal: parseFloat(lens.value) || 0,
        item_type: 'lens',
        lens_specifications: {
          type: lens.type,
          material: lens.material,
          code: lens.code
        }
      };
      saleItems.push(lensItem);
    }

    // Inserir itens da venda
    if (saleItems.length > 0) {
      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) {
        console.error('Erro ao criar itens da venda:', itemsError);
        return res.status(500).json({
          success: false,
          message: 'Erro ao criar itens da venda',
          error: itemsError.message
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'TSO criado com sucesso',
      data: {
        id: saleResult.id,
        tsoNumber,
        prescriptionId
      }
    });

  } catch (error) {
    console.error('Erro ao criar TSO:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Listar TSOs
const getTSOs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('sales')
      .select(`
        id,
        tso_number,
        emission_date,
        delivery_time,
        laboratory,
        status,
        total,
        notes,
        clients!inner(
          id,
          name,
          cpf,
          address,
          neighborhood,
          city,
          state
        )
      `)
      .not('tso_number', 'is', null)
      .order('emission_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(`tso_number.ilike.%${search}%,clients.name.ilike.%${search}%,clients.cpf.ilike.%${search}%`);
    }

    const { data: sales, error } = await query;

    if (error) {
      console.error('Erro ao buscar TSOs:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar TSOs',
        error: error.message
      });
    }

    // Contar total
    const { count } = await supabase
      .from('sales')
      .select('*', { count: 'exact', head: true })
      .not('tso_number', 'is', null);

    res.json({
      success: true,
      data: {
        tsos: sales || [],
        total: count || 0,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Erro ao listar TSOs:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Buscar TSO por ID
const getTSOById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: sale, error } = await supabase
      .from('sales')
      .select(`
        *,
        clients!inner(*),
        prescriptions(*),
        sale_items(*)
      `)
      .eq('id', id)
      .not('tso_number', 'is', null)
      .single();

    if (error) {
      console.error('Erro ao buscar TSO:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar TSO',
        error: error.message
      });
    }

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'TSO não encontrado'
      });
    }

    res.json({
      success: true,
      data: sale
    });

  } catch (error) {
    console.error('Erro ao buscar TSO:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

module.exports = {
  createTSO,
  getTSOs,
  getTSOById
};
