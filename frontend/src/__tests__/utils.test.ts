/**
 * Testes de utilitários e funções auxiliares
 */

import {
  formatCurrency,
  formatDate,
  formatPhone,
  formatCPF,
  SALE_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  PRODUCT_CATEGORY_LABELS,
} from '../constants';

describe('Format Currency', () => {
  it('deve formatar valores positivos', () => {
    const result = formatCurrency(1500.5);
    expect(result).toContain('1.500,50');
  });

  it('deve formatar zero', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0,00');
  });

  it('deve formatar valores negativos', () => {
    const result = formatCurrency(-100);
    expect(result).toContain('100,00');
  });
});

describe('Format Date', () => {
  it('deve formatar data corretamente no padrão brasileiro', () => {
    // Usar data atual de 2025 com horário de Brasília
    const result = formatDate('2025-11-28T12:00:00-03:00');
    expect(result).toMatch(/28\/11\/2025/);
  });

  it('deve aceitar objeto Date', () => {
    const date = new Date(2025, 10, 28, 12, 0, 0); // 28/11/2025 12:00 (mês 0-indexed)
    const result = formatDate(date);
    expect(result).toBeDefined();
    expect(result).toContain('2025');
  });
});

describe('Format Phone', () => {
  it('deve formatar celular (11 dígitos)', () => {
    const result = formatPhone('11999998888');
    expect(result).toBe('(11) 99999-8888');
  });

  it('deve formatar fixo (10 dígitos)', () => {
    const result = formatPhone('1133334444');
    expect(result).toBe('(11) 3333-4444');
  });

  it('deve retornar original se formato inválido', () => {
    const result = formatPhone('123');
    expect(result).toBe('123');
  });
});

describe('Format CPF', () => {
  it('deve formatar CPF corretamente', () => {
    const result = formatCPF('12345678901');
    expect(result).toBe('123.456.789-01');
  });

  it('deve retornar original se formato inválido', () => {
    const result = formatCPF('123');
    expect(result).toBe('123');
  });
});

describe('Status Labels', () => {
  it('deve ter labels para status de venda', () => {
    expect(SALE_STATUS_LABELS.draft).toBe('Rascunho');
    expect(SALE_STATUS_LABELS.confirmed).toBe('Confirmada');
    expect(SALE_STATUS_LABELS.completed).toBe('Concluída');
    expect(SALE_STATUS_LABELS.cancelled).toBe('Cancelada');
  });

  it('deve ter labels para status de pagamento', () => {
    expect(PAYMENT_STATUS_LABELS.pending).toBe('Pendente');
    expect(PAYMENT_STATUS_LABELS.paid).toBe('Pago');
    expect(PAYMENT_STATUS_LABELS.partial).toBe('Parcial');
  });

  it('deve ter labels para categorias de produtos', () => {
    expect(PRODUCT_CATEGORY_LABELS.oculos_grau).toBe('Óculos de Grau');
    expect(PRODUCT_CATEGORY_LABELS.oculos_sol).toBe('Óculos de Sol');
    expect(PRODUCT_CATEGORY_LABELS.lentes).toBe('Lentes');
    expect(PRODUCT_CATEGORY_LABELS.acessorios).toBe('Acessórios');
  });
});
