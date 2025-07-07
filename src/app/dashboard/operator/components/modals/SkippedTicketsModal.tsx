interface SkippedTicketsModalProps {
  show: boolean;
  onClose: () => void;
}

export default function SkippedTicketsModal({
  show,
  onClose,
}: SkippedTicketsModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md">
        <h2 className="text-xl font-bold mb-4 text-gray-900">
          Tickets Saltados
        </h2>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center p-2 bg-gray-100 rounded">
            <span className="text-gray-900">B12</span>
            <button className="text-accent-green hover:text-green-600 font-medium">
              Llamar
            </button>
          </div>
          <div className="flex justify-between items-center p-2 bg-gray-100 rounded">
            <span className="text-gray-900">C05</span>
            <button className="text-accent-green hover:text-green-600 font-medium">
              Llamar
            </button>
          </div>
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
