import { NextRequest, NextResponse } from 'next/server';

// Configurar para ignorar SSL en desarrollo
if (process.env.NODE_ENV === 'development') {
  process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = '0';
}

async function proxyRequest(request: NextRequest, path: string[]) {
  const backendUrl = process.env.API_URL || 'http://localhost:8080';
  const targetPath = path.join('/');
  const targetUrl = `${backendUrl}/api/${targetPath}`;
  
  console.log('🔄 Proxy request:', {
    method: request.method,
    originalUrl: request.url,
    targetUrl: targetUrl,
    headers: Object.fromEntries(request.headers.entries())
  });

  try {
    // Copiar headers relevantes
    const headers: HeadersInit = {};
    
    // Copiar headers de autorización y content-type
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const contentType = request.headers.get('content-type');
    if (contentType) {
      headers['Content-Type'] = contentType;
    }

    // Preparar el body si existe
    let body: string | undefined;
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      body = await request.text();
    }

    // Realizar la petición al backend
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
    });

    console.log('📡 Backend response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    // Obtener el contenido de la respuesta
    const responseText = await response.text();
    
    // Intentar parsear como JSON, si no es posible devolver como texto
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    // Crear la respuesta con los headers CORS apropiados
    const nextResponse = NextResponse.json(responseData, {
      status: response.status,
      statusText: response.statusText,
    });

    // Agregar headers CORS
    nextResponse.headers.set('Access-Control-Allow-Origin', '*');
    nextResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    nextResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return nextResponse;

  } catch (error: any) {
    console.error('🔴 Error en proxy:', error);
    
    return NextResponse.json(
      { 
        error: 'Error de conexión con el backend',
        details: error.message,
        targetUrl: targetUrl
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return proxyRequest(request, resolvedParams.path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return proxyRequest(request, resolvedParams.path);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return proxyRequest(request, resolvedParams.path);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return proxyRequest(request, resolvedParams.path);
}

export async function OPTIONS(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
