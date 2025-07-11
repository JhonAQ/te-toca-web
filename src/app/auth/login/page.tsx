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

    // Validación básica del cliente
    if (!username.trim()) {
      setError("Por favor ingresa tu nombre de usuario");
      setLoading(false);
      return;
    }

    if (!password.trim()) {
      setError("Por favor ingresa tu contraseña");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }

    try {
      console.log("🔄 Attempting login for user:", username);

      // Llamada REAL a la API - sin fallback
      const response = await fetch(`/api/auth/worker/login/default`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
        }),
      });

      const data = await response.json();
      console.log("📡 API Response status:", response.status);

      // Manejar respuestas de error específicas
      if (!response.ok) {
        console.log("❌ Login failed with status:", response.status);

        switch (response.status) {
          case 400:
            setError(data.message || "Datos de entrada inválidos");
            break;
          case 401:
            setError(
              "Usuario o contraseña incorrectos. Verifica tus credenciales."
            );
            break;
          case 404:
            setError("Sistema no disponible. Contacta al administrador.");
            break;
          case 403:
            setError(data.message || "Acceso denegado");
            break;
          case 500:
            setError(
              "Error del servidor. Intenta nuevamente en unos momentos."
            );
            break;
          default:
            setError(data.message || "Error de conexión. Intenta nuevamente.");
        }
        setLoading(false);
        return;
      }

      // Verificar que la respuesta tenga la estructura correcta
      if (!data.success) {
        console.log("❌ API returned success: false");
        setError(data.message || "Error en la respuesta del servidor");
        setLoading(false);
        return;
      }

      if (!data.token || !data.user) {
        console.log("❌ Missing token or user data in response");
        setError("Respuesta inválida del servidor");
        setLoading(false);
        return;
      }

      // Validar datos del usuario
      if (!data.user.id || !data.user.name || !data.user.tenantId) {
        console.log("❌ Invalid user data structure");
        setError("Datos de usuario incompletos");
        setLoading(false);
        return;
      }

      console.log("✅ Login successful for:", data.user.name);

      // Guardar datos en localStorage
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("workerName", data.user.name);
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("userRole", data.user.role);
      localStorage.setItem("tenantId", data.user.tenantId);
      localStorage.setItem("tenantName", data.user.tenantName || "Sistema");

      // Guardar permisos si existen
      if (data.user.permissions) {
        localStorage.setItem(
          "userPermissions",
          JSON.stringify(data.user.permissions)
        );
      }

      console.log("✅ User data saved to localStorage");

      // Redirigir al dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("❌ Network or unexpected error:", error);

      if (error instanceof Error) {
        if (error.name === "NetworkError" || error.message.includes("fetch")) {
          setError("Error de conexión. Verifica tu conexión a internet.");
        } else {
          setError("Error inesperado. Intenta nuevamente.");
        }
      } else {
        setError("Error de conexión. Intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full font-sans">
      <div className="fixed inset-0 z-0">
        <div className="flex h-full">
          <div className="w-1/2 bg-primary"></div>
          <div className="w-1/2 bg-gray-300"></div>
        </div>
      </div>

      <div className="z-10 w-full flex flex-col items-center">
        <div className="self-start p-6 fixed">
          <Image
            src="/TeTocaLogo.png"
            alt="TeToca Logo"
            width={120}
            height={60}
            priority
          />
        </div>

        <div className="flex-grow flex items-center justify-center w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md mx-4">
            <h1 className="text-3xl font-bold mb-2 text-gray-900">Ingresar</h1>
            <p className="text-gray-600 mb-6">Accede a tu cuenta de operario</p>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-900 mb-1"
                >
                  Nombre de Usuario
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary text-gray-900"
                  placeholder="Ingresa tu nombre de usuario"
                  required
                  disabled={loading}
                  autoComplete="username"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary text-gray-900"
                    placeholder="Ingresa tu contraseña"
                    required
                    disabled={loading}
                    autoComplete="current-password"
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                    onClick={togglePasswordVisibility}
                    disabled={loading}
                    tabIndex={-1}
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
                className="w-full bg-secondary text-white py-2 px-4 rounded-lg hover:bg-secondary-hover focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Verificando credenciales...
                  </div>
                ) : (
                  "Iniciar Sesión"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                ¿Problemas para acceder? Contacta al administrador del sistema
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
