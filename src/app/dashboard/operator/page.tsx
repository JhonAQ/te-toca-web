"use client";

import { useState } from "react";

import Header from "./components/Header";
import CurrentTicketPanel from "./components/CurrentTicketPanel";
import ActionButtons from "./components/ActionButtons";
import Footer from "./components/Footer";
import SkippedTicketsModal from "./components/modals/SkippedTicketsModal";
import QueueModal from "./components/modals/QueueModal";

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
      <Header operatorName={operatorName} />

      <main className="flex-1 flex">
        <CurrentTicketPanel currentTicket={currentTicket} />
        <ActionButtons
          handleCallCustomer={handleCallCustomer}
          handleFinishAttention={handleFinishAttention}
          handleSkipTurn={handleSkipTurn}
          handleCancelTicket={handleCancelTicket}
          setShowSkippedModal={setShowSkippedModal}
        />
      </main>

      <Footer
        isPaused={isPaused}
        queueCount={queueCount}
        handlePauseToggle={handlePauseToggle}
        setShowQueueModal={setShowQueueModal}
      />

      <SkippedTicketsModal
        show={showSkippedModal}
        onClose={() => setShowSkippedModal(false)}
      />

      <QueueModal
        show={showQueueModal}
        onClose={() => setShowQueueModal(false)}
      />
    </div>
  );
}