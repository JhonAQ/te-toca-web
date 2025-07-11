"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isDevMode, handleApiCall } from "@/utils/devMode";

import Header from "./components/Header";
import CurrentTicketPanel from "./components/CurrentTicketPanel";
import ActionButtons from "./components/ActionButtons";
import Footer from "./components/Footer";
import LiveClock from "./components/LiveClock";
import SkippedTicketsModal from "./components/modals/SkippedTicketsModal";
import QueueModal from "./components/modals/QueueModal";

export default function OperatorDashboard() {
  const router = useRouter();
  const [currentTicket, setCurrentTicket] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [queueCount, setQueueCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [operatorName, setOperatorName] = useState("");
  const [selectedQueueName, setSelectedQueueName] = useState("");
  const [showSkippedModal, setShowSkippedModal] = useState(false);
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Datos mock para desarrollo
  const mockTickets = [
    { number: "AB03", customerName: "María González" },
    { number: "CD15", customerName: "Pedro Ramírez" },
    { number: "EF22", customerName: "Ana López" },
    { number: "GH08", customerName: "Carlos Mendoza" },
    { number: "IJ14", customerName: "Laura Herrera" },
  ];
  const [mockTicketIndex, setMockTicketIndex] = useState(0);

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
      await Promise.all([
        fetchNextTicket(),
        fetchQueueStatus(),
        fetchQueueDetails()
      ]);
    } catch (error) {
      console.error("Error al inicializar workspace:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQueueDetails = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const selectedQueue = localStorage.getItem("selectedQueue");
      
      if (!token || !selectedQueue) {
        router.push("/dashboard/queue-selection");
        return;
      }

      console.log("🔍 Fetching queue details for:", selectedQueue);

      const response = await fetch(`/api/operator/queue-details?queueId=${selectedQueue}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.clear();
          router.push("/auth/login");
          return;
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log("✅ Queue details loaded:", data.queue?.name);
        // Actualizar estado con detalles reales de la cola
        if (data.queue?.name) {
          setSelectedQueueName(data.queue.name);
          localStorage.setItem("selectedQueueName", data.queue.name);
        }
      }
    } catch (error) {
      console.error("❌ Error fetching queue details:", error);
    }
  };

  const fetchNextTicket = async () => {
    try {
      const data = await handleApiCall(
        () => {
          const token = localStorage.getItem("authToken");
          const selectedQueue = localStorage.getItem("selectedQueue");
          return fetch(`/api/operator/next-ticket?queueId=${selectedQueue}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        },
        {
          ticket: {
            number: mockTickets[mockTicketIndex].number,
            customerName: mockTickets[mockTicketIndex].customerName,
          },
        },
        300
      );

      setCurrentTicket(data.ticket?.number || null);
      setCustomerName(data.ticket?.customerName || null);
    } catch (error) {
      console.error("Error al obtener siguiente ticket:", error);
    }
  };

  const fetchQueueStatus = async () => {
    try {
      const data = await handleApiCall(
        () => {
          const token = localStorage.getItem("authToken");
          const selectedQueue = localStorage.getItem("selectedQueue");
          return fetch(`/api/operator/queue-status?queueId=${selectedQueue}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        },
        { waitingCount: Math.floor(Math.random() * 20) + 5 },
        300
      );

      setQueueCount(data.waitingCount || 0);
    } catch (error) {
      console.error("Error al obtener estado de cola:", error);
    }
  };

  const handleCallCustomer = async () => {
    if (!currentTicket) return;

    try {
      await handleApiCall(
        () => {
          const token = localStorage.getItem("authToken");
          return fetch("/api/operator/call-customer", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ ticketNumber: currentTicket }),
          });
        },
        { success: true },
        500
      );

      if (isDevMode()) {
        console.log(`📞 Llamando al cliente ${currentTicket}`);
      }
    } catch (error) {
      console.error("Error al llamar al cliente:", error);
    }
  };

  const handleFinishAttention = async () => {
    if (!currentTicket) return;

    try {
      await handleApiCall(
        () => {
          const token = localStorage.getItem("authToken");
          return fetch("/api/operator/finish-attention", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ ticketNumber: currentTicket }),
          });
        },
        { success: true },
        500
      );

      if (isDevMode()) {
        console.log(`✅ Atención terminada para ${currentTicket}`);
        const nextIndex = (mockTicketIndex + 1) % mockTickets.length;
        setMockTicketIndex(nextIndex);
      }

      await fetchNextTicket();
      await fetchQueueStatus();
    } catch (error) {
      console.error("Error al terminar atención:", error);
    }
  };

  const handleSkipTurn = async () => {
    if (!currentTicket) return;

    try {
      await handleApiCall(
        () => {
          const token = localStorage.getItem("authToken");
          return fetch("/api/operator/skip-turn", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ ticketNumber: currentTicket }),
          });
        },
        { success: true },
        500
      );

      if (isDevMode()) {
        console.log(`⏭️ Turno saltado para ${currentTicket}`);
        const nextIndex = (mockTicketIndex + 1) % mockTickets.length;
        setMockTicketIndex(nextIndex);
      }

      await fetchNextTicket();
      await fetchQueueStatus();
    } catch (error) {
      console.error("Error al saltar turno:", error);
    }
  };

  const handleCancelTicket = async (reason: string) => {
    if (!currentTicket) return;

    try {
      await handleApiCall(
        () => {
          const token = localStorage.getItem("authToken");
          return fetch("/api/operator/cancel-ticket", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              ticketNumber: currentTicket,
              reason: reason,
            }),
          });
        },
        { success: true },
        500
      );

      if (isDevMode()) {
        console.log(`❌ Ticket cancelado ${currentTicket} - Razón: ${reason}`);
        const nextIndex = (mockTicketIndex + 1) % mockTickets.length;
        setMockTicketIndex(nextIndex);
      }

      await fetchNextTicket();
      await fetchQueueStatus();
    } catch (error) {
      console.error("Error al cancelar ticket:", error);
    }
  };

  const handlePauseToggle = async () => {
    try {
      await handleApiCall(
        () => {
          const token = localStorage.getItem("authToken");
          return fetch("/api/operator/toggle-pause", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ isPaused: !isPaused }),
          });
        },
        { success: true },
        300
      );

      setIsPaused(!isPaused);
      if (isDevMode()) {
        console.log(
          isPaused ? "▶ Reanudando atención" : "⏸Pausando atención"
        );
      }
    } catch (error) {
      console.error("Error al cambiar estado de pausa:", error);
    }
  };

  const handleBackToQueues = () => {
    router.push("/dashboard/queue-selection");
  };

  const handleSelectSkippedTicket = async (
    ticketNumber: string,
    customerName: string
  ) => {
    try {
      await handleApiCall(
        () => {
          const token = localStorage.getItem("authToken");
          return fetch("/api/operator/select-skipped-ticket", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ ticketNumber }),
          });
        },
        { success: true, ticket: { number: ticketNumber, customerName } },
        500
      );

      setCurrentTicket(ticketNumber);
      setCustomerName(customerName);

      if (isDevMode()) {
        console.log(`🔄 Ticket saltado seleccionado: ${ticketNumber}`);
      }
    } catch (error) {
      console.error("Error al seleccionar ticket saltado:", error);
    }
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
    <div className="h-screen bg-primary-dark flex flex-col font-sans overflow-hidden relative">
      <Header
        operatorName={operatorName}
        selectedQueueName={selectedQueueName}
        onBackToQueues={handleBackToQueues}
      />

      {/* Contenido principal */}
      <main
        className={`flex-1 flex min-h-0 transition-all duration-300 ${
          isPaused ? "blur-sm" : ""
        }`}
      >
        {/* Panel central - Ticket actual */}
        <div className="flex-1 flex relative">
          {/* Reloj flotante */}
          <div className="absolute top-6 right-86 z-10">
            <LiveClock />
          </div>

          <CurrentTicketPanel
            currentTicket={currentTicket}
            customerName={customerName}
            isPaused={isPaused}
          />
          <ActionButtons
            currentTicket={currentTicket}
            customerName={customerName}
            handleCallCustomer={handleCallCustomer}
            handleFinishAttention={handleFinishAttention}
            handleSkipTurn={handleSkipTurn}
            handleCancelTicket={handleCancelTicket}
            setShowSkippedModal={setShowSkippedModal}
            isPaused={isPaused}
          />
        </div>
      </main>

      <div
        className={`transition-all duration-300 ${isPaused ? "blur-sm" : ""}`}
      >
        <Footer
          isPaused={isPaused}
          queueCount={queueCount}
          handlePauseToggle={handlePauseToggle}
          setShowQueueModal={setShowQueueModal}
        />
      </div>

      {/* Overlay de pausa */}
      {isPaused && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-20">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              Atención Pausada
            </h2>
            <p className="text-gray-300 mb-6">
              Presiona el botón de reanudar cuando estés listo
            </p>
            <button
              onClick={handlePauseToggle}
              className="btn-primary flex items-center space-x-2 mx-auto"
            >
              <span>Reanudar Atención</span>
            </button>
          </div>
        </div>
      )}

      <SkippedTicketsModal
        show={showSkippedModal}
        onClose={() => setShowSkippedModal(false)}
        onSelectTicket={handleSelectSkippedTicket}
      />

      <QueueModal
        show={showQueueModal}
        onClose={() => setShowQueueModal(false)}
      />

      {isDevMode() && (
        <div className="fixed bottom-4 right-4 bg-orange-500 text-white px-3 py-2 rounded-lg text-sm z-30">
          🚀 Modo Desarrollo
        </div>
      )}
    </div>
  );
}
