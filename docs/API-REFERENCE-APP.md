# API Reference - TeToca App Móvil (Clientes)

## Descripción General

Esta documentación describe todas las APIs REST necesarias para la aplicación móvil de clientes de TeToca. Los usuarios pueden registrarse, buscar empresas/instituciones, unirse a colas virtuales y gestionar sus tickets. El sistema es multitenant donde cada empresa tiene su propio workspace.

## Arquitectura Multitenant

- **Empresa/Tenant**: Cada empresa/institución tiene su propio espacio de datos
- **Usuarios/Clientes**: Se registran en la app y pueden acceder a todas las empresas
- **Colas**: Pertenecen a una empresa específica, los usuarios pueden unirse a cualquier cola
- **Tickets**: Representan la posición del usuario en una cola específica

## Base URL

```
http://localhost:3000/api
```

## Autenticación

Todas las APIs marcadas como "autenticado" requieren el header:
```
Authorization: Bearer <token>
```

## Endpoints

### 1. Autenticación de Usuarios (Clientes)

#### POST /auth/user/register

Registra un nuevo usuario cliente en la aplicación.

**URL**: `/auth/user/register`  
**Método**: POST  
**Autenticación**: No requerida  
**Descripción**: Permite a nuevos usuarios crear una cuenta

**Request Body**:
```json
{
  "name": "string",
  "email": "string",
  "phone": "string (opcional)",
  "password": "string"
}
```

**Response Success (201)**:
```json
{
  "token": "string",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "profilePicture": null,
    "isActive": true,
    "createdAt": "ISO8601",
    "updatedAt": "ISO8601"
  }
}
```

**Response Error (409)** - Email ya existe:
```json
{
  "error": "Ya existe una cuenta con este email"
}
```

**Response Error (400)** - Datos inválidos:
```json
{
  "error": "Datos inválidos. Por favor revisa la información"
}
```

---

#### POST /auth/user/login

Autentica un usuario cliente existente.

**URL**: `/auth/user/login`  
**Método**: POST  
**Autenticación**: No requerida

**Request Body**:
```json
{
  "email": "string",
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
    "email": "string",
    "phone": "string",
    "profilePicture": "string|null",
    "isActive": true,
    "createdAt": "ISO8601",
    "updatedAt": "ISO8601"
  }
}
```

**Response Error (401)**:
```json
{
  "error": "Email o contraseña incorrectos"
}
```

**Response Error (404)**:
```json
{
  "error": "Usuario no encontrado"
}
```

---

#### POST /auth/user/logout

Cierra la sesión del usuario actual.

**URL**: `/auth/user/logout`  
**Método**: POST  
**Autenticación**: Requerida

**Request Body**: Vacío

**Response Success (200)**:
```json
{
  "message": "Sesión cerrada exitosamente"
}
```

---

### 2. Gestión de Perfil de Usuario

#### GET /user/profile

Obtiene el perfil del usuario autenticado.

**URL**: `/user/profile`  
**Método**: GET  
**Autenticación**: Requerida

**Response Success (200)**:
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "phone": "string",
  "profilePicture": "string|null",
  "isActive": true,
  "preferences": {
    "notifications": true,
    "language": "es"
  },
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

---

#### PUT /user/profile

Actualiza el perfil del usuario.

**URL**: `/user/profile`  
**Método**: PUT  
**Autenticación**: Requerida

**Request Body**:
```json
{
  "name": "string (opcional)",
  "phone": "string (opcional)",
  "profilePicture": "string (opcional)"
}
```

