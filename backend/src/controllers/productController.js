const { supabase } = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - sku
 *         - category
 *         - price
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         sku:
 *           type: string
 *         category:
 *           type: string
 *           enum: [oculos_grau, oculos_sol, lentes, acessorios, servicos]
 *         subcategory:
 *           type: string
 *         brand:
 *           type: string
 *         model:
 *           type: string
 *         color:
 *           type: string
 *         material:
 *           type: string
 *         gender:
 *           type: string
 *           enum: [M, F, U, C]
 *         price:
 *           type: number
 *         costPrice:
 *           type: number
 *         profitMargin:
 *           type: number
 *         weight:
 *           type: number
 *         dimensions:
 *           type: object
 *         specifications:
 *           type: object
 *         images:
 *           type: array
 *           items:
 *             type: string
 *         isActive:
 *           type: boolean
 *         isPrescriptionRequired:
 *           type: boolean
 *         minStock:
 *           type: integer
 *         maxStock:
 *           type: integer
 *         supplierId:
 *           type: string
 *           format: uuid
 *         tags:
 *           type: array
 *           items:
 *             type: string
 */

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Listar produtos
 *     tags: [Produtos]
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
 *         description: Buscar por nome, SKU ou marca
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [oculos_grau, oculos_sol, lentes, acessorios, servicos]
 *         description: Filtrar por categoria
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *         description: Filtrar por marca
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtrar por status ativo
 *     responses:
 *       200:
 *         description: Lista de produtos
 */
