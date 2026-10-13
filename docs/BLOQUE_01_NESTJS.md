# Bloque 01 — estructura y acceso seguro

## Objetivo y decisiones

Implementar el primer corte verificable de NestJS conservando el prototipo para referencia. El nuevo servidor no monta rutas Express. Fastify se usa como adaptador HTTP de NestJS y permite pruebas de solicitudes sin abrir puertos; la lógica de negocio permanece en servicios Nest.

La división ADMINISTRADOR/GERENCIA concreta la separación propuesta: ADMINISTRADOR gestiona cuentas, GERENCIA tendrá gestión operativa y reportes. El acceso completo de los médicos al historial, aprobado por el propietario, se aplicará en el módulo clínico; no implica poder administrar usuarios.

## Permisos de este bloque

| Acción | Público | ADMINISTRADOR | GERENCIA | RECEPCIONISTA | MEDICO |
|---|---|---|---|---|---|
| Login | Sí | Sí | Sí | Sí | Sí |
| Consultar su sesión / cerrar todas sus sesiones | No | Sí | Sí | Sí | Sí |
| Crear personal | No | Sí | No | No | No |
| Activar/desactivar personal no administrador | No | Sí | No | No | No |
| Historial y agenda | No implementado | No implementado | No implementado | No implementado | No implementado |

## Conceptos para estudiar

- **Module:** agrupa controladores y proveedores. AppModule reúne el primer bloque.
- **Controller:** recibe solicitudes y delega; no decide la persistencia.
- **Service:** concentra operaciones y reglas.
- **DTO + ValidationPipe:** valida forma, contenido y campos permitidos.
- **Guard:** comprueba identidad y permisos antes del controlador.
- **Inyección de dependencias:** UserStore puede resolverse a PostgreSQL o al repositorio de pruebas, sin cambiar el controlador.
- **tokenVersion:** al desactivar o cerrar sesiones se incrementa. Un token emitido con la versión anterior deja de ser aceptado, incluso tras reactivar la cuenta.
- **Migración:** archivo SQL versionado que registra cómo crear/modificar la estructura. Se distingue del seed, que carga datos.

## Verificaciones previstas

Compilación estricta; 401 sin sesión; 403 con rol insuficiente; DTO inválido 400; usuario duplicado 409; datos de respuesta sin hash; baja y reactivación no recuperan tokens anteriores; logout global; límites de login; errores sin credenciales; OpenAPI con respuestas.

## Límites deliberados

Tokens de acceso de 15 minutos; al vencer se inicia sesión de nuevo hasta implementar renovación segura. Logout es global para la cuenta, no por dispositivo. El limitador en memoria sirve para una instancia; falta distribución y políticas de proxy antes de escalar. No se implementaron aún las reglas clínicas ni sus tablas nuevas de agenda. Se mantiene el esquema anterior con ADMINISTRADOR y tokenVersion para no rediseñar todos los dominios a la vez.

## Ejercicio práctico posterior al arranque

1. Crear una cuenta MEDICO desde ADMINISTRADOR.
2. Iniciar sesión como MEDICO e intentar crear otra cuenta: esperar 403.
3. Desactivar esa cuenta desde ADMINISTRADOR.
4. Reutilizar el token del médico en /auth/me: esperar 401.
5. Reactivarla y repetir con el token anterior: debe seguir rechazado.
6. Iniciar sesión nuevamente: ahora sí debe funcionar.

Preguntas: ¿qué diferencia hay entre 401 y 403?, ¿por qué comprobar isActive solo en login sería insuficiente?, ¿por qué cambiar el repositorio por uno en memoria no prueba todavía la base real?
