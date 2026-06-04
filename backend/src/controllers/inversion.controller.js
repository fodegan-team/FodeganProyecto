const pool  = require('../config/database')
const email = require('../config/email')

// ── Configuración ─────────────────────────────────
const getConfiguracion = async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM configuracion WHERE id = 1')
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo configuración' })
  }
}

const updateConfiguracion = async (req, res) => {
  try {
    const { precio_kilo, peso_animal_kg } = req.body
    await pool.query(
      'UPDATE configuracion SET precio_kilo=?, peso_animal_kg=? WHERE id=1',
      [precio_kilo, peso_animal_kg]
    )
    res.json({ message: 'Configuración actualizada' })
  } catch (err) {
    res.status(500).json({ error: 'Error actualizando configuración' })
  }
}

// ── Crear inversión ───────────────────────────────
const crearInversion = async (req, res) => {
  try {
    const { finca_id, monto, dias_ciclo } = req.body
    const inversionista_id = req.usuario.id

    if (![120, 150, 180].includes(parseInt(dias_ciclo))) {
      return res.status(400).json({ error: 'Días inválido. Opciones: 120, 150 o 180' })
    }

    const rendimientos = { 120: 12, 150: 15, 180: 18 }
    const rendimiento_pct = rendimientos[parseInt(dias_ciclo)]

    const [config] = await pool.query('SELECT * FROM configuracion WHERE id=1')
    const { precio_kilo, peso_animal_kg } = config[0]

    const costoAnimal       = precio_kilo * peso_animal_kg
    const cantidad_animales = Math.floor(parseFloat(monto) / costoAnimal)

    if (cantidad_animales < 1) return res.status(400).json({ error: 'Monto insuficiente' })

    // Verificar finca
    const [finca] = await pool.query(
      `SELECT * FROM fincas WHERE id=? AND estado='aprobada' AND capacidad_disponible >= ?`,
      [finca_id, cantidad_animales]
    )
    if (finca.length === 0) return res.status(404).json({ error: 'Finca no disponible' })

    // Crear inversión en estado pendiente_reunion
    const [result] = await pool.query(`
      INSERT INTO inversiones
        (inversionista_id, finca_id, monto_cop, cantidad_animales, dias_ciclo,
         rendimiento_pct, precio_kilo, peso_animal_kg, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pendiente_reunion')
    `, [inversionista_id, finca_id, monto, cantidad_animales, dias_ciclo,
        rendimiento_pct, precio_kilo, peso_animal_kg])

    const inversion_id = result.insertId

    // Crear reunión pendiente
    await pool.query(
      `INSERT INTO reuniones (inversion_id, tipo, estado) VALUES (?, 'post_inversion', 'pendiente')`,
      [inversion_id]
    )

    // Enviar correo al inversor
    const [inversor] = await pool.query('SELECT * FROM usuarios WHERE id=?', [inversionista_id])
    await email.correoInversionCreada(inversor[0], {
      monto_cop: monto, cantidad_animales, dias_ciclo, rendimiento_pct
    })

    res.status(201).json({
      message: 'Inversión registrada. Te contactaremos para coordinar la reunión de firma.',
      inversion_id
    })
  } catch (err) {
    console.error('Error crearInversion:', err)
    res.status(500).json({ error: 'Error creando inversión' })
  }
}

