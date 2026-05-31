const nodemailer = require('nodemailer')
require('dotenv').config()

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

// ── Plantilla base HTML ───────────────────────────
function plantillaBase(contenido) {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #F4F5F7; margin: 0; padding: 0; }
        .container { max-width: 580px; margin: 30px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
        .header { background: #1B4332; padding: 28px 32px; text-align: center; }
        .header h1 { color: #D4A373; font-size: 22px; margin: 0; letter-spacing: 3px; }
        .header p { color: rgba(255,255,255,0.6); font-size: 11px; margin: 4px 0 0; letter-spacing: 1px; }
        .body { padding: 32px; color: #374151; line-height: 1.7; }
        .body h2 { color: #1B4332; font-size: 18px; margin-bottom: 12px; }
        .body p { font-size: 14px; margin-bottom: 12px; }
        .highlight { background: #F0FDF4; border-left: 4px solid #1B4332; padding: 14px 18px; border-radius: 0 8px 8px 0; margin: 16px 0; }
        .highlight p { margin: 4px 0; font-size: 13px; }
        .btn { display: inline-block; background: #1B4332; color: #fff !important; padding: 12px 28px; border-radius: 100px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 16px 0; }
        .footer { background: #F9FAFB; padding: 20px 32px; text-align: center; font-size: 11px; color: #9CA3AF; border-top: 1px solid #E5E7EB; }
        .divider { height: 1px; background: #E5E7EB; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>FODEGAN</h1>
          <p>FONDO DE INVERSIONES GANADERO</p>
        </div>
        <div class="body">
          ${contenido}
        </div>
        <div class="footer">
          © 2026 FODEGAN · Todos los derechos reservados<br/>
          Este correo es generado automáticamente, por favor no responder.
        </div>
      </div>
    </body>
    </html>
  `
}

// ── Correos del sistema ───────────────────────────

// Finca aprobada por el admin
async function correoFincaAprobada(propietario, finca) {
  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      propietario.email,
    subject: '✅ Tu finca ha sido aprobada — FODEGAN',
    html: plantillaBase(`
      <h2>¡Tu finca fue aprobada!</h2>
      <p>Hola <strong>${propietario.nombre}</strong>, nos complace informarte que tu finca ha superado nuestros filtros de calidad y ya está disponible en la plataforma.</p>
      <div class="highlight">
        <p><strong>Finca:</strong> ${finca.nombre_real}</p>
        <p><strong>Ubicación:</strong> ${finca.ubicacion}</p>
        <p><strong>Capacidad:</strong> ${finca.capacidad_total} animales</p>
      </div>
      <p>Los inversionistas ya pueden ver tu finca disponible y realizar inversiones. Te notificaremos cuando alguien invierta.</p>
    `)
  })
}

// Finca rechazada por el admin
async function correoFincaRechazada(propietario, finca, motivo) {
  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      propietario.email,
    subject: '❌ Tu finca no fue aprobada — FODEGAN',
    html: plantillaBase(`
      <h2>Tu finca no fue aprobada</h2>
      <p>Hola <strong>${propietario.nombre}</strong>, lamentamos informarte que tu finca no superó nuestros filtros en esta ocasión.</p>
      <div class="highlight">
        <p><strong>Finca:</strong> ${finca.nombre_real}</p>
        <p><strong>Motivo:</strong> ${motivo}</p>
      </div>
      <p>Puedes corregir los puntos mencionados y volver a solicitar la aprobación. Nuestro equipo está disponible para ayudarte.</p>
    `)
  })
}

// Inversión creada — correo al inversor con reunión
async function correoInversionCreada(inversor, inversion) {
  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      inversor.email,
    subject: '📋 Inversión registrada — Reunión pendiente · FODEGAN',
    html: plantillaBase(`
      <h2>Tu inversión fue registrada</h2>
      <p>Hola <strong>${inversor.nombre}</strong>, hemos recibido tu solicitud de inversión exitosamente.</p>
      <div class="highlight">
        <p><strong>Monto:</strong> $${parseInt(inversion.monto_cop).toLocaleString('es-CO')} COP</p>
        <p><strong>Animales:</strong> ${inversion.cantidad_animales}</p>
        <p><strong>Duración:</strong> ${inversion.dias_ciclo} días</p>
        <p><strong>Rendimiento esperado:</strong> ${inversion.rendimiento_pct}%</p>
      </div>
      <p><strong>Próximo paso:</strong> Nuestro equipo se pondrá en contacto contigo en las próximas 24-48 horas para coordinar una reunión de firma de documentos de confidencialidad y formalización.</p>
      <p>Una vez firmados los documentos, tu inversión quedará activa y podrás hacer seguimiento en tiempo real.</p>
    `)
  })
}

// Inversión aprobada por admin — correo al inversor
async function correoInversionAprobada(inversor, inversion) {
  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      inversor.email,
    subject: '🎉 ¡Tu inversión está activa! — FODEGAN',
    html: plantillaBase(`
      <h2>¡Tu inversión está activa!</h2>
      <p>Hola <strong>${inversor.nombre}</strong>, los documentos han sido firmados y tu inversión ya está en marcha.</p>
      <div class="highlight">
        <p><strong>Animales asignados:</strong> ${inversion.cantidad_animales}</p>
        <p><strong>Inicio del ciclo:</strong> ${new Date(inversion.fecha_inicio_ciclo).toLocaleDateString('es-CO')}</p>
        <p><strong>Fin estimado:</strong> ${new Date(inversion.fecha_fin_ciclo).toLocaleDateString('es-CO')}</p>
        <p><strong>Rendimiento:</strong> ${inversion.rendimiento_pct}%</p>
      </div>
      <p>Ya puedes ver el progreso de tu inversión en la sección <strong>"Mis Inversiones"</strong> de tu dashboard.</p>
    `)
  })
}

// Inversión cancelada por admin
async function correoInversionCancelada(inversor, motivo) {
  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      inversor.email,
    subject: '❌ Inversión no procesada — FODEGAN',
    html: plantillaBase(`
      <h2>Tu inversión no pudo procesarse</h2>
      <p>Hola <strong>${inversor.nombre}</strong>, lamentamos informarte que tu solicitud de inversión no pudo ser procesada.</p>
      <div class="highlight">
        <p><strong>Motivo:</strong> ${motivo}</p>
      </div>
      <p>No se realizó ningún cargo. Puedes intentar nuevamente con otra finca disponible.</p>
    `)
  })
}

// Zootecnista aprobado
async function correoZootecnistaAprobado(zootecnista) {
  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      zootecnista.email,
    subject: '✅ Cuenta aprobada — FODEGAN',
    html: plantillaBase(`
      <h2>¡Tu cuenta fue aprobada!</h2>
      <p>Hola <strong>${zootecnista.nombre}</strong>, tu cuenta de zootecnista ha sido verificada y aprobada.</p>
      <p>Ya puedes ingresar a la plataforma y ver las fincas asignadas bajo tu responsabilidad.</p>
    `)
  })
}

// Inversión finalizada — correo al admin
async function correoInversionFinalizada(inversion) {
  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      process.env.EMAIL_USER,
    subject: `⏰ Inversión #${inversion.id} llegó a su fin — FODEGAN`,
    html: plantillaBase(`
      <h2>Una inversión ha llegado a su fin</h2>
      <p>La inversión <strong>#${inversion.id}</strong> ha completado su ciclo.</p>
      <div class="highlight">
        <p><strong>Animales:</strong> ${inversion.cantidad_animales}</p>
        <p><strong>Monto:</strong> $${parseInt(inversion.monto_cop).toLocaleString('es-CO')} COP</p>
        <p><strong>Fecha fin:</strong> ${new Date(inversion.fecha_fin_ciclo).toLocaleDateString('es-CO')}</p>
      </div>
      <p>Por favor coordina las reuniones de cierre con el inversor, propietario y zootecnista.</p>
    `)
  })
}

module.exports = {
  correoFincaAprobada,
  correoFincaRechazada,
  correoInversionCreada,
  correoInversionAprobada,
  correoInversionCancelada,
  correoZootecnistaAprobado,
  correoInversionFinalizada
}