import Image from "next/image";

interface HeaderProps {
  operatorName: string;
}

export default function Header({ operatorName }: HeaderProps) {
  return (
    <header className="bg-[#171130] shadow-sm pl-4 pr-9 flex justify-between items-center">
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
        <span className="text-gray-300 font-bold text-xl">{operatorName}</span>
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
          <span className="text-gray-600 font-semibold">
            {operatorName.split(" ")[0][0] + operatorName.split(" ")[1][0]}
          </span>
        </div>
      </div>
    </header>
  );
}
