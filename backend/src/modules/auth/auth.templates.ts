interface LoginOtpTemplateInput {
  productName: string
  name: string
  code: string
  ttlMinutes: number
}

export function buildLoginOtpEmail({ productName, name, code, ttlMinutes }: LoginOtpTemplateInput) {
  const subject = `${productName}: codigo de verificacion`
  const text = [
    `Hola ${name},`,
    '',
    `Tu codigo de verificacion es: ${code}`,
    `Este codigo vence en ${ttlMinutes} minutos.`,
    '',
    'Si no intentaste iniciar sesion, ignora este correo.',
  ].join('\n')

  const html = `
    <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6; padding: 24px;">
      <p style="margin: 0 0 12px;">Hola ${name},</p>
      <p style="margin: 0 0 16px;">Usa este codigo para completar tu inicio de sesion en ${productName}.</p>
      <div style="display: inline-block; padding: 12px 18px; border-radius: 12px; background: #0f766e; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 6px;">
        ${code}
      </div>
      <p style="margin: 16px 0 0;">Este codigo vence en ${ttlMinutes} minutos.</p>
      <p style="margin: 16px 0 0; color: #475569;">Si no intentaste iniciar sesion, puedes ignorar este mensaje.</p>
    </div>
  `

  return {
    subject,
    text,
    html,
  }
}
