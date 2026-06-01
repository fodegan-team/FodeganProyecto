const pool  = require('../config/database')
const email = require('../config/email')

const getUsuarios = async (_req, res) => {
  try {
    const [usuarios] = await pool.query(`
      SELECT u.id, u.nombre, u.apellido, u.email, u.telefono,
             u.cedula, u.ciudad, u.activo, u.aprobado, u.created_at,
             r.nombre as rol
      FROM usuarios u
      JOIN roles r ON u.rol_id = r.id
      ORDER BY u.created_at DESC
    `)
    res.json(usuarios)
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo usuarios' })
  }
}

const aprobarUsuario = async (req, res) => {
  try {
    const { id } = req.params
    const [usuarios] = await pool.query(
      'SELECT u.*, r.nombre as rol FROM usuarios u JOIN roles r ON u.rol_id = r.id WHERE u.id = ?',
      [id]
    )
    if (usuarios.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' })

    await pool.query('UPDATE usuarios SET aprobado = TRUE WHERE id = ?', [id])

    if (usuarios[0].rol === 'zootecnista') {
      await email.correoZootecnistaAprobado(usuarios[0])
    }

    res.json({ message: 'Usuario aprobado correctamente' })
  } catch (err) {
    res.status(500).json({ error: 'Error aprobando usuario' })
  }
}

const getAnimalesInversion = async (req, res) => {
  try {
    const { id } = req.params
    const [animales] = await pool.query(`
      SELECT a.*,
        (SELECT COUNT(*) FROM seguimiento_peso sp WHERE sp.animal_id = a.id) AS registros
      FROM animales a
      WHERE a.inversion_id = ?
      ORDER BY a.codigo
    `, [id])
    res.json(animales)
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo animales' })
  }
}
const asignarZootecnista = async (req, res) => {
  try {
    const { zootecnista_id, finca_id } = req.body
    await pool.query(`
      INSERT INTO asignaciones_zootecnista (zootecnista_id, finca_id, activa)
      VALUES (?, ?, TRUE)
      ON DUPLICATE KEY UPDATE activa = TRUE
    `, [zootecnista_id, finca_id])
    res.json({ message: 'Zootecnista asignado correctamente' })
  } catch (err) {
    res.status(500).json({ error: 'Error asignando zootecnista' })
  }
}

const getZootecnistas = async (_req, res) => {
  try {
    const [zootecnistas] = await pool.query(`
      SELECT u.id, u.nombre, u.apellido, u.email, u.aprobado
      FROM usuarios u
      WHERE u.rol_id = 3
      ORDER BY u.nombre
    `)

    for (const zoo of zootecnistas) {
      const [fincas] = await pool.query(`
        SELECT f.id, f.nombre_real, f.nombre_ficticio
        FROM asignaciones_zootecnista az
        JOIN fincas f ON az.finca_id = f.id
        WHERE az.zootecnista_id = ? AND az.activa = TRUE
      `, [zoo.id])
      zoo.fincas = fincas
    }

    res.json(zootecnistas)
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo zootecnistas' })
  }
}

module.exports = { getUsuarios, aprobarUsuario, getAnimalesInversion, asignarZootecnista, getZootecnistas }