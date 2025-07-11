/**
 * Utilidades para manejo de modo desarrollo y llamadas API
 */

export function isDevMode(): boolean {
  return process.env.NODE_ENV === 'development';
}

export async function handleApiCall<T>(
  apiCall: () => Promise<Response>,
  mockData?: T,
  delay: number = 0
): Promise<T> {
  try {
    console.log('📡 Making API call...');
    const response = await apiCall();
    
    if (!response.ok) {
      console.log('❌ API call failed with status:', response.status);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success && data.success !== undefined) {
      console.log('❌ API returned success: false');
      throw new Error(data.message || 'Error en la respuesta de la API');
    }
    
    console.log('✅ API call successful');
    return data;
  } catch (error) {
    console.error('❌ API call failed:', error);
    
    // Solo usar datos mock en desarrollo Y si se especifica explícitamente
    if (isDevMode() && mockData !== undefined) {
      console.log('🔄 Using fallback mock data in development mode');
      
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      return mockData;
    }
    
    // Re-lanzar el error para que el componente lo maneje
    throw error;
  }
}

export function getMockDelay(): number {
  return isDevMode() ? Math.random() * 1000 + 500 : 0;
}

export function logDevMode(message: string, data?: any): void {
  if (isDevMode()) {
    console.log(`🚀 [DEV MODE] ${message}`, data || '');
  }
}

export function showDevWarning(): boolean {
  return isDevMode();
}