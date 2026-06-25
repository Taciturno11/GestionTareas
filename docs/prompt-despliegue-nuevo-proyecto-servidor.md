# Prompt para Codex: desplegar un proyecto nuevo en mi servidor

Copia y pega este texto en el otro chat de Codex cuando vayas a subir un proyecto diferente al servidor.

---

Hola Codex. Quiero desplegar este proyecto nuevo en mi servidor usando el dominio `mundial.martinnauca.com`. Por favor primero revisa el proyecto completo y arma el plan antes de tocar produccion.

## Datos del servidor

- Servidor SSH: `root@72.60.138.218`
- Servidor web: Nginx
- Los proyectos deben quedar separados entre si.
- No tocar ni reemplazar otros proyectos existentes en el servidor.
- Dominio objetivo para este nuevo proyecto: `https://mundial.martinnauca.com`.

## Datos que debes pedirme antes de desplegar

Preguntame y confirma estos datos:

- Nombre corto del proyecto, recomendado: `mundial`.
- Confirmar dominio: `mundial.martinnauca.com`.
- Si el proyecto tiene solo frontend, solo backend, o frontend + backend.
- Puerto interno del backend si aplica, por ejemplo: `4200`, `4300`, etc.
- Si usa base de datos PostgreSQL.
- Si necesita variables de entorno.
- Comando de build.
- Comando de start del backend.

## Estructura recomendada en el servidor

Usa esta estructura recomendada:

```text
/var/www/mundial
/opt/mundial/current
/opt/mundial/releases
/etc/mundial
/opt/backups/mundial
```

Si hay backend Node.js:

```text
/opt/mundial/current/backend
/etc/mundial/backend.env
systemd service: mundial-backend.service
```

Si hay frontend estatico:

```text
/var/www/mundial
```

## Reglas de seguridad

- No imprimir secretos en consola ni en respuestas.
- No subir `.env` al repositorio.
- No copiar `.env` local a produccion.
- Crear el archivo de variables en `/etc/mundial/backend.env`.
- No reutilizar rutas, servicios ni puertos de otros proyectos existentes.
- Antes de desplegar, hacer backup si ya existe una version anterior.
- Preservar archivos runtime de produccion si existen, como `config.js`.

## Flujo de despliegue esperado

1. Revisar estructura del proyecto.
2. Identificar stack, comandos de build/start y variables necesarias.
3. Usar rutas finales del proyecto `mundial`.
4. Proponer puerto interno si hay backend.
5. Crear o revisar configuracion Nginx.
6. Crear o revisar servicio systemd si hay backend.
7. Ejecutar build local.
8. Crear paquete de despliegue.
9. Copiar paquete al servidor por `scp`.
10. Crear release en `/opt/mundial/releases/FECHA`.
11. Hacer backup de version anterior si existe.
12. Copiar frontend a `/var/www/mundial`.
13. Copiar backend a `/opt/mundial/current/backend`.
14. Instalar dependencias de produccion.
15. Ejecutar migraciones si aplica.
16. Reiniciar servicio backend si aplica.
17. Validar Nginx con `nginx -t`.
18. Recargar Nginx.
19. Verificar health check.
20. Verificar dominio publico.

## Importante

Antes de ejecutar comandos destructivos en el servidor, explicame exactamente que rutas vas a tocar. Si alguna ruta pertenece a otro proyecto existente, detente y preguntame.

Primero analiza y hazme preguntas. Luego arma el plan. Despues, cuando yo confirme, implementa el despliegue.
