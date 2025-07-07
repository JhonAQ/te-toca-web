import { FiUsers, FiClock, FiPlay, FiPause } from "react-icons/fi";

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
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high":
        return "Alta";
      case "medium":
        return "Media";
      case "low":
        return "Baja";
      default:
        return "Normal";
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border-2 transition-all duration-200 hover:shadow-md cursor-pointer ${
        isSelected
          ? "border-secondary bg-secondary/5"
          : "border-gray-200 hover:border-gray-300"
      }`}
      onClick={() => onSelect(queue.id)}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {queue.name}
            </h3>
            <p className="text-gray-600 text-sm mb-3">{queue.description}</p>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              {queue.category}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(
                queue.priority
              )}`}
            >
              {getPriorityText(queue.priority)}
            </span>

            <div className="flex items-center">
              {queue.isActive ? (
                <div className="flex items-center text-green-600">
                  <FiPlay className="w-4 h-4 mr-1" />
                  <span className="text-xs font-medium">Activa</span>
                </div>
              ) : (
                <div className="flex items-center text-gray-500">
                  <FiPause className="w-4 h-4 mr-1" />
                  <span className="text-xs font-medium">Pausada</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="flex items-center space-x-2">
            <FiUsers className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {queue.waitingCount}
              </p>
              <p className="text-xs text-gray-500">En espera</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <FiClock className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {queue.averageWaitTime} min
              </p>
              <p className="text-xs text-gray-500">Tiempo promedio</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              isSelected
                ? "bg-secondary text-white hover:bg-secondary-hover"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {isSelected ? "Seleccionada" : "Seleccionar Cola"}
          </button>
        </div>
      </div>
    </div>
  );
}
