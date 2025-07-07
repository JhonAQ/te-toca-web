interface CurrentTicketPanelProps {
  currentTicket: string;
}

export default function CurrentTicketPanel({
  currentTicket,
}: CurrentTicketPanelProps) {
  return (
    <div className="flex-2/3 rounded-lg shadow-lg flex items-center justify-center">
      <div className="rounded-lg shadow-gray-400 p-17 border-gray-400 border-2  shadow-sm transform hover:scale-105 transition-transform">
        <div className="text-center text-white">
          <p className="text-lg font-medium mb-2">Atendiendo a:</p>
          <div className="text-6xl text-[#7E87EF] font-bold tracking-wider">
            {currentTicket}
          </div>
        </div>
      </div>
    </div>
  );
}
