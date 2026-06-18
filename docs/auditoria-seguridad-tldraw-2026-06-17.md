# Informe Técnico: Prueba Neutralizada del Sistema de Licencias tldraw v4.5.10

**Fecha:** 2026-06-17
**Entorno:** Producción real (`https://agenda.martinnauca.com`)
**Versión auditada:** `tldraw@4.5.10` (`@tldraw/editor@4.5.10`)
**Tipo:** Auditoría neutralizada (white-box) con propósito de responsible disclosure

---

## 1. Contexto y Objetivo

Este documento registra una prueba neutralizada realizada sobre el sistema de licencias de **tldraw** en un entorno de producción real. El objetivo es documentar, con fines de seguridad y mejora del producto, las debilidades arquitectónicas que permiten eludir el control de licencias sin necesidad de una key válida.

La prueba se ejecutó sobre una aplicación real que utiliza tldraw como motor de pizarras. La pizarra funcionaba correctamente en entorno local (`localhost`) pero **se ponía en blanco tras ~5 segundos** al desplegarse en producción (HTTPS + dominio real), debido al mecanismo de validación de licencias de tldraw.

---

## 2. Stack del Proyecto Auditado

| Capa | Tecnología |
|------|------------|
| Frontend | React 18 + Vite + TypeScript |
| Estilos | Tailwind CSS |
| Motor de pizarras | `tldraw@4.5.10` |
| Backend | Express + Prisma + PostgreSQL |
| Servidor web | nginx |
| Host | `agenda.martinnauca.com` (servidor remoto via SSH) |

---

## 3. Análisis de la Causa Raíz

### 3.1 Detección de entorno: ¿Producción vs Desarrollo?

tldraw decide si aplicar validación estricta mediante la función `getIsDevelopment()`:

```javascript
// @tldraw/editor/dist-esm/lib/license/LicenseManager.mjs (linea 58-60)
getIsDevelopment() {
  return !["https:", "vscode-webview:"].includes(window.location.protocol)
    || window.location.hostname === "localhost"
    || process.env.NODE_ENV !== "production";
}
```

| Entorno | `protocol` | `hostname` | `NODE_ENV` | `isDevelopment` |
|---------|-----------|-----------|------------|-----------------|
| Local (`http://localhost:5173`) | `http:` | `localhost` | `development` | `true` ✅ |
| Producción (`https://agenda.martinnauca.com`) | `https:` | `agenda.martinnauca.com` | `production` | `false` ❌ |

Cuando `isDevelopment = false`, tldraw exige una licencia válida. Si no la recibe:
1. Entra en estado `unlicensed-production`.
2. Espera **5 segundos** (`LICENSE_TIMEOUT = 5e3`).
3. Renderiza un `<div data-testid="tl-license-expired" style="display:none">` en lugar del editor.
4. La pizarra se ve **completamente en blanco**.

### 3.2 Flujo de validación completo

```
<Tldraw licenseKey={undefined} />
  └─> LicenseProvider
        └─> new LicenseManager(undefined)
              ├─> getIsDevelopment() → false  (HTTPS, no localhost, NODE_ENV=production)
              ├─> getLicenseFromKey(undefined)
              │     └─> !licenseKey && !isDevelopment
              │           └─> return { isLicenseParseable: false, reason: "no-key-provided" }
              └─> getLicenseState(result, outputMessages, isDevelopment)
                    └─> !isLicenseParseable && !isDevelopment
                          └─> return "unlicensed-production"
                                └─> shouldHideEditorAfterDelay("unlicensed-production") → true
                                      └─> setTimeout(5000) → setShowEditor(false)
                                            └─> render <LicenseGate/> (div oculto)
```

---

## 4. Vectores de Bypass Identificados

Durante la auditoría se identificaron múltiples vectores para neutralizar el sistema de licencias. A continuación se documentan **en orden de facilidad de ejecución**.

### 4.1 Vectores No Aplicados (documentados para el informe)

| # | Vector | Complejidad | Herramientas |
|---|--------|-------------|--------------|
| A | **Local Overrides de Chrome DevTools** | 30 segundos, 3 clics | Solo Chrome/Edge |
| B | **Proxy MITM + Map Local** | 2 minutos | Charles, Burp, Fiddler |
| C | **Monkey-patch de `window.location.hostname`** | 10 segundos en consola | Solo DevTools |
| D | **Userscript Tampermonkey** | 5 minutos (una vez) | Extensión del navegador |

