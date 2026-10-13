# Clínica Salud Integral — migración a NestJS

Esta rama (`migration/nestjs`) contiene el **bloque 1: autenticación y usuarios**. El calendario, pacientes, historias clínicas y caja todavía NO están montados en la API NestJS. El prototipo Express permanece en el código para migración incremental y en la rama remota `baseline/express-pre-nestjs`.

## Estado del bloque

- NestJS 11 con adaptador Fastify, TypeScript estricto, PostgreSQL y Prisma.
- `/api/v1`: rutas protegidas por defecto, JWT de 15 minutos con issuer/audience y algoritmo restringido.
- Cada solicitud autenticada comprueba usuario activo, rol actual y versión de sesión en PostgreSQL.
- Alta de personal solo para ADMINISTRADOR. No hay registro público.
- Logout invalida **todas** las sesiones de esa cuenta. Refresh tokens y MFA quedan pendientes.
- Validación global de entradas, rechazo de campos ajenos al DTO y respuestas sin password/tokenVersion.
- Límite de login de 5 intentos/minuto por IP y límite general de 120/minuto por IP, en memoria de cada instancia. Antes de escalar: almacenamiento compartido y configuración explícita de proxies confiables; no activar trustProxy indiscriminadamente.
- Swagger generado desde NestJS, disponible solo fuera de producción; CORS con orígenes explícitos y cabeceras Helmet.
- Migración SQL inicial versionada. No usarla directamente sobre la base del prototipo ya poblada.
- Seed heredado deshabilitado y bootstrap independiente del primer administrador.

## Arranque en una nueva base local (PowerShell)

Requisitos: Node.js compatible con Prisma 7 (en revisión se usó Node 24), PostgreSQL y pnpm 11.25.0.

1. Actualizar la rama. Si `git status` muestra cambios propios, consérvelos antes de cambiar de rama o integrar.

```powershell
git status
git fetch origin
git switch migration/nestjs
git pull --ff-only origin migration/nestjs
pnpm install --frozen-lockfile
```

2. En pgAdmin crear **clinica_salud_integral_nest_dev**, vacía. No hace falta borrar la base Express.

3. Si no existe `.env`, copiar el ejemplo; si ya existe, editarlo sin sobrescribir las credenciales propias:

```powershell
# Solo si NO tienes .env:
Copy-Item .env.example .env
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Completar `.env` con DATABASE_URL apuntando a la nueva base, JWT_SECRET con el valor generado (mínimo 48 caracteres), NODE_ENV=development, PORT=3000 y CORS_ORIGINS=http://localhost:5173. Codificar los caracteres especiales de la contraseña de PostgreSQL en la URL. Nunca subir `.env` ni enviar sus secretos por chat.

4. Crear estructura y verificar:

```powershell
pnpm generate
pnpm db:deploy
pnpm test
```

5. Crear el primer administrador. El script solo permite bootstrap si todavía no existe ningún ADMINISTRADOR y no sobrescribe cuentas. La contraseña debe tener al menos 12 caracteres y como máximo 72 bytes UTF-8. Introducirla mediante lectura oculta, no como un literal en el historial de PowerShell:

```powershell
$env:ADMIN_EMAIL = Read-Host 'Correo del administrador'
$clinicSecurePassword = Read-Host 'Contraseña (mínimo 12 caracteres)' -AsSecureString
$env:ADMIN_PASSWORD = [System.Net.NetworkCredential]::new('', $clinicSecurePassword).Password
try {
    pnpm admin:create
} finally {
    Remove-Item Env:ADMIN_EMAIL -ErrorAction SilentlyContinue
    Remove-Item Env:ADMIN_PASSWORD -ErrorAction SilentlyContinue
    Remove-Variable clinicSecurePassword -ErrorAction SilentlyContinue
}
```

6. Arrancar:

```powershell
pnpm dev
```

Abrir http://localhost:3000/api-docs. Iniciar sesión con el administrador creado en `POST /api/v1/auth/login`, copiar `accessToken` y pegarlo en **Authorize** (esquema HTTP bearer; solo el token). Probar `GET /api/v1/auth/me`.

`pnpm dev` compila y observa los JS de `dist`. Para recompilar automáticamente cambios TypeScript, ejecutar `pnpm watch:types` en una segunda terminal. También puedes detener y volver a ejecutar `pnpm dev` después de editar. No usamos tsx para ejecutar NestJS porque necesitamos los metadatos de decoradores emitidos por TypeScript.

## Endpoints disponibles

| Método / ruta | Acceso | Resultado |
|---|---|---|
| POST /api/v1/auth/login | Público, limitado por IP | JWT y usuario seguro |
| GET /api/v1/auth/me | Autenticado | Usuario y rol vigentes |
| POST /api/v1/auth/logout | Autenticado | Revoca todas sus sesiones; 204 |
| POST /api/v1/users | ADMINISTRADOR | Alta con contraseña hasheada; 201 |
| PATCH /api/v1/users/:id/active | ADMINISTRADOR | Activa/desactiva personal e invalida tokens previos |

No se permite desactivar administradores en este bloque: requiere una política posterior para evitar perder la última cuenta administrativa. GERENCIA no administra usuarios. El cambio de rol y recuperación de contraseña aún no tienen endpoint. Los usuarios MEDICO creados aquí todavía necesitan el futuro módulo de vinculación al profesional; crear una cuenta no crea un médico clínico.

## Pruebas

`pnpm test` genera Prisma, compila NestJS y ejecuta pruebas HTTP con la aplicación Nest real y un repositorio de usuarios en memoria. Comprueba autenticación, permisos, validación, revocación, rate limiting y OpenAPI. **No demuestra por sí solo la integración con PostgreSQL.**

`pnpm test:db` comprueba el adaptador Prisma real. Requiere compilar antes y proporcionar TEST_DATABASE_URL de una base aislada terminada en `_test`, con migraciones aplicadas. Solo elimina el usuario aleatorio creado por su prueba. No apuntar a producción. GitHub Actions prepara un PostgreSQL 17 efímero y ejecuta ambas suites; revisar el resultado del workflow antes de considerar validada esa integración.

## Seed y servidor heredado

El seed heredado se sustituyó por un comando que termina sin escribir ni borrar datos. Los registros clínicos de ejemplo no forman parte del nuevo seed. **No ejecutar `pnpm seed` para este bloque:** usar las migraciones y `pnpm admin:create`.

`pnpm dev:legacy` levanta Express solo para referencia local, con sus módulos anteriores y riesgos todavía pendientes. El registro público fue retirado también allí. No desplegar ese servidor como alternativa segura a NestJS. La migración completa aún está en curso.

## Pendientes

Agenda y concurrencia; sedes/consultorios; atención e historia clínica; derivaciones; caja; auditoría funcional; refresh/MFA/recuperación; readiness y métricas; pruebas de carga y restauración. Este bloque no es una versión clínica apta para producción.
