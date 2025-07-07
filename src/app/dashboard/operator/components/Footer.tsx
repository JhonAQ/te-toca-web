import { FiPause, FiPlay, FiUsers } from "react-icons/fi";

interface FooterProps {
  isPaused: boolean;
  queueCount: number;
  handlePauseToggle: () => void;
  setShowQueueModal: (show: boolean) => void;
}

export default function Footer({
  isPaused,
  queueCount,
  handlePauseToggle,
  setShowQueueModal,
}: FooterProps) {
  return (
    <footer className="flex items-center h-25 px-8 space-x-6 bg-[#171130]">
      {/* Botón Pausar */}
      <button
        onClick={handlePauseToggle}
        className={`flex items-center space-x-3 px-6 py-3 rounded-lg border-2 transition-colors ${
          isPaused
            ? "border-white bg-white text-gray-700 hover:border-gray-200"
            : "border-accent-green bg-accent-green text-white"
        }`}
      >
        {isPaused ? <FiPlay className="w-5 h-5" /> : <FiPause className="w-5 h-5" />}
        <span className="font-medium">{isPaused ? "Reanudar" : "Pausar"}</span>
      </button>

      {/* Botón Ver Fila */}
      <button
        onClick={() => setShowQueueModal(true)}
        className="flex items-center space-x-3 px-6 py-3 rounded-lg border-2 border-white bg-white text-gray-700 hover:border-gray-200 transition-colors"
      >
        <FiUsers className="w-5 h-5" />
        <span className="font-medium">Ver en Fila</span>
        <span className="bg-primary text-white px-2 py-1 rounded-full text-sm font-bold">
          {queueCount}
        </span>
      </button>
    </footer>
  );
}