**Response Success (200)**:
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "phone": "string",
  "profilePicture": "string|null",
  "updatedAt": "ISO8601"
}
```

---

#### POST /user/push-token

Registra el token de notificaciones push del usuario.

**URL**: `/user/push-token`  
**Método**: POST  
**Autenticación**: Requerida

**Request Body**:
```json
{
  "token": "string",
  "platform": "ios|android"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Token registrado exitosamente"
}
```

---

### 3. Gestión de Categorías (Público)

#### GET /public/categories

Obtiene todas las categorías disponibles.

**URL**: `/public/categories`  
**Método**: GET  
**Autenticación**: No requerida

**Response Success (200)**:
```json
{
  "categories": [
    {
      "id": "string",
      "name": "string",
      "iconName": "string",
      "color": "string",
      "isActive": true,
      "enterpriseCount": 0
    }
  ]
}
```

---

### 4. Gestión de Empresas/Instituciones (Público)

#### GET /public/companies

Obtiene todas las empresas/instituciones disponibles.

**URL**: `/public/companies`  
**Método**: GET  
**Autenticación**: No requerida

**Query Parameters**:
- `page` (number, opcional): Número de página (default: 1)
- `limit` (number, opcional): Elementos por página (default: 20)
- `search` (string, opcional): Texto de búsqueda

**Response Success (200)**:
```json
{
  "companies": [
    {
      "id": "string",
      "name": "string",
      "shortName": "string",
      "type": "string",
      "logo": "string|null",
      "address": "string",
      "schedule": "string",
      "phone": "string",
      "isActive": true,
      "activeQueues": 0,
      "tenantId": "string",
      "settings": {},
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

#### GET /public/companies/{id}

Obtiene los detalles de una empresa específica.

**URL**: `/public/companies/{id}`  
**Método**: GET  
**Autenticación**: No requerida

**Parámetros de URL**:
- `id` (string): ID de la empresa

**Response Success (200)**:
```json
{
  "id": "string",
  "name": "string",
  "shortName": "string",
  "type": "string",
  "logo": "string|null",
  "address": "string",
  "schedule": "string",
  "phone": "string",
  "isActive": true,
  "activeQueues": 0,
  "tenantId": "string",
  "settings": {},
  "queues": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "icon": "string",
      "peopleWaiting": 0,
      "avgTime": "string",
      "isActive": true
    }
  ],
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

**Response Error (404)**:
```json
{
  "error": "Empresa no encontrada"
}
```

---

#### GET /public/companies/search

Busca empresas por texto.

**URL**: `/public/companies/search`  
**Método**: GET  
**Autenticación**: No requerida

**Query Parameters**:
- `q` (string): Texto de búsqueda
- `page` (number, opcional): Número de página
- `limit` (number, opcional): Elementos por página

**Response Success (200)**:
```json
{
  "companies": [
    {
      "id": "string",
      "name": "string",
      "shortName": "string",
      "type": "string",
      "logo": "string|null",
      "address": "string",
      "isActive": true,
      "activeQueues": 0,
      "relevanceScore": 0.95
    }
  ],
  "searchQuery": "string",
  "totalResults": 10
}
```

---

#### GET /public/categories/{categoryId}/companies

Obtiene empresas filtradas por categoría.

**URL**: `/public/categories/{categoryId}/companies`  
**Método**: GET  
**Autenticación**: No requerida

**Parámetros de URL**:
- `categoryId` (string): ID de la categoría

**Query Parameters**:
- `page` (number, opcional)
- `limit` (number, opcional)

**Response Success (200)**:
```json
{
  "category": {
    "id": "string",
    "name": "string",
    "iconName": "string",
    "color": "string"
  },
  "companies": [
    {
      "id": "string",
      "name": "string",
      "shortName": "string",
      "type": "string",
      "logo": "string|null",
      "address": "string",
      "isActive": true,
      "activeQueues": 0
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

---

### 5. Gestión de Colas (Público)

#### GET /public/companies/{companyId}/queues

Obtiene todas las colas de una empresa específica.

**URL**: `/public/companies/{companyId}/queues`  
**Método**: GET  
**Autenticación**: No requerida

**Parámetros de URL**:
- `companyId` (string): ID de la empresa

**Response Success (200)**:
```json
{
  "company": {
    "id": "string",
    "name": "string",
    "logo": "string|null"
  },
  "queues": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "icon": "string",
      "category": "string",
      "priority": "low|medium|high",
      "peopleWaiting": 0,
      "avgTime": "string",
      "averageWaitTime": 0,
      "isActive": true,
      "totalProcessedToday": 0,
      "estimatedWaitTime": 0,
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601"
    }
  ]
}
```

**Response Error (404)**:
```json
{
  "error": "Empresa no encontrada"
}
```

---

#### GET /public/queues/{queueId}

Obtiene los detalles de una cola específica.

**URL**: `/public/queues/{queueId}`  
**Método**: GET  
**Autenticación**: No requerida

**Parámetros de URL**:
- `queueId` (string): ID de la cola

**Response Success (200)**:
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "icon": "string",
  "category": "string",
  "priority": "low|medium|high",
  "peopleWaiting": 0,
  "avgTime": "string",
  "averageWaitTime": 0,
  "isActive": true,
  "totalProcessedToday": 0,
  "company": {
    "id": "string",
    "name": "string",
    "logo": "string|null",
    "address": "string",
    "phone": "string"
  },
  "currentStats": {
    "currentTicketNumber": "string",
    "lastCalledTicket": "string",
    "estimatedWaitTime": 0,
    "averageServiceTime": 0
  },
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

**Response Error (404)**:
```json
{
  "error": "Cola no encontrada"
}
```

---

#### GET /public/queues/{queueId}/status

Obtiene el estado en tiempo real de una cola.

**URL**: `/public/queues/{queueId}/status`  
**Método**: GET  
**Autenticación**: No requerida

**Response Success (200)**:
```json
{
  "queueId": "string",
  "isActive": true,
  "peopleWaiting": 0,
  "currentTicketNumber": "string",
  "lastCalledTicket": "string",
  "estimatedWaitTime": 0,
  "averageServiceTime": 0,
  "totalProcessedToday": 0,
  "lastUpdated": "ISO8601"
}
```

---

### 6. Gestión de Tickets (Autenticado)

#### POST /queues/{queueId}/join

Permite al usuario unirse a una cola y obtener un ticket.

**URL**: `/queues/{queueId}/join`  
**Método**: POST  
**Autenticación**: Requerida

**Parámetros de URL**:
- `queueId` (string): ID de la cola

**Request Body**:
```json
{
  "pushToken": "string (opcional)",
  "serviceType": "string (opcional)",
  "priority": "normal|priority (opcional)",
  "notes": "string (opcional)"
}
```

**Response Success (201)**:
```json
{
  "ticket": {
    "id": "string",
    "number": "string",
    "queueId": "string",
    "enterpriseId": "string",
    "enterpriseName": "string",
    "queueName": "string",
    "customerName": "string",
    "customerPhone": "string",
    "customerEmail": "string",
    "serviceType": "string",
    "priority": "normal|priority",
    "status": "waiting",
    "position": 0,
    "estimatedWaitTime": 0,
    "actualWaitTime": 0,
    "serviceTime": 0,
    "createdAt": "ISO8601",
    "updatedAt": "ISO8601",
    "notes": "string"
  },
  "queueInfo": {
    "name": "string",
    "currentPosition": 0,
    "totalWaiting": 0,
    "estimatedWaitTime": 0
  }
}
```

**Response Error (400)** - Cola no activa:
```json
{
  "error": "La cola no está disponible en este momento"
}
```

**Response Error (409)** - Usuario ya en cola:
```json
{
  "error": "Ya tienes un ticket activo en esta cola"
}
```

---

#### GET /tickets/{ticketId}

Obtiene los detalles de un ticket específico.

**URL**: `/tickets/{ticketId}`  
**Método**: GET  
**Autenticación**: Requerida

**Parámetros de URL**:
- `ticketId` (string): ID del ticket

**Response Success (200)**:
```json
{
  "id": "string",
  "number": "string",
  "queueId": "string",
  "enterpriseId": "string",
  "enterpriseName": "string",
  "queueName": "string",
  "customerName": "string",
  "customerPhone": "string",
  "customerEmail": "string",
  "serviceType": "string",
  "priority": "normal|priority",
  "status": "waiting|called|in_progress|completed|cancelled|paused",
  "position": 0,
  "estimatedWaitTime": 0,
  "actualWaitTime": 0,
  "serviceTime": 0,
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601",
  "calledAt": "ISO8601|null",
  "completedAt": "ISO8601|null",
  "cancelledAt": "ISO8601|null",
  "notes": "string",
  "reason": "string",
  "currentQueueStatus": {
    "currentTicketNumber": "string",
    "peopleAhead": 0,
    "estimatedWaitTime": 0
  }
}
```

**Response Error (404)**:
```json
{
  "error": "Ticket no encontrado"
}
```

**Response Error (403)**:
```json
{
  "error": "No tienes permisos para ver este ticket"
}
```

---

#### PUT /tickets/{ticketId}/pause

Pausa un ticket activo.

**URL**: `/tickets/{ticketId}/pause`  
**Método**: PUT  
**Autenticación**: Requerida

**Request Body**:
```json
{
  "reason": "string (opcional)"
}
```

**Response Success (200)**:
```json
{
  "ticket": {
    "id": "string",
    "number": "string",
    "status": "paused",
    "pausedAt": "ISO8601",
    "reason": "string",
    "updatedAt": "ISO8601"
  },
  "message": "Ticket pausado exitosamente"
}
```

**Response Error (400)** - Ticket no se puede pausar:
```json
{
  "error": "El ticket no se puede pausar en su estado actual"
}
```

---

#### PUT /tickets/{ticketId}/resume

Reanuda un ticket pausado.

**URL**: `/tickets/{ticketId}/resume`  
**Método**: PUT  
**Autenticación**: Requerida

**Request Body**: Vacío

**Response Success (200)**:
```json
{
  "ticket": {
    "id": "string",
    "number": "string",
    "status": "waiting",
    "resumedAt": "ISO8601",
    "newPosition": 0,
    "estimatedWaitTime": 0,
    "updatedAt": "ISO8601"
  },
  "message": "Ticket reanudado exitosamente"
}
```

**Response Error (400)**:
```json
{
  "error": "El ticket no está pausado"
}
```

---

#### DELETE /tickets/{ticketId}/cancel

Cancela un ticket activo.

**URL**: `/tickets/{ticketId}/cancel`  
**Método**: DELETE  
**Autenticación**: Requerida

**Request Body**:
```json
{
  "reason": "string (opcional)"
}
```

**Response Success (200)**:
```json
{
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

**Response Error (400)**:
```json
{
  "error": "El ticket no se puede cancelar en su estado actual"
}
```

---

#### GET /user/tickets

Obtiene todos los tickets del usuario autenticado.

**URL**: `/user/tickets`  
**Método**: GET  
**Autenticación**: Requerida

**Query Parameters**:
- `status` (string, opcional): Filtrar por estado (waiting, completed, cancelled, etc.)
- `page` (number, opcional): Número de página
- `limit` (number, opcional): Elementos por página

**Response Success (200)**:
```json
{
  "tickets": [
    {
      "id": "string",
      "number": "string",
      "queueId": "string",
      "enterpriseId": "string",
      "enterpriseName": "string",
      "queueName": "string",
      "serviceType": "string",
      "priority": "normal|priority",
      "status": "waiting|called|in_progress|completed|cancelled|paused",
      "position": 0,
      "estimatedWaitTime": 0,
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  },
  "stats": {
    "active": 2,
    "completed": 15,
    "cancelled": 3
  }
}
```

---

#### GET /user/tickets/current

Obtiene solo los tickets activos del usuario.

**URL**: `/user/tickets/current`  
**Método**: GET  
**Autenticación**: Requerida

**Response Success (200)**:
```json
{
  "activeTickets": [
    {
      "id": "string",
      "number": "string",
      "queueId": "string",
      "enterpriseId": "string",
      "enterpriseName": "string",
      "queueName": "string",
      "status": "waiting|called|paused",
      "position": 0,
      "estimatedWaitTime": 0,
      "createdAt": "ISO8601",
      "currentQueueStatus": {
        "currentTicketNumber": "string",
        "peopleAhead": 0
      }
    }
  ]
}
```

---

### 7. APIs Multitenant (Empresas Específicas)

#### GET /tenant/{tenantId}/public/companies

Obtiene las agencias/sucursales de un tenant específico.

**URL**: `/tenant/{tenantId}/public/companies`  
**Método**: GET  
**Autenticación**: No requerida

**Parámetros de URL**:
- `tenantId` (string): ID del tenant/empresa

**Response Success (200)**:
```json
{
  "tenant": {
    "id": "string",
    "name": "string",
    "settings": {}
  },
  "companies": [
    {
      "id": "string",
      "name": "string",
      "shortName": "string",
      "type": "string",
      "logo": "string|null",
      "address": "string",
      "schedule": "string",
      "phone": "string",
      "isActive": true,
      "activeQueues": 0
    }
  ]
}
```

---

#### GET /tenant/{tenantId}/public/companies/{companyId}

Obtiene detalles de una agencia específica de un tenant.

**URL**: `/tenant/{tenantId}/public/companies/{companyId}`  
**Método**: GET  
**Autenticación**: No requerida

**Response Success (200)**:
```json
{
  "company": {
    "id": "string",
    "name": "string",
    "shortName": "string",
    "type": "string",
    "logo": "string|null",
    "address": "string",
    "schedule": "string",
    "phone": "string",
    "isActive": true,
    "tenantId": "string"
  },
  "queues": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "icon": "string",
      "peopleWaiting": 0,
      "avgTime": "string",
      "isActive": true
    }
  ]
}
```

---

#### POST /tenant/{tenantId}/queues/{queueId}/join

Unirse a una cola específica de un tenant.

**URL**: `/tenant/{tenantId}/queues/{queueId}/join`  
**Método**: POST  
**Autenticación**: Requerida

**Request/Response**: Similar a `/queues/{queueId}/join` pero específico del tenant.

---

### 8. Gestión de Notificaciones

#### GET /user/notifications

Obtiene las notificaciones del usuario.

**URL**: `/user/notifications`  
**Método**: GET  
**Autenticación**: Requerida

**Query Parameters**:
- `unread` (boolean, opcional): Solo notificaciones no leídas
- `page` (number, opcional)
- `limit` (number, opcional)

**Response Success (200)**:
```json
{
  "notifications": [
    {
      "id": "string",
      "type": "ticket_called|ticket_ready|queue_update",
      "title": "string",
      "message": "string",
      "data": {
        "ticketId": "string",
        "queueId": "string"
      },
      "isRead": false,
      "createdAt": "ISO8601"
    }
  ],
  "unreadCount": 5
}
```

---

#### PUT /user/notifications/{notificationId}/read

Marca una notificación como leída.

**URL**: `/user/notifications/{notificationId}/read`  
**Método**: PUT  
**Autenticación**: Requerida

**Response Success (200)**:
```json
{
  "message": "Notificación marcada como leída"
}
```

---

### 9. Gestión de Errores

#### Códigos de Estado HTTP

- **200**: Éxito
- **201**: Creado exitosamente
- **204**: Sin contenido
- **400**: Solicitud incorrecta
- **401**: No autorizado (token inválido/expirado)
- **403**: Prohibido (sin permisos)
- **404**: No encontrado
- **409**: Conflicto (datos duplicados)
- **422**: Entidad no procesable (validación fallida)
- **500**: Error interno del servidor

#### Formato de Errores

```json
{
  "error": "Mensaje de error descriptivo",
  "code": "ERROR_CODE",
  "details": {
    "field": "Información específica del campo (opcional)"
  },
  "timestamp": "ISO8601"
}
```

---

### 10. Estructura de Datos

#### User (Cliente)
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "phone": "string",
  "profilePicture": "string|null",
  "isActive": true,
  "preferences": {
    "notifications": true,
    "language": "es"
  },
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

#### Company (Empresa/Institución)
```json
{
  "id": "string",
  "name": "string",
  "shortName": "string",
  "type": "string",
  "logo": "string|null",
  "address": "string",
  "schedule": "string",
  "phone": "string",
  "isActive": true,
  "activeQueues": 0,
  "tenantId": "string",
  "settings": {},
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

#### Queue (Cola)
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "icon": "string",
  "category": "string",
  "priority": "low|medium|high",
  "peopleWaiting": 0,
  "avgTime": "string",
  "averageWaitTime": 0,
  "isActive": true,
  "totalProcessedToday": 0,
  "enterpriseId": "string",
  "tenantId": "string",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

#### Ticket
```json
{
  "id": "string",
  "number": "string",
  "queueId": "string",
  "enterpriseId": "string",
  "enterpriseName": "string",
  "queueName": "string",
  "customerName": "string",
  "customerPhone": "string",
  "customerEmail": "string",
  "serviceType": "string",
  "priority": "normal|priority",
  "status": "waiting|called|in_progress|completed|cancelled|paused",
  "position": 0,
  "estimatedWaitTime": 0,
  "actualWaitTime": 0,
  "serviceTime": 0,
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601",
  "calledAt": "ISO8601|null",
  "completedAt": "ISO8601|null",
  "cancelledAt": "ISO8601|null",
  "skippedAt": "ISO8601|null",
  "pausedAt": "ISO8601|null",
  "resumedAt": "ISO8601|null",
  "notes": "string",
  "reason": "string"
}
```

#### Category
```json
{
  "id": "string",
  "name": "string",
  "iconName": "string",
  "color": "string",
  "isActive": true,
  "enterpriseCount": 0
}
```

#### Notification
```json
{
  "id": "string",
  "userId": "string",
  "type": "ticket_called|ticket_ready|queue_update|general",
  "title": "string",
  "message": "string",
  "data": {
    "ticketId": "string",
    "queueId": "string",
    "enterpriseId": "string"
  },
  "isRead": false,
  "createdAt": "ISO8601"
}
```

---

### 11. Flujos de Trabajo Principales

#### Flujo de Registro y Login
1. `POST /auth/user/register` - Crear cuenta
2. `POST /auth/user/login` - Iniciar sesión
3. `POST /user/push-token` - Registrar token de notificaciones

#### Flujo de Búsqueda y Selección de Empresa
1. `GET /public/categories` - Obtener categorías
2. `GET /public/companies` o `GET /public/categories/{id}/companies` - Buscar empresas
3. `GET /public/companies/{id}` - Ver detalles de empresa
4. `GET /public/companies/{id}/queues` - Ver colas disponibles

#### Flujo de Unirse a Cola
1. `GET /public/queues/{id}` - Ver detalles de cola
2. `POST /queues/{id}/join` - Unirse a la cola
3. `GET /tickets/{id}` - Ver estado del ticket
4. `GET /user/tickets/current` - Ver tickets activos

#### Flujo de Gestión de Ticket
1. `PUT /tickets/{id}/pause` - Pausar ticket
2. `PUT /tickets/{id}/resume` - Reanudar ticket
3. `DELETE /tickets/{id}/cancel` - Cancelar ticket

---

### 12. Consideraciones de Implementación

#### Seguridad
- Validar token JWT en todas las rutas autenticadas
- Validar que el usuario solo puede ver/modificar sus propios tickets
- Sanitizar inputs para prevenir inyecciones
- Rate limiting en endpoints públicos

#### Performance
- Implementar caché para datos públicos (empresas, categorías)
- Paginación en todas las listas
- Índices en base de datos para búsquedas
- Compresión de respuestas

#### Notificaciones Push
- Enviar notificación cuando falten 3 personas en la cola
- Notificar cuando sea llamado el ticket
- Notificar cambios de estado importantes

#### Multitenant
- Aislamiento de datos por tenant
- Configuraciones específicas por tenant
- Métricas separadas por tenant

#### WebSockets (Opcional)
Para actualizaciones en tiempo real:
- Estado de cola en tiempo real
- Posición actualizada del ticket
- Notificaciones instantáneas

---

### 13. Variables de Entorno

```env
# JWT
JWT_SECRET=clavesecretaparaTETOCAPP1602
JWT_EXPIRES_IN=7d

# Base de datos
DATABASE_URL=postgresql://user:password@localhost:5432/tetoca_app

# Redis (para caché y sesiones)
REDIS_URL=redis://localhost:6379

# Notificaciones Push
EXPO_ACCESS_TOKEN=your_expo_access_token
FCM_SERVER_KEY=your_fcm_server_key

# Aplicación
PORT=3000
NODE_ENV=development
API_VERSION=v1

# CORS
ALLOWED_ORIGINS=http://localhost:8081,exp://192.168.1.100:8081
```

---

### 14. Casos de Uso Específicos

#### Escaneo QR
Cuando el usuario escanea un QR, el código debe contener:
```json
{
  "type": "queue",
  "queueId": "string",
  "tenantId": "string (opcional)"
}
```

El frontend debe llamar a:
- `GET /public/queues/{queueId}` para mostrar información
- `POST /queues/{queueId}/join` para unirse

#### Multiples Tickets Activos
Un usuario puede tener múltiples tickets activos en diferentes colas, pero solo uno por cola.

#### Estados de Ticket
- `waiting`: En espera en la cola
- `called`: Ha sido llamado por el operador
- `in_progress`: Siendo atendido
- `completed`: Atención completada
- `cancelled`: Cancelado por el usuario
- `paused`: Pausado temporalmente

#### Manejo de Errores de Red
La app debe manejar:
- Conexión perdida durante operaciones
- Timeouts en peticiones
- Estados inconsistentes por fallos de red
