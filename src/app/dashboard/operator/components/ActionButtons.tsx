import { useState } from "react";
import {
  FiPhone,
  FiCheck,
  FiArrowRight,
  FiRefreshCw,
  FiX,
} from "react-icons/fi";
import CallCustomerModal from "./modals/CallCustomerModal";
import CancelTicketModal from "./modals/CancelTicketModal";

interface ActionButtonsProps {
  currentTicket: string | null;
  handleCallCustomer: () => void;
  handleFinishAttention: () => void;
  handleSkipTurn: () => void;
  handleCancelTicket: (reason: string) => void;
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
  const [showCallModal, setShowCallModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const hasTicket = Boolean(currentTicket);

  const handleCallClick = () => {
    if (hasTicket) {
      setShowCallModal(true);
      handleCallCustomer();
    }
  };

  const handleCancelClick = () => {
    if (hasTicket) {
      setShowCancelModal(true);
    }
  };

  const handleConfirmCancel = async (reason: string) => {
    await handleCancelTicket(reason);
    setShowCancelModal(false);
  };

  return (
    <>
      <div className="w-80 bg-white/5 backdrop-blur-sm border-l border-white/10 flex flex-col justify-center items-center p-8 space-y-4">
        {/* Botón Llamar */}
        <button
          onClick={handleCallClick}
          disabled={!hasTicket}
          className={`w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-xl font-medium transition-all duration-200 ${
            hasTicket
              ? "btn-success hover:scale-105 active:scale-95"
              : "bg-gray-600 text-gray-400 cursor-not-allowed"
          }`}
        >
          <FiPhone className="w-5 h-5" />
          <span>Llamar Cliente</span>
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
          onClick={handleCancelClick}
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

      <CallCustomerModal
        show={showCallModal}
        onClose={() => setShowCallModal(false)}
        ticketNumber={currentTicket}
      />

      <CancelTicketModal
        show={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
        ticketNumber={currentTicket}
      />
    </>
  );
}
