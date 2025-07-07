import { FiUsers, FiClock, FiTrendingUp } from "react-icons/fi";

interface QueueStatsProps {
  totalQueues: number;
  totalWaiting: number;
  averageWaitTime: number;
  activeOperators: number;
}

export default function QueueStats({
  totalQueues,
  totalWaiting,
  averageWaitTime,
  activeOperators,
}: QueueStatsProps) {
  const stats = [
    {
      icon: FiUsers,
      label: "Colas Disponibles",
      value: totalQueues,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      icon: FiUsers,
      label: "Personas Esperando",
      value: totalWaiting,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      icon: FiClock,
      label: "Tiempo Promedio",
      value: `${averageWaitTime} min`,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      icon: FiTrendingUp,
      label: "Operarios Activos",
      value: activeOperators,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stat.value}
              </p>
            </div>
            <div className={`p-3 rounded-full ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
