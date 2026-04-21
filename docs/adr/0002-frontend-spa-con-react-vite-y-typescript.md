# 0002 - Frontend SPA con React, Vite y TypeScript

## Estado

Aprobado

## Contexto

El proyecto actual es una aplicacion web de gestion de tareas y el trabajo se esta iniciando por el frontend.

Se necesita una base que permita iterar rapido, construir pantallas, validar flujos y mantener tipado razonable sin agregar complejidad innecesaria.

## Decision

El frontend se desarrollara como una SPA usando:

- `React` para la capa de interfaz
- `Vite` para scaffolding, entorno de desarrollo y build
- `TypeScript` para el tipado del codigo

La navegacion inicial sera propia de una SPA. Si en una fase posterior se necesita enrutamiento formal, se evaluara incorporar una libreria de routing.

## Consecuencias

- El desarrollo visual sera rapido y con buen ciclo de feedback local.
- El tipado ayudara a ordenar componentes, datos de prueba y futuras integraciones.
- El proyecto quedara preparado para crecer hacia varias vistas sin cambiar la base elegida.
- La aplicacion dependera de JavaScript en el cliente, lo cual es aceptable para la etapa actual del producto.
