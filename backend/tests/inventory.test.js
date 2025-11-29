/**
 * Testes de Inventário/Estoque
 */

describe('Inventory Movement Validation', () => {
  describe('Movement Types', () => {
    const validTypes = ['in', 'out', 'adjustment', 'transfer', 'return'];

    const validateMovementType = (type) => {
      return validTypes.includes(type);
    };

    it('deve aceitar tipo in', () => {
      expect(validateMovementType('in')).toBe(true);
    });

    it('deve aceitar tipo out', () => {
      expect(validateMovementType('out')).toBe(true);
    });

    it('deve aceitar tipo adjustment', () => {
      expect(validateMovementType('adjustment')).toBe(true);
    });

    it('deve aceitar tipo transfer', () => {
      expect(validateMovementType('transfer')).toBe(true);
    });

    it('deve aceitar tipo return', () => {
      expect(validateMovementType('return')).toBe(true);
    });

    it('deve rejeitar tipo inválido', () => {
      expect(validateMovementType('invalid')).toBe(false);
    });
  });

  describe('Quantity Validation', () => {
    const validateQuantity = (quantity, movementType, currentStock) => {
      if (quantity <= 0) return false;
      if (!Number.isInteger(quantity)) return false;
      
      // Para saída, verificar se tem estoque suficiente
      if (movementType === 'out' && quantity > currentStock) {
        return false;
      }
      
      return true;
    };

    it('deve rejeitar quantidade zero', () => {
      expect(validateQuantity(0, 'in', 10)).toBe(false);
    });

    it('deve rejeitar quantidade negativa', () => {
      expect(validateQuantity(-5, 'in', 10)).toBe(false);
    });

    it('deve rejeitar quantidade decimal', () => {
      expect(validateQuantity(5.5, 'in', 10)).toBe(false);
    });

    it('deve aceitar entrada válida', () => {
      expect(validateQuantity(10, 'in', 5)).toBe(true);
    });

    it('deve rejeitar saída maior que estoque', () => {
      expect(validateQuantity(15, 'out', 10)).toBe(false);
    });

    it('deve aceitar saída válida', () => {
      expect(validateQuantity(5, 'out', 10)).toBe(true);
    });
  });
});

describe('Stock Calculations', () => {
  describe('Movement Application', () => {
    const applyMovement = (currentStock, movementType, quantity) => {
      switch (movementType) {
        case 'in':
        case 'return':
          return currentStock + quantity;
        case 'out':
          return Math.max(0, currentStock - quantity);
        case 'adjustment':
          return quantity; // Ajuste define o valor final
        default:
          return currentStock;
      }
    };

    it('deve adicionar estoque na entrada', () => {
      expect(applyMovement(10, 'in', 5)).toBe(15);
    });

    it('deve remover estoque na saída', () => {
      expect(applyMovement(10, 'out', 3)).toBe(7);
    });

    it('deve definir estoque no ajuste', () => {
      expect(applyMovement(10, 'adjustment', 25)).toBe(25);
    });

    it('deve adicionar estoque na devolução', () => {
      expect(applyMovement(10, 'return', 2)).toBe(12);
    });

    it('não deve ter estoque negativo', () => {
      expect(applyMovement(5, 'out', 10)).toBe(0);
    });
  });

  describe('Average Cost Calculation', () => {
    const calculateAverageCost = (currentStock, currentAvgCost, newQuantity, newUnitCost) => {
      if (newQuantity <= 0) return currentAvgCost;
      
      const totalCurrentValue = currentStock * currentAvgCost;
      const totalNewValue = newQuantity * newUnitCost;
      const totalStock = currentStock + newQuantity;
      
      if (totalStock === 0) return 0;
      
      return (totalCurrentValue + totalNewValue) / totalStock;
    };

    it('deve calcular custo médio corretamente', () => {
      // 10 unidades a R$100 + 5 unidades a R$80 = R$1000 + R$400 = R$1400 / 15 = R$93.33
      const avgCost = calculateAverageCost(10, 100, 5, 80);
      expect(avgCost).toBeCloseTo(93.33, 1);
    });

    it('deve manter custo médio se quantidade nova for zero', () => {
      expect(calculateAverageCost(10, 100, 0, 80)).toBe(100);
    });

    it('deve calcular custo médio para estoque inicial zerado', () => {
      expect(calculateAverageCost(0, 0, 10, 50)).toBe(50);
    });
  });

  describe('Stock Alerts', () => {
    const getStockStatus = (currentStock, minStock, maxStock) => {
      if (currentStock <= 0) return 'out_of_stock';
      if (currentStock <= minStock) return 'low_stock';
      if (maxStock && currentStock >= maxStock) return 'over_stock';
      return 'normal';
    };

    it('deve identificar fora de estoque', () => {
      expect(getStockStatus(0, 5, 50)).toBe('out_of_stock');
    });

    it('deve identificar estoque baixo', () => {
      expect(getStockStatus(3, 5, 50)).toBe('low_stock');
    });

    it('deve identificar estoque igual ao mínimo como baixo', () => {
      expect(getStockStatus(5, 5, 50)).toBe('low_stock');
    });

    it('deve identificar estoque normal', () => {
      expect(getStockStatus(20, 5, 50)).toBe('normal');
    });

    it('deve identificar excesso de estoque', () => {
      expect(getStockStatus(55, 5, 50)).toBe('over_stock');
    });
  });
});

describe('Inventory Reports', () => {
  const mockInventory = [
    { productId: '1', location: 'Loja Principal', currentStock: 10, costPrice: 100, minStock: 5 },
    { productId: '2', location: 'Loja Principal', currentStock: 3, costPrice: 80, minStock: 5 },
    { productId: '3', location: 'Depósito', currentStock: 25, costPrice: 50, minStock: 10 },
    { productId: '4', location: 'Loja Principal', currentStock: 0, costPrice: 120, minStock: 2 },
  ];

  describe('Total Stock Value', () => {
    const calculateTotalValue = (inventory) => {
      return inventory.reduce((sum, item) => {
        return sum + (item.currentStock * item.costPrice);
      }, 0);
    };

    it('deve calcular valor total do estoque', () => {
      // 10*100 + 3*80 + 25*50 + 0*120 = 1000 + 240 + 1250 + 0 = 2490
      expect(calculateTotalValue(mockInventory)).toBe(2490);
    });
  });

  describe('Low Stock Count', () => {
    const countLowStock = (inventory) => {
      return inventory.filter(item => item.currentStock <= item.minStock).length;
    };

    it('deve contar produtos com estoque baixo', () => {
      expect(countLowStock(mockInventory)).toBe(2); // productId 2 e 4
    });
  });

  describe('Stock by Location', () => {
    const stockByLocation = (inventory) => {
      return inventory.reduce((acc, item) => {
        if (!acc[item.location]) {
          acc[item.location] = { count: 0, totalStock: 0, value: 0 };
        }
        acc[item.location].count++;
        acc[item.location].totalStock += item.currentStock;
        acc[item.location].value += item.currentStock * item.costPrice;
        return acc;
      }, {});
    };

    it('deve agrupar estoque por localização', () => {
      const result = stockByLocation(mockInventory);
      
      expect(result['Loja Principal'].count).toBe(3);
      expect(result['Loja Principal'].totalStock).toBe(13);
      expect(result['Depósito'].count).toBe(1);
      expect(result['Depósito'].totalStock).toBe(25);
    });
  });
});