// ── Admin: aprobar inversión ──────────────────────
const aprobarInversion = async (req, res) => {
  try {
    const { id } = req.params

    const [inversiones] = await pool.query(`
      SELECT i.*, u.nombre, u.apellido, u.email
      FROM inversiones i
      JOIN usuarios u ON i.inversionista_id = u.id
      WHERE i.id = ? AND i.estado = 'pendiente_reunion'
    `, [id])

    if (inversiones.length === 0) return res.status(404).json({ error: 'Inversión no encontrada' })

    const inv = inversiones[0]

    // Verificar que todos los animales tienen peso registrado
    const [animales] = await pool.query(
      'SELECT * FROM animales WHERE inversion_id = ?', [id]
    )

    if (animales.length < inv.cantidad_animales) {
      return res.status(400).json({
        error: `Debes registrar el peso de todos los animales antes de aprobar. Registrados: ${animales.length}/${inv.cantidad_animales}`
      })
    }

    const fechaInicio = new Date()
    const fechaFin    = new Date()
    fechaFin.setDate(fechaFin.getDate() + inv.dias_ciclo)

    await pool.query(`
      UPDATE inversiones
      SET estado='activa', fecha_inicio_ciclo=?, fecha_fin_ciclo=?
      WHERE id=?
    `, [fechaInicio.toISOString().split('T')[0], fechaFin.toISOString().split('T')[0], id])

    // Reducir capacidad de la finca
    await pool.query(
      `UPDATE fincas SET capacidad_disponible = capacidad_disponible - ? WHERE id=?`,
      [inv.cantidad_animales, inv.finca_id]
    )

    await pool.query(`UPDATE reuniones SET estado='completada' WHERE inversion_id=?`, [id])

    await email.correoInversionAprobada(
      { nombre: inv.nombre, email: inv.email },
      { cantidad_animales: inv.cantidad_animales, fecha_inicio_ciclo: fechaInicio, fecha_fin_ciclo: fechaFin, rendimiento_pct: inv.rendimiento_pct }
    )

    res.json({ message: 'Inversión aprobada y activada correctamente' })
  } catch (err) {
    console.error('Error aprobarInversion:', err)
    res.status(500).json({ error: 'Error aprobando inversión' })
  }
}

// ── Admin: rechazar inversión ─────────────────────
const rechazarInversion = async (req, res) => {
  try {
    const { id }     = req.params
    const { motivo } = req.body

    const [inversiones] = await pool.query(`
      SELECT i.*, u.nombre, u.email
      FROM inversiones i
      JOIN usuarios u ON i.inversionista_id = u.id
      WHERE i.id=?
    `, [id])

    if (inversiones.length === 0) return res.status(404).json({ error: 'Inversión no encontrada' })

    await pool.query(`UPDATE inversiones SET estado='cancelada' WHERE id=?`, [id])
    await pool.query(`UPDATE reuniones SET estado='cancelada' WHERE inversion_id=?`, [id])

    await email.correoInversionCancelada(
      { nombre: inversiones[0].nombre, email: inversiones[0].email },
      motivo
    )

    res.json({ message: 'Inversión rechazada' })
  } catch (err) {
    res.status(500).json({ error: 'Error rechazando inversión' })
  }
}

// ── Mis inversiones (inversor) ────────────────────
const getMisInversiones = async (req, res) => {
  try {
    const [inversiones] = await pool.query(`
      SELECT
        i.*,
        f.nombre_ficticio,
        DATEDIFF(i.fecha_fin_ciclo, CURDATE()) AS dias_restantes,
        CASE
          WHEN i.fecha_inicio_ciclo IS NULL THEN 0
          ELSE ROUND(DATEDIFF(CURDATE(), i.fecha_inicio_ciclo) / i.dias_ciclo * 100)
        END AS progreso
      FROM inversiones i
      JOIN fincas f ON i.finca_id = f.id
      WHERE i.inversionista_id = ?
      ORDER BY i.created_at DESC
    `, [req.usuario.id])

    res.json(inversiones)
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo inversiones' })
  }
}

// ── Detalle de inversión ──────────────────────────
const getDetalleInversion = async (req, res) => {
  try {
    const { id } = req.params

    const [inversiones] = await pool.query(`
      SELECT i.*, f.nombre_ficticio,
        DATEDIFF(i.fecha_fin_ciclo, CURDATE()) AS dias_restantes,
        CASE
          WHEN i.fecha_inicio_ciclo IS NULL THEN 0
          ELSE ROUND(DATEDIFF(CURDATE(), i.fecha_inicio_ciclo) / i.dias_ciclo * 100)
        END AS progreso
      FROM inversiones i
      JOIN fincas f ON i.finca_id = f.id
      WHERE i.id=? AND i.inversionista_id=?
    `, [id, req.usuario.id])

    if (inversiones.length === 0) return res.status(404).json({ error: 'Inversión no encontrada' })

    const inversion = inversiones[0]

    // Animales con seguimiento
    const [animales] = await pool.query(`
      SELECT a.*,
        sp.peso_kg as peso_actual,
        sp.estado  as estado_actual,
        sp.mes_numero as ultimo_mes,
        (SELECT COUNT(*) FROM seguimiento_peso WHERE animal_id = a.id) as registros
      FROM animales a
      LEFT JOIN seguimiento_peso sp ON sp.animal_id = a.id
        AND sp.mes_numero = (
          SELECT MAX(mes_numero) FROM seguimiento_peso WHERE animal_id = a.id
        )
      WHERE a.inversion_id = ?
      ORDER BY a.codigo
    `, [id])

    // Seguimiento por mes
    const [seguimiento] = await pool.query(`
      SELECT
        sp.mes_numero,
        AVG(sp.peso_kg) AS peso_promedio,
        COUNT(DISTINCT sp.animal_id) AS animales,
        MIN(sp.fecha_registro) AS fecha_registro
      FROM seguimiento_peso sp
      WHERE sp.inversion_id = ?
      GROUP BY sp.mes_numero
      ORDER BY sp.mes_numero ASC
    `, [id])

    // Comentarios
    const [comentarios] = await pool.query(`
      SELECT c.*, u.nombre as zootecnista_nombre
      FROM comentarios c
      JOIN usuarios u ON c.zootecnista_id = u.id
      WHERE c.inversion_id=?
      ORDER BY c.created_at DESC
    `, [id])

    res.json({ inversion, animales, seguimiento, comentarios })
  } catch (err) {
    console.error('Error getDetalleInversion:', err)
    res.status(500).json({ error: 'Error obteniendo detalle' })
  }
}

