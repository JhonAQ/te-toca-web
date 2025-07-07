import { redirect } from "next/navigation";

export default function Dashboard() {
  // Redirección automática a la página del operario
  // En una implementación real, esto dependería del rol del usuario
  redirect("/dashboard/operator");

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Redirigiendo...
        </h1>
        <p className="text-gray-600">Cargando panel de operario</p>
      </div>
    </div>
  );
}
