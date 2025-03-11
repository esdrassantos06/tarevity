import axios from 'axios';
import { getSession } from 'next-auth/react';

// Interface para erro de API customizado
export interface APIError {
  message: string;
  status?: number;
  code?: string;
}

// Função para verificar se um erro é uma APIError
export function isAPIError(error: unknown): error is APIError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error
  );
}

// Cria uma instância do Axios com configurações personalizadas
const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Importante para enviar cookies de autenticação
});

// Interceptador de requisição
axiosClient.interceptors.request.use(
  async (config) => {
    // Só adiciona token no cliente (não no servidor)
    if (typeof window !== 'undefined') {
      try {
        const session = await getSession();
        
        if (session && session.user) {
          // Opcional: adicionar token de autorização
          // config.headers.Authorization = `Bearer ${session.accessToken}`;
        }
      } catch (error) {
        console.error('Erro ao obter sessão:', error);
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptador de resposta
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log de erros em ambiente de desenvolvimento
    if (process.env.NODE_ENV !== 'production') {
      console.error('Erro Axios:', error);
    }

    // Tratamento de erros específicos
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      switch (status) {
        case 401: // Não autorizado
          // Opção de redirecionar para login ou fazer refresh do token
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
          break;
        
        case 429: // Muitas requisições
          console.warn('Limite de requisições excedido');
          break;
        
        case 500: // Erro interno do servidor
          console.error('Erro interno do servidor');
          break;
      }

      // Rejeita a promessa com um erro customizado
      return Promise.reject({
        message: errorData?.message || 'Erro desconhecido',
        status,
        code: errorData?.code
      });
    }

    // Erro de rede ou sem resposta do servidor
    return Promise.reject({
      message: 'Erro de conexão. Verifique sua internet.',
      status: null
    });
  }
);

export default axiosClient;