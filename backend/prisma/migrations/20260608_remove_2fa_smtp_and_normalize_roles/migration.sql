-- Normalize GESTION_TAREAS user roles and remove the unused email verification flow.
UPDATE "User" SET "role" = 'admin' WHERE "role" = 'admin_unitek';
UPDATE "User" SET "role" = 'usuario' WHERE "role" = 'cliente';

ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'usuario';

DROP TABLE IF EXISTS "LoginOtpChallenge";

ALTER TABLE "User" DROP COLUMN IF EXISTS "twoFactorEnabled";
ALTER TABLE "User" DROP COLUMN IF EXISTS "twoFactorMethod";
