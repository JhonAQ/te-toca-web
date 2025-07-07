interface QueueModalProps {
  show: boolean;
  onClose: () => void;
}

export default function QueueModal({ show, onClose }: QueueModalProps) {
  if (!show) return null;

  const ticketsInQueue = ["D15", "E22", "F01", "G08", "H14"];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md">
        <h2 className="text-xl font-bold mb-4 text-gray-900">
          Tickets en Fila
        </h2>
        <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
          {ticketsInQueue.map((ticket, index) => (
            <div
              key={ticket}
              className="flex justify-between items-center p-2 bg-gray-100 rounded"
            >
              <span className="font-medium text-gray-900">{ticket}</span>
              <span className="text-sm text-gray-600">#{index + 1}</span>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="w-full bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
