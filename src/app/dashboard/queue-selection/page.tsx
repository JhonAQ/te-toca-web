"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isDevMode, handleApiCall } from "@/utils/devMode";
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

export default function QueueSelectionPage() {
  const router = useRouter();
  const [workerName, setWorkerName] = useState("Juan Pérez");
  const [queues, setQueues] = useState<Queue[]>([]);
  const [selectedQueue, setSelectedQueue] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estadísticas generales
  const [stats, setStats] = useState({
    totalQueues: 0,
    totalWaiting: 0,
    averageWaitTime: 0,
    activeOperators: 0,
  });

  // Datos mock para desarrollo
  const mockQueues: Queue[] = [
    {
      id: "1",
      name: "Atención General",
      description: "Cola principal para consultas generales y información",
      waitingCount: 8,
      averageWaitTime: 12,
      isActive: true,
      priority: "medium",
      category: "General",
    },
    {
      id: "2",
      name: "Soporte Técnico",
      description: "Resolución de problemas técnicos y asistencia especializada",
      waitingCount: 3,
      averageWaitTime: 25,
      isActive: true,
      priority: "high",
      category: "Técnico",
    },
    {
      id: "3",
      name: "Ventas",
      description: "Información sobre productos y servicios disponibles",
      waitingCount: 15,
      averageWaitTime: 8,
      isActive: true,
      priority: "low",
      category: "Comercial",
    },
    {
      id: "4",
      name: "Reclamos",
      description: "Gestión de quejas y reclamos de clientes",
      waitingCount: 2,
      averageWaitTime: 18,
      isActive: false,
      priority: "high",
      category: "Servicio al Cliente",
    },
  ];

  const mockData = {
    queues: mockQueues,
    stats: {
      totalQueues: mockQueues.length,
      totalWaiting: mockQueues.reduce((sum, q) => sum + q.waitingCount, 0),
      averageWaitTime: Math.round(
        mockQueues.reduce((sum, q) => sum + q.averageWaitTime, 0) / mockQueues.length
      ),
      activeOperators: 5,
    },
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    const savedWorkerName = localStorage.getItem("workerName");
    if (savedWorkerName) {
      setWorkerName(savedWorkerName);
    }

    fetchQueues();
  }, [router]);

  const fetchQueues = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await handleApiCall(
        () => {
          const token = localStorage.getItem("authToken");
          return fetch("/api/worker/queues", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        },
        mockData,
        1000
      );

      setQueues(data.queues || []);
      setStats(data.stats || mockData.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
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
      await handleApiCall(
        () => {
          const token = localStorage.getItem("authToken");
          return fetch("/api/worker/select-queue", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ queueId: selectedQueue }),
          });
        },
        { success: true },
        500
      );

      // Guardar la cola seleccionada
      const selectedQueueData = queues.find((q) => q.id === selectedQueue);
      localStorage.setItem("selectedQueue", selectedQueue);
      localStorage.setItem("selectedQueueName", selectedQueueData?.name || "");

      router.push("/dashboard/operator");
    } catch (err) {
      console.error("Error al seleccionar cola:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("selectedQueue");
    localStorage.removeItem("selectedQueueName");
    localStorage.removeItem("workerName");
    localStorage.removeItem("userId");
    router.push("/auth/login");
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
      <Header workerName={workerName} onLogout={handleLogout} />

      <main className="flex-1 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Selecciona una Cola de Trabajo
            </h1>
            <p className="text-gray-600">
              Elige la cola que deseas atender y comienza a trabajar
              {isDevMode() && <span className="text-orange-500 ml-2">(Modo Desarrollo)</span>}
            </p>
          </div>

          <QueueStats
            totalQueues={stats.totalQueues}
            totalWaiting={stats.totalWaiting}
            averageWaitTime={stats.averageWaitTime}
            activeOperators={stats.activeOperators}
          />

          {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-800">
                    {error}. {isDevMode() ? "Usando datos de desarrollo." : "Mostrando datos de ejemplo."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {queues.length === 0 ? (
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
                      <p className="text-sm text-gray-600">Cola seleccionada:</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {queues.find((q) => q.id === selectedQueue)?.name}
                      </p>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setSelectedQueue(null)}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button onClick={handleStartWork} className="btn-primary">
                        Comenzar a Trabajar
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