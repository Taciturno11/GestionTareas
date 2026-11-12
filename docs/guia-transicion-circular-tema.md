# Guia reutilizable: cambio de tema con revelado circular

Esta guia permite reproducir el cambio claro/oscuro de GESTION_TAREAS en otros proyectos. El circulo nace en el centro de la pantalla, tiene un borde suavizado y revela el tema nuevo durante 900 ms. No depende del backend ni consume una API externa: `document.startViewTransition()` es una API del navegador; el resto es CSS y una actualizacion del tema en el DOM.

La implementacion de este repositorio esta en:

- [`src/components/Header/Header.tsx`](../src/components/Header/Header.tsx): boton, inicio de la transicion y fallback.
- [`src/index.css`](../src/index.css): mascara SVG, easing y animacion.
- [`src/theme/ThemeProvider.tsx`](../src/theme/ThemeProvider.tsx) y [`src/theme/theme.ts`](../src/theme/theme.ts): estado, preferencia del sistema y persistencia.
- [`index.html`](../index.html): tema inicial antes de renderizar la aplicacion.

## Que ocurre al pulsar el boton

1. Se determina el tema siguiente (`light` o `dark`).
2. Si el navegador no soporta View Transitions, o el usuario prefiere menos movimiento, se cambia el tema sin animacion.
3. En otro caso, `document.startViewTransition()` captura el estado anterior, ejecuta el cambio de tema y captura el estado nuevo.
4. CSS muestra `::view-transition-new(root)` mediante una mascara circular centrada. `mask-size` crece de `0` a `220vmax`; el SVG difumina el borde.
5. Al terminar se retira la clase temporal que activa estos estilos.

La posicion del boton no interviene: `mask-position: center` fija el origen en el centro de la vista de transicion. Para iniciar el efecto en el boton habria que medir sus coordenadas y cambiar la posicion de la mascara.

## Requisitos

- Dos temas aplicables al documento, preferiblemente con variables CSS.
- Un boton que cambie el tema sin recargar la pagina.
- JavaScript en el navegador. El servidor puede estar escrito en Python, Node.js, PHP u otro lenguaje.
- Fallback para navegadores sin `document.startViewTransition()` y para `prefers-reduced-motion: reduce`.

Esta receta anima un cambio **dentro del mismo documento**. No anima por si sola una navegacion con recarga completa. Las transiciones entre documentos son otra modalidad, con requisitos y soporte distintos.

## 1. Preparar los temas

Definir colores reales para ambos estados. La animacion solo revela el cambio; no crea una paleta automaticamente.

```css
:root {
  --app-bg: #ffffff;
  --app-text: #171717;
}

:root.dark {
  --app-bg: #121212;
  --app-text: #f5f5f5;
}

body {
  background: var(--app-bg);
  color: var(--app-text);
}
```

Si el proyecto usa Tailwind, se pueden conservar sus tokens y su clase `.dark`. Lo importante es que el cambio de clase o variables ocurra durante el callback de la transicion.

## 2. Agregar el CSS del efecto

Este bloque reproduce la mascara centrada, la suavidad del borde y la curva temporal de esta aplicacion. Colocarlo en el CSS global, no dentro de estilos `scoped` de un componente Vue.

