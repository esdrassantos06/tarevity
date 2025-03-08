'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';

// Define the form validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Por favor, insira um email válido'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Initialize form with React Hook Form
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  // Handle form submission
  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    
    try {
      // Send request to the password reset API
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      });
  
      // First check if the response is ok before trying to parse JSON
      if (!response.ok) {
        // Try to parse error response, but handle the case where it's not valid JSON
        let errorMessage = 'Ocorreu um erro ao processar sua solicitação';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          // Use status text if JSON parsing fails
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
  
      // Response is ok, so try to parse it
      let responseData;
      try {
        responseData = await response.json();
      } catch (parseError) {
        console.error('Error parsing successful response:', parseError);
        // Even successful responses should be valid JSON
        throw new Error('Resposta inválida do servidor');
      }
  
      // If successful, update UI to show success message
      setIsSubmitted(true);
      toast.success(responseData.message || 'Instruções de recuperação enviadas para seu email');
    } catch (error) {
      // Show error toast
      console.error('Error in forgot password:', error);
      toast.error(error instanceof Error ? error.message : 'Ocorreu um erro ao processar sua solicitação');
    } finally {
      setIsLoading(false);
    }
  };

  // Show different UI based on submission status
  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Esqueceu sua senha?</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {isSubmitted 
            ? 'Verifique seu email para redefinir sua senha.' 
            : 'Insira seu email e enviaremos instruções para redefinir sua senha.'}
        </p>
      </div>

      {isSubmitted ? (
        // Show success state after submission
        <div className="text-center">
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
            <FaEnvelope className="mx-auto h-12 w-12 text-green-500 dark:text-green-400 mb-2" />
            <p className="text-green-800 dark:text-green-200">
              Enviamos um email para você com instruções sobre como redefinir sua senha. O link expirará em 1 hora.
            </p>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Não recebeu o email? Verifique sua pasta de spam ou tente novamente.
            </p>
            
            <button
              onClick={() => setIsSubmitted(false)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Tentar novamente
            </button>
            
            <Link
              href="/auth/login"
              className="block w-full text-center mt-4 text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              <FaArrowLeft className="inline mr-1" />
              Voltar para o login
            </Link>
          </div>
        </div>
      ) : (
        // Show form when not yet submitted
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="seu@email.com"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            {isLoading ? 'Enviando...' : 'Enviar instruções'}
          </button>

          <div className="text-center mt-4">
            <Link
              href="/auth/login"
              className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              <FaArrowLeft className="inline mr-1" />
              Voltar para o login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}