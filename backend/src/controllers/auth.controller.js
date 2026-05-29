const bcrypt = require('bcrypt')
const jwt    = require('jsonwebtoken')
const pool   = require('../config/database')

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

const register = async (req, res) => {
  try {
    const {
      nombre, apellido, email, password,
      telefono, cedula, ciudad, rol_id,
      // Inversor
      monto_disponible, banco, tipo_cuenta, numero_cuenta,
      // Propietario
      nombre_finca, ubicacion, hectareas, capacidad_bovinos,
      // Zootecnista
      tarjeta_profesional, universidad
    } = req.body

    const [existe] = await pool.query(
      'SELECT id FROM usuarios WHERE email = ?', [email]
    )
    if (existe.length > 0) {
      return res.status(400).json({ error: 'El correo ya está registrado' })
    }

    const password_hash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 12)

    // Inversor se aprueba automáticamente, los demás no
    const aprobado = rol_id === 1 ? true : false

    const [result] = await pool.query(
      `INSERT INTO usuarios (nombre, apellido, email, password_hash, telefono, cedula, ciudad, rol_id, aprobado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, apellido, email, password_hash, telefono, cedula, ciudad, rol_id || 1, aprobado]
    )

    const usuarioId = result.insertId

    // Insertar datos específicos según rol
    if (rol_id === 1) {
      // Inversor
      await pool.query(
        `INSERT INTO datos_inversor (usuario_id, monto_disponible, banco, tipo_cuenta, numero_cuenta)
         VALUES (?, ?, ?, ?, ?)`,
        [usuarioId, monto_disponible, banco, tipo_cuenta, numero_cuenta]
      )
    } else if (rol_id === 2) {
      // Propietario
      await pool.query(
        `INSERT INTO datos_propietario (usuario_id, nombre_finca, ubicacion, hectareas, capacidad_bovinos)
         VALUES (?, ?, ?, ?, ?)`,
        [usuarioId, nombre_finca, ubicacion, hectareas, capacidad_bovinos]
      )
    } else if (rol_id === 3) {
      // Zootecnista
      await pool.query(
        `INSERT INTO datos_zootecnista (usuario_id, tarjeta_profesional, universidad)
         VALUES (?, ?, ?)`,
        [usuarioId, tarjeta_profesional, universidad]
      )
    }

    const payload = { id: usuarioId, email, rol_id: rol_id || 1 }
    const accessToken  = generarAccessToken(payload)
    const refreshToken = generarRefreshToken(payload)

    await pool.query(
      'UPDATE usuarios SET refresh_token = ? WHERE id = ?',
      [refreshToken, usuarioId]
    )

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:   7 * 24 * 60 * 60 * 1000
    })

    return res.status(201).json({
      message: aprobado
        ? 'Registro exitoso. Ya puedes iniciar sesión.'
        : 'Registro exitoso. Tu cuenta está pendiente de aprobación por el administrador.',
      aprobado,
      accessToken: aprobado ? accessToken : null,
      usuario: { id: usuarioId, nombre, apellido, email, rol_id: rol_id || 1 }
    })
  } catch (err) {
    console.error('Error en register:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body

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

    const passwordValida = await bcrypt.compare(password, usuario.password_hash)
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales incorrectas' })
    }

    if (!usuario.aprobado) {
      return res.status(403).json({
        error: 'Tu cuenta está pendiente de aprobación por el administrador.'
      })
    }

    const payload = { id: usuario.id, email: usuario.email, rol_id: usuario.rol_id }
    const accessToken  = generarAccessToken(payload)
    const refreshToken = generarRefreshToken(payload)

    await pool.query(
      'UPDATE usuarios SET refresh_token = ? WHERE id = ?',
      [refreshToken, usuario.id]
    )

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
        id:       usuario.id,
        nombre:   usuario.nombre,
        apellido: usuario.apellido,
        email:    usuario.email,
        rol:      usuario.rol,
        rol_id:   usuario.rol_id
      }
    })
  } catch (err) {
    console.error('Error en login:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies
    if (refreshToken) {
      await pool.query(
        'UPDATE usuarios SET refresh_token = NULL WHERE refresh_token = ?',
        [refreshToken]
      )
    }
    res.clearCookie('refreshToken')
    return res.json({ message: 'Sesión cerrada correctamente' })
  } catch (err) {
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken
    if (!token) return res.status(401).json({ error: 'No autorizado' })

    const [usuarios] = await pool.query(
      'SELECT * FROM usuarios WHERE refresh_token = ?', [token]
    )
    if (usuarios.length === 0) return res.status(401).json({ error: 'Token inválido' })

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const payload = { id: decoded.id, email: decoded.email, rol_id: decoded.rol_id }
    const nuevoAccessToken = generarAccessToken(payload)

    return res.json({ accessToken: nuevoAccessToken })
  } catch (err) {
    return res.status(401).json({ error: 'Token expirado o inválido' })
  }
}

module.exports = { register, login, logout, refreshToken }