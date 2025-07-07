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
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isPaused ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1M7 7h10v10H7V7z"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          )}
        </svg>
        <span className="font-medium">{isPaused ? "Reanudar" : "Pausar"}</span>
      </button>

      {/* Botón Ver Fila */}
      <button
        onClick={() => setShowQueueModal(true)}
        className="flex items-center space-x-3 px-6 py-3 rounded-lg border-2 border-white bg-white text-gray-700 hover:border-gray-200 transition-colors"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <span className="font-medium">Ver en Fila</span>
        <span className="bg-primary text-white px-2 py-1 rounded-full text-sm font-bold">
          {queueCount}
        </span>
      </button>
    </footer>
  );
}
