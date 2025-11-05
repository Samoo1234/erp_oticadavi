const bcrypt = require('bcryptjs');
const { supabase } = require('../config/database');

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Listar usuários
 *     tags: [Usuários]
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
 *         description: Buscar por nome ou email
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, manager, seller, optician]
 *         description: Filtrar por role
 *     responses:
 *       200:
 *         description: Lista de usuários
 */
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role } = req.query;

    const from = (parseInt(page) - 1) * parseInt(limit);
    const to = from + parseInt(limit) - 1;

    let query = supabase
      .from('users')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    // Filtro de busca
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Filtro de role
    if (role) {
      query = query.eq('role', role);
    }

    const { data, error, count } = await query;

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao listar usuários',
        error: error.message
      });
    }

    // Converter snake_case -> camelCase e remover senhas
    const users = (data || []).map((u) => {
      const { password, ...userWithoutPassword } = u;
      return {
        id: userWithoutPassword.id,
        name: userWithoutPassword.name,
        email: userWithoutPassword.email,
        role: userWithoutPassword.role,
        phone: userWithoutPassword.phone,
        isActive: userWithoutPassword.is_active,
        lastLogin: userWithoutPassword.last_login,
        createdAt: userWithoutPassword.created_at,
        updatedAt: userWithoutPassword.updated_at
      };
    });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total: count || users.length,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil((count || users.length) / parseInt(limit))
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
 * /api/v1/users/{id}:
 *   get:
 *     summary: Obter usuário por ID
 *     tags: [Usuários]
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
 *         description: Dados do usuário
 *       404:
 *         description: Usuário não encontrado
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Remover senha e converter para camelCase
    const { password, ...userWithoutPassword } = data;
    const user = {
      id: userWithoutPassword.id,
      name: userWithoutPassword.name,
      email: userWithoutPassword.email,
      role: userWithoutPassword.role,
      phone: userWithoutPassword.phone,
      isActive: userWithoutPassword.is_active,
      lastLogin: userWithoutPassword.last_login,
      createdAt: userWithoutPassword.created_at,
      updatedAt: userWithoutPassword.updated_at
    };

    res.json({
      success: true,
      data: user
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
 * /api/v1/users:
 *   post:
 *     summary: Criar novo usuário
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, manager, seller, optician]
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
const createUser = async (req, res) => {
  try {
    const userData = req.body;

    // Validar campos obrigatórios
    if (!userData.name || !userData.email || !userData.password) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email e senha são obrigatórios'
      });
    }

    // Verificar se email já existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', userData.email)
      .single();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email já cadastrado'
      });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    // Preparar dados para inserção (snake_case)
    const insertData = {
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: userData.role || 'seller',
      phone: userData.phone || null,
      is_active: userData.isActive !== undefined ? userData.isActive : true
    };

    const { data, error } = await supabase
      .from('users')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Erro ao criar usuário',
        error: error.message
      });
    }

    // Remover senha da resposta e converter para camelCase
    const { password, ...userWithoutPassword } = data;
    const user = {
      id: userWithoutPassword.id,
      name: userWithoutPassword.name,
      email: userWithoutPassword.email,
      role: userWithoutPassword.role,
      phone: userWithoutPassword.phone,
      isActive: userWithoutPassword.is_active,
      lastLogin: userWithoutPassword.last_login,
      createdAt: userWithoutPassword.created_at,
      updatedAt: userWithoutPassword.updated_at
    };

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: user
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
 * /api/v1/users/{id}:
 *   put:
 *     summary: Atualizar usuário
 *     tags: [Usuários]
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
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, manager, seller, optician]
 *               phone:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       404:
 *         description: Usuário não encontrado
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Verificar se usuário existe
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar se email já existe em outro usuário
    if (updateData.email && updateData.email !== existingUser.email) {
      const { data: emailExists } = await supabase
        .from('users')
        .select('id')
        .eq('email', updateData.email)
        .neq('id', id)
        .single();

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email já cadastrado em outro usuário'
        });
      }
    }

    // Preparar dados para atualização (snake_case)
    const supabaseUpdateData = {};

    if (updateData.name !== undefined) {
      supabaseUpdateData.name = updateData.name;
    }
    if (updateData.email !== undefined) {
      supabaseUpdateData.email = updateData.email;
    }
    if (updateData.role !== undefined) {
      supabaseUpdateData.role = updateData.role;
    }
    if (updateData.phone !== undefined) {
      supabaseUpdateData.phone = updateData.phone || null;
    }
    if (updateData.isActive !== undefined) {
      supabaseUpdateData.is_active = updateData.isActive;
    }
    if (updateData.password !== undefined && updateData.password !== '') {
      // Hash da nova senha
      supabaseUpdateData.password = await bcrypt.hash(updateData.password, 12);
    }

    supabaseUpdateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('users')
      .update(supabaseUpdateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Erro ao atualizar usuário',
        error: error.message
      });
    }

    // Remover senha da resposta e converter para camelCase
    const { password, ...userWithoutPassword } = data;
    const user = {
      id: userWithoutPassword.id,
      name: userWithoutPassword.name,
      email: userWithoutPassword.email,
      role: userWithoutPassword.role,
      phone: userWithoutPassword.phone,
      isActive: userWithoutPassword.is_active,
      lastLogin: userWithoutPassword.last_login,
      createdAt: userWithoutPassword.created_at,
      updatedAt: userWithoutPassword.updated_at
    };

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: user
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
 * /api/v1/users/{id}:
 *   delete:
 *     summary: Excluir usuário
 *     tags: [Usuários]
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
 *         description: Usuário excluído com sucesso
 *       404:
 *         description: Usuário não encontrado
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se usuário existe
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Não permitir exclusão do próprio usuário
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível excluir seu próprio usuário'
      });
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Erro ao excluir usuário',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Usuário excluído com sucesso'
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
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
