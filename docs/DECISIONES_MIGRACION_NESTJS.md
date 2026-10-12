# Decisiones de migración — Clínica Salud Integral

Fecha: 2026-10-12. Aprobadas por el propietario del proyecto en conversación.

## Punto de partida y versionado

- Se conserva el repositorio `makaveli171093/clinica_salud_integral`.
- Commit base Express: `d35d5d298f862169bce3822567af6ff5913f9698`.
- Respaldo publicado en GitHub: rama `baseline/express-pre-nestjs`, apuntando al commit base.
- Etiqueta anotada `v0.1.0-express-baseline` creada solo en la copia local de revisión; su publicación por Git no fue posible por falta de credenciales de terminal. El respaldo remoto verificable es la rama indicada arriba.
- Este punto conserva el prototipo auditado, con defectos conocidos; no certifica estabilidad para producción.
- Rama de migración: `migration/nestjs`. La rama `master` conserva el estado anterior hasta integrar una migración verificada.
- Las futuras etiquetas de versión representarán hitos verificados. No se publicará `v1.0.0` estable solo por completar el traslado de framework.

## Decisiones funcionales confirmadas

| Tema | Decisión |
|---|---|
| Sedes | Una sede inicialmente, con modelo preparado para incorporar otras. |
| Duración | Configurable desde gerencia o administración; puede variar por especialidad. |
| Consultorio | Se asigna al configurar los días y horarios de atención de cada médico. |
| Historia clínica | Los médicos podrán consultar el historial completo, con filtros por fecha y especialidad. Esto no otorga ese acceso a recepción, caja o administración. |
| Derivación | Cada especialidad tendrá una configuración para indicar si exige derivación. |
| Paciente extra | Se permite atención adicional/sobrecupo; únicamente el médico puede ingresar al paciente extra. |
| Caja | Incluir un módulo básico inicialmente y ampliarlo después; futura integración con pasarela de pagos. |
| Datos existentes | El propietario indica que no hay datos importantes y autoriza vaciar la base para la migración. No se ha realizado ningún vaciado. |

## Criterios de diseño derivados para especificar

Estos criterios orientan el diseño; no equivalen a funcionalidad ya implementada.

- Asociar horarios y consultorios a una sede, aunque inicialmente exista solo una.
- Conservar inicio y fin reservados de cada cita: cambiar la duración configurada no debe alterar retrospectivamente citas existentes.
- Validar conflictos del médico también entre sedes y conflictos de consultorio.
- El acceso médico amplio al historial debe permanecer autenticado y auditado; los filtros no sustituyen los controles de acceso.
- La obligación de derivación es configurable por especialidad. Vigencia, consumo y excepciones se definirán en las reglas de agenda.
- El flujo de paciente extra debe diferenciarse de la reserva ordinaria y tener identidad del médico, motivo y trazabilidad. Queda por definir si ocupa un espacio adicional, extiende la jornada o usa una cola sin hora fija; no se asume que puede saltarse todas las restricciones.
- Definir importes de caja con precisión decimal, moneda explícita y movimientos trazables; separar situación de pago y estado clínico.
- La autorización para reinicializar datos se aplicará a la base identificada para este proyecto al preparar el entorno. No habilita limpiezas automáticas indiscriminadas ni ejecución del seed contra una conexión desconocida.

## Prioridades aprobadas

1. Matriz de permisos: roles, acciones y alcance de recursos.
2. Reglas de agenda: disponibilidad, duración, consultorios, derivaciones, concurrencia y sobrecupos.
3. Flujo de atención: llegada, espera, atención, cierre e historial.

## Orientación técnica

- Migrar a NestJS con módulos por dominio, manteniendo PostgreSQL y Prisma como base propuesta.
- Corregir los defectos auditados, especialmente registro privilegiado público, revocación de acceso, fechas estáticas, concurrencia, integridad clínica y build.
- Establecer validación global, errores coherentes, contratos OpenAPI, auditoría y pruebas de integración con PostgreSQL.
- Preservar el punto base; implementar cambios progresivos y comprobar cada hito antes de integrarlo.

## Siguiente entregable, previo al código funcional

Especificación de permisos, agenda y flujo clínico, seguida del modelo de datos revisado y alcance concreto de caja básica. Las decisiones todavía abiertas se señalarán como propuestas, sin atribuirles aprobación previa.
