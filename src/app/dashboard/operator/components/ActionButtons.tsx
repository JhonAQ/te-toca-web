import {
  FiPhone,
  FiCheck,
  FiArrowRight,
  FiRefreshCw,
  FiX,
} from "react-icons/fi";

interface ActionButtonsProps {
  currentTicket: string | null;
  handleCallCustomer: () => void;
  handleFinishAttention: () => void;
  handleSkipTurn: () => void;
  handleCancelTicket: () => void;
  setShowSkippedModal: (show: boolean) => void;
}

export default function ActionButtons({
  currentTicket,
  handleCallCustomer,
  handleFinishAttention,
  handleSkipTurn,
  handleCancelTicket,
  setShowSkippedModal,
}: ActionButtonsProps) {
  const hasTicket = Boolean(currentTicket);

  return (
    <div className="w-80 bg-white/5 backdrop-blur-sm border-l border-white/10 flex flex-col justify-center items-center p-8 space-y-4">
      {/* Botón Llamar */}
      <button
        onClick={handleCallCustomer}
        disabled={!hasTicket}
        className={`w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-xl font-medium transition-all duration-200 ${
          hasTicket
            ? "btn-success hover:scale-105 active:scale-95"
            : "bg-gray-600 text-gray-400 cursor-not-allowed"
        }`}
      >
        <FiPhone className="w-5 h-5" />
        <span>Llamar</span>
      </button>

      {/* Botón Terminar Atención */}
      <button
        onClick={handleFinishAttention}
        disabled={!hasTicket}
        className={`w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-xl font-medium transition-all duration-200 ${
          hasTicket
            ? "btn-info hover:scale-105 active:scale-95"
            : "bg-gray-600 text-gray-400 cursor-not-allowed"
        }`}
      >
        <FiCheck className="w-5 h-5" />
        <span>Terminar Atención</span>
      </button>

      {/* Botón Saltar Turno */}
      <button
        onClick={handleSkipTurn}
        disabled={!hasTicket}
        className={`w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-xl font-medium transition-all duration-200 ${
          hasTicket
            ? "btn-warning hover:scale-105 active:scale-95"
            : "bg-gray-600 text-gray-400 cursor-not-allowed"
        }`}
      >
        <FiArrowRight className="w-5 h-5" />
        <span>Saltar Turno</span>
      </button>

      {/* Botón Llamar Saltado */}
      <button
        onClick={() => setShowSkippedModal(true)}
        className="w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-xl font-medium transition-all duration-200 btn-primary hover:scale-105 active:scale-95"
      >
        <FiRefreshCw className="w-5 h-5" />
        <span>Llamar Saltado</span>
      </button>

      {/* Botón Cancelar */}
      <button
        onClick={handleCancelTicket}
        disabled={!hasTicket}
        className={`w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-xl font-medium transition-all duration-200 ${
          hasTicket
            ? "btn-danger hover:scale-105 active:scale-95"
            : "bg-gray-600 text-gray-400 cursor-not-allowed"
        }`}
      >
        <FiX className="w-5 h-5" />
        <span>Cancelar Ticket</span>
      </button>
    </div>
  );
}
