import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    
    if (!authHeader) {
      return NextResponse.json(
        { error: "Token de autorización requerido" },
        { status: 401 }
      );
    }

    const { queueId } = await request.json();

    if (!queueId) {
      return NextResponse.json(
        { error: "ID de cola requerido" },
        { status: 400 }
      );
    }

    // Aquí deberías configurar la URL de tu backend real
    const backendUrl = process.env.API_URL || "https://api.tetoca.com";
    
    // Realizar la solicitud al backend
    const response = await fetch(`${backendUrl}/api/worker/select-queue`, {
      method: "POST",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ queueId }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Error al seleccionar la cola" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error al seleccionar cola:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