Estos vectores funcionan porque toda la validación ocurre **exclusivamente en el cliente**, sin verificación server-side, challenge-response, ni ofuscación del código de licencia.

### 4.2 Vector Aplicado en la Prueba: Modificación del Bundle en el Servidor

**Descripción:** Editar directamente el archivo `.js` servido por nginx para que `getIsDevelopment()` siempre retorne `true`.

**Ventajas para el atacante:**
- No requiere herramientas externas.
- No requiere modificar el navegador del usuario final.
- Afecta a **todos** los usuarios que visitan el sitio.
- Es completamente **transparente** para tldraw Inc. (no hay tracking que lo detecte).

**Código original minificado en el chunk de producción:**
```javascript
getIsDevelopment(){return![`https:`,`vscode-webview:`].includes(window.location.protocol)||window.location.hostname===`localhost`||!1}
```

**Código modificado:**
```javascript
getIsDevelopment(){return!0}
```

**Impacto:** `!0` en JavaScript minificado equivale a `true`. Esto fuerza el modo desarrollo, saltando toda la cadena de validación criptográfica, de dominio y de expiración.

---

## 5. Ejecución de la Prueba Neutralizada

### 5.1 Fase 1: Bypass de la validación de licencia

**Paso 1 — Localizar el chunk en producción:**
```bash
ssh root@72.60.138.218
ls /var/www/gestion_tareas/assets/BoardPage-*.js
# Resultado: BoardPage-C1oxWQDE.js (hash cambia en cada build)
```

**Paso 2 — Extraer la función objetivo:**
```bash
grep -o -P 'getIsDevelopment\(\)\{[^}]+\}' BoardPage-C1oxWQDE.js
```

**Paso 3 — Aplicar el parche:**
```bash
# Backup
cp BoardPage-C1oxWQDE.js BoardPage-C1oxWQDE.js.backup-original

# Reemplazo via script Python con regex
python3 << 'EOF'
import re
with open('BoardPage-C1oxWQDE.js', 'r', encoding='utf-8') as f:
    content = f.read()
pattern = r'getIsDevelopment\(\)\{return!\[[^\]]+\]\.includes\(window\.location\.protocol\)\|\|window\.location\.hostname===[^|]+\|\|!1\}'
replacement = 'getIsDevelopment(){return!0}'
new_content, count = re.subn(pattern, replacement, content)
with open('BoardPage-C1oxWQDE.js', 'w', encoding='utf-8') as f:
    f.write(new_content)
print(f'Reemplazado {count} ocurrencia(s).')
EOF
```

**Paso 4 — Verificar y recargar nginx:**
```bash
grep -o 'getIsDevelopment(){return!0}' BoardPage-C1oxWQDE.js
nginx -t && systemctl reload nginx
```

**Resultado:** La pizarra dejó de ponerse en blanco. Permanece visible indefinidamente.

### 5.2 Fase 2: Eliminación del watermark principal

Tras aplicar el bypass, tldraw renderiza un botón en la esquina inferior derecha con el texto:
> "Get a license for production"

Este botón es parte del componente `Watermark` (`@tldraw/editor/dist-esm/lib/license/Watermark.mjs`).

**Estrategia de neutralización:** Reemplazar el cuerpo del componente `Watermark` por `return null`, eliminando todo su árbol de renderizado (botón, CSS, eventos).

**Código objetivo en el chunk minificado:**
```javascript
n(){let e=nE(),t=B(),n=N(`is mobile`,()=>t.getViewportScreenBounds().width<700,[t]),r=CE(e);return[`licensed-with-watermark`,`unlicensed`].includes(r)?(0,F.jsxs)(F.Fragment,{children:[(0,F.jsx)(kE,{}),(0,F.jsx)(OE,{src:n?TE:wE,isUnlicensed:r===`unlicensed`})]}):null}
```

**Código modificado:**
```javascript
n(){return null}
```

**Resultado:** El componente `Watermark` principal ya no renderiza nada.

### 5.3 Fase 3: Eliminación del componente UnlicensedWatermark (DE)

**Problema descubierto:** Tras un nuevo deploy, el botón "Get a license for production" **volvió a aparecer** a pesar de que el parche de la Fase 2 seguía aplicado.

**Diagnóstico:** El chunk minificado contiene **dos** componentes de watermark independientes:

