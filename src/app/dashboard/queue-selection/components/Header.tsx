import Image from "next/image";
import { FiLogOut, FiRefreshCw } from "react-icons/fi";

interface HeaderProps {
  workerName: string;
  onLogout: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function Header({
  workerName,
  onLogout,
  onRefresh,
  isRefreshing = false,
}: HeaderProps) {
  const tenantName = localStorage.getItem("tenantName") || "Sistema";

  return (
    <header className="bg-primary shadow-sm px-6 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <Image
          src="/TeTocaLogo.png"
          alt="TeToca Logo"
          width={110}
          height={70}
          priority
        />
        <div className="text-white/80 text-sm">
          <span>{tenantName}</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="text-white hover:text-gray-300 transition-colors p-2 rounded-lg hover:bg-white/10 disabled:opacity-50"
            title="Actualizar colas"
          >
            <FiRefreshCw
              className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </button>
        )}

        <div className="text-right">
          <p className="text-gray-300 text-sm">Bienvenido,</p>
          <p className="text-white font-bold text-lg">{workerName}</p>
        </div>

        <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-lg">
            {workerName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </span>
        </div>

        <button
          onClick={onLogout}
          className="text-white hover:text-gray-300 transition-colors p-2 rounded-lg hover:bg-white/10"
          title="Cerrar sesión"
        >
          <FiLogOut size={20} />
        </button>
      </div>
    </header>
  );
}