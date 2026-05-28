/**
 * PRUEBAS DE INTEGRACIÓN — FODEGAN
 * Prueban los endpoints reales de la API con la base de datos
 */

const request = require('supertest')

process.env.PORT                  = 3001
process.env.JWT_SECRET            = 'test_secret_fodegan'
process.env.JWT_EXPIRES_IN        = '15m'
process.env.JWT_REFRESH_EXPIRES_IN = '7d'
process.env.BCRYPT_ROUNDS         = '10'
process.env.DB_HOST               = 'localhost'
process.env.DB_PORT               = '3306'
process.env.DB_NAME               = 'fodegan_db'
process.env.DB_USER               = 'root'
process.env.DB_PASSWORD           = '123456789'
process.env.FRONTEND_URL          = 'http://localhost:5173'

const app = require('../app')

// Email único para no chocar con usuarios existentes
const emailTest = `test_${Date.now()}@fodegan.com`

// ══════════════════════════════════════════════════════
// PRUEBA DE INTEGRACIÓN 1 — Registro de usuario inversor
// ══════════════════════════════════════════════════════
describe('Prueba de Integración 1: Registro de inversor', () => {

  test('debe registrar un inversor correctamente', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        nombre:           'Test',
        apellido:         'Integración',
        email:            emailTest,
        password:         'Fodegan2026',
        telefono:         '3001234567',
        cedula:           `TEST${Date.now()}`,
        ciudad:           'Bogotá',
        rol_id:           1,
        monto_disponible: 5000000,
        banco:            'Bancolombia',
        tipo_cuenta:      'ahorros',
        numero_cuenta:    '12345678901'
      })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('accessToken')
    expect(res.body.aprobado).toBe(true)
    expect(res.body.usuario.email).toBe(emailTest)
  })

  test('debe rechazar registro con email duplicado', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        nombre:           'Test',
        apellido:         'Duplicado',
        email:            emailTest,
        password:         'Fodegan2026',
        telefono:         '3001234567',
        cedula:           `DUP${Date.now()}`,
        rol_id:           1,
        monto_disponible: 1000000,
        banco:            'Nu',
        tipo_cuenta:      'ahorros',
        numero_cuenta:    '99999999999'
      })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('El correo ya está registrado')
  })

  test('debe rechazar registro con contraseña inválida', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        nombre:    'Test',
        apellido:  'Invalid',
        email:     `invalido_${Date.now()}@test.com`,
        password:  '1234',
        telefono:  '3001234567',
        cedula:    `INV${Date.now()}`,
        rol_id:    1
      })

    expect(res.status).toBe(400)
  })
})

// ══════════════════════════════════════════════════════
// PRUEBA DE INTEGRACIÓN 2 — Login de usuario
// ══════════════════════════════════════════════════════
describe('Prueba de Integración 2: Login de usuario', () => {

  test('debe iniciar sesión correctamente con credenciales válidas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email:    emailTest,
        password: 'Fodegan2026'
      })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('accessToken')
    expect(res.body.usuario).toHaveProperty('rol')
    expect(res.body.usuario.email).toBe(emailTest)
  })

  test('debe rechazar login con contraseña incorrecta', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email:    emailTest,
        password: 'ClaveIncorrecta123'
      })

    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Credenciales incorrectas')
  })

  test('debe rechazar login con email inexistente', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email:    'noexiste@fodegan.com',
        password: 'Fodegan2026'
      })

    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Credenciales incorrectas')
  })
})