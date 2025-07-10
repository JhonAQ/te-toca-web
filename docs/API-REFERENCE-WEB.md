# API Reference - TeToca Web (Operadores)

## Descripción General

Esta documentación describe todas las APIs REST necesarias para el frontend web de operadores de TeToca. El sistema es multitenant donde cada empresa tiene su propio workspace de datos, colas y trabajadores.

## Arquitectura Multitenant

- **Empresa (Tenant)**: Cada empresa tiene su propio espacio de datos
- **Trabajadores/Operarios**: Pertenecen a una empresa específica
- **Colas**: Pertenecen a una empresa, los operarios solo pueden gestionar colas de su empresa
- **Tickets**: Pertenecen a una cola específica de una empresa

## Autenticación

Todas las APIs (excepto login) requieren el header:
```
Authorization: Bearer <token>
```

## Endpoints

### 1. Autenticación

#### POST /api/auth/worker/login/{tenantId}

Autentica un operario en una empresa específica.

**URL**: `/api/auth/worker/login/{tenantId}`  
**Método**: POST  
**Descripción**: Inicia sesión de un operario en el sistema

**Parámetros de URL**:
- `tenantId` (string): ID de la empresa/tenant

**Request Body**:
```json
{
  "username": "string",
  "password": "string"
}
```

**Response Success (200)**:
```json
{
  "token": "string",
  "user": {
    "id": "string",
    "name": "string",
    "username": "string",
    "role": "operator",
    "tenantId": "string",
    "tenantName": "string",
    "permissions": ["string"],
    "isActive": true
  }
}
```

**Response Error (401)**:
```json
{
  "error": "Credenciales inválidas"
}
```

**Response Error (404)**:
```json
{
  "error": "Tenant no encontrado"
}
```

---

### 2. Gestión de Colas

#### GET /api/worker/queues

Obtiene todas las colas disponibles para el operario autenticado.

**URL**: `/api/worker/queues`  
**Método**: GET  
**Descripción**: Lista las colas asignadas al operario según su empresa

**Headers**:
```
Authorization: Bearer <token>
```

**Response Success (200)**:
```json
{
  "queues": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "waitingCount": 0,
      "averageWaitTime": 0,
      "isActive": true,
      "priority": "low|medium|high",
      "category": "string",
      "tenantId": "string",
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601"
    }
  ],
  "stats": {
    "totalQueues": 0,
    "totalWaiting": 0,
    "averageWaitTime": 0,
    "activeOperators": 0
  }
}
```

**Response Error (401)**:
```json
{
  "error": "Token de autorización requerido"
}
```

#### POST /api/worker/select-queue

Selecciona una cola específica para trabajar.

**URL**: `/api/worker/select-queue`  
**Método**: POST  
**Descripción**: Asigna al operario a una cola específica

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "queueId": "string"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Cola seleccionada exitosamente",
  "queue": {
    "id": "string",
    "name": "string",
    "description": "string"
  }
}
```

**Response Error (403)**:
```json
{
  "error": "No tienes permisos para acceder a esta cola"
}
```

**Response Error (404)**:
```json
{
  "error": "Cola no encontrada"
}
```

---

### 3. Gestión de Operaciones

#### GET /api/operator/next-ticket

Obtiene el siguiente ticket en la cola del operario.

**URL**: `/api/operator/next-ticket`  
**Método**: GET  
**Descripción**: Obtiene el próximo ticket a atender en la cola asignada

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `queueId` (string): ID de la cola

**Response Success (200)**:
```json
{
  "ticket": {
    "id": "string",
    "number": "string",
    "customerName": "string",
    "customerPhone": "string",
    "customerEmail": "string",
    "serviceType": "string",
    "priority": "normal|priority",
    "createdAt": "ISO8601",
    "estimatedWaitTime": 0,
    "queueId": "string",
    "status": "waiting|called|in_progress"
  }
}
```

**Response Success (204)** - No hay tickets:
```json
{
  "ticket": null,
  "message": "No hay tickets en espera"
}
```

#### GET /api/operator/queue-status

Obtiene el estado actual de la cola.

**URL**: `/api/operator/queue-status`  
**Método**: GET  
**Descripción**: Obtiene estadísticas y estado de la cola asignada

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `queueId` (string): ID de la cola

**Response Success (200)**:
```json
{
  "waitingCount": 0,
  "averageWaitTime": 0,
  "totalProcessedToday": 0,
  "queueStatus": "active|paused|closed",
  "upcomingTickets": [
    {
      "number": "string",
      "customerName": "string",
      "estimatedTime": 0,
      "priority": "normal|priority"
    }
  ]
}
```

#### POST /api/operator/call-customer

Llama a un cliente específico.

**URL**: `/api/operator/call-customer`  
**Método**: POST  
**Descripción**: Marca un ticket como "llamado" y notifica al cliente

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "ticketNumber": "string"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Cliente llamado exitosamente",
  "ticket": {
    "id": "string",
    "number": "string",
    "status": "called",
    "calledAt": "ISO8601"
  }
}
```

