import bcrypt from "bcryptjs";

const password = "12345678"; // pon aquí la contraseña que quieres probar

const hash = "$2b$12$3/loFh0lXY5SyxNuc68uHO7LUReSD7b9DGxGVM1d9atFsbALclYkq";

const ok = await bcrypt.compare(password, hash);

console.log("¿Coincide?:", ok);

//$2b$12$3/loFh0lXY5SyxNuc68uHO7LUReSD7b9DGxGVM1d9atFsbALclYkq
//Desglose:
//$2b" -> algoritmo / versión
//$12 -> número de rondas (coste)
//$3/loFh0lXY5SyxNuc68uHO -> salt (16 bytes codificados en base64)
//7LUReSD7b9DGxGVM1d9atFsbALclYkq -> hash (24 bytes codificados en base64)