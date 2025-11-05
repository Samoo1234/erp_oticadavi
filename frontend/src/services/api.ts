import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1',
  timeout: 10000,
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    // Não rejeitar erros de rede silenciosamente - deixar o componente tratar
    // Mas não fazer log desnecessário aqui
    return Promise.reject(error);
  }
);
