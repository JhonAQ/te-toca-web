import { useState } from "react";
import { FiPhone, FiClock, FiUser, FiX, FiRefreshCw } from "react-icons/fi";

interface SkippedTicket {
  id: string;
  number: string;
  customerName: string;
  waitTime: number;
  reason: string;
  skippedAt: string;
}

interface SkippedTicketsModalProps {
  show: boolean;
  onClose: () => void;
  onSelectTicket?: (ticketNumber: string) => void;
}

export default function SkippedTicketsModal({
  show,
  onClose,
  onSelectTicket,
}: SkippedTicketsModalProps) {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  // Datos mock de tickets saltados
  const skippedTickets: SkippedTicket[] = [
    {
      id: "1",
      number: "B12",
      customerName: "María González",
      waitTime: 25,
      reason: "Cliente no respondió",
      skippedAt: "14:30",
    },
    {
      id: "2",
      number: "C05",
      customerName: "Pedro Ramírez",
      waitTime: 18,
      reason: "Llamada no contestada",
      skippedAt: "14:45",
    },
    {
      id: "3",
      number: "A08",
      customerName: "Ana López",
      waitTime: 32,
      reason: "Cliente ausente",
      skippedAt: "15:10",
    },
  ];

  const handleCallSkipped = (ticketNumber: string) => {
    if (onSelectTicket) {
      onSelectTicket(ticketNumber);
    }
    onClose();
  };

  const getWaitTimeColor = (minutes: number) => {
    if (minutes >= 30) return "text-red-600 bg-red-50";
    if (minutes >= 20) return "text-orange-600 bg-orange-50";
    return "text-green-600 bg-green-50";
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-2xl">
        <div className="modal-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <FiRefreshCw className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Tickets Saltados
                </h2>
                <p className="text-sm text-gray-600">
                  {skippedTickets.length} tickets pendientes
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>
        </div>

        <div className="modal-body">
          {skippedTickets.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiRefreshCw className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay tickets saltados
              </h3>
              <p className="text-gray-500">
                Todos los tickets están siendo atendidos normalmente
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {skippedTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`card cursor-pointer transition-all duration-200 ${
                    selectedTicket === ticket.number
                      ? "ring-2 ring-secondary ring-opacity-50 bg-secondary/5"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => setSelectedTicket(ticket.number)}
                >
                  <div className="card-body">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {ticket.number}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <FiUser className="w-4 h-4 text-gray-500" />
                              <span className="font-semibold text-gray-900">
                                {ticket.customerName}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm">
                              <div className="flex items-center space-x-1">
                                <FiClock className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">
                                  Saltado a las {ticket.skippedAt}
                                </span>
                              </div>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getWaitTimeColor(
                                  ticket.waitTime
                                )}`}
                              >
                                {ticket.waitTime} min esperando
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Razón:</span> {ticket.reason}
                          </p>
                        </div>
                      </div>

                      <div className="ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCallSkipped(ticket.number);
                          }}
                          className="btn-success flex items-center space-x-2 px-4 py-2"
                        >
                          <FiPhone className="w-4 h-4" />
                          <span>Llamar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              Cerrar
            </button>
            {selectedTicket && (
              <button
                onClick={() => handleCallSkipped(selectedTicket)}
                className="flex-1 btn-primary flex items-center justify-center space-x-2"
              >
                <FiPhone className="w-4 h-4" />
                <span>Llamar {selectedTicket}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
