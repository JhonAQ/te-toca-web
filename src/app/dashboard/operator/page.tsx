"use client";

import { useState } from "react";
import Image from "next/image";

export default function OperatorDashboard() {
  const [currentTicket, setCurrentTicket] = useState("AB03");
  const [queueCount, setQueueCount] = useState(12);
  const [isPaused, setIsPaused] = useState(false);
  const [operatorName, setOperatorName] = useState("Juan Pérez");
  const [showSkippedModal, setShowSkippedModal] = useState(false);
  const [showQueueModal, setShowQueueModal] = useState(false);

  // Funciones para manejar las acciones del operario
  const handleCallCustomer = async () => {
    try {
      // API call para llamar al cliente
      console.log("Llamando al cliente:", currentTicket);
    } catch (error) {
      console.error("Error al llamar al cliente:", error);
    }
  };

  const handleFinishAttention = async () => {
    try {
      // API call para terminar la atención
      console.log("Terminando atención:", currentTicket);
    } catch (error) {
      console.error("Error al terminar atención:", error);
    }
  };

  const handleSkipTurn = async () => {
    try {
      // API call para saltar turno
      console.log("Saltando turno:", currentTicket);
    } catch (error) {
      console.error("Error al saltar turno:", error);
    }
  };

  const handleCancelTicket = async () => {
    try {
      // API call para cancelar ticket
      console.log("Cancelando ticket:", currentTicket);
    } catch (error) {
      console.error("Error al cancelar ticket:", error);
    }
  };

  const handlePauseToggle = async () => {
    try {
      setIsPaused(!isPaused);
      // API call para pausar/reanudar
      console.log(isPaused ? "Reanudando atención" : "Pausando atención");
    } catch (error) {
      console.error("Error al cambiar estado de pausa:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0526] flex flex-col font-sans">
      {/* Header */}
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
            <span className="text-gray-600 font-semibold">{operatorName.split(" ")[0][0] + operatorName.split(" ")[1][0]}</span>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 flex">
          {/* Panel Izquierdo - Ticket Actual */}
          <div className="flex-2/3 rounded-lg shadow-lg p-6 flex items-center justify-center">
            <div className=" rounded-lg shadow-white p-12 shadow-sm transform hover:scale-105 transition-transform">
              <div className="text-center text-white">
                <p className="text-lg font-medium mb-2">Atendiendo a:</p>
                <div className="text-6xl text-[#7E87EF] font-bold tracking-wider">
                  {currentTicket}
                </div>
              </div>
            </div>
          </div>

          {/* Panel Derecho - Botones de Acción */}
          <div className="flex-1/3 flex flex-col justify-center items-center bg-gray-300 space-y-6">
            {/* Botón Llamar */}
            <button
              onClick={handleCallCustomer}
              className="flex items-center bg-green-500 w-90 space-x-3 bg-accent-green text-white px-6 py-4 rounded-lg hover:bg-green-600 transition-colors shadow-md"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <span className="font-medium">Llamar</span>
            </button>

            {/* Botón Terminar Atención */}
            <button
              onClick={handleFinishAttention}
              className="flex items-center space-x-3 bg-blue-500 w-90 text-white px-6 py-4 rounded-lg hover:bg-blue-600 transition-colors shadow-md"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="font-medium">Terminar Atención</span>
            </button>

            {/* Botón Saltar Turno */}
            <button
              onClick={handleSkipTurn}
              className="flex items-center space-x-3 bg-orange-500 w-90 text-white px-6 py-4 rounded-lg hover:bg-yellow-600 transition-colors shadow-md"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-medium">Saltar Turno</span>
            </button>

            {/* Botón Llamar Saltado */}
            <button
              onClick={() => setShowSkippedModal(true)}
              className="flex items-center space-x-3 w-90 bg-secondary text-white px-6 py-4 rounded-lg hover:opacity-80 transition-colors shadow-md"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span className="font-medium">Llamar Saltado</span>
            </button>

            {/* Botón Cancelar */}
            <button
              onClick={handleCancelTicket}
              className="flex items-center bg-red-500 w-90 space-x-3 bg-accent-red text-white px-6 py-4 rounded-lg hover:bg-red-600 transition-colors shadow-md"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span className="font-medium">Cancelar Ticket</span>
            </button>
          </div>

      </main>
        {/* Footer */}
        <footer className="flex items-center h-25 px-8 space-x-6 bg-[#171130]">
          {/* Botón Pausar */}
          <button
            onClick={handlePauseToggle}
            className={`flex items-center space-x-3 px-6 py-3 rounded-lg border-2 transition-colors ${
              isPaused
                ? 
                "border-white bg-white text-gray-700 hover:border-gray-200"
                : 
                "border-accent-green bg-accent-green text-white"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isPaused ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1M7 7h10v10H7V7z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              )}
            </svg>
            <span className="font-medium">
              {isPaused ? "Reanudar" : "Pausar"}
            </span>
          </button>

          {/* Botón Ver Fila */}
          <button
            onClick={() => setShowQueueModal(true)}
            className="flex items-center space-x-3 px-6 py-3 rounded-lg border-2 border-white bg-white text-gray-700 hover:border-gray-200 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className="font-medium">Ver en Fila</span>
            <span className="bg-primary text-white px-2 py-1 rounded-full text-sm font-bold">
              {queueCount}
            </span>
          </button>
        </footer>

      {/* Modal para Tickets Saltados */}
      {showSkippedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Tickets Saltados
            </h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center p-2 bg-gray-100 rounded">
                <span className="text-gray-900">B12</span>
                <button className="text-accent-green hover:text-green-600 font-medium">
                  Llamar
                </button>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-100 rounded">
                <span className="text-gray-900">C05</span>
                <button className="text-accent-green hover:text-green-600 font-medium">
                  Llamar
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowSkippedModal(false)}
              className="w-full bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal para Ver Fila */}
      {showQueueModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Tickets en Fila
            </h2>
            <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
              {["D15", "E22", "F01", "G08", "H14"].map((ticket, index) => (
                <div
                  key={ticket}
                  className="flex justify-between items-center p-2 bg-gray-100 rounded"
                >
                  <span className="font-medium text-gray-900">{ticket}</span>
                  <span className="text-sm text-gray-600">#{index + 1}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowQueueModal(false)}
              className="w-full bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
