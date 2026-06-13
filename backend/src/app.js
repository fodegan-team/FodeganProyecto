require('dotenv').config()
const express      = require('express')
const cors         = require('cors')
const helmet       = require('helmet')
const rateLimit    = require('express-rate-limit')
const cookieParser = require('cookie-parser')

const authRoutes = require('./routes/auth.routes')
const adminRoutes = require('./routes/admin.routes')
const zootecnistaRoutes = require('./routes/zootecnista.routes')
const fincaRoutes    = require('./routes/finca.routes')
const inversionRoutes = require('./routes/inversion.routes')

const server = express()
const PORT   = process.env.PORT || 3000
const propietarioRoutes = require('./routes/propietario.routes')

server.use(helmet())
server.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'DELETE']
}))

server.use(express.json({ limit: '50mb' }))
server.use(express.urlencoded({ extended: true, limit: '50mb' }))
server.use(express.urlencoded({ extended: true }))
server.use(cookieParser())

if (process.env.NODE_ENV !== 'test') {
  server.use('/api', rateLimit({
    windowMs: 15 * 60 * 1000,
    max:      100,
    message:  { error: 'Demasiadas peticiones. Intenta más tarde.' }
  }))
}

if (process.env.NODE_ENV !== 'test') {
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max:      100,  // Aumentado para desarrollo
    message:  { error: 'Demasiados intentos. Espera 15 minutos.' }
  })
  server.use('/api/auth/login',    authLimiter)
  server.use('/api/auth/register', authLimiter)
}

// ── Rutas ─────────────────────────────────────────
server.use('/api/auth', authRoutes)
server.use('/api/inversiones',inversionRoutes)
server.use('/api/fincas', fincaRoutes)
server.use('/api/admin', adminRoutes)
server.use('/api/zootecnista', zootecnistaRoutes)
server.use('/api/propietario', propietarioRoutes)
// ── Health check ──────────────────────────────────
server.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', app: 'FODEGAN API v0.1' })
})

// ── 404 ───────────────────────────────────────────
server.use('*', (_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' })
})

// ── Error handler ─────────────────────────────────
server.use((err, _req, res, _next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Error interno del servidor' })
})

const path = require('path')
// Servir frontend en producción
if (process.env.NODE_ENV === 'production') {
  server.use(express.static(path.join(__dirname, '../../frontend/dist')))
  server.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'))
  })
}

server.listen(PORT, () => {
  console.log(`✅ FODEGAN API corriendo en http://localhost:${PORT}`)
})

module.exports = server