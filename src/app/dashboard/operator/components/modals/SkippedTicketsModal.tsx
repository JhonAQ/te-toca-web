import { useState, useEffect } from "react";
import { FiX, FiClock, FiUser, FiAlertTriangle } from "react-icons/fi";

interface SkippedTicket {
  id: string;
  number: string;
  customerName: string;
  customerPhone?: string;
  waitTime: number;
  reason?: string;
  priority: "normal" | "priority";
  skippedAt: string;
}

interface SkippedTicketsModalProps {
  show: boolean;
  onClose: () => void;
  onSelectTicket: (ticketNumber: string, customerName: string) => void;
}

export default function SkippedTicketsModal({
  show,
  onClose,
  onSelectTicket,
}: SkippedTicketsModalProps) {
  const [skippedTickets, setSkippedTickets] = useState<SkippedTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (show) {
      fetchSkippedTickets();
    }
  }, [show]);

  const fetchSkippedTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("authToken");
      const selectedQueue = localStorage.getItem("selectedQueue");

      if (!token || !selectedQueue) {
        setError("Sesión expirada. Por favor inicia sesión nuevamente.");
        return;
      }

      console.log("📋 Fetching REAL skipped tickets for queue:", selectedQueue);

      const response = await fetch(
        `/api/operator/skipped-tickets?queueId=${selectedQueue}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log(
          "✅ REAL skipped tickets loaded:",
          data.skippedTickets.length
        );
        setSkippedTickets(data.skippedTickets || []);
      } else {
        throw new Error(data.message || "Error al obtener tickets saltados");
      }
    } catch (error) {
      console.error("❌ Error fetching skipped tickets:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Error al cargar los tickets saltados"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRetakeTicket = async (ticket: SkippedTicket) => {
    try {
      console.log("🔄 Retaking REAL skipped ticket:", ticket.number);
      await onSelectTicket(ticket.number, ticket.customerName);

      // Refresh the list after successful selection
      await fetchSkippedTickets();
    } catch (error) {
      console.error("❌ Error retaking ticket:", error);
      setError("Error al retomar el ticket");
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getPriorityColor = (priority: "normal" | "priority") => {
    return priority === "priority"
      ? "text-red-600 bg-red-50"
      : "text-gray-600 bg-gray-50";
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Tickets Saltados</h2>
            <p className="text-sm text-gray-500 mt-1">
              {loading
                ? "Cargando..."
                : `${skippedTickets.length} tickets pendientes de atención`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-gray-600">
                Cargando tickets saltados...
              </span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8">
              <FiAlertTriangle className="w-12 h-12 text-red-400 mb-4" />
              <p className="text-gray-600 text-center mb-4">{error}</p>
              <button onClick={fetchSkippedTickets} className="btn-primary">
                Intentar nuevamente
              </button>
            </div>
          ) : skippedTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <FiClock className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-600 text-center">
                No hay tickets saltados en esta cola
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Los tickets que saltes aparecerán aquí para que puedas retomarlos
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {skippedTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-bold text-lg text-primary">
                          {ticket.number}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                            ticket.priority
                          )}`}
                        >
                          {ticket.priority === "priority"
                            ? "Prioritario"
                            : "Normal"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <FiUser className="w-4 h-4 text-gray-400" />
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
                        </div>

                        <div className="flex items-center space-x-2">
                          <FiClock className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">
                              Esperando: {formatTime(ticket.waitTime)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Saltado:{" "}
                              {new Date(ticket.skippedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {ticket.reason && (
                        <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-600">
                          <strong>Motivo:</strong> {ticket.reason}
                        </div>
                      )}
                    </div>

                    <div className="ml-4">
                      <button
                        onClick={() => handleRetakeTicket(ticket)}
                        className="btn-primary"
                      >
                        Retomar
                      </button>
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
              {skippedTickets.length > 0 && (
                <span>
                  Puedes retomar cualquier ticket saltado para continuar con su
                  atención
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
