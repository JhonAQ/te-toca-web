import { NextRequest, NextResponse } from "next/server";

// Esta función actuará como proxy para el backend real
export async function POST(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  const { tenantId } = params;
  
  try {
    const body = await request.json();
    
    // Aquí deberías configurar la URL de tu backend real
    const backendUrl = process.env.API_URL || "https://api.tetoca.com";
    
    // Realizar la solicitud al backend
    const response = await fetch(`${backendUrl}/api/auth/worker/login/${tenantId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    // Si hay un error en la respuesta del backend
    if (!response.ok) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: response.status }
      );
    }

    // Si todo va bien, devolvemos la respuesta del backend
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error en autenticación:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