```css
:root {
  --theme-transition-expo-out: linear(
    0 0%, 0.1684 2.66%, 0.3165 5.49%, 0.446 8.52%,
    0.5581 11.78%, 0.6535 15.29%, 0.7341 19.11%,
    0.8011 23.3%, 0.8557 27.93%, 0.8962 32.68%,
    0.9283 38.01%, 0.9529 44.08%, 0.9711 51.14%,
    0.9833 59.06%, 0.9915 68.74%, 1 100%
  );
  --theme-transition-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Cdefs%3E%3Cfilter id='blur'%3E%3CfeGaussianBlur stdDeviation='2'/%3E%3C/filter%3E%3C/defs%3E%3Ccircle cx='20' cy='20' r='18' fill='white' filter='url(%23blur)'/%3E%3C/svg%3E");
}

::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

::view-transition-new(root) {
  z-index: 1;
}

.theme-transition-circle::view-transition-group(root) {
  animation-duration: 900ms;
  animation-timing-function: var(--theme-transition-expo-out);
}

.theme-transition-circle::view-transition-old(root) {
  animation: none;
  animation-fill-mode: both;
  z-index: -1;
}

.theme-transition-circle::view-transition-new(root) {
  animation: theme-circle-reveal 900ms var(--theme-transition-expo-out) both;
  mask-image: var(--theme-transition-mask);
  mask-position: center;
  mask-repeat: no-repeat;
  mask-size: 0;
  -webkit-mask-image: var(--theme-transition-mask);
  -webkit-mask-position: center;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-size: 0;
}

@keyframes theme-circle-reveal {
  to {
    mask-size: 220vmax;
    -webkit-mask-size: 220vmax;
  }
}
```

`220vmax` es deliberadamente mayor que la ventana para que el circulo termine cubriendo las esquinas, incluso en pantallas muy anchas o altas. Los prefijos `-webkit-` ayudan con implementaciones de mascara que aun los necesitan.

## 3. Activar la transicion desde JavaScript

La funcion siguiente es independiente de React y Vue. `updateDom` debe aplicar el tema al documento antes de terminar; puede devolver una promesa si el framework actualiza el DOM de forma asincrona.

```js
function changeThemeWithCircle(updateDom) {
  const root = document.documentElement
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!document.startViewTransition || reduceMotion) {
    return Promise.resolve().then(updateDom)
  }

  root.classList.add('theme-transition-circle')
  let transition
  try {
    transition = document.startViewTransition(updateDom)
  } catch (error) {
    root.classList.remove('theme-transition-circle')
    return Promise.reject(error)
  }

  return transition.finished.finally(() => {
    root.classList.remove('theme-transition-circle')
  })
}
```

Ejemplo sin framework:

```html
<button type="button" data-theme-toggle aria-label="Cambiar tema">Cambiar tema</button>
<script>
  const storageKey = 'mi-app-tema'

  function applyTheme(nextTheme) {
    const root = document.documentElement
    root.classList.toggle('dark', nextTheme === 'dark')
    root.dataset.theme = nextTheme
    root.style.colorScheme = nextTheme
    try { localStorage.setItem(storageKey, nextTheme) } catch { /* almacenamiento opcional */ }
  }

  document.querySelector('[data-theme-toggle]').addEventListener('click', () => {
    const isDark = document.documentElement.classList.contains('dark')
    const nextTheme = isDark ? 'light' : 'dark'
    void changeThemeWithCircle(() => applyTheme(nextTheme)).catch(console.error)
  })
</script>
```

El ejemplo supone que `changeThemeWithCircle` ya se cargo en el mismo documento o mediante un modulo importado.

## 4. Evitar el destello del tema equivocado

Leer la preferencia antes de cargar el CSS principal o montar la aplicacion. Adaptar la clave de almacenamiento a cada proyecto. `system` significa seguir la configuracion del dispositivo.

```html
<script>
  (() => {
    let preference = 'system'
    try { preference = localStorage.getItem('mi-app-tema') || 'system' } catch { /* usar sistema */ }
    const systemDark = matchMedia('(prefers-color-scheme: dark)').matches
    const dark = preference === 'dark' || (preference === 'system' && systemDark)
    document.documentElement.classList.toggle('dark', dark)
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
  })()
</script>
```

Colocar este script al inicio de `<head>`, antes de la hoja de estilos. Si se ofrece la opcion `system`, tambien escuchar cambios de `prefers-color-scheme` mientras esa preferencia siga activa; GESTION_TAREAS lo hace en `ThemeProvider`.

## Adaptacion por tecnologia

### Vue 3

