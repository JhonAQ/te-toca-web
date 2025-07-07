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
  customerName: string | null;
  handleCallCustomer: () => void;
  handleFinishAttention: () => void;
  handleSkipTurn: () => void;
  handleCancelTicket: (reason: string) => void;
  setShowSkippedModal: (show: boolean) => void;
  isPaused: boolean;
}

export default function ActionButtons({
  currentTicket,
  customerName,
  handleCallCustomer,
  handleFinishAttention,
  handleSkipTurn,
  handleCancelTicket,
  setShowSkippedModal,
  isPaused,
}: ActionButtonsProps) {
  const [showCallModal, setShowCallModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const hasTicket = Boolean(currentTicket);
  const isDisabled = isPaused || !hasTicket;

  const handleCallClick = () => {
    if (hasTicket && !isPaused) {
      setShowCallModal(true);
      handleCallCustomer();
    }
  };

  const handleCancelClick = () => {
    if (hasTicket && !isPaused) {
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
          disabled={isDisabled}
          className={`w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-xl font-medium transition-all duration-200 ${
            !isDisabled
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
          disabled={isDisabled}
          className={`w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-xl font-medium transition-all duration-200 ${
            !isDisabled
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
          disabled={isDisabled}
          className={`w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-xl font-medium transition-all duration-200 ${
            !isDisabled
              ? "btn-warning hover:scale-105 active:scale-95"
              : "bg-gray-600 text-gray-400 cursor-not-allowed"
          }`}
        >
          <FiArrowRight className="w-5 h-5" />
          <span>Saltar Turno</span>
        </button>

        {/* Botón Retomar Saltado */}
        <button
          onClick={() => setShowSkippedModal(true)}
          disabled={isPaused}
          className={`w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-xl font-medium transition-all duration-200 ${
            !isPaused
              ? "btn-primary hover:scale-105 active:scale-95"
              : "bg-gray-600 text-gray-400 cursor-not-allowed"
          }`}
        >
          <FiRefreshCw className="w-5 h-5" />
          <span>Retomar Saltado</span>
        </button>

        {/* Botón Cancelar */}
        <button
          onClick={handleCancelClick}
          disabled={isDisabled}
          className={`w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-xl font-medium transition-all duration-200 ${
            !isDisabled
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
        customerName={customerName}
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
