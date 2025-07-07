"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Para produccion (tenant id)
      const tenantId = "default";
      const response = await fetch(`/api/auth/worker/login/${tenantId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Algo salio mal");
      }

      const data = await response.json();

      // Guardar token en localStorage o en un estado seguro
      localStorage.setItem("authToken", data.token);

      // Redireccionar al dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full font-sans">
      {/* Fondo dividido en dos secciones */}
      <div className="fixed inset-0 z-0">
        <div className="flex h-full">
          <div className="w-1/2" style={{ backgroundColor: "#0c0526" }}></div>
          <div className="w-1/2 bg-gray-300"></div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="z-10 w-full flex flex-col items-center">
        {/* Logo en la esquina superior izquierda */}
        <div className="self-start p-6 fixed">
          <Image
            src="/TeTocaLogo.png"
            alt="TeToca Logo"
            width={120}
            height={60}
            priority
          />
        </div>

        {/* Card centrada */}
        <div className="flex-grow flex items-center justify-center w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md mx-4">
            <h1 className="text-3xl font-bold mb-2 text-gray-900">Ingresar</h1>
            <p className="text-gray-600 mb-6">Bienvenido a TeToca</p>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-900 mb-1"
                >
                  Nombre Operario
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8075FF] focus:border-[#8075FF]"
                  placeholder="Ingresa tu nombre de usuario"
                  style={{
                    color: "#000",
                    "::placeholder": { color: "#9ca3af" },
                  }}
                  required
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-900 mb-1"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={isPasswordVisible ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8075FF] focus:border-[#8075FF]"
                    placeholder="Ingresa tu contraseña"
                    style={{
                      color: "#000",
                      "::placeholder": { color: "#9ca3af" },
                    }}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                    onClick={togglePasswordVisibility}
                  >
                    {isPasswordVisible ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                          clipRule="evenodd"
                        />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: "#8075FF" }}
                className="w-full text-white py-2 px-4 rounded-lg hover:bg-[#6a63d8] focus:outline-none focus:ring-2 focus:ring-[#8075FF] focus:ring-offset-2 transition-colors"
              >
                {loading ? "Iniciando sesión..." : "Sign in"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