Mantener el CSS global. Dentro del callback, cambiar el estado reactivo y esperar `nextTick()` para que Vue aplique el DOM nuevo antes de que el navegador capture la vista final:

```js
import { nextTick } from 'vue'

function toggleTheme() {
  const next = resolvedTheme.value === 'dark' ? 'light' : 'dark'
  void changeThemeWithCircle(async () => {
    theme.value = next
    await nextTick()
    document.documentElement.classList.toggle('dark', next === 'dark')
    document.documentElement.dataset.theme = next
    document.documentElement.style.colorScheme = next
    try { localStorage.setItem('mi-app-tema', next) } catch { /* opcional */ }
  }).catch(console.error)
}
```

En este fragmento `theme` y `resolvedTheme` son el estado existente de la aplicacion; no son variables provistas por Vue. Si el proyecto ya tiene un composable o store de tema, usarlo en lugar de crear otro estado paralelo.

### React

En esta aplicacion el boton usa `flushSync` para completar el cambio de estado durante el callback. Adaptar `setTheme` al contexto o store del proyecto y asegurar que la clase `.dark` tambien cambie antes de terminar el callback:

```jsx
import { flushSync } from 'react-dom'

function toggleTheme() {
  const next = resolvedTheme === 'dark' ? 'light' : 'dark'
  void changeThemeWithCircle(() => {
    flushSync(() => setTheme(next))
    document.documentElement.classList.toggle('dark', next === 'dark')
    document.documentElement.dataset.theme = next
    document.documentElement.style.colorScheme = next
  }).catch(console.error)
}
```

`flushSync` se reserva para esta integracion concreta con la API del navegador; no es una recomendacion para todas las actualizaciones de React. Persistir la preferencia en el mecanismo de tema del proyecto.

### Backend Python: Django, Flask, FastAPI, etc.

El backend no implementa esta animacion. Incluir el CSS global, el script temprano del tema y el boton en la plantilla HTML que entrega Python. Al hacer clic, cambiar la clase del documento mediante JavaScript **sin enviar un formulario ni recargar la pagina**. Se puede almacenar la preferencia en `localStorage` o sincronizarla con el servidor si el producto necesita una preferencia por cuenta; esta sincronizacion es independiente de la animacion.

Si el clic provoca una navegacion completa, esta receta de `document.startViewTransition()` no cubre esa navegacion. Para ese caso, cambiar el tema dentro de la pagina o estudiar por separado las transiciones entre documentos.

## Comprobaciones antes de reutilizar

- Probar claro a oscuro y oscuro a claro, tambien con paginas que tengan imagenes, portales y componentes con estilos propios.
- Confirmar que la mascara parte del centro y cubre las cuatro esquinas en movil y escritorio.
- Confirmar que el tema se aplica sin animacion cuando `startViewTransition` no existe o `prefers-reduced-motion` es `reduce`.
- Recargar la pagina y confirmar que el tema guardado aparece desde el primer fotograma.
- Probar la preferencia `system` y un cambio de tema del sistema si el producto ofrece esa opcion.
- Comprobar compatibilidad en los navegadores objetivo; la API y algunos detalles de mascaras no estan disponibles en todas las versiones antiguas.

## Referencias

- [MDN: `Document.startViewTransition()`](https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition): API nativa y compatibilidad.
- [MDN: uso de View Transitions](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using): capturas anterior/nueva y pseudo-elementos.
- [MDN: `mask-image`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/mask-image) y [`mask-size`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/mask-size): mascara y expansion.
- [MDN: `prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion): accesibilidad.
- [Vue: `nextTick()`](https://vuejs.org/api/general.html#nexttick) y [React: `flushSync`](https://react.dev/reference/react-dom/flushSync): sincronizacion del DOM.
- [Demo de theme-toggle.rdsx.dev](https://theme-toggle.rdsx.dev/): inspiracion visual; no es un servicio consumido por la aplicacion.
- [MDN: `@view-transition`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40view-transition): modalidad distinta para navegar entre documentos.
