const pool  = require('../config/database')
const email = require('../config/email')

// ── Obtener fincas disponibles (para inversor) ────
const getFincasDisponibles = async (req, res) => {
  try {
    const { monto } = req.query
    if (!monto) return res.status(400).json({ error: 'Monto requerido' })

    const [config] = await pool.query('SELECT * FROM configuracion WHERE id = 1')
    const { precio_kilo, peso_animal_kg } = config[0]

    const costoAnimal       = precio_kilo * peso_animal_kg
    const animalesPosibles  = Math.floor(parseFloat(monto) / costoAnimal)

    if (animalesPosibles < 1) {
      return res.status(400).json({
        error: 'Monto insuficiente para invertir en al menos 1 animal',
        costoAnimal
      })
    }

    const [fincas] = await pool.query(`
      SELECT
        f.id, f.nombre_ficticio, f.ubicacion,
        f.hectareas, f.capacidad_total, f.capacidad_disponible
      FROM fincas f
      WHERE f.estado = 'aprobada'
        AND f.capacidad_disponible >= ?
      ORDER BY f.capacidad_disponible DESC
    `, [animalesPosibles])

    res.json({
      configuracion: { precio_kilo, peso_animal_kg, costoAnimal },
      animalesPosibles,
      fincas
    })
  } catch (err) {
    console.error('Error getFincasDisponibles:', err)
    res.status(500).json({ error: 'Error obteniendo fincas' })
  }
}

// ── Admin: obtener todas las fincas ──────────────
const getAllFincas = async (req, res) => {
  try {
    const [fincas] = await pool.query(`
      SELECT f.*, u.nombre, u.apellido, u.email
      FROM fincas f
      JOIN usuarios u ON f.propietario_id = u.id
      ORDER BY f.created_at DESC
    `)
    res.json(fincas)
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo fincas' })
  }
}

// ── Admin: aprobar finca ──────────────────────────
const aprobarFinca = async (req, res) => {
  try {
    const { id } = req.params

    const [fincas] = await pool.query(`
      SELECT f.*, u.nombre, u.apellido, u.email
      FROM fincas f
      JOIN usuarios u ON f.propietario_id = u.id
      WHERE f.id = ?
    `, [id])

    if (fincas.length === 0) return res.status(404).json({ error: 'Finca no encontrada' })

    const finca     = fincas[0]
    const propietario = { nombre: finca.nombre, email: finca.email }

    await pool.query(`UPDATE fincas SET estado = 'aprobada' WHERE id = ?`, [id])
    await pool.query(`UPDATE usuarios SET aprobado = TRUE WHERE id = ?`, [finca.propietario_id])

    // Enviar correo al propietario
    await email.correoFincaAprobada(propietario, finca)

    res.json({ message: 'Finca aprobada correctamente' })
  } catch (err) {
    console.error('Error aprobarFinca:', err)
    res.status(500).json({ error: 'Error aprobando finca' })
  }
}

// ── Admin: rechazar finca ─────────────────────────
const rechazarFinca = async (req, res) => {
  try {
    const { id }     = req.params
    const { motivo } = req.body

    const [fincas] = await pool.query(`
      SELECT f.*, u.nombre, u.apellido, u.email
      FROM fincas f
      JOIN usuarios u ON f.propietario_id = u.id
      WHERE f.id = ?
    `, [id])

    if (fincas.length === 0) return res.status(404).json({ error: 'Finca no encontrada' })

    const finca       = fincas[0]
    const propietario = { nombre: finca.nombre, email: finca.email }

    await pool.query(
      `UPDATE fincas SET estado = 'rechazada', motivo_rechazo = ? WHERE id = ?`,
      [motivo, id]
    )

    await email.correoFincaRechazada(propietario, finca, motivo)

    res.json({ message: 'Finca rechazada' })
  } catch (err) {
    console.error('Error rechazarFinca:', err)
    res.status(500).json({ error: 'Error rechazando finca' })
  }
}

// ── Propietario: ver su finca ─────────────────────
const getMiFinca = async (req, res) => {
  try {
    const [fincas] = await pool.query(
      'SELECT * FROM fincas WHERE propietario_id = ?',
      [req.usuario.id]
    )
    res.json(fincas)
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo finca' })
  }
}

module.exports = { getFincasDisponibles, getAllFincas, aprobarFinca, rechazarFinca, getMiFinca }