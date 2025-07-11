import { FiUsers, FiClock, FiUser } from "react-icons/fi";

interface CurrentTicketPanelProps {
  currentTicket: string | null;
  customerName: string | null;
  isPaused: boolean;
}

export default function CurrentTicketPanel({
  currentTicket,
  customerName,
  isPaused,
}: CurrentTicketPanelProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center">
        {currentTicket ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 border border-white/20 animate-pulse-glow">
            <div className="text-center text-white">
              <p className="text-lg font-medium mb-4 text-gray-300">
                Atendiendo a:
              </p>
              <div className="text-8xl text-secondary font-bold tracking-wider mb-4">
                {currentTicket}
              </div>

              {customerName && (
                <div className="flex items-center justify-center space-x-2 mb-6">
                  <FiUser className="w-5 h-5 text-gray-300" />
                  <span className="text-xl text-white font-medium">
                    {customerName}
                  </span>
                </div>
              )}

              <div className="inline-flex items-center px-4 py-2 bg-green-500/20 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <span className="text-green-400 font-medium">En atención</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 border border-white/20">
            <div className="mb-6">
              <FiUsers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-white text-xl font-medium">No hay tickets</p>
              <p className="text-gray-300 text-sm mt-2">
                Esperando el siguiente cliente en la cola
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
