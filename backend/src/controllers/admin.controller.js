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
        (SELECT COUNT(*) FROM seguimiento_peso WHERE animal_id = a.id) AS registros
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
      FROM usuarios u WHERE u.rol_id = 3 ORDER BY u.nombre
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

// ── Visitas ───────────────────────────────────────
const crearVisita = async (req, res) => {
  try {
    const { zootecnista_id, finca_id, fecha_visita, tipo, notas } = req.body

    // Obtener propietario de la finca
    const [fincas] = await pool.query(
      'SELECT f.*, u.nombre as prop_nombre, u.email as prop_email FROM fincas f JOIN usuarios u ON f.propietario_id = u.id WHERE f.id = ?',
      [finca_id]
    )
    if (fincas.length === 0) return res.status(404).json({ error: 'Finca no encontrada' })

    const finca = fincas[0]

    const [result] = await pool.query(`
      INSERT INTO visitas (zootecnista_id, finca_id, fecha_visita, tipo, estado, notas, created_by, propietario_id)
      VALUES (?, ?, ?, ?, 'pendiente', ?, ?, ?)
    `, [zootecnista_id, finca_id, fecha_visita, tipo, notas || null, req.usuario.id, finca.propietario_id])

    // Obtener zootecnista
    const [zoo] = await pool.query('SELECT nombre FROM usuarios WHERE id = ?', [zootecnista_id])

    // Enviar notificación al propietario por correo
    try {
      await email.correoConfirmacionVisita(
        { nombre: finca.prop_nombre, email: finca.prop_email },
        {
          id:            result.insertId,
          finca:         finca.nombre_ficticio,
          zootecnista:   zoo[0]?.nombre,
          fecha_visita,
          tipo
        }
      )
    } catch (emailErr) {
      console.error('Error enviando correo:', emailErr.message)
    }

    res.status(201).json({ message: 'Visita programada correctamente', visita_id: result.insertId })
  } catch (err) {
    console.error('Error crearVisita:', err)
    res.status(500).json({ error: 'Error creando visita' })
  }
}

const getVisitas = async (_req, res) => {
  try {
    const [visitas] = await pool.query(`
      SELECT v.*, f.nombre_ficticio, f.nombre_real,
        u.nombre as zootecnista_nombre,
        p.nombre as propietario_nombre
      FROM visitas v
      JOIN fincas f ON v.finca_id = f.id
      JOIN usuarios u ON v.zootecnista_id = u.id
      LEFT JOIN usuarios p ON v.propietario_id = p.id
      ORDER BY v.fecha_visita DESC
    `)
    res.json(visitas)
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo visitas' })
  }
}

const getAlertasSanitarias = async (_req, res) => {
  try {
    const [alertas] = await pool.query(`
      SELECT al.*, a.codigo as animal_codigo,
        f.nombre_ficticio, u.nombre as zootecnista_nombre
      FROM alertas_sanitarias al
      JOIN animales a ON al.animal_id = a.id
      JOIN inversiones i ON al.inversion_id = i.id
      JOIN fincas f ON i.finca_id = f.id
      JOIN usuarios u ON al.zootecnista_id = u.id
      WHERE al.estado = 'activa'
      ORDER BY al.created_at DESC
    `)
    res.json(alertas)
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo alertas' })
  }
}

// ── Inversiones del zootecnista para asignar visita ──
const getInversionesZootecnista = async (req, res) => {
  try {
    const { zootecnista_id } = req.params
    const [inversiones] = await pool.query(`
      SELECT i.id, i.cantidad_animales, i.dias_ciclo,
        f.nombre_ficticio, f.id as finca_id
      FROM inversiones i
      JOIN fincas f ON i.finca_id = f.id
      JOIN asignaciones_zootecnista az ON az.finca_id = f.id
      WHERE az.zootecnista_id = ? AND az.activa = TRUE AND i.estado = 'activa'
    `, [zootecnista_id])
    res.json(inversiones)
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo inversiones' })
  }
}

const getReportesInversion = async (req, res) => {
  try {
    const { id } = req.params
    const [reportes] = await pool.query(`
      SELECT rt.*, u.nombre as zootecnista_nombre,
        a.codigo as animal_codigo,
        (SELECT COUNT(*) FROM evidencias WHERE reporte_id = rt.id) as evidencias
      FROM reportes_tecnicos rt
      JOIN usuarios u ON rt.zootecnista_id = u.id
      LEFT JOIN animales a ON rt.animal_id = a.id
      WHERE rt.inversion_id = ?
      ORDER BY rt.created_at DESC
    `, [id])
    res.json(reportes)
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo reportes' })
  }
}
module.exports = { getUsuarios, aprobarUsuario, getAnimalesInversion, asignarZootecnista, getZootecnistas, crearVisita, getVisitas, getAlertasSanitarias, getInversionesZootecnista, getReportesInversion }