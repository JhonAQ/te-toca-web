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
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
        <span className="font-medium">Llamar</span>
      </button>

      {/* Botón Terminar Atención */}
      <button
        onClick={handleFinishAttention}
        className="flex items-center space-x-3 bg-blue-500 w-90 text-white px-6 py-4 rounded-lg hover:bg-blue-600 transition-colors shadow-md"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        <span className="font-medium">Terminar Atención</span>
      </button>

      {/* Botón Saltar Turno */}
      <button
        onClick={handleSkipTurn}
        className="flex items-center space-x-3 bg-orange-500 w-90 text-white px-6 py-4 rounded-lg hover:bg-yellow-600 transition-colors shadow-md"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="font-medium">Saltar Turno</span>
      </button>

      {/* Botón Llamar Saltado */}
      <button
        onClick={() => setShowSkippedModal(true)}
        className="flex items-center space-x-3 w-90 bg-secondary text-white px-6 py-4 rounded-lg hover:opacity-80 transition-colors shadow-md"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        <span className="font-medium">Llamar Saltado</span>
      </button>

      {/* Botón Cancelar */}
      <button
        onClick={handleCancelTicket}
        className="flex items-center bg-red-500 w-90 space-x-3 bg-accent-red text-white px-6 py-4 rounded-lg hover:bg-red-600 transition-colors shadow-md"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
        <span className="font-medium">Cancelar Ticket</span>
      </button>
    </div>
  );
}
