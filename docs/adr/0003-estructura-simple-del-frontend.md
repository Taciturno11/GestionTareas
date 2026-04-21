# 0003 - Estructura simple del frontend

## Estado

Aprobado

## Contexto

El proyecto esta en una etapa temprana y todavia no necesita una arquitectura por modulos complejos o por features profundas.

Al mismo tiempo, conviene evitar que todos los archivos queden mezclados en `src/`.

## Decision

Se adopta una estructura simple del frontend basada en responsabilidad general.

La referencia actual es esta:

```text
src/
├─ assets/
├─ components/
├─ data/
├─ pages/
├─ types/
├─ App.tsx
└─ index.css
```

Criterios iniciales:

- `pages/` para vistas principales
- `components/` para piezas reutilizables
- `data/` para mock data y datos temporales del frontend
- `types/` para contratos y tipos compartidos
- `assets/` para imagenes y recursos visuales

## Consecuencias

- La estructura sera facil de entender mientras el proyecto sigue pequeno.
- Habra menos friccion para crear nuevas pantallas y componentes.
- Si el proyecto crece bastante, esta estructura podra evolucionar a una organizada por dominio o feature.
- No se adopta por ahora una arquitectura mas pesada porque todavia no esta justificada.
