/**
 * Utilidades para manejar campos JSON almacenados como strings en SQLite
 */

export function parseJsonField<T>(jsonString: string | null, defaultValue: T): T {
  if (!jsonString) return defaultValue
  
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    console.warn('Error parsing JSON field:', error)
    return defaultValue
  }
}

export function stringifyJsonField(data: any): string {
  try {
    return JSON.stringify(data)
  } catch (error) {
    console.warn('Error stringifying JSON field:', error)
    return '{}'
  }
}

// Tipos específicos para campos JSON
export interface TenantSettings {
  timezone?: string
  businessHours?: {
    start: string
    end: string
  }
  [key: string]: any
}

export interface UserPreferences {
  notifications: boolean
  language: string
  [key: string]: any
}

export interface CompanySettings {
  [key: string]: any
}

export interface NotificationData {
  ticketId?: string
  queueId?: string
  enterpriseId?: string
  [key: string]: any
}

// Helpers específicos
export function parseTenantSettings(settingsString: string | null): TenantSettings {
  return parseJsonField(settingsString, {})
}

export function parseUserPreferences(preferencesString: string | null): UserPreferences {
  return parseJsonField(preferencesString, { notifications: true, language: 'es' })
}

export function parseUserPushTokens(tokensString: string | null): string[] {
  return parseJsonField(tokensString, [])
}

export function parseNotificationData(dataString: string | null): NotificationData {
  return parseJsonField(dataString, {})
}

// Función unificada para permisos de worker
export function parseWorkerPermissions(permissionsString: string | null): any {
  if (!permissionsString) {
    return {
      queues: [],
      actions: []
    }
  }
  
  try {
    return JSON.parse(permissionsString)
  } catch (error) {
    console.warn('Error parsing worker permissions:', error)
    return {
      queues: [],
      actions: []
    }
  }
}

export function stringifyWorkerPermissions(permissions: any): string {
  try {
    return JSON.stringify(permissions)
  } catch (error) {
    console.warn('Error stringifying worker permissions:', error)
    return '{}'
  }
}
