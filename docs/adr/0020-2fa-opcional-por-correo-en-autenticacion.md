# 0020 - 2FA opcional por correo en autenticacion

## Estado

Aceptado.

## Contexto

El backend ya usa JWT con login por correo y contrasena. Se necesita reforzar el acceso sin romper el flujo actual ni obligar a todos los usuarios del MVP a usar un segundo paso desde el primer dia.

## Decision

Se agrega verificacion en dos pasos opcional por usuario dentro del modulo `auth` existente.

Reglas:

- El login base sigue validando correo y contrasena.
- Si `User.twoFactorEnabled` es `false`, el backend responde como hoy con `{ user, token }`.
- Si `User.twoFactorEnabled` es `true`, el backend genera un OTP temporal por correo y no entrega JWT hasta validar ese codigo.
- El metodo inicial soportado es `email`.
- Los OTP se almacenan hasheados, con expiracion, limite de intentos y un challenge reutilizable para reenvio controlado.
- El usuario define su seguridad personal mediante `twoFactorEnabled`.
- El rol del usuario se modela de forma independiente con valores iniciales `admin_unitek` y `cliente`.

## Consecuencias

- El frontend puede migrar a un flujo de login de dos pasos sin perder compatibilidad con la respuesta final existente.
- Se agregan variables SMTP obligatorias para usar 2FA por correo.
- El modelo `User` gana estado de seguridad y rol.
- Se introduce la tabla `LoginOtpChallenge` para persistir verificaciones temporales.
