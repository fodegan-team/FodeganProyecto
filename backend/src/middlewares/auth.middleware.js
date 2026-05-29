const jwt  = require('jsonwebtoken')
const pool = require('../config/database')

const verificarToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' })
    }
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const [usuarios] = await pool.query(
      'SELECT id, nombre, email, rol_id, activo FROM usuarios WHERE id = ?',
      [decoded.id]
    )
    if (usuarios.length === 0 || !usuarios[0].activo) {
      return res.status(401).json({ error: 'Usuario no autorizado' })
    }
    req.usuario = usuarios[0]
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' })
  }
}

const verificarRol = (...rolesPermitidos) => {
  return async (req, res, next) => {
    try {
      const [roles] = await pool.query(
        'SELECT nombre FROM roles WHERE id = ?',
        [req.usuario.rol_id]
      )
      if (roles.length === 0) {
        return res.status(403).json({ error: 'Rol no encontrado' })
      }
      const rolUsuario = roles[0].nombre
      if (!rolesPermitidos.includes(rolUsuario)) {
        return res.status(403).json({
          error: `Acceso denegado. Se requiere rol: ${rolesPermitidos.join(' o ')}`
        })
      }
      next()
    } catch (err) {
      return res.status(500).json({ error: 'Error verificando permisos' })
    }
  }
}

module.exports = { verificarToken, verificarRol }