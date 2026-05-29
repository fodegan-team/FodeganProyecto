/**
 * PRUEBAS UNITARIAS — FODEGAN
 * Prueban funciones individuales sin depender de la BD
 */

const bcrypt = require('bcrypt')
const jwt    = require('jsonwebtoken')

// Simular variables de entorno
process.env.JWT_SECRET      = 'test_secret_fodegan'
process.env.JWT_EXPIRES_IN  = '15m'
process.env.BCRYPT_ROUNDS   = '10'

// ── Funciones a probar (extraídas del controlador) ──
function generarAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })
}

function validarPassword(password) {
  if (password.length < 8) return false
  if (!/[A-Z]/.test(password)) return false
  if (!/[0-9]/.test(password)) return false
  return true
}

// ══════════════════════════════════════════════════
// PRUEBA UNITARIA 1 — Hash de contraseña con bcrypt
// ══════════════════════════════════════════════════
describe('Prueba Unitaria 1: Hash de contraseña con bcrypt', () => {
  test('debe hashear la contraseña correctamente', async () => {
    const password = 'Fodegan2026'
    const hash = await bcrypt.hash(password, 10)

    // El hash no debe ser igual al texto plano
    expect(hash).not.toBe(password)
    // El hash debe tener el formato de bcrypt
    expect(hash).toMatch(/^\$2b\$/)
  })

  test('debe verificar correctamente una contraseña válida', async () => {
    const password = 'Fodegan2026'
    const hash = await bcrypt.hash(password, 10)
    const valida = await bcrypt.compare(password, hash)

    expect(valida).toBe(true)
  })

  test('debe rechazar una contraseña incorrecta', async () => {
    const hash = await bcrypt.hash('Fodegan2026', 10)
    const invalida = await bcrypt.compare('OtraPassword123', hash)

    expect(invalida).toBe(false)
  })
})

// ══════════════════════════════════════════════════
// PRUEBA UNITARIA 2 — Validación de contraseña
// ══════════════════════════════════════════════════
describe('Prueba Unitaria 2: Validación de reglas de contraseña', () => {
  test('debe rechazar contraseña menor a 8 caracteres', () => {
    expect(validarPassword('Abc123')).toBe(false)
  })

  test('debe rechazar contraseña sin mayúscula', () => {
    expect(validarPassword('fodegan2026')).toBe(false)
  })

  test('debe rechazar contraseña sin número', () => {
    expect(validarPassword('FodeganSinNumero')).toBe(false)
  })

  test('debe aceptar contraseña válida', () => {
    expect(validarPassword('Fodegan2026')).toBe(true)
  })
})