/**
 * Utilidades para manejo de campos JSON en la base de datos
 */

export function parseJsonField<T>(jsonString: string | null, fallback: T): T {
  if (!jsonString) return fallback;
  
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Error parsing JSON field:', error);
    return fallback;
  }
}

export function stringifyJsonField(data: any): string {
  try {
    return JSON.stringify(data);
  } catch (error) {
    console.error('Error stringifying JSON field:', error);
    return '{}';
  }
}

// Interfaces para tipos específicos
export interface TenantSettings {
  [key: string]: any;
}

export interface UserPreferences {
  notifications: boolean;
  language: string;
  [key: string]: any;
}

export interface CompanySettings {
  [key: string]: any;
}

export interface NotificationData {
  ticketId?: string;
  queueId?: string;
  enterpriseId?: string;
  [key: string]: any;
}

// Helpers específicos para campos comunes
export function parseWorkerPermissions(permissionsString: string | null): any {
  if (!permissionsString) {
    return {
      queues: [],
      actions: []
    };
  }
  
  try {
    return JSON.parse(permissionsString);
  } catch (error) {
    console.warn('Error parsing worker permissions:', error);
    return {
      queues: [],
      actions: []
    };
  }
}

export function stringifyWorkerPermissions(permissions: any): string {
  try {
    return JSON.stringify(permissions);
  } catch (error) {
    console.warn('Error stringifying worker permissions:', error);
    return '{}';
  }
}

export function parseTenantSettings(settingsString: string | null): TenantSettings {
  return parseJsonField(settingsString, {});
}

export function parseUserPreferences(preferencesString: string | null): UserPreferences {
  return parseJsonField(preferencesString, { notifications: true, language: 'es' });
}

export function parseUserPushTokens(tokensString: string | null): string[] {
  return parseJsonField(tokensString, []);
}

export function parseNotificationData(dataString: string | null): NotificationData {
  return parseJsonField(dataString, {});
}