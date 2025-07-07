import { FiUsers, FiClock, FiUser, FiX } from "react-icons/fi";

interface QueueTicket {
  id: string;
  number: string;
  customerName: string;
  estimatedTime: number;
  priority: "normal" | "priority";
  serviceType: string;
}

interface QueueModalProps {
  show: boolean;
  onClose: () => void;
}

export default function QueueModal({ show, onClose }: QueueModalProps) {
  if (!show) return null;

  // Datos mock de tickets en cola
  const ticketsInQueue: QueueTicket[] = [
    {
      id: "1",
      number: "D15",
      customerName: "Carlos Mendoza",
      estimatedTime: 5,
      priority: "normal",
      serviceType: "Consulta General",
    },
    {
      id: "2",
      number: "E22",
      customerName: "Laura Herrera",
      estimatedTime: 8,
      priority: "priority",
      serviceType: "Soporte Técnico",
    },
    {
      id: "3",
      number: "F01",
      customerName: "Roberto Silva",
      estimatedTime: 12,
      priority: "normal",
      serviceType: "Ventas",
    },
    {
      id: "4",
      number: "G08",
      customerName: "Carmen Ruiz",
      estimatedTime: 15,
      priority: "normal",
      serviceType: "Reclamos",
    },
    {
      id: "5",
      number: "H14",
      customerName: "Miguel Torres",
      estimatedTime: 18,
      priority: "priority",
      serviceType: "Consulta General",
    },
  ];


  const getEstimatedTimeColor = (minutes: number) => {
    if (minutes <= 5) return "text-green-600";
    if (minutes <= 10) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content min-w-140">
        <div className="modal-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiUsers className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Cola de Espera
                </h2>
                <p className="text-sm text-gray-600">
                  {ticketsInQueue.length} personas en fila
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
          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {ticketsInQueue.length}
              </div>
              <div className="text-sm text-blue-600 font-medium">En Fila</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(
                  ticketsInQueue.reduce(
                    (acc, ticket) => acc + ticket.estimatedTime,
                    0
                  ) / ticketsInQueue.length
                )}
              </div>
              <div className="text-sm text-orange-600 font-medium">
                Tiempo Promedio
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {ticketsInQueue.filter((t) => t.priority === "priority").length}
              </div>
              <div className="text-sm text-red-600 font-medium">
                Prioritarios
              </div>
            </div>
          </div>

          {/* Lista de tickets */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {ticketsInQueue.map((ticket, index) => (
              <div
                key={ticket.id}
                className="card transition-all duration-200 hover:shadow-md"
              >
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Posición en fila */}
                      <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">
                          #{index + 1}
                        </span>
                      </div>

                      {/* Información del ticket */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-xl font-bold text-gray-900">
                            {ticket.number}
                          </span>
                        </div>

                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <FiUser className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              {ticket.customerName}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-600">
                              {ticket.serviceType}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tiempo estimado */}
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <FiClock className="w-4 h-4 text-gray-400" />
                        <span
                          className={`font-semibold ${getEstimatedTimeColor(
                            ticket.estimatedTime
                          )}`}
                        >
                          ~{ticket.estimatedTime} min
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Tiempo estimado
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button
            onClick={onClose}
            className="w-full bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