const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, brand, isActive } = req.query;
    const from = (parseInt(page) - 1) * parseInt(limit);
    const to = from + parseInt(limit) - 1;

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,brand.ilike.%${search}%,model.ilike.%${search}%`);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (brand) {
      query = query.eq('brand', brand);
    }
    if (isActive !== undefined && isActive !== '') {
      const active = isActive === 'true' || isActive === true;
      query = query.eq('is_active', active);
    }

    const { data, error, count } = await query;

    if (error) {
      return res.status(500).json({ success: false, message: 'Erro ao listar produtos', error: error.message });
    }

    const products = (data || []).map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      sku: p.sku,
      category: p.category,
      subcategory: p.subcategory,
      brand: p.brand,
      model: p.model,
      color: p.color,
      material: p.material,
      gender: p.gender,
      price: Number(p.price || 0),
      costPrice: Number(p.cost_price || 0),
      profitMargin: Number(p.profit_margin || 0),
      dimensions: p.dimensions,
      specifications: p.specifications,
      images: p.images,
      isActive: p.is_active,
      isPrescriptionRequired: p.is_prescription_required,
      minStock: p.min_stock,
      maxStock: p.max_stock,
      tags: p.tags,
      createdAt: p.created_at,
      updatedAt: p.updated_at
    }));

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          total: count || products.length,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil((count || products.length) / parseInt(limit))
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
 * /api/v1/products/{id}:
 *   get:
 *     summary: Obter produto por ID
 *     tags: [Produtos]
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
 *         description: Dados do produto
 *       404:
 *         description: Produto não encontrado
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }

    const product = {
      id: data.id,
      name: data.name,
      description: data.description,
      sku: data.sku,
      category: data.category,
      subcategory: data.subcategory,
      brand: data.brand,
      model: data.model,
      color: data.color,
      material: data.material,
      gender: data.gender,
      price: Number(data.price || 0),
      costPrice: Number(data.cost_price || 0),
      profitMargin: Number(data.profit_margin || 0),
      dimensions: data.dimensions,
      specifications: data.specifications,
      images: data.images,
      isActive: data.is_active,
      isPrescriptionRequired: data.is_prescription_required,
      minStock: data.min_stock,
      maxStock: data.max_stock,
      tags: data.tags,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    res.json({ success: true, data: product });
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
 * /api/v1/products:
 *   post:
 *     summary: Criar novo produto
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
const createProduct = async (req, res) => {
  try {
    const productData = req.body;

    // Verificar SKU existente
    const { data: exists } = await supabase
      .from('products')
      .select('id')
      .eq('sku', productData.sku)
      .single();
    if (exists) {
      return res.status(400).json({ success: false, message: 'SKU já cadastrado' });
    }

    // Calcular margem
    let profitMargin = productData.profitMargin;
    if (productData.costPrice && productData.price && profitMargin === undefined) {
      profitMargin = Number(((productData.price - productData.costPrice) / productData.price) * 100).toFixed(2);
    }

    // Inserir produto (snake_case)
    const insertProduct = {
      name: productData.name,
      description: productData.description || null,
      sku: productData.sku,
      category: productData.category,
      subcategory: productData.subcategory || null,
      brand: productData.brand || null,
      model: productData.model || null,
      color: productData.color || null,
      material: productData.material || null,
      gender: productData.gender || null,
      price: productData.price,
      cost_price: productData.costPrice || 0,
      profit_margin: profitMargin || 0,
      specifications: productData.specifications || null,
      images: productData.images || [],
      is_active: productData.isActive !== undefined ? productData.isActive : true,
      is_prescription_required: productData.isPrescriptionRequired || false,
      min_stock: productData.minStock || 0,
      max_stock: productData.maxStock || null,
      tags: productData.tags || []
    };

    const { data, error } = await supabase
      .from('products')
      .insert([insertProduct])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ success: false, message: 'Erro ao criar produto', error: error.message });
    }

    // Estoque inicial
    if (productData.initialStock) {
      await supabase.from('inventory').insert([
        {
          product_id: data.id,
          location: 'Loja Principal',
          current_stock: productData.initialStock,
          min_stock: productData.minStock || 0,
          max_stock: productData.maxStock || null,
          cost_price: productData.costPrice || null
        }
      ]);
    }

    res.status(201).json({ success: true, message: 'Produto criado com sucesso', data });
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
 * /api/v1/products/{id}:
 *   put:
 *     summary: Atualizar produto
 *     tags: [Produtos]
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
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 *       404:
 *         description: Produto não encontrado
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;

    const { data: current, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    if (fetchError || !current) {
      return res.status(404).json({ success: false, message: 'Produto não encontrado' });
    }

    if (update.sku && update.sku !== current.sku) {
      const { data: exists } = await supabase
        .from('products')
        .select('id')
        .eq('sku', update.sku)
        .neq('id', id)
        .single();
      if (exists) {
        return res.status(400).json({ success: false, message: 'SKU já cadastrado em outro produto' });
      }
    }

    const supUpdate = {
      name: update.name ?? current.name,
      description: update.description ?? current.description,
      sku: update.sku ?? current.sku,
      category: update.category ?? current.category,
      subcategory: update.subcategory ?? current.subcategory,
      brand: update.brand ?? current.brand,
      model: update.model ?? current.model,
      color: update.color ?? current.color,
      material: update.material ?? current.material,
      gender: update.gender ?? current.gender,
      price: update.price ?? current.price,
      cost_price: update.costPrice ?? current.cost_price,
      profit_margin: update.profitMargin ?? current.profit_margin,
      specifications: update.specifications ?? current.specifications,
      images: update.images ?? current.images,
      is_active: update.isActive ?? current.is_active,
      is_prescription_required: update.isPrescriptionRequired ?? current.is_prescription_required,
      min_stock: update.minStock ?? current.min_stock,
      max_stock: update.maxStock ?? current.max_stock,
      tags: update.tags ?? current.tags,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('products')
      .update(supUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ success: false, message: 'Erro ao atualizar produto', error: error.message });
    }

    res.json({ success: true, message: 'Produto atualizado com sucesso', data });
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
 * /api/v1/products/{id}:
 *   delete:
 *     summary: Excluir produto
 *     tags: [Produtos]
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
 *         description: Produto excluído com sucesso
 *       404:
 *         description: Produto não encontrado
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: movements } = await supabase
      .from('inventory_movements')
      .select('id')
      .eq('product_id', id)
      .limit(1);

    if (movements && movements.length > 0) {
      await supabase
        .from('products')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id);
      return res.json({ success: true, message: 'Produto desativado com sucesso (possui histórico de movimentações)' });
    }

    await supabase.from('products').delete().eq('id', id);
    res.json({ success: true, message: 'Produto excluído com sucesso' });
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
 * /api/v1/products/categories:
 *   get:
 *     summary: Obter categorias e subcategorias
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorias
 */
const getCategories = async (req, res) => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('category, subcategory, is_active');
    if (error) {
      return res.status(500).json({ success: false, message: 'Erro ao obter categorias', error: error.message });
    }

    const categoriesMap = new Map();
    const subcategoriesList = [];
    (products || []).forEach((p) => {
      if (p.is_active) {
        categoriesMap.set(p.category, (categoriesMap.get(p.category) || 0) + 1);
        if (p.subcategory) {
          subcategoriesList.push({ category: p.category, subcategory: p.subcategory });
        }
      }
    });

    const categories = Array.from(categoriesMap.entries()).map(([category, count]) => ({ category, count }));
    const subcategories = subcategoriesList;

    res.json({ success: true, data: { categories, subcategories } });
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
 * /api/v1/products/brands:
 *   get:
 *     summary: Obter marcas
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de marcas
 */
const getBrands = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('brand, is_active');
    if (error) {
      return res.status(500).json({ success: false, message: 'Erro ao obter marcas', error: error.message });
    }
    const map = new Map();
    (data || []).forEach((p) => {
      if (p.is_active && p.brand) map.set(p.brand, (map.get(p.brand) || 0) + 1);
    });
    const brands = Array.from(map.entries()).map(([brand, count]) => ({ brand, count }));
    res.json({ success: true, data: brands });
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
 * /api/v1/products/low-stock:
 *   get:
 *     summary: Obter produtos com estoque baixo
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de produtos com estoque baixo
 */
const getLowStockProducts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('product_id, current_stock, min_stock')
      .lte('current_stock', supabase.rpc ? undefined : 999999); // placeholder
    if (error) {
      return res.status(500).json({ success: false, message: 'Erro ao obter estoque baixo', error: error.message });
    }
    res.json({ success: true, data: data || [] });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getBrands,
  getLowStockProducts
};
