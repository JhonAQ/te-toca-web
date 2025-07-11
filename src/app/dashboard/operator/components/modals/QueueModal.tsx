import { useState, useEffect } from "react";
import {
  FiX,
  FiClock,
  FiUser,
  FiAlertTriangle,
  FiUsers,
  FiRefreshCw,
} from "react-icons/fi";

interface QueueTicket {
  id: string;
  number: string;
  customerName: string;
  customerPhone?: string;
  serviceType?: string;
  priority: "normal" | "priority";
  status: "waiting";
  position: number;
  estimatedWaitTime: number;
  createdAt: string;
}

interface QueueModalProps {
  show: boolean;
  onClose: () => void;
}

export default function QueueModal({ show, onClose }: QueueModalProps) {
  const [queueTickets, setQueueTickets] = useState<QueueTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queueInfo, setQueueInfo] = useState({
    totalWaiting: 0,
    totalCalled: 0,
    totalInProgress: 0,
  });

  useEffect(() => {
    if (show) {
      fetchQueueTickets();
    }
  }, [show]);

  const fetchQueueTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("authToken");
      const selectedQueue = localStorage.getItem("selectedQueue");

      if (!token || !selectedQueue) {
        setError("Sesión expirada. Por favor inicia sesión nuevamente.");
        return;
      }

      console.log("📋 Fetching REAL waiting tickets for queue:", selectedQueue);

      const response = await fetch(
        `/api/operator/queue-tickets?queueId=${selectedQueue}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("📡 API Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API Error:", response.status, errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("📊 Queue tickets response:", data);

      if (data.success) {
        console.log(
          "✅ REAL waiting tickets loaded:",
          data.tickets?.length || 0
        );
        setQueueTickets(data.tickets || []);
        setQueueInfo(
          data.queueInfo || {
            totalWaiting: 0,
            totalCalled: 0,
            totalInProgress: 0,
          }
        );
      } else {
        throw new Error(data.message || "Error al obtener tickets de la cola");
      }
    } catch (error) {
      console.error("❌ Error fetching queue tickets:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Error al cargar los tickets de la cola"
      );
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: "normal" | "priority") => {
    return priority === "priority"
      ? "text-red-600 bg-red-50 border-red-200"
      : "text-gray-600 bg-gray-50 border-gray-200";
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Personas en Cola
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {loading
                ? "Cargando..."
                : `${queueTickets.length} personas esperando ser atendidas`}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchQueueTickets}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              title="Actualizar"
            >
              <FiRefreshCw
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
            >
              <FiX size={24} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {queueInfo.totalWaiting}
              </div>
              <div className="text-sm text-gray-600">En Espera</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {queueTickets.filter((t) => t.priority === "priority").length}
              </div>
              <div className="text-sm text-gray-600">Prioritarios</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {queueTickets.length > 0
                  ? Math.round(
                      queueTickets.reduce(
                        (sum, t) => sum + t.estimatedWaitTime,
                        0
                      ) / queueTickets.length
                    )
                  : 0}{" "}
                min
              </div>
              <div className="text-sm text-gray-600">Tiempo Promedio</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-gray-600">
                Cargando tickets de la cola...
              </span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8">
              <FiAlertTriangle className="w-12 h-12 text-red-400 mb-4" />
              <p className="text-gray-600 text-center mb-4">{error}</p>
              <button onClick={fetchQueueTickets} className="btn-primary">
                Intentar nuevamente
              </button>
            </div>
          ) : queueTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <FiUsers className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-600 text-center">
                No hay personas esperando en la cola
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Cuando lleguen nuevos clientes aparecerán aquí
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {queueTickets.map((ticket, index) => (
                <div
                  key={ticket.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div
                          className={`text-lg font-bold ${
                            ticket.priority === "priority"
                              ? "text-red-600"
                              : "text-primary"
                          }`}
                        >
                          #{index + 1}
                        </div>
                        <div className="text-xs text-gray-500">Posición</div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-bold text-lg text-gray-900">
                            {ticket.number}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                              ticket.priority
                            )}`}
                          >
                            {ticket.priority === "priority"
                              ? "Prioritario"
                              : "Normal"}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div>
                            <p className="font-medium text-gray-900">
                              {ticket.customerName}
                            </p>
                            {ticket.customerPhone && (
                              <p className="text-sm text-gray-500">
                                {ticket.customerPhone}
                              </p>
                            )}
                          </div>

                          <div>
                            <p className="text-sm text-gray-600">
                              {ticket.serviceType || "Servicio General"}
                            </p>
                            <p className="text-xs text-gray-500">
                              Tiempo estimado:{" "}
                              {formatTime(ticket.estimatedWaitTime)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <FiClock className="w-3 h-3 mr-1" />
                        Esperando
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(ticket.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {queueTickets.length > 0 && (
                <span>
                  Los tickets se muestran en orden de atención (prioridad +
                  llegada)
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
