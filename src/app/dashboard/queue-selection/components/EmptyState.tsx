import { FiInbox } from "react-icons/fi";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <FiInbox className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No hay colas disponibles
      </h3>
      <p className="text-gray-500 text-center max-w-md">
        No tienes colas asignadas en este momento. Contacta a tu supervisor para
        obtener acceso a las colas.
      </p>
    </div>
  );
}
