"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import OAuthButtons from "./OAuthButtons";

const registerSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Erro ao registrar");
      }

      router.push("/auth/login?registered=true");
    } catch (error: any) {
      setError(error.message || "Ocorreu um erro ao registrar");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-cardLightMode rounded-lg shadow-md dark:bg-cardDarkMode">
      <h1 className="text-2xl font-bold text-center mb-6 dark:text-white">
        Registrar - Tarevity
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Nome
          </label>
          <input
            id="name"
            type="text"
            {...register("name")}
            className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            disabled={isLoading}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className="mt-1 block w-full rounded-md p-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Senha
          </label>
          <input
            id="password"
            type="password"
            {...register("password")}
            className="mt-1 block w-full rounded-md p-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            disabled={isLoading}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Confirmar Senha
          </label>
          <input
            id="confirmPassword"
            type="password"
            {...register("confirmPassword")}
            className="mt-1 block w-full rounded-md p-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          {isLoading ? "Registrando..." : "Registrar"}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500 dark:bg-zinc-800 dark:text-gray-400">
              Ou continue com
            </span>
          </div>
        </div>

        <div className="mt-6">
          <OAuthButtons />
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Já tem uma conta?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
}
