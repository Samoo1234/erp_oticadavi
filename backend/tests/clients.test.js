/**
 * Testes de Clientes
 */

const request = require('supertest');

// Mock de dados de cliente
const mockClient = {
  id: 'test-uuid-123',
  name: 'João Silva',
  email: 'joao@test.com',
  phone: '11999999999',
  cpf: '12345678901',
  birthDate: '1990-01-15',
  gender: 'M',
  address: {
    street: 'Rua Teste',
    number: '123',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234567',
  },
  isActive: true,
  loyaltyPoints: 100,
  totalPurchases: 1500.00,
};

describe('Client Data Validation', () => {
  describe('CPF Validation', () => {
    const validateCPF = (cpf) => {
      if (!cpf) return false;
      const cleaned = cpf.replace(/\D/g, '');
      return cleaned.length === 11;
    };

    it('deve rejeitar CPF vazio', () => {
      expect(validateCPF('')).toBe(false);
    });

    it('deve rejeitar CPF com menos de 11 dígitos', () => {
      expect(validateCPF('1234567890')).toBe(false);
    });

    it('deve aceitar CPF com 11 dígitos', () => {
      expect(validateCPF('12345678901')).toBe(true);
    });

    it('deve aceitar CPF formatado', () => {
      expect(validateCPF('123.456.789-01')).toBe(true);
    });
  });

  describe('Phone Validation', () => {
    const validatePhone = (phone) => {
      if (!phone) return false;
      const cleaned = phone.replace(/\D/g, '');
      return cleaned.length >= 10 && cleaned.length <= 11;
    };

    it('deve rejeitar telefone vazio', () => {
      expect(validatePhone('')).toBe(false);
    });

    it('deve rejeitar telefone muito curto', () => {
      expect(validatePhone('123456789')).toBe(false);
    });

    it('deve aceitar telefone fixo (10 dígitos)', () => {
      expect(validatePhone('1133334444')).toBe(true);
    });

    it('deve aceitar celular (11 dígitos)', () => {
      expect(validatePhone('11999999999')).toBe(true);
    });

    it('deve aceitar telefone formatado', () => {
      expect(validatePhone('(11) 99999-9999')).toBe(true);
    });
  });

  describe('Address Validation', () => {
    const validateAddress = (address) => {
      if (!address) return true; // Endereço é opcional
      if (address.zipCode && address.zipCode.replace(/\D/g, '').length !== 8) {
        return false;
      }
      return true;
    };

    it('deve aceitar endereço nulo', () => {
      expect(validateAddress(null)).toBe(true);
    });

    it('deve rejeitar CEP inválido', () => {
      expect(validateAddress({ zipCode: '1234' })).toBe(false);
    });

    it('deve aceitar CEP válido', () => {
      expect(validateAddress({ zipCode: '01234567' })).toBe(true);
    });

    it('deve aceitar CEP formatado', () => {
      expect(validateAddress({ zipCode: '01234-567' })).toBe(true);
    });
  });
});

describe('Client Data Mapping', () => {
  const mapClientFromCentral = (clienteCentral) => {
    return {
      id: clienteCentral.id,
      name: clienteCentral.nome,
      phone: clienteCentral.telefone,
      cpf: clienteCentral.cpf,
      email: clienteCentral.email,
      birthDate: clienteCentral.data_nascimento,
      gender: clienteCentral.sexo,
      isActive: clienteCentral.active,
    };
  };

  it('deve mapear cliente do banco central corretamente', () => {
    const clienteCentral = {
      id: 'uuid-123',
      nome: 'Maria Santos',
      telefone: '11988888888',
      cpf: '98765432100',
      email: 'maria@test.com',
      data_nascimento: '1985-05-20',
      sexo: 'F',
      active: true,
    };

    const mapped = mapClientFromCentral(clienteCentral);

    expect(mapped.id).toBe('uuid-123');
    expect(mapped.name).toBe('Maria Santos');
    expect(mapped.phone).toBe('11988888888');
    expect(mapped.cpf).toBe('98765432100');
    expect(mapped.email).toBe('maria@test.com');
    expect(mapped.birthDate).toBe('1985-05-20');
    expect(mapped.gender).toBe('F');
    expect(mapped.isActive).toBe(true);
  });
});

describe('Client Search', () => {
  const mockClients = [
    { id: '1', name: 'João Silva', phone: '11999999999', cpf: '11111111111' },
    { id: '2', name: 'Maria Santos', phone: '11888888888', cpf: '22222222222' },
    { id: '3', name: 'José João', phone: '11777777777', cpf: '33333333333' },
  ];

  const searchClients = (term) => {
    if (!term) return mockClients;
    const lowerTerm = term.toLowerCase();
    return mockClients.filter(
      (c) =>
        c.name.toLowerCase().includes(lowerTerm) ||
        c.phone.includes(term) ||
        c.cpf.includes(term)
    );
  };

  it('deve retornar todos os clientes sem termo de busca', () => {
    expect(searchClients('').length).toBe(3);
  });

  it('deve buscar por nome', () => {
    const result = searchClients('João');
    expect(result.length).toBe(2);
  });

  it('deve buscar por telefone', () => {
    const result = searchClients('999999999');
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('João Silva');
  });

  it('deve buscar por CPF', () => {
    const result = searchClients('22222222222');
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Maria Santos');
  });

  it('deve retornar vazio para termo não encontrado', () => {
    const result = searchClients('xyz');
    expect(result.length).toBe(0);
  });
});
