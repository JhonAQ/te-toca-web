# Guía de Autenticación - TeToca

## Tipos de Usuario

### 1. Usuarios/Clientes (App Móvil)
- **Tipo**: `user`
- **Autenticación**: Email + Contraseña
- **Acceso**: APIs públicas y APIs de cliente

### 2. Workers/Operarios (Web)
- **Tipo**: `worker`
- **Autenticación**: Username + Contraseña + TenantId
- **Acceso**: APIs de operador según tenant

## Endpoints de Autenticación

### Usuarios (Clientes)
```bash
# Registro
POST /api/auth/user/register
Content-Type: application/json

{
  "name": "Ana López",
  "email": "ana@example.com",
  "phone": "+51 987 654 321",
  "password": "password123"
}

# Login
POST /api/auth/user/login
Content-Type: application/json

{
  "email": "ana@example.com",
  "password": "password123"
}

# Logout
POST /api/auth/user/logout
Authorization: Bearer <token>
```

### Workers (Operarios)
```bash
# Login
POST /api/auth/worker/login/default
Content-Type: application/json

{
  "username": "admin",
  "password": "123456"
}
```

## Uso de Tokens

Todas las rutas protegidas requieren el token en el header:

```bash
Authorization: Bearer <jwt_token>
```

## Cuentas de Prueba

### Usuarios
- `cliente@test.com` / `123456`
- `ana.lopez@test.com` / `123456`
- `pedro.ramirez@test.com` / `123456`

### Workers (Tenant: default)
- `admin` / `123456` (Administrador)
- `operator1` / `123456` (Operario)
- `supervisor` / `123456` (Supervisor)

## Testing

```bash
# Instalar dependencias
npm install

# Generar cliente Prisma
npm run db:generate

# Aplicar migraciones
npm run db:push

# Poblar base de datos
npm run db:seed

# Iniciar servidor
npm run dev
```

## Ejemplos de Uso

### Registro de Usuario
```javascript
const response = await fetch('/api/auth/user/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Nuevo Usuario',
    email: 'nuevo@example.com',
    password: 'password123'
  })
})

const { token, user } = await response.json()
localStorage.setItem('authToken', token)
```

### Login de Worker
```javascript
const response = await fetch('/api/auth/worker/login/default', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'admin',
    password: '123456'
  })
})

const { token, user } = await response.json()
localStorage.setItem('authToken', token)
```

### Uso de API Protegida
```javascript
const response = await fetch('/api/worker/queues', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  }
})

const data = await response.json()
```
