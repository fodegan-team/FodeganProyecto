const bcrypt = require('bcrypt')
const jwt    = require('jsonwebtoken')
const pool   = require('../config/database')

// ── Generar tokens ────────────────────────────────
function generarAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m'
  })
}

function generarRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  })
}

// ── REGISTRO ──────────────────────────────────────
const register = async (req, res) => {
  try {
    const { nombre, apellido, email, password, rol_id } = req.body

    // Verificar si el email ya existe
    const [existe] = await pool.query(
      'SELECT id FROM usuarios WHERE email = ?', [email]
    )
    if (existe.length > 0) {
      return res.status(400).json({ error: 'El correo ya está registrado' })
    }

    // Hash de la contraseña con bcrypt (12 rounds)
    const password_hash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 12)

    // Insertar usuario
    const [result] = await pool.query(
      `INSERT INTO usuarios (nombre, apellido, email, password_hash, rol_id)
       VALUES (?, ?, ?, ?, ?)`,
      [nombre, apellido, email, password_hash, rol_id || 1]
    )

    // Generar tokens
    const payload = { id: result.insertId, email, rol_id: rol_id || 1 }
    const accessToken  = generarAccessToken(payload)
    const refreshToken = generarRefreshToken(payload)

    // Guardar refresh token en BD
    await pool.query(
      'UPDATE usuarios SET refresh_token = ? WHERE id = ?',
      [refreshToken, result.insertId]
    )

    // Enviar refresh token en cookie httpOnly (más seguro)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:   7 * 24 * 60 * 60 * 1000 // 7 días
    })

    return res.status(201).json({
      message: 'Usuario registrado exitosamente',
      accessToken,
      usuario: {
        id:      result.insertId,
        nombre,
        apellido,
        email,
        rol_id:  rol_id || 1
      }
    })
  } catch (err) {
    console.error('Error en register:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// ── LOGIN ─────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Buscar usuario
    const [usuarios] = await pool.query(
      `SELECT u.*, r.nombre as rol
       FROM usuarios u
       JOIN roles r ON u.rol_id = r.id
       WHERE u.email = ? AND u.activo = TRUE`,
      [email]
    )

    if (usuarios.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' })
    }

    const usuario = usuarios[0]

    // Verificar contraseña con bcrypt
    const passwordValida = await bcrypt.compare(password, usuario.password_hash)
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales incorrectas' })
    }

    // Generar tokens
    const payload = { id: usuario.id, email: usuario.email, rol_id: usuario.rol_id }
    const accessToken  = generarAccessToken(payload)
    const refreshToken = generarRefreshToken(payload)

    // Actualizar refresh token en BD
    await pool.query(
      'UPDATE usuarios SET refresh_token = ? WHERE id = ?',
      [refreshToken, usuario.id]
    )

    // Enviar refresh token en cookie httpOnly
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:   7 * 24 * 60 * 60 * 1000
    })

    return res.json({
      message: 'Login exitoso',
      accessToken,
      usuario: {
        id:      usuario.id,
        nombre:  usuario.nombre,
        apellido:usuario.apellido,
        email:   usuario.email,
        rol:     usuario.rol,
        rol_id:  usuario.rol_id
      }
    })
  } catch (err) {
    console.error('Error en login:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// ── LOGOUT ────────────────────────────────────────
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies

    if (refreshToken) {
      // Invalidar refresh token en BD
      await pool.query(
        'UPDATE usuarios SET refresh_token = NULL WHERE refresh_token = ?',
        [refreshToken]
      )
    }

    res.clearCookie('refreshToken')
    return res.json({ message: 'Sesión cerrada correctamente' })
  } catch (err) {
    console.error('Error en logout:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// ── REFRESH TOKEN ─────────────────────────────────
const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken
    if (!token) return res.status(401).json({ error: 'No autorizado' })

    // Verificar que el token existe en BD
    const [usuarios] = await pool.query(
      'SELECT * FROM usuarios WHERE refresh_token = ?', [token]
    )
    if (usuarios.length === 0) return res.status(401).json({ error: 'Token inválido' })

    // Verificar firma del token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const payload = { id: decoded.id, email: decoded.email, rol_id: decoded.rol_id }

    const nuevoAccessToken = generarAccessToken(payload)

    return res.json({ accessToken: nuevoAccessToken })
  } catch (err) {
    return res.status(401).json({ error: 'Token expirado o inválido' })
  }
}

module.exports = { register, login, logout, refreshToken }