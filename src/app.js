require('dotenv').config()
const express      = require('express')
const cors         = require('cors')
const helmet       = require('helmet')
const rateLimit    = require('express-rate-limit')
const cookieParser = require('cookie-parser')

const authRoutes = require('./routes/auth.routes')

const app  = express()
const PORT = process.env.PORT || 3000

// ── Seguridad: Cabeceras HTTP ─────────────────────
app.use(helmet())

// ── CORS: Solo permite el frontend ───────────────
app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,  // necesario para cookies
  methods:     ['GET', 'POST', 'PUT', 'DELETE']
}))

// ── Parseo ────────────────────────────────────────
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// ── Rate limit global ─────────────────────────────
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      100,
  message:  { error: 'Demasiadas peticiones. Intenta más tarde.' }
}))

// ── Rate limit estricto para auth ─────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      5,
  message:  { error: 'Demasiados intentos. Espera 15 minutos.' }
})
app.use('/api/auth/login',    authLimiter)
app.use('/api/auth/register', authLimiter)

// ── Rutas ─────────────────────────────────────────
app.use('/api/auth', authRoutes)

// ── Health check ──────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', app: 'FODEGAN API v0.1' })
})

// ── Ruta no encontrada ────────────────────────────
app.use('*', (_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' })
})

// ── Error handler global ──────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Error interno del servidor' })
})

app.listen(PORT, () => {
  console.log(`✅ FODEGAN API corriendo en http://localhost:${PORT}`)
})

module.exports = app