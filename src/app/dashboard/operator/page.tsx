"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import Header from "./components/Header";
import CurrentTicketPanel from "./components/CurrentTicketPanel";
import ActionButtons from "./components/ActionButtons";
import Footer from "./components/Footer";
import SkippedTicketsModal from "./components/modals/SkippedTicketsModal";
import QueueModal from "./components/modals/QueueModal";

export default function OperatorDashboard() {
  const router = useRouter();
  const [currentTicket, setCurrentTicket] = useState<string | null>(null);
  const [queueCount, setQueueCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [operatorName, setOperatorName] = useState("");
  const [selectedQueueName, setSelectedQueueName] = useState("");
  const [showSkippedModal, setShowSkippedModal] = useState(false);
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const selectedQueue = localStorage.getItem("selectedQueue");

    if (!token || !selectedQueue) {
      router.push("/dashboard/queue-selection");
      return;
    }

    const savedOperatorName = localStorage.getItem("workerName") || "Operario";
    const savedQueueName =
      localStorage.getItem("selectedQueueName") || "Cola Seleccionada";

    setOperatorName(savedOperatorName);
    setSelectedQueueName(savedQueueName);

    initializeWorkspace();
  }, [router]);

  const initializeWorkspace = async () => {
    try {
      await fetchNextTicket();
      await fetchQueueStatus();
    } catch (error) {
      console.error("Error al inicializar workspace:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNextTicket = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const selectedQueue = localStorage.getItem("selectedQueue");

      const response = await fetch(
        `/api/operator/next-ticket?queueId=${selectedQueue}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCurrentTicket(data.ticket?.number || null);
      }
    } catch (error) {
      console.error("Error al obtener siguiente ticket:", error);
      // Datos de ejemplo para desarrollo
      setCurrentTicket("AB03");
    }
  };

  const fetchQueueStatus = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const selectedQueue = localStorage.getItem("selectedQueue");

      const response = await fetch(
        `/api/operator/queue-status?queueId=${selectedQueue}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setQueueCount(data.waitingCount || 0);
      }
    } catch (error) {
      console.error("Error al obtener estado de cola:", error);
      // Datos de ejemplo para desarrollo
      setQueueCount(12);
    }
  };

  // Funciones para manejar las acciones del operario
  const handleCallCustomer = async () => {
    if (!currentTicket) return;

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/operator/call-customer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ticketNumber: currentTicket }),
      });

      if (response.ok) {
        console.log("Cliente llamado exitosamente");
      }
    } catch (error) {
      console.error("Error al llamar al cliente:", error);
    }
  };

  const handleFinishAttention = async () => {
    if (!currentTicket) return;

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/operator/finish-attention", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ticketNumber: currentTicket }),
      });

      if (response.ok) {
        console.log("Atención terminada exitosamente");
        await fetchNextTicket();
        await fetchQueueStatus();
      }
    } catch (error) {
      console.error("Error al terminar atención:", error);
    }
  };

  const handleSkipTurn = async () => {
    if (!currentTicket) return;

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/operator/skip-turn", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ticketNumber: currentTicket }),
      });

      if (response.ok) {
        console.log("Turno saltado exitosamente");
        await fetchNextTicket();
        await fetchQueueStatus();
      }
    } catch (error) {
      console.error("Error al saltar turno:", error);
    }
  };

  const handleCancelTicket = async () => {
    if (!currentTicket) return;

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/operator/cancel-ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ticketNumber: currentTicket }),
      });

      if (response.ok) {
        console.log("Ticket cancelado exitosamente");
        await fetchNextTicket();
        await fetchQueueStatus();
      }
    } catch (error) {
      console.error("Error al cancelar ticket:", error);
    }
  };

  const handlePauseToggle = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/operator/toggle-pause", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isPaused: !isPaused }),
      });

      if (response.ok) {
        setIsPaused(!isPaused);
        console.log(isPaused ? "Reanudando atención" : "Pausando atención");
      }
    } catch (error) {
      console.error("Error al cambiar estado de pausa:", error);
    }
  };

  const handleBackToQueues = () => {
    router.push("/dashboard/queue-selection");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-white">Preparando workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-dark flex flex-col font-sans">
      <Header
        operatorName={operatorName}
        selectedQueueName={selectedQueueName}
        onBackToQueues={handleBackToQueues}
      />

      <main className="flex-1 flex">
        <CurrentTicketPanel currentTicket={currentTicket} isPaused={isPaused} />
        <ActionButtons
          currentTicket={currentTicket}
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
