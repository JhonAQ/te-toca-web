import { FiUsers, FiClock } from "react-icons/fi";

interface UpcomingTicket {
  number: string;
  estimatedTime: number;
  priority: "normal" | "priority";
}

export default function UpcomingTickets() {
  // Simulamos los próximos 5 tickets
  const upcomingTickets: UpcomingTicket[] = [
    { number: "D15", estimatedTime: 3, priority: "normal" },
    { number: "E22", estimatedTime: 7, priority: "priority" },
    { number: "F01", estimatedTime: 12, priority: "normal" },
    { number: "G08", estimatedTime: 15, priority: "normal" },
    { number: "H14", estimatedTime: 18, priority: "priority" },
  ];

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <FiUsers className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-white font-semibold">Próximos en Fila</h3>
          <p className="text-gray-300 text-sm">
            {upcomingTickets.length} personas esperando
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {upcomingTickets.map((ticket, index) => (
          <div
            key={ticket.number}
            className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  #{index + 1}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-white font-semibold">
                  {ticket.number}
                </span>
                {ticket.priority === "priority" && (
                  <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                    🔥
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 text-gray-300">
              <FiClock className="w-4 h-4" />
              <span className="text-sm">~{ticket.estimatedTime}min</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-white/20">
        <div className="flex justify-between text-sm">
          <span className="text-gray-300">Tiempo total estimado:</span>
          <span className="text-white font-semibold">
            ~
            {upcomingTickets.reduce(
              (acc, ticket) => acc + ticket.estimatedTime,
              0
            )}{" "}
            min
          </span>
        </div>
      </div>
    </div>
  );
}
