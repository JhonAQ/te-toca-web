export const isDevMode = () => {
  return process.env.NEXT_PUBLIC_DEV_MODE === 'true';
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
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error en llamada API:', error);
    console.log('🔄 Fallback a datos simulados');
    return mockApiResponse(mockData, mockDelay);
  }
};
