import { useState } from "react";
import { signIn } from "next-auth/react";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

export default function OAuthButtons() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(true);
    try {
      await signIn(provider, { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("OAuth sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <button
        type="button"
        onClick={() => handleOAuthSignIn("github")}
        disabled={isLoading}
        className="flex items-center justify-center gap-2 w-full p-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
      >
        <FaGithub />
        <span>Continuar com GitHub</span>
      </button>
      <button
        type="button"
        onClick={() => handleOAuthSignIn("google")}
        disabled={isLoading}
        className="flex items-center justify-center gap-2 w-full p-2 bg-white text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
      >
        <FcGoogle  />
        <span>Continuar com Google</span>
      </button>
    </div>
  );
}
