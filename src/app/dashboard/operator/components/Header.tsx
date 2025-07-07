import Image from "next/image";
import { FiArrowLeft, FiCircle } from "react-icons/fi";

interface HeaderProps {
  operatorName: string;
  selectedQueueName: string;
  onBackToQueues: () => void;
}

export default function Header({
  operatorName,
  selectedQueueName,
  onBackToQueues,
}: HeaderProps) {
  return (
    <header className="bg-primary shadow-sm px-6 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <Image
          src="/TeTocaLogo.png"
          alt="TeToca Logo"
          width={110}
          height={70}
          priority
        />
        <div className="h-8 w-px bg-gray-600"></div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onBackToQueues}
            className="text-white hover:text-gray-300 transition-colors p-2 rounded-lg hover:bg-white/10"
            title="Volver a selección de colas"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <p className="text-gray-300 text-sm">Atendiendo</p>
            <p className="text-white font-semibold">{selectedQueueName}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <FiCircle className="w-3 h-3 text-green-400 fill-current" />
          <span className="text-gray-300 text-sm">En línea</span>
        </div>

        <div className="text-right">
          <p className="text-gray-300 text-sm">Operario</p>
          <p className="text-white font-bold text-lg">{operatorName}</p>
        </div>

        <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-lg">
            {operatorName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </span>
        </div>
      </div>
    </header>
  );
}
