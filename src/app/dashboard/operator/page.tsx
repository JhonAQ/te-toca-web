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
        fetchQueueDetails(),
        fetchNextTicket(),
        fetchQueueStatus(),
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

      console.log("🔍 Fetching REAL queue details for:", selectedQueue);

      const response = await fetch(
        `/api/operator/queue-details?queueId=${selectedQueue}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.clear();
          router.push("/auth/login");
          return;
        }
        if (response.status === 403) {
          console.log("❌ Access denied to queue");
          router.push("/dashboard/queue-selection");
          return;
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.queue) {
        console.log("✅ REAL Queue details loaded:", data.queue.name);
        // Actualizar estado con detalles REALES de la cola
        setSelectedQueueName(data.queue.name);
        localStorage.setItem("selectedQueueName", data.queue.name);

        // Actualizar contador real de la cola
        setQueueCount(data.queue.waitingCount || 0);
      } else {
        throw new Error(data.message || "Error al obtener detalles de la cola");
      }
    } catch (error) {
      console.error("❌ Error fetching REAL queue details:", error);
      // Si hay error accediendo a la cola real, redirigir al dashboard
      router.push("/dashboard/queue-selection");
    }
  };

  const fetchNextTicket = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const selectedQueue = localStorage.getItem("selectedQueue");

      if (!token || !selectedQueue) {
        router.push("/dashboard/queue-selection");
        return;
      }

      console.log("🎫 Fetching REAL next ticket for queue:", selectedQueue);

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
        if (data.success && data.ticket) {
          console.log("✅ REAL ticket found:", data.ticket.number);
          setCurrentTicket(data.ticket.number);
          setCustomerName(data.ticket.customerName);
        } else {
          console.log("ℹ️ No tickets in queue");
          setCurrentTicket(null);
          setCustomerName(null);
        }
      } else {
        // Si la API real falla, usar fallback de desarrollo
        if (isDevMode()) {
          console.log("🔄 Using fallback mock data for next ticket");
          const mockTicket = mockTickets[mockTicketIndex];
          setCurrentTicket(mockTicket.number);
          setCustomerName(mockTicket.customerName);
        } else {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error("❌ Error fetching REAL next ticket:", error);
      // En caso de error, usar datos mock solo en desarrollo
      if (isDevMode()) {
        console.log("🔄 Fallback to mock data due to error");
        const mockTicket = mockTickets[mockTicketIndex];
        setCurrentTicket(mockTicket.number);
        setCustomerName(mockTicket.customerName);
      }
    }
  };

  const fetchQueueStatus = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const selectedQueue = localStorage.getItem("selectedQueue");

      if (!token || !selectedQueue) {
        router.push("/dashboard/queue-selection");
        return;
      }

      console.log("📊 Fetching REAL queue status for:", selectedQueue);

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
        if (data.success) {
          console.log("✅ REAL queue status:", data.waitingCount, "people waiting");
          
          // IMPORTANTE: Actualizar contador en tiempo real
          setQueueCount(data.waitingCount || 0);
          console.log("🔄 Queue count updated to:", data.waitingCount || 0);
        }
      } else {
        // Si la API real falla, usar fallback de desarrollo
        if (isDevMode()) {
          console.log("🔄 Using fallback mock data for queue status");
          setQueueCount(Math.floor(Math.random() * 20) + 5);
        } else {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error("❌ Error fetching REAL queue status:", error);
      // En caso de error, usar datos mock solo en desarrollo
      if (isDevMode()) {
        console.log("🔄 Fallback to mock data due to error");
        setQueueCount(Math.floor(Math.random() * 20) + 5);
      }
    }
  };

  // Agregar useEffect para actualización automática del contador
  useEffect(() => {
    if (selectedQueueName) {
      // Actualizar cada 30 segundos
      const interval = setInterval(() => {
        console.log("🔄 Auto-refreshing queue status...");
        fetchQueueStatus();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [selectedQueueName]);

  const handleCallCustomer = async () => {
    if (!currentTicket) return;

    try {
      console.log("📞 Calling REAL customer for ticket:", currentTicket);

      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/operator/call-customer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ticketNumber: currentTicket }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log("✅ Customer called successfully:", data.message);
        // Mostrar información del cliente llamado
        alert(
          `Cliente llamado: ${data.ticket.customerName}\nTeléfono: ${
            data.ticket.customerPhone || "No disponible"
          }`
        );
      } else {
        throw new Error(data.message || "Error al llamar al cliente");
      }
    } catch (error) {
      console.error("❌ Error calling customer:", error);
      alert(
        "Error al llamar al cliente: " +
          (error instanceof Error ? error.message : "Error desconocido")
      );
    }
  };

  const handleFinishAttention = async () => {
    if (!currentTicket) return;

    try {
      console.log("✅ Finishing REAL attention for ticket:", currentTicket);

      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/operator/finish-attention", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ticketNumber: currentTicket }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log("✅ Attention finished successfully:", data.message);

        // Actualizar con el siguiente ticket
        if (data.nextTicket) {
          setCurrentTicket(data.nextTicket.number);
          setCustomerName(data.nextTicket.customerName);
        } else {
          setCurrentTicket(null);
          setCustomerName(null);
        }

        // Actualizar estado de la cola
        await fetchQueueStatus();
      } else {
        throw new Error(data.message || "Error al terminar atención");
      }
    } catch (error) {
      console.error("❌ Error finishing attention:", error);
      alert(
        "Error al terminar atención: " +
          (error instanceof Error ? error.message : "Error desconocido")
      );
    }
  };

  const handleSkipTurn = async () => {
    if (!currentTicket) return;

    const reason = prompt(
      "Ingresa el motivo para saltar este turno (opcional):"
    );

    try {
      console.log("⏭️ Skipping REAL turn for ticket:", currentTicket);

      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/operator/skip-turn", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ticketNumber: currentTicket,
          reason: reason || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log("✅ Turn skipped successfully:", data.message);

        // Actualizar con el siguiente ticket
        if (data.nextTicket) {
          setCurrentTicket(data.nextTicket.number);
          setCustomerName(data.nextTicket.customerName);
        } else {
          setCurrentTicket(null);
          setCustomerName(null);
        }

        // Actualizar estado de la cola
        await fetchQueueStatus();
      } else {
        throw new Error(data.message || "Error al saltar turno");
      }
    } catch (error) {
      console.error("❌ Error skipping turn:", error);
      alert(
        "Error al saltar turno: " +
          (error instanceof Error ? error.message : "Error desconocido")
      );
    }
  };

  const handleCancelTicket = async (reason: string) => {
    if (!currentTicket) return;

    try {
      console.log(
        "❌ Cancelling REAL ticket:",
        currentTicket,
        "reason:",
        reason
      );

      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/operator/cancel-ticket", {
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

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log("✅ Ticket cancelled successfully:", data.message);

        // Actualizar con el siguiente ticket
        if (data.nextTicket) {
          setCurrentTicket(data.nextTicket.number);
          setCustomerName(data.nextTicket.customerName);
        } else {
          setCurrentTicket(null);
          setCustomerName(null);
        }

        // Actualizar estado de la cola
        await fetchQueueStatus();
      } else {
        throw new Error(data.message || "Error al cancelar ticket");
      }
    } catch (error) {
      console.error("❌ Error cancelling ticket:", error);
      alert(
        "Error al cancelar ticket: " +
          (error instanceof Error ? error.message : "Error desconocido")
      );
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
        console.log(isPaused ? "▶ Reanudando atención" : "⏸Pausando atención");
      }
    } catch (error) {
      console.error("Error al cambiar estado de pausa:", error);
    }
  };

  const handleBackToQueues = () => {
    console.log("🔙 Returning to queue selection");

    // Limpiar la cola seleccionada del localStorage
    localStorage.removeItem("selectedQueue");
    localStorage.removeItem("selectedQueueName");

    // Redirigir a la selección de colas
    router.push("/dashboard/queue-selection");
  };

  const handleSelectSkippedTicket = async (
    ticketNumber: string,
    customerName: string
  ) => {
    try {
      console.log("🔄 Selecting REAL skipped ticket:", ticketNumber);

      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/operator/select-skipped-ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ticketNumber }),
      });

      console.log("📡 Select skipped ticket response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Select skipped ticket error:", errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("📊 Select skipped ticket response:", data);
      
      if (data.success) {
        console.log("✅ Skipped ticket selected successfully:", data.message);
        
        // Actualizar ticket actual
        setCurrentTicket(data.ticket.number);
        setCustomerName(data.ticket.customerName);
        
        // Cerrar modal
        setShowSkippedModal(false);

        // IMPORTANTE: Actualizar estado de la cola
        await fetchQueueStatus();
        console.log("🔄 Queue status refreshed after selecting skipped ticket");
      } else {
        throw new Error(data.message || "Error al seleccionar ticket saltado");
      }
    } catch (error) {
      console.error("❌ Error selecting skipped ticket:", error);
      alert(
        "Error al seleccionar ticket saltado: " +
          (error instanceof Error ? error.message : "Error desconocido")
      );
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
