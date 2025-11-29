/**
 * Testes de Produtos
 */

describe('Product Validation', () => {
  describe('SKU Validation', () => {
    const validateSKU = (sku) => {
      if (!sku) return false;
      if (sku.length < 3) return false;
      return /^[A-Z0-9\-]+$/i.test(sku);
    };

    it('deve rejeitar SKU vazio', () => {
      expect(validateSKU('')).toBe(false);
    });

    it('deve rejeitar SKU muito curto', () => {
      expect(validateSKU('AB')).toBe(false);
    });

    it('deve aceitar SKU válido', () => {
      expect(validateSKU('RB-AV-001')).toBe(true);
    });

    it('deve aceitar SKU com números', () => {
      expect(validateSKU('PROD001')).toBe(true);
    });
  });

  describe('Price Validation', () => {
    const validatePrice = (price) => {
      if (price === null || price === undefined) return false;
      if (typeof price !== 'number') return false;
      if (price < 0) return false;
      return true;
    };

    it('deve rejeitar preço nulo', () => {
      expect(validatePrice(null)).toBe(false);
    });

    it('deve rejeitar preço negativo', () => {
      expect(validatePrice(-10)).toBe(false);
    });

    it('deve aceitar preço zero', () => {
      expect(validatePrice(0)).toBe(true);
    });

    it('deve aceitar preço positivo', () => {
      expect(validatePrice(150.99)).toBe(true);
    });
  });

  describe('Category Validation', () => {
    const validCategories = ['oculos_grau', 'oculos_sol', 'lentes', 'acessorios', 'servicos'];

    const validateCategory = (category) => {
      return validCategories.includes(category);
    };

    it('deve rejeitar categoria inválida', () => {
      expect(validateCategory('invalido')).toBe(false);
    });

    it('deve aceitar oculos_grau', () => {
      expect(validateCategory('oculos_grau')).toBe(true);
    });

    it('deve aceitar oculos_sol', () => {
      expect(validateCategory('oculos_sol')).toBe(true);
    });

    it('deve aceitar lentes', () => {
      expect(validateCategory('lentes')).toBe(true);
    });

    it('deve aceitar acessorios', () => {
      expect(validateCategory('acessorios')).toBe(true);
    });

    it('deve aceitar servicos', () => {
      expect(validateCategory('servicos')).toBe(true);
    });
  });
});

describe('Product Calculations', () => {
  describe('Profit Margin', () => {
    const calculateProfitMargin = (price, costPrice) => {
      if (!price || !costPrice || costPrice >= price) return 0;
      return ((price - costPrice) / price) * 100;
    };

    it('deve calcular margem de lucro corretamente', () => {
      const margin = calculateProfitMargin(100, 60);
      expect(margin).toBe(40);
    });

    it('deve retornar 0 para custo maior que preço', () => {
      const margin = calculateProfitMargin(100, 120);
      expect(margin).toBe(0);
    });

    it('deve retornar 0 para custo igual ao preço', () => {
      const margin = calculateProfitMargin(100, 100);
      expect(margin).toBe(0);
    });

    it('deve retornar 0 para valores inválidos', () => {
      expect(calculateProfitMargin(0, 0)).toBe(0);
      expect(calculateProfitMargin(null, 50)).toBe(0);
    });
  });

  describe('Stock Alerts', () => {
    const isLowStock = (currentStock, minStock) => {
      return currentStock <= minStock;
    };

    it('deve identificar estoque baixo', () => {
      expect(isLowStock(5, 10)).toBe(true);
    });

    it('deve identificar estoque igual ao mínimo como baixo', () => {
      expect(isLowStock(10, 10)).toBe(true);
    });

    it('deve identificar estoque normal', () => {
      expect(isLowStock(20, 10)).toBe(false);
    });
  });
});

describe('Product Filtering', () => {
  const mockProducts = [
    { id: '1', name: 'Ray-Ban Aviator', category: 'oculos_sol', brand: 'Ray-Ban', price: 450, isActive: true, currentStock: 12 },
    { id: '2', name: 'Oakley Holbrook', category: 'oculos_sol', brand: 'Oakley', price: 380, isActive: true, currentStock: 2 },
    { id: '3', name: 'Essilor Progressive', category: 'lentes', brand: 'Essilor', price: 320, isActive: true, currentStock: 8 },
    { id: '4', name: 'Estojo Simples', category: 'acessorios', brand: null, price: 25, isActive: false, currentStock: 45 },
  ];

  const filterProducts = (products, filters) => {
    return products.filter(p => {
      if (filters.category && p.category !== filters.category) return false;
      if (filters.brand && p.brand !== filters.brand) return false;
      if (filters.isActive !== undefined && p.isActive !== filters.isActive) return false;
      if (filters.lowStock && p.currentStock > 5) return false;
      if (filters.search) {
        const search = filters.search.toLowerCase();
        if (!p.name.toLowerCase().includes(search) && 
            (!p.brand || !p.brand.toLowerCase().includes(search))) {
          return false;
        }
      }
      return true;
    });
  };

  it('deve filtrar por categoria', () => {
    const result = filterProducts(mockProducts, { category: 'oculos_sol' });
    expect(result.length).toBe(2);
  });

  it('deve filtrar por marca', () => {
    const result = filterProducts(mockProducts, { brand: 'Ray-Ban' });
    expect(result.length).toBe(1);
  });

  it('deve filtrar por status ativo', () => {
    const result = filterProducts(mockProducts, { isActive: true });
    expect(result.length).toBe(3);
  });

  it('deve filtrar por estoque baixo', () => {
    const result = filterProducts(mockProducts, { lowStock: true });
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Oakley Holbrook');
  });

  it('deve filtrar por busca de texto', () => {
    const result = filterProducts(mockProducts, { search: 'ray' });
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Ray-Ban Aviator');
  });

  it('deve combinar múltiplos filtros', () => {
    const result = filterProducts(mockProducts, { 
      category: 'oculos_sol', 
      isActive: true 
    });
    expect(result.length).toBe(2);
  });
});
