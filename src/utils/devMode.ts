export const isDevMode = () => {
  return process.env.NEXT_PUBLIC_DEV_MODE === 'true';
};

export const getApiBaseUrl = () => {
  // En desarrollo, usar HTTP, en producción HTTPS
  if (isDevMode()) {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'https://api.tetoca.com';
};

export const getTenantId = () => {
  return localStorage.getItem('tenantId') || process.env.DEFAULT_TENANT_ID || 'default';
};

export const mockApiResponse = <T>(data: T, delay: number = 500): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

export const handleApiCall = async <T>(
  apiCall: () => Promise<Response>,
  mockData: T,
  mockDelay: number = 500
): Promise<T> => {
  if (isDevMode()) {
    console.log('🚀 Modo desarrollo: usando datos simulados');
    return mockApiResponse(mockData, mockDelay);
  }

  try {
    const response = await apiCall();
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error en llamada API:', error);
    throw error;
  }
};

// Utilidades para llamadas API específicas del operador
export const operatorApiCall = async <T>(
  endpoint: string,
  options: RequestInit = {},
  mockData?: T
): Promise<T> => {
  const token = localStorage.getItem('authToken');
  const tenantId = getTenantId();
  const baseUrl = getApiBaseUrl();

  if (!token) {
    throw new Error('Token de autenticación no encontrado');
  }

  const url = `${baseUrl}/api/tenants/${tenantId}/operator${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (isDevMode() && mockData) {
    console.log(`🚀 Mock API call to: ${endpoint}`);
    return mockApiResponse(mockData, 500);
  }

  const response = await fetch(url, defaultOptions);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
  }

  // Si es 204 No Content, retornamos un objeto vacío
  if (response.status === 204) {
    return {} as T;
  }

  return await response.json();
};