#### POST /api/operator/finish-attention

Termina la atención de un ticket.

**URL**: `/api/operator/finish-attention`  
**Método**: POST  
**Descripción**: Marca un ticket como completado y libera al operario

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "ticketNumber": "string",
  "notes": "string (opcional)",
  "serviceRating": "1-5 (opcional)"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Atención terminada exitosamente",
  "ticket": {
    "id": "string",
    "number": "string",
    "status": "completed",
    "completedAt": "ISO8601",
    "serviceTime": 0
  }
}
```

#### POST /api/operator/skip-turn

Salta el turno de un cliente.

**URL**: `/api/operator/skip-turn`  
**Método**: POST  
**Descripción**: Salta un ticket y lo marca como "saltado"

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "ticketNumber": "string",
  "reason": "string (opcional)"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Turno saltado exitosamente",
  "ticket": {
    "id": "string",
    "number": "string",
    "status": "skipped",
    "skippedAt": "ISO8601",
    "reason": "string"
  }
}
```

#### POST /api/operator/cancel-ticket

Cancela un ticket permanentemente.

**URL**: `/api/operator/cancel-ticket`  
**Método**: POST  
**Descripción**: Cancela un ticket y lo marca como "cancelado"

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "ticketNumber": "string",
  "reason": "string"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Ticket cancelado exitosamente",
  "ticket": {
    "id": "string",
    "number": "string",
    "status": "cancelled",
    "cancelledAt": "ISO8601",
    "reason": "string"
  }
}
```

#### POST /api/operator/toggle-pause

Pausa/reanuda la atención del operario.

**URL**: `/api/operator/toggle-pause`  
**Método**: POST  
**Descripción**: Cambia el estado de pausa del operario

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "isPaused": true
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "isPaused": true,
  "message": "Estado actualizado exitosamente"
}
```

#### POST /api/operator/select-skipped-ticket

Selecciona un ticket previamente saltado.

