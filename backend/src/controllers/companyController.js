const { supabase } = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     Company:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         document:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         phone2:
 *           type: string
 *         address:
 *           type: string
 *         neighborhood:
 *           type: string
 *         city:
 *           type: string
 *         state:
 *           type: string
 *         zipCode:
 *           type: string
 */

/**
 * @swagger
 * /api/v1/company:
 *   get:
 *     summary: Obter dados da empresa
 *     tags: [Empresa]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados da empresa
 */
exports.getCompany = async (req, res) => {
  try {
    // Buscar empresa no Supabase
    const { data: company, error } = await supabase
      .from('companies')
      .select('*')
      .eq('is_active', true)
      .single();

    // Se não existe, cria com dados padrão
    if (error || !company) {
      const { data: newCompany, error: insertError } = await supabase
        .from('companies')
        .insert([{
          name: 'Ótica Davi',
          phone: '',
          address: '',
          neighborhood: 'Centro',
          city: 'Mantena',
          state: 'MG',
          zip_code: '35290-000'
        }])
        .select();

      if (insertError) {
        return res.status(500).json({ error: insertError.message });
      }
      return res.json(newCompany[0]);
    }

    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @swagger
 * /api/v1/company:
 *   put:
 *     summary: Atualizar dados da empresa
 *     tags: [Empresa]
 *     security:
 *       - bearerAuth: []
 */
exports.updateCompany = async (req, res) => {
  try {
    const {
      name, document, email, phone, phone2,
      address, neighborhood, city, state, zip_code, logo
    } = req.body;

    // Buscar empresa existente
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('*')
      .eq('is_active', true)
      .single();

    if (!existingCompany) {
      // Criar empresa se não existe
      const { data: newCompany, error: insertError } = await supabase
        .from('companies')
        .insert([{
          name: name || 'Ótica Davi',
          document,
          email,
          phone,
          phone2,
          address,
          neighborhood,
          city,
          state,
          zip_code,
          logo
        }])
        .select();

      if (insertError) {
        return res.status(500).json({ error: insertError.message });
      }
      return res.json(newCompany[0]);
    } else {
      // Atualizar empresa existente
      const { data: updatedCompany, error: updateError } = await supabase
        .from('companies')
        .update({
          name, document, email, phone, phone2,
          address, neighborhood, city, state, zip_code, logo
        })
        .eq('id', existingCompany.id)
        .select();

      if (updateError) {
        return res.status(500).json({ error: updateError.message });
      }
      return res.json(updatedCompany[0]);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


