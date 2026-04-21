# 0004 - Tailwind como base de estilos

## Estado

Aprobado

## Contexto

El proyecto necesita avanzar rapido en interfaz, layout y estilos visuales.

Tambien se busca mantener consistencia sin abrir muchos archivos CSS por componente desde el inicio.

## Decision

`Tailwind CSS` sera la base principal del sistema de estilos del frontend.

Lineamientos iniciales:

- Tailwind se usara como primera opcion para layout, espaciado, color, tipografia y estados visuales.
- `src/index.css` quedara para estilos globales y variables compartidas.
- Se permite usar estilos inline de forma puntual cuando se este traduciendo una maqueta especifica o cuando un detalle visual sea mas claro de expresar asi en una etapa temprana.
- Si una solucion inline empieza a repetirse o complica mantenimiento, debera normalizarse despues.

## Consecuencias

- El ritmo de iteracion visual sera alto.
- La mayoria de estilos estaran cerca del markup.
- Habra menos CSS disperso al inicio del proyecto.
- Se debe evitar mezclar demasiados enfoques de estilo sin criterio, para no perder consistencia.
