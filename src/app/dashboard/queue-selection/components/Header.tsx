import Image from "next/image";
import { FiLogOut } from "react-icons/fi";

interface HeaderProps {
  workerName: string;
  onLogout: () => void;
}

export default function Header({ workerName, onLogout }: HeaderProps) {
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
        <div className="text-right">
          <p className="text-white text-sm">Bienvenido,</p>
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
          className="text-white hover:text-gray-300 transition-colors p-2"
          title="Cerrar sesión"
        >
          <FiLogOut size={20} />
        </button>
      </div>
    </header>
  );
}
