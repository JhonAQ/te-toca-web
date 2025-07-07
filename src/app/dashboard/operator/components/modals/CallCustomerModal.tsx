import { useState, useEffect } from "react";
import { FiPhone, FiCopy, FiCheck, FiX, FiUser } from "react-icons/fi";
import QRCodeModal from "./QRCodeModal";

interface CallCustomerModalProps {
  show: boolean;
  onClose: () => void;
  ticketNumber: string | null;
  customerName?: string | null;
  customerPhone?: string;
}

export default function CallCustomerModal({
  show,
  onClose,
  ticketNumber,
  customerName,
  customerPhone,
}: CallCustomerModalProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const mockPhone = customerPhone || "+57 300 123 4567";

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText(mockPhone);
      setCopied(true);
    } catch (err) {
      console.error("Error al copiar:", err);
    }
  };

  const handleCallDirect = () => {
    window.open(`tel:${mockPhone}`, "_self");
  };

  if (!show) return null;

  return (
    <>
      <div className="modal-overlay">
        <div className="modal-content max-w-lg">
          <div className="modal-header">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Llamar Cliente - {ticketNumber}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>
          </div>

          <div className="modal-body">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiPhone className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Información de Contacto
              </h3>
              <p className="text-gray-600">
                Usa cualquiera de las opciones para contactar al cliente
              </p>
            </div>

            {/* Información del cliente */}
            {customerName && (
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2">
                  <FiUser className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-600">Cliente</p>
                    <p className="text-lg font-bold text-blue-900">
                      {customerName}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Número de teléfono */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Teléfono</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mockPhone}
                  </p>
                </div>
                <button
                  onClick={handleCopyPhone}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    copied
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {copied ? (
                    <>
                      <FiCheck size={16} />
                      <span className="text-sm font-medium">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <FiCopy size={16} />
                      <span className="text-sm font-medium">Copiar</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleCallDirect}
                className="btn-success flex items-center justify-center space-x-2 w-full"
              >
                <FiPhone size={18} />
                <span>Llamar Ahora</span>
              </button>

              <button
                onClick={() => setShowQR(true)}
                className="btn-primary flex items-center justify-center space-x-2 w-full"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm6 0h2v2h-2V5zm4 0h2v2h-2V5zm-2 4h2v2h-2V9zm4-4v8h8V3h-8zm2 2h4v4h-4V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm8 2h2v2h-2v-2zm0 4h2v2h-2v-2zm4 0h2v2h-2v-2zm-4-8h2v2h-2v-2zm4 0h2v2h-2v-2z" />
                </svg>
                <span>Ver QR</span>
              </button>
            </div>
          </div>

          <div className="modal-footer">
            <button
              onClick={onClose}
              className="w-full bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      <QRCodeModal
        show={showQR}
        onClose={() => setShowQR(false)}
        phoneNumber={mockPhone}
        ticketNumber={ticketNumber}
      />
    </>
  );
}
