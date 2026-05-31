require('dotenv').config()
const bcrypt = require('bcrypt')
const pool   = require('./database')

async function createAdmin() {
  try {
    const hash = await bcrypt.hash('Admin2026', 12)

    await pool.query(`
      INSERT INTO usuarios (nombre, apellido, email, password_hash, rol_id, activo, aprobado)
      VALUES ('Admin', 'FODEGAN', 'admin@fodegan.com', ?, 4, TRUE, TRUE)
      ON DUPLICATE KEY UPDATE password_hash = ?
    `, [hash, hash])

    console.log('✅ Administrador creado correctamente')
    console.log('📧 Email: admin@fodegan.com')
    console.log('🔑 Contraseña: Admin2026')
    process.exit(0)
  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  }
}

createAdmin()