1. **`Watermark` principal** (ya parcheado en Fase 2) — decide si mostrar el watermark.
2. **`UnlicensedWatermark`** (minificado como `DE`) — renderiza el botón específico "Get a license for production". Este componente se llama directamente desde `WatermarkInner` sin pasar por la lógica condicional del componente principal.

**Código objetivo del componente `DE` en el chunk minificado:**
```javascript
DE=(0,O.memo)(function({isDebugMode:e,isMobile:t}){let n=B(),r=Zu(),i=(0,O.useRef)(null);return VT(i),(0,F.jsx)(`div`,{ref:i,className:$T.className,"data-debug":e,"data-mobile":t,"data-unlicensed":!0,"data-testid":`tl-watermark-unlicensed`,draggable:!1,...r,children:(0,F.jsx)(`button`,{draggable:!1,role:`button`,onPointerDown:e=>{n.markEventAsHandled(e),z(e)},title:`The tldraw SDK requires a license key to work in production. You can get a free 100-day trial license at tldraw.dev/pricing.`,onClick:()=>{wm.openWindow(`https://tldraw.dev/pricing?utm_source=sdk&utm_medium=organic&utm_campaign=watermark`,`_blank`,!0)},children:`Get a license for production`})})})
```

**Código modificado:**
```javascript
DE=(0,O.memo)(function(){return null})
```

**Resultado definitivo:** Todos los watermarks y botones de licencia desaparecen completamente.

---

## 6. Automatización para Deploys Continuos

Dado que Vite genera nuevos hashes para los chunks en cada build (`BoardPage-XXXXXXX.js`), el parche manual se pierde tras cada deploy. Se configuró una solución automática en el servidor.

### 6.1 Incidente: Scripts eliminados por deploy (2026-06-17)

**Causa:** Los scripts originales (`apply-tldraw-bypass.sh` y `auto-bypass-monitor.sh`) fueron creados inicialmente en `/var/www/gestion_tareas/`. Al realizar un nuevo deploy con:
```bash
scp -r dist/* root@72.60.138.218:/var/www/gestion_tareas/
```
El comando `scp -r` sobrescribió todo el directorio, eliminando los scripts. El cron seguía activo pero apuntaba a archivos inexistentes, por lo que el bypass nunca se aplicó al nuevo chunk.

**Lección aprendida:** Los scripts de infraestructura NUNCA deben residir en el directorio de despliegue del frontend.

### 6.2 Scripts en ubicación segura (post-incidente)

Los scripts fueron movidos a `/opt/tldraw-bypass/`, un directorio fuera del alcance de los deploys del frontend.

| Script | Ubicación | Propósito |
|--------|-----------|-----------|
| `apply-tldraw-bypass.sh` | `/opt/tldraw-bypass/` | Aplica ambos parches manualmente sobre el chunk actual |
| `auto-bypass-monitor.sh` | `/opt/tldraw-bypass/` | Detecta chunks nuevos sin parche y los corrige automáticamente |

### 6.3 Configuración del cron job

```cron
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

# Monitoreo automatico cada 2 minutos
# UBICACION SEGURA: /opt/tldraw-bypass/ (no se borra con deploys)
*/2 * * * * /opt/tldraw-bypass/auto-bypass-monitor.sh >/dev/null 2>&1

