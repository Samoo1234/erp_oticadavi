/**
 * Setup de testes - Jest
 */

// Timeout padrão para testes
jest.setTimeout(10000);

// Mock de variáveis de ambiente
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';

// Suprimir logs durante testes
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  // Manter error para debug de falhas
  error: console.error,
};

// Cleanup após todos os testes
afterAll(async () => {
  // Fechar conexões se necessário
});

// Cleanup após cada teste
afterEach(() => {
  // Limpar mocks
  jest.clearAllMocks();
});
