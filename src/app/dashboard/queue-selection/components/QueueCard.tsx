import {
  FiUsers,
  FiClock,
  FiPlay,
  FiPause,
  FiAlertCircle,
} from "react-icons/fi";

interface QueueCardProps {
  queue: {
    id: string;
    name: string;
    description: string;
    waitingCount: number;
    averageWaitTime: number;
    isActive: boolean;
    priority: "low" | "medium" | "high";
    category: string;
  };
  onSelect: (queueId: string) => void;
  isSelected: boolean;
}

export default function QueueCard({
  queue,
  onSelect,
  isSelected,
}: QueueCardProps) {
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case "high":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          text: "Alta",
          icon: FiAlertCircle,
        };
      case "medium":
        return {
          color: "bg-orange-100 text-orange-800 border-orange-200",
          text: "Media",
          icon: FiClock,
        };
      case "low":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          text: "Baja",
          icon: FiUsers,
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          text: "Normal",
          icon: FiUsers,
        };
    }
  };

  const priorityConfig = getPriorityConfig(queue.priority);

  return (
    <div
      className={`card cursor-pointer transition-all duration-200 transform hover:scale-105 ${
        isSelected
          ? "border-secondary bg-secondary/5 ring-2 ring-secondary ring-opacity-50"
          : "hover:border-gray-300"
      } ${!queue.isActive ? "opacity-75" : ""}`}
      onClick={() => queue.isActive && onSelect(queue.id)}
    >
      <div className="card-body">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-xl font-bold text-gray-900">{queue.name}</h3>
              {!queue.isActive && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  <FiPause className="w-3 h-3 mr-1" />
                  Pausada
                </span>
              )}
            </div>
            <p className="text-gray-600 text-sm mb-3">{queue.description}</p>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              {queue.category}
            </span>
          </div>

          <div className="flex flex-col items-end space-y-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${priorityConfig.color}`}
            >
              <priorityConfig.icon className="w-3 h-3 mr-1" />
              {priorityConfig.text}
            </span>

            {queue.isActive && (
              <div className="flex items-center text-green-600">
                <FiPlay className="w-4 h-4 mr-1" />
                <span className="text-xs font-medium">Activa</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FiUsers className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">
                {queue.waitingCount}
              </p>
              <p className="text-xs text-gray-500">En espera</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="p-2 bg-orange-50 rounded-lg">
              <FiClock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">
                {queue.averageWaitTime} min
              </p>
              <p className="text-xs text-gray-500">Tiempo promedio</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            disabled={!queue.isActive}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              isSelected
                ? "bg-secondary text-white shadow-md"
                : queue.isActive
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                : "bg-gray-50 text-gray-400 cursor-not-allowed"
            }`}
          >
            {!queue.isActive
              ? "Cola Inactiva"
              : isSelected
              ? "Seleccionada"
              : "Seleccionar Cola"}
          </button>
        </div>
      </div>
    </div>
  );
}
