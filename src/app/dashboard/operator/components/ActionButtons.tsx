import { FiPhone, FiCheck, FiArrowRight, FiRefreshCw, FiX } from "react-icons/fi";

interface ActionButtonsProps {
  handleCallCustomer: () => void;
  handleFinishAttention: () => void;
  handleSkipTurn: () => void;
  handleCancelTicket: () => void;
  setShowSkippedModal: (show: boolean) => void;
}

export default function ActionButtons({
  handleCallCustomer,
  handleFinishAttention,
  handleSkipTurn,
  handleCancelTicket,
  setShowSkippedModal,
}: ActionButtonsProps) {
  return (
    <div className="flex-1/4 flex flex-col justify-center items-center bg-gray-300 space-y-6">
      {/* Botón Llamar */}
      <button
        onClick={handleCallCustomer}
        className="flex items-center bg-green-500 w-90 space-x-3 bg-accent-green text-white px-6 py-4 rounded-lg hover:bg-green-600 transition-colors shadow-md"
      >
        <FiPhone className="w-6 h-6" />
        <span className="font-medium">Llamar</span>
      </button>

      {/* Botón Terminar Atención */}
      <button
        onClick={handleFinishAttention}
        className="flex items-center space-x-3 bg-blue-500 w-90 text-white px-6 py-4 rounded-lg hover:bg-blue-600 transition-colors shadow-md"
      >
        <FiCheck className="w-6 h-6" />
        <span className="font-medium">Terminar Atención</span>
      </button>

      {/* Botón Saltar Turno */}
      <button
        onClick={handleSkipTurn}
        className="flex items-center space-x-3 bg-orange-500 w-90 text-white px-6 py-4 rounded-lg hover:bg-yellow-600 transition-colors shadow-md"
      >
        <FiArrowRight className="w-6 h-6" />
        <span className="font-medium">Saltar Turno</span>
      </button>

      {/* Botón Llamar Saltado */}
      <button
        onClick={() => setShowSkippedModal(true)}
        className="flex items-center space-x-3 w-90 bg-secondary text-white px-6 py-4 rounded-lg hover:opacity-80 transition-colors shadow-md"
      >
        <FiRefreshCw className="w-6 h-6" />
        <span className="font-medium">Llamar Saltado</span>
      </button>

      {/* Botón Cancelar */}
      <button
        onClick={handleCancelTicket}
        className="flex items-center bg-red-500 w-90 space-x-3 bg-accent-red text-white px-6 py-4 rounded-lg hover:bg-red-600 transition-colors shadow-md"
      >
        <FiX className="w-6 h-6" />
        <span className="font-medium">Cancelar Ticket</span>
      </button>
    </div>
  );
}