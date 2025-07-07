import { useState, useEffect } from "react";
import { FiClock } from "react-icons/fi";

export default function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-CO", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
          <FiClock className="w-5 h-5 text-white" />
        </div>
        <div className="text-white">
          <div className="text-xl font-bold font-mono">{formatTime(time)}</div>
          <div className="text-xs text-gray-300 capitalize">
            {formatDate(time)}
          </div>
        </div>
      </div>
    </div>
  );
}