// src/components/profile/ProfileComponent.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import {
  FaUser,
  FaEnvelope,
  FaPencilAlt,
  FaSave,
  FaTimes,
  FaClipboardList,
  FaClipboardCheck,
  FaClock
} from "react-icons/fa";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  image: string | null;
  provider: string | null;
}

interface UserStats {
  total: number;
  completed: number;
  pending: number;
}

export default function ProfileComponent() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [formData, setFormData] = useState({
    name: "",
  });

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!session?.user?.id) return;

      setIsLoading(true);
      try {
        const response = await fetch("/api/profile", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Falha ao carregar dados do perfil");
        }

        const data = await response.json();
        setProfileData(data);
        setFormData({
          name: data.name || "",
        });

        // After loading profile, fetch the user statistics
        await fetchUserStats();
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Não foi possível carregar seu perfil");
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchProfileData();
    }
  }, [session]);

  // Function to fetch user task statistics
  const fetchUserStats = async () => {
    try {
      const response = await fetch("/api/stats", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Falha ao carregar estatísticas");
      }

      const data = await response.json();
      setUserStats(data);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      toast.error("Não foi possível carregar suas estatísticas");
    }
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Falha ao atualizar perfil");
      }

      const updatedProfile = await response.json();
      setProfileData(updatedProfile);

      // Update session data to reflect changes
      if (update) {
        await update({
          ...session,
          user: {
            ...session?.user,
            name: updatedProfile.name,
          },
        });
      }

      toast.success("Perfil atualizado com sucesso!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Erro ao atualizar perfil");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setFormData({
      name: profileData?.name || "",
    });
    setIsEditing(false);
  };

  if (isLoading && !profileData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12"></div>
      </div>
    );
  }

  if (!session?.user || !profileData) {
    return (
      <div className="bg-cardLightMode dark:bg-cardDarkMode shadow rounded-lg p-6">
        <p className="text-gray-600 dark:text-gray-400">
          Por favor, faça login para visualizar seu perfil.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-cardLightMode dark:bg-cardDarkMode shadow rounded-lg overflow-hidden">
      {/* Profile Header */}
      <div className="bg-secondary h-32"></div>

      <div className="px-6 py-8">
        <div className="flex flex-col md:flex-row items-center">
          {/* Profile Image */}
          <div className="relative -mt-16 mb-4 md:mb-0 md:mr-6">
            <div className="h-24 w-24 rounded-full overflow-hidden bg-backgroundLight border-4 border-borderLight dark:border-borderDark">
              {profileData.image ? (
                <Image
                  src={profileData.image}
                  alt={profileData.name || "Profile Picture"}
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-blue-100 dark:bg-blue-900">
                  <FaUser className="h-12 w-12 text-blue-500 dark:text-blue-300" />
                </div>
              )}
            </div>
          </div>

          {/* Profile Info & Form */}
          <div className="flex-1">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Nome
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 p-2 outline-none block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primaryHover outline-none"
                  >
                    <FaSave className="mr-2 -ml-1 h-4 w-4" />
                    Salvar
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 outline-none dark:bg-zinc-600 dark:text-gray-200 dark:hover:bg-zinc-700"
                  >
                    <FaTimes className="mr-2 -ml-1 h-4 w-4" />
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profileData.name || "Usuário"}
                  </h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center p-2 border border-transparent rounded-md text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none"
                  >
                    <FaPencilAlt className="h-4 w-4" />
                    <span className="ml-1">Editar</span>
                  </button>
                </div>
                <div className="mt-2 flex items-center text-gray-600 dark:text-gray-400">
                  <FaEnvelope className="mr-2 h-4 w-4" />
                  <span>{profileData.email}</span>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <p>
                      Método de login:{" "}
                      {profileData.provider
                        ? profileData.provider.charAt(0).toUpperCase() +
                          profileData.provider.slice(1)
                        : "Email/Senha"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Sections */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Estatísticas de Tarefas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {userStats ? userStats.total : '--'}
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <FaClipboardList className="mr-1" />
              Tarefas Criadas
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {userStats ? userStats.completed : '--'}
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <FaClipboardCheck className="mr-1" />
              Tarefas Concluídas
            </div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {userStats ? userStats.pending : '--'}
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <FaClock className="mr-1" />
              Pendentes
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}