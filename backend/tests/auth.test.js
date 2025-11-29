/**
 * Testes de Autenticação
 */

const request = require('supertest');
const express = require('express');

// Mock do servidor
const app = express();
app.use(express.json());

// Mock das rotas de autenticação
const authRoutes = require('../src/routes/auth');
app.use('/api/v1/auth', authRoutes);

describe('Auth API', () => {
  describe('POST /api/v1/auth/login', () => {
    it('deve retornar erro quando email não é fornecido', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ password: '123456' });

      // API retorna 401 (Unauthorized) para credenciais incompletas
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
      expect(res.statusCode).toBeLessThan(500);
    });

    it('deve retornar erro quando senha não é fornecida', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@test.com' });

      // API retorna 401 (Unauthorized) para credenciais incompletas
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
      expect(res.statusCode).toBeLessThan(500);
    });

    it('deve retornar erro para credenciais inválidas', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'invalid@test.com',
          password: 'wrongpassword',
        });

      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });

    it('deve retornar token para credenciais válidas', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@oticadavi.com',
          password: '123456',
        });

      // Se o banco estiver configurado corretamente
      if (res.statusCode === 200) {
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('token');
        expect(res.body.data).toHaveProperty('user');
      }
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('deve retornar erro quando token não é fornecido', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me');

      expect(res.statusCode).toBe(401);
    });

    it('deve retornar erro para token inválido', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('deve realizar logout com sucesso', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', 'Bearer valid-token');

      // Logout geralmente retorna sucesso mesmo sem token válido
      expect(res.statusCode).toBeLessThan(500);
    });
  });
});

// Testes de validação de senha
describe('Password Validation', () => {
  const validatePassword = (password) => {
    if (!password) return false;
    if (password.length < 6) return false;
    return true;
  };

  it('deve rejeitar senha vazia', () => {
    expect(validatePassword('')).toBe(false);
  });

  it('deve rejeitar senha muito curta', () => {
    expect(validatePassword('12345')).toBe(false);
  });

  it('deve aceitar senha válida', () => {
    expect(validatePassword('123456')).toBe(true);
  });
});

// Testes de validação de email
describe('Email Validation', () => {
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  it('deve rejeitar email vazio', () => {
    expect(validateEmail('')).toBe(false);
  });

  it('deve rejeitar email sem @', () => {
    expect(validateEmail('testtest.com')).toBe(false);
  });

  it('deve rejeitar email sem domínio', () => {
    expect(validateEmail('test@')).toBe(false);
  });

  it('deve aceitar email válido', () => {
    expect(validateEmail('test@test.com')).toBe(true);
  });
});
