# AGENTS.md

Contexto operativo para agentes IA que trabajen en este repositorio.

## Objetivo del proyecto

Construir el frontend de una aplicacion de gestion de tareas. La app debe permitir evolucionar hacia vistas de inicio, tareas, proyectos, calendario y archivo.

## Estado actual

- Proyecto frontend SPA.
- Backend inicial ya existe en `backend/` con Express, Prisma y PostgreSQL.
- Datos actuales viven como mock data local.
- Routing ya existe con `react-router-dom`.
- UI usa Tailwind CSS, componentes `components/ui`, Base UI/shadcn y algunos iconos de Heroicons/Lucide.

## Stack principal

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query para cache compartida de tareas y ajustes
- shadcn/Base UI
- Tiptap para hojas de texto enriquecido
- tldraw para hojas tipo pizarra
- React Flow para diagramas BD

## Estructura importante

- `src/App.tsx`: rutas principales.
- `src/components/AppLayout/`: layout base de app privada.
- `src/components/Header/`: cabecera.
- `src/components/Sidebar/`: navegacion lateral.
- `src/components/ui/`: componentes base reutilizables.
- `src/data/`: mock data local.
- `src/pages/`: paginas principales.
- `src/types/`: tipos compartidos.
- `docs/adr/`: decisiones arquitectonicas.
- `docs/bitacora-cambios-gestion-tareas.md`: historial vivo y obligatorio de cambios recientes.
- `docs/guia-continuidad-y-despliegue-produccion.md`: procedimiento obligatorio para trabajar entre laptops y desplegar.
- `docs/hojas-texto-pizarra.md`: reglas operativas para hojas de texto y pizarra.
- `docs/plan-migracion-workspaces-proyectos.md`: plan aprobado para workspaces personales y proyectos normalizados.

## Reglas para cambios

- Leer `docs/bitacora-cambios-gestion-tareas.md` antes de comenzar cualquier cambio para conocer el contexto mas reciente.
- Leer `docs/guia-continuidad-y-despliegue-produccion.md` antes de conectarse o desplegar en produccion.
- Actualizar la bitacora al terminar cada implementacion, correccion, cambio documental o despliegue.
- Agregar las entradas nuevas al inicio de `Cambios recientes` y nunca borrar el historial anterior.
- Registrar objetivo, cambios, validaciones, despliegue y commit cuando corresponda.
- No escribir secretos, tokens, contrasenas ni claves sensibles en la bitacora.
- No reemplazar el `.env` del servidor ni `config.js` de produccion durante un despliegue.
- Antes de desplegar, exigir working tree limpio, build, backup, migraciones y health checks.
- Leer ADRs antes de cambiar decisiones de arquitectura.
- Crear ADR nuevo si una decision aprobada cambia o aparece una decision tecnica relevante.
- No editar ADR antiguo para ocultar historia; solo corregir typos o enlaces.
- Preferir patrones existentes sobre abstracciones nuevas.
- Mantener mock data desacoplada para reemplazo futuro por API.
- Evitar mezclar nuevos sistemas de estilos sin ADR o razon clara.
- Mantener componentes de UI reutilizables en `src/components/ui/`.
- Mantener vistas principales en `src/pages/`.
- Para hojas de texto enriquecido, usar Tiptap; no volver a textarea plano salvo compatibilidad puntual.
- Para pizarras, usar tldraw; no crear canvas propio mientras tldraw cubra el caso.
- Para diagramas BD, usar React Flow (`@xyflow/react`); no construir motor de nodos/conexiones propio.
- Archivar espacios debe ser reversible; borrar espacios sigue siendo destructivo y requiere confirmacion.
- Si se cambia el modelo de `WorkspacePage.content` o `WorkspacePage.type`, crear o actualizar ADR/documentacion.
- Antes de agregar extensiones pesadas de Tiptap/tldraw, revisar impacto en bundle y considerar lazy loading.

## Reglas de diseno UX/UI

- Revisar `docs/diseno-ui.md` antes de crear o modificar componentes visuales.
- Antes de aplicar o cerrar un cambio visual, verificar que el resto de componentes de la misma seccion sigan viendose bien.
- Probar componentes reutilizables en sus variantes principales, no solo en el caso que se esta editando.
- No meter formularios complejos dentro de cards pequenas, pills o botones si eso comprime inputs o genera saltos de layout.
- Inputs, color pickers, previews y acciones no deben competir por el mismo espacio.
- Si una interaccion necesita varios controles, usar un formulario, panel o zona separada.
- Estados hover, editar, eliminar y agregar deben ser comodos y no tapar texto ni acciones principales.
- Si un input o textarea necesita cursor de texto, usar `cursor-text-dark` junto con `caret-gray-900`; evita que el I-beam nativo se vea blanco/invisible.
- Si un popover/dropdown se abre dentro de un modal, revisar z-index; `PopoverContent` usa portal y debe quedar encima del modal/backdrop.

## Comandos utiles

```bash
npm run dev
npm run build
npm run lint
```

## Antes de terminar una tarea

- Ejecutar `npm run build` si cambia codigo TypeScript o configuracion.
- Ejecutar `npm run lint` si cambia logica, componentes o imports.
- Actualizar `docs/bitacora-cambios-gestion-tareas.md` con el resultado real de la tarea.
- Actualizar README o ADR si cambia contexto, estructura o decision tecnica.

## Notas de contexto

- `docs/adr/0002` dice que routing se evaluaria despues, pero el repo ya usa React Router. Conviene crear ADR nuevo para formalizar esa decision.
- `docs/adr/0003` describe una estructura inicial; la estructura real ya incluye `components/ui` y `lib`.
- `docs/adr/0004` cubre Tailwind, pero no formaliza shadcn/Base UI/iconos.
