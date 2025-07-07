import { FiX, FiDownload } from "react-icons/fi";

interface QRCodeModalProps {
  show: boolean;
  onClose: () => void;
  phoneNumber: string;
  ticketNumber: string | null;
}

export default function QRCodeModal({
  show,
  onClose,
  phoneNumber,
  ticketNumber,
}: QRCodeModalProps) {
  if (!show) return null;

  // Generar URL de QR usando un servicio público
  const qrData = `tel:${phoneNumber}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    qrData
  )}`;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = `qr-ticket-${ticketNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-md">
        <div className="modal-header">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Código QR - {ticketNumber}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>
        </div>

        <div className="modal-body text-center">
          <div className="bg-white p-6 rounded-lg border-2 border-gray-200 mb-4 inline-block">
            <img
              src={qrUrl}
              alt="QR Code"
              className="w-64 h-64 mx-auto"
              onError={(e) => {
                e.currentTarget.src =
                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIGR5PSIuM2VtIiBzdHlsZT0iZm9udC1mYW1pbHk6c2Fucy1zZXJpZjt0ZXh0LWFuY2hvcjptaWRkbGUiPkVycm9yIGFsIGNhcmdhciBRUjwvdGV4dD48L3N2Zz4=";
              }}
            />
          </div>

          <div className="mb-4">
            <p className="text-gray-600 text-sm mb-2">
              Escanea con tu teléfono para llamar directamente a:
            </p>
            <p className="font-bold text-lg text-gray-900">{phoneNumber}</p>
          </div>

          <button
            onClick={handleDownload}
            className="btn-primary flex items-center justify-center space-x-2 w-full mb-4"
          >
            <FiDownload size={18} />
            <span>Descargar QR</span>
          </button>
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
  );
}
