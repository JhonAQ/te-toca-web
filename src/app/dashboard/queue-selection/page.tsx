"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "./components/Header";
import QueueStats from "./components/QueueStats";
import QueueCard from "./components/QueueCard";
import EmptyState from "./components/EmptyState";

interface Queue {
  id: string;
  name: string;
  description: string;
  waitingCount: number;
  averageWaitTime: number;
  isActive: boolean;
  priority: "low" | "medium" | "high";
  category: string;
}

interface QueueStats {
  totalQueues: number;
  totalWaiting: number;
  averageWaitTime: number;
  activeOperators: number;
}

export default function QueueSelectionPage() {
  const router = useRouter();
  const [workerName, setWorkerName] = useState("");
  const [queues, setQueues] = useState<Queue[]>([]);
  const [selectedQueue, setSelectedQueue] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<QueueStats>({
    totalQueues: 0,
    totalWaiting: 0,
    averageWaitTime: 0,
    activeOperators: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const savedWorkerName = localStorage.getItem("workerName");

    if (!token) {
      router.push("/auth/login");
      return;
    }

    if (savedWorkerName) {
      setWorkerName(savedWorkerName);
    }

    fetchQueues();
  }, [router]);

  const fetchQueues = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("authToken");

      if (!token) {
        router.push("/auth/login");
        return;
      }

      console.log("🔍 Fetching queues for worker...");

      const response = await fetch("/api/worker/queues", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log("❌ Token expired or invalid");
          localStorage.clear();
          router.push("/auth/login");
          return;
        }

        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Error al obtener las colas");
      }

      console.log("✅ Queues fetched successfully:", data.queues.length);

      // Validar y formatear datos
      const formattedQueues = (data.queues || []).map((queue: any) => ({
        id: queue.id,
        name: queue.name || "Cola sin nombre",
        description: queue.description || "Sin descripción",
        waitingCount: queue.waitingCount || 0,
        averageWaitTime: queue.averageWaitTime || 0,
        isActive: queue.isActive !== false, // Por defecto true si no está definido
        priority: queue.priority || "medium",
        category: queue.category || "General",
      }));

      setQueues(formattedQueues);
      setStats(
        data.stats || {
          totalQueues: formattedQueues.length,
          totalWaiting: 0,
          averageWaitTime: 0,
          activeOperators: 0,
        }
      );
    } catch (err) {
      console.error("❌ Error fetching queues:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error desconocido al cargar las colas"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQueueSelect = (queueId: string) => {
    setSelectedQueue(queueId === selectedQueue ? null : queueId);
  };

  const handleStartWork = async () => {
    if (!selectedQueue) return;

    try {
      setLoading(true);

      const token = localStorage.getItem("authToken");

      if (!token) {
        router.push("/auth/login");
        return;
      }

      console.log("🔄 Selecting queue:", selectedQueue);

      const response = await fetch("/api/worker/select-queue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ queueId: selectedQueue }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.clear();
          router.push("/auth/login");
          return;
        }

        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Error al seleccionar la cola");
      }

      console.log("✅ Queue selected successfully:", data.queue?.name);

      // Guardar la cola seleccionada
      const selectedQueueData = queues.find((q) => q.id === selectedQueue);
      localStorage.setItem("selectedQueue", selectedQueue);
      localStorage.setItem("selectedQueueName", selectedQueueData?.name || "");

      // Redirigir al dashboard del operador
      router.push("/dashboard/operator");
    } catch (err) {
      console.error("❌ Error selecting queue:", err);
      setError(
        err instanceof Error ? err.message : "Error al seleccionar la cola"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Limpiar todos los datos del localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("selectedQueue");
    localStorage.removeItem("selectedQueueName");
    localStorage.removeItem("workerName");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("tenantId");
    localStorage.removeItem("tenantName");

    router.push("/auth/login");
  };

  const handleRefresh = () => {
    fetchQueues();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando colas disponibles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        workerName={workerName}
        onLogout={handleLogout}
        onRefresh={handleRefresh}
        isRefreshing={loading}
      />

      <main className="flex-1 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Selecciona una Cola de Trabajo
            </h1>
            <p className="text-gray-600">
              Elige la cola que deseas atender y comienza a trabajar
            </p>
          </div>

          <QueueStats
            totalQueues={stats.totalQueues}
            totalWaiting={stats.totalWaiting}
            averageWaitTime={stats.averageWaitTime}
            activeOperators={stats.activeOperators}
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
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
                  <p className="text-sm text-red-800">{error}</p>
                  <button
                    onClick={handleRefresh}
                    className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
                  >
                    Intentar nuevamente
                  </button>
                </div>
              </div>
            </div>
          )}

          {queues.length === 0 && !loading ? (
            <EmptyState />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {queues.map((queue) => (
                  <QueueCard
                    key={queue.id}
                    queue={queue}
                    onSelect={handleQueueSelect}
                    isSelected={selectedQueue === queue.id}
                  />
                ))}
              </div>

              {selectedQueue && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-6 shadow-lg">
                  <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        Cola seleccionada:
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        {queues.find((q) => q.id === selectedQueue)?.name}
                      </p>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setSelectedQueue(null)}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        disabled={loading}
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleStartWork}
                        className="btn-primary"
                        disabled={loading}
                      >
                        {loading ? "Seleccionando..." : "Comenzar a Trabajar"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
