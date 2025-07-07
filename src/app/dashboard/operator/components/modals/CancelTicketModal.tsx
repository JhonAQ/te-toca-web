import { useState } from "react";
import { FiX, FiAlertTriangle } from "react-icons/fi";

interface CancelTicketModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  ticketNumber: string | null;
}

const cancelReasons = [
  "Cliente no se presentó",
  "Cliente canceló la cita",
  "Problema técnico",
  "Documentación incompleta",
  "Cliente no respondió llamadas",
  "Solicitud fuera de horario",
  "Otro motivo",
];

export default function CancelTicketModal({
  show,
  onClose,
  onConfirm,
  ticketNumber,
}: CancelTicketModalProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    const finalReason =
      selectedReason === "Otro motivo" ? customReason : selectedReason;

    if (!finalReason.trim()) return;

    setLoading(true);
    try {
      await onConfirm(finalReason);
      onClose();
      setSelectedReason("");
      setCustomReason("");
    } catch (error) {
      console.error("Error al cancelar ticket:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedReason("");
    setCustomReason("");
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-md">
        <div className="modal-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <FiAlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Cancelar Ticket
                </h2>
                <p className="text-sm text-gray-600">Ticket: {ticketNumber}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>
        </div>

        <div className="modal-body">
          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex">
                <FiAlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Atención</h3>
                  <p className="text-sm text-red-700 mt-1">
                    Esta acción cancelará permanentemente el ticket{" "}
                    {ticketNumber}. El cliente deberá solicitar un nuevo turno.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Selecciona la razón de cancelación:
            </label>
            <div className="space-y-2">
              {cancelReasons.map((reason) => (
                <label
                  key={reason}
                  className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="text-secondary focus:ring-secondary"
                  />
                  <span className="text-gray-900">{reason}</span>
                </label>
              ))}
            </div>
          </div>

          {selectedReason === "Otro motivo" && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Especifica el motivo:
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Describe la razón de cancelación..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary resize-none"
                rows={3}
                required
              />
            </div>
          )}
        </div>

        <div className="modal-footer">
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={
                !selectedReason ||
                (selectedReason === "Otro motivo" && !customReason.trim()) ||
                loading
              }
              className="flex-1 btn-danger disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Cancelando..." : "Confirmar Cancelación"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