// ── Admin: todas las inversiones ──────────────────
const getAllInversiones = async (req, res) => {
  try {
    const { estado } = req.query
    let query = `
      SELECT i.*, f.nombre_ficticio, f.nombre_real,
        u.nombre as inversor_nombre, u.email as inversor_email
      FROM inversiones i
      JOIN fincas f ON i.finca_id = f.id
      JOIN usuarios u ON i.inversionista_id = u.id
    `
    const params = []
    if (estado) { query += ' WHERE i.estado = ?'; params.push(estado) }
    query += ' ORDER BY i.created_at DESC'

    const [inversiones] = await pool.query(query, params)
    res.json(inversiones)
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo inversiones' })
  }
}

// ── Admin: finalizar inversión ────────────────────
const finalizarInversion = async (req, res) => {
  try {
    const { id } = req.params

    const [inversiones] = await pool.query(
      'SELECT * FROM inversiones WHERE id=? AND estado="activa"', [id]
    )
    if (inversiones.length === 0) return res.status(404).json({ error: 'Inversión no encontrada' })

    const inv = inversiones[0]

    // Restaurar capacidad de la finca
    await pool.query(
      `UPDATE fincas SET capacidad_disponible = capacidad_disponible + ? WHERE id=?`,
      [inv.cantidad_animales, inv.finca_id]
    )

    await pool.query(`UPDATE inversiones SET estado='finalizada' WHERE id=?`, [id])

    res.json({ message: 'Inversión finalizada correctamente' })
  } catch (err) {
    res.status(500).json({ error: 'Error finalizando inversión' })
  }
}

const registrarAnimalesInversion = async (req, res) => {
  try {
    const { id } = req.params
    const { animales } = req.body // Array: [{codigo, peso_inicial}]

    // Verificar que la inversión existe y está pendiente
    const [inversiones] = await pool.query(
      'SELECT * FROM inversiones WHERE id = ? AND estado = "pendiente_reunion"',
      [id]
    )
    if (inversiones.length === 0) return res.status(404).json({ error: 'Inversión no encontrada' })

    const inv = inversiones[0]

    // Eliminar animales anteriores si los hay
    await pool.query('DELETE FROM animales WHERE inversion_id = ?', [id])

    // Insertar nuevos animales con peso real
    for (const animal of animales) {
      await pool.query(
        'INSERT INTO animales (inversion_id, codigo, peso_inicial) VALUES (?, ?, ?)',
        [id, animal.codigo, animal.peso_inicial]
      )
    }

    res.json({
      message: `${animales.length} animales registrados correctamente`,
      registrados: animales.length,
      total: inv.cantidad_animales,
      completo: animales.length >= inv.cantidad_animales
    })
  } catch (err) {
    console.error('Error registrarAnimalesInversion:', err)
    res.status(500).json({ error: 'Error registrando animales' })
  }
}

module.exports = {
  getConfiguracion, updateConfiguracion,
  crearInversion, aprobarInversion, rechazarInversion,
  getMisInversiones, getDetalleInversion,
  getAllInversiones, finalizarInversion,
  registrarAnimalesInversion
}