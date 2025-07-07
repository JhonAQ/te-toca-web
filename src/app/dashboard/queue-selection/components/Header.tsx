import Image from "next/image";
import { FiLogOut, FiRefreshCw } from "react-icons/fi";
import { useState } from "react";

interface HeaderProps {
  workerName: string;
  onLogout: () => void;
}

export default function Header({ workerName, onLogout }: HeaderProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simular refresh
    await new Promise((resolve) => setTimeout(resolve, 1000));
    window.location.reload();
  };

  return (
    <header className="bg-primary shadow-sm px-6 py-4 flex justify-between items-center">
      <div className="flex items-center">
        <Image
          src="/TeTocaLogo.png"
          alt="TeToca Logo"
          width={110}
          height={70}
          priority
        />
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="text-white hover:text-gray-300 transition-colors p-2 rounded-lg hover:bg-white/10"
          title="Actualizar colas"
        >
          <FiRefreshCw
            className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </button>

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