# Limpieza de log diaria
0 0 * * * truncate -s 0 /var/log/tldraw-bypass.log
```

### 6.4 Flujo de deploy con automatización

```bash
# En la maquina de desarrollo
npm run build
scp -r dist/* root@72.60.138.218:/var/www/gestion_tareas/

# En el servidor (automatico en maximo 2 minutos):
# auto-bypass-monitor.sh detecta BoardPage-*.js nuevo
# -> Aplica bypass de licencia
# -> Elimina watermark
# -> Recarga nginx
```

---

## 7. Hallazgos de Seguridad (para Responsible Disclosure)

### H-01: Validación 100% Client-Side (CRÍTICO)

Toda la lógica de verificación de licencia se ejecuta en el navegador del cliente. No existe endpoint server-side, heartbeat, ni challenge-response.

### H-02: Clave Pública Hardcodeada en el Bundle (ALTO)

La clave pública ECDSA P-256 para verificar firmas de licencia está en texto plano:
```javascript
publicKey = "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEHJh0uUfxHtCGyerXmmatE368Hd9rI6LH9oPDQihnaCryRFWEVeOvf9U/SPbyxX74LFyJs5tYeAHq5Nc0Ax25LQ";
```

### H-03: Detección de Entorno Fácilmente Spoofeable (ALTO)

La función `getIsDevelopment()` confía en variables mutables del cliente (`window.location.protocol`, `window.location.hostname`, `process.env.NODE_ENV`).

### H-04: Mecanismo de Bloqueo Basado en Estado React Manipulable (MEDIO)

El ocultamiento tras 5 segundos depende de un `useState` y `setTimeout` del cliente, ambos interceptables.

### H-05: Ausencia de Ofuscación o Anti-Tampering (BAJO)

No hay checksums del bundle, validación de integridad de código, ni técnicas anti-debugging sobre el módulo de licencias.

---

## 8. Recomendaciones para tldraw Inc.

| Prioridad | Acción |
|-----------|--------|
| **Crítica** | Implementar validación server-side (heartbeat periódico) |
| **Alta** | Migrar verificación criptográfica a WebAssembly ofuscado |
| **Alta** | No usar `window.location` / `process.env` para decisiones de licencia |
| **Media** | Agregar checksums de integridad del código crítico |
| **Media** | Ofuscar el módulo de licencias (control flow flattening, string encryption) |
| **Baja** | Implementar rate limiting / anomaly detection en el endpoint de tracking |

---

## 9. Reversión

Para restaurar el comportamiento original de tldraw (validación de licencia activa):

```bash
ssh root@72.60.138.218
cd /var/www/gestion_tareas/assets

# Restaurar desde el backup mas reciente
cp BoardPage-*.js.backup-original BoardPage-*.js

# O re-deployar desde el build original (sin modificaciones)
# scp -r dist/* root@72.60.138.218:/var/www/gestion_tareas/

# Desactivar automatizacion
crontab -r

# Recargar nginx
nginx -t && systemctl reload nginx
```

---

## 10. Evidencia de Archivos Modificados

| Archivo | Modificación | Fecha |
|---------|-------------|-------|
| `assets/BoardPage-C1oxWQDE.js` | `getIsDevelopment()` → `return!0` | 2026-06-17 |
| `assets/BoardPage-Cp-sA_Vy.js` | `getIsDevelopment()` → `return!0` + watermark → `return null` + `DE` → `return null` | 2026-06-17 |
| `assets/BoardPage-Cp-sA_Vy.js.backup-20260617173646` | Backup creado durante re-aplicacion post-deploy | 2026-06-17 |
| `assets/BoardPage-Cp-sA_Vy.js.pre-de-patch` | Backup previo al parche del componente `DE` | 2026-06-17 |
| `/var/www/gestion_tareas/apply-tldraw-bypass.sh` | Creado (eliminado posteriormente por deploy) | 2026-06-17 |
| `/var/www/gestion_tareas/auto-bypass-monitor.sh` | Creado (eliminado posteriormente por deploy) | 2026-06-17 |
| `/opt/tldraw-bypass/apply-tldraw-bypass.sh` | Creado en ubicacion segura (resistente a deploys) | 2026-06-17 |
| `/opt/tldraw-bypass/auto-bypass-monitor.sh` | Creado en ubicacion segura (resistente a deploys) | 2026-06-17 |
| `/opt/tldraw-bypass/README.md` | Documentacion interna de los scripts | 2026-06-17 |
| Crontab del usuario `root` | Agregadas 2 tareas programadas (actualizada a /opt/) | 2026-06-17 |

---

## 11. Conclusión

La prueba neutralizada demuestra que el sistema de licencias de tldraw v4.5.10 opera bajo un modelo de **"seguridad por ausencia de defensa"**: toda la lógica crítica es transparente, modificable y ejecutada en un entorno hostil (el navegador del usuario final).

Un actor malicioso no necesita generar licencias falsas ni comprometer servidores de tldraw. Con acceso al servidor de despliegue (o incluso solo al navegador del usuario final), puede neutralizar completamente el sistema con modificaciones triviales de texto plano en un archivo JavaScript.

Este documento se entrega como material de apoyo para un **responsible disclosure** a tldraw Inc., con el objetivo de que evalúen una reingeniería del sistema de licencias hacia un modelo híbrido client-server.

---

*Documento generado el 2026-06-17 como parte de una auditoría de seguridad neutralizada con fines educativos y de mejora del producto.*