**URL**: `/api/operator/select-skipped-ticket`  
**Método**: POST  
**Descripción**: Retoma un ticket que fue saltado anteriormente

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "ticketNumber": "string"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Ticket saltado seleccionado exitosamente",
  "ticket": {
    "id": "string",
    "number": "string",
    "customerName": "string",
    "status": "in_progress",
    "resumedAt": "ISO8601"
  }
}
```

#### GET /api/operator/skipped-tickets

Obtiene la lista de tickets saltados.

**URL**: `/api/operator/skipped-tickets`  
**Método**: GET  
**Descripción**: Lista todos los tickets saltados en la cola actual

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `queueId` (string): ID de la cola

**Response Success (200)**:
```json
{
  "skippedTickets": [
    {
      "id": "string",
      "number": "string",
      "customerName": "string",
      "customerPhone": "string",
      "waitTime": 0,
      "reason": "string",
      "skippedAt": "ISO8601",
      "priority": "normal|priority"
    }
  ]
}
```

#### GET /api/operator/queue-details

Obtiene detalles completos de la cola con tickets.

**URL**: `/api/operator/queue-details`  
**Método**: GET  
**Descripción**: Obtiene información detallada de la cola y sus tickets

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `queueId` (string): ID de la cola

**Response Success (200)**:
```json
{
  "queue": {
    "id": "string",
    "name": "string",
    "description": "string",
    "isActive": true,
    "waitingCount": 0,
    "averageWaitTime": 0
  },
  "tickets": [
    {
      "id": "string",
      "number": "string",
      "customerName": "string",
      "serviceType": "string",
      "estimatedTime": 0,
      "priority": "normal|priority",
      "status": "waiting|called|in_progress",
      "createdAt": "ISO8601"
    }
  ]
}
```

---

### 4. Gestión de Errores

#### Códigos de Estado HTTP

- **200**: Éxito
- **201**: Creado exitosamente
- **204**: Sin contenido (operación exitosa sin datos)
- **400**: Solicitud incorrecta
- **401**: No autorizado
- **403**: Prohibido
- **404**: No encontrado
- **500**: Error interno del servidor

#### Formato de Errores

```json
{
  "error": "Mensaje de error descriptivo",
  "code": "ERROR_CODE",
  "details": "Información adicional (opcional)"
}
```

---

### 5. Estructura de Datos

#### Ticket
```json
{
  "id": "string",
  "number": "string",
  "customerName": "string",
  "customerPhone": "string",
  "customerEmail": "string",
  "serviceType": "string",
  "priority": "normal|priority",
  "status": "waiting|called|in_progress|completed|cancelled|skipped",
  "queueId": "string",
  "tenantId": "string",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601",
  "calledAt": "ISO8601|null",
  "completedAt": "ISO8601|null",
  "cancelledAt": "ISO8601|null",
  "skippedAt": "ISO8601|null",
  "estimatedWaitTime": 0,
  "actualWaitTime": 0,
  "serviceTime": 0,
  "notes": "string",
  "reason": "string"
}
```

#### Queue
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "category": "string",
  "priority": "low|medium|high",
  "isActive": true,
  "tenantId": "string",
  "waitingCount": 0,
  "averageWaitTime": 0,
  "totalProcessedToday": 0,
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

#### User (Operario)
```json
{
  "id": "string",
  "name": "string",
  "username": "string",
  "role": "operator",
  "tenantId": "string",
  "tenantName": "string",
  "permissions": ["string"],
  "isActive": true,
  "currentQueueId": "string|null",
  "isPaused": false,
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

#### Tenant
```json
{
  "id": "string",
  "name": "string",
  "isActive": true,
  "settings": {
    "timezone": "string",
    "businessHours": {
      "start": "HH:mm",
      "end": "HH:mm"
    }
  },
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

---

### 6. Notas de Implementación

1. **Autenticación**: Todos los endpoints requieren validar el token JWT
2. **Multitenant**: Cada operación debe validar que el usuario tenga acceso a los datos de su tenant
3. **Logging**: Registrar todas las operaciones para auditoría
4. **Validación**: Validar todos los inputs y parámetros

### 7. Variables de Entorno

```env
# JWT
JWT_SECRET=clavesecretaparaTETOCAPP1602
JWT_EXPIRES_IN=24h

# Aplicación
PORT=3000
NODE_ENV=development

# Configuración de tenant por defecto
DEFAULT_TENANT_ID=default
```

### 8. Casos de Uso Principales

1. **Login de Operario**: Autenticar y obtener token
2. **Selección de Cola**: Obtener colas disponibles y seleccionar una
3. **Atención de Tickets**: Ciclo completo de atención (llamar, atender, terminar)
4. **Gestión de Excepciones**: Saltar turnos, cancelar tickets, retomar saltados
5. **Pausa de Atención**: Pausar y reanudar el flujo de trabajo
6. **Consulta de Estado**: Ver estado de la cola y tickets pendientes
