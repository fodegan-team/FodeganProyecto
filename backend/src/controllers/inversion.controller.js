const pool = require('../config/database')

// ── Obtener configuración global ──────────────────
const getConfiguracion = async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM configuracion WHERE id = 1')
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo configuración' })
  }
}

// ── Actualizar configuración (solo admin) ─────────
const updateConfiguracion = async (req, res) => {
  try {
    const { precio_kilo, peso_animal_kg } = req.body
    await pool.query(
      'UPDATE configuracion SET precio_kilo = ?, peso_animal_kg = ? WHERE id = 1',
      [precio_kilo, peso_animal_kg]
    )
    res.json({ message: 'Configuración actualizada correctamente' })
  } catch (err) {
    res.status(500).json({ error: 'Error actualizando configuración' })
  }
}

// ── Obtener fincas disponibles filtradas ──────────
const getFincasDisponibles = async (req, res) => {
  try {
    const { monto } = req.query

    if (!monto) return res.status(400).json({ error: 'Monto requerido' })

    // Obtener configuración actual
    const [config] = await pool.query('SELECT * FROM configuracion WHERE id = 1')
    const { precio_kilo, peso_animal_kg } = config[0]

    // Calcular cabezas posibles del inversor
    const costoAnimal   = precio_kilo * peso_animal_kg
    const cabezasPosibles = Math.floor(parseFloat(monto) / costoAnimal)

    if (cabezasPosibles < 1) {
      return res.status(400).json({
        error: 'Monto insuficiente para invertir en al menos 1 animal',
        costoAnimal,
        cabezasMinimas: 1
      })
    }

    // Obtener fincas aprobadas con capacidad suficiente
    // Capacidad = hectareas * 1.75 (promedio entre 1.5 y 2 bovinos/hectarea)
    const [fincas] = await pool.query(`
      SELECT
        dp.id,
        dp.hectareas,
        dp.ubicacion,
        FLOOR(dp.hectareas * 1.75) AS capacidad_total,
        u.ciudad,
        CONCAT('Finca ', ELT(dp.id, 'Alfa', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa')) AS nombre_ficticio
      FROM datos_propietario dp
      JOIN usuarios u ON dp.usuario_id = u.id
      WHERE u.aprobado = TRUE
        AND u.activo   = TRUE
        AND FLOOR(dp.hectareas * 1.75) >= ?
      ORDER BY dp.hectareas DESC
    `, [cabezasPosibles])

    res.json({
      configuracion: { precio_kilo, peso_animal_kg, costoAnimal },
      cabezasPosibles,
      fincas
    })
  } catch (err) {
    console.error('Error en getFincasDisponibles:', err)
    res.status(500).json({ error: 'Error obteniendo fincas' })
  }
}

// ── Crear inversión ───────────────────────────────
const crearInversion = async (req, res) => {
  try {
    const { finca_id, monto, dias_ciclo } = req.body
    const inversionista_id = req.usuario.id

    if (![120, 150, 180].includes(parseInt(dias_ciclo))) {
      return res.status(400).json({ error: 'Días de ciclo inválido. Opciones: 120, 150 o 180' })
    }

    // Obtener configuración actual
    const [config] = await pool.query('SELECT * FROM configuracion WHERE id = 1')
    const { precio_kilo, peso_animal_kg } = config[0]

    const costoAnimal  = precio_kilo * peso_animal_kg
    const cabezas      = Math.floor(parseFloat(monto) / costoAnimal)

    if (cabezas < 1) {
      return res.status(400).json({ error: 'Monto insuficiente' })
    }

    // Verificar que la finca existe y está aprobada
    const [finca] = await pool.query(`
      SELECT dp.* FROM datos_propietario dp
      JOIN usuarios u ON dp.usuario_id = u.id
      WHERE dp.id = ? AND u.aprobado = TRUE
    `, [finca_id])

    if (finca.length === 0) {
      return res.status(404).json({ error: 'Finca no encontrada o no disponible' })
    }

    // Calcular fechas
    const fechaInicio = new Date()
    const fechaFin    = new Date()
    fechaFin.setDate(fechaFin.getDate() + parseInt(dias_ciclo))

    const [result] = await pool.query(`
      INSERT INTO inversiones
        (inversionista_id, finca_id, monto_cop, cabezas, dias_ciclo, precio_kilo, peso_animal_kg, fecha_inicio, fecha_fin)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      inversionista_id, finca_id, monto, cabezas,
      dias_ciclo, precio_kilo, peso_animal_kg,
      fechaInicio.toISOString().split('T')[0],
      fechaFin.toISOString().split('T')[0]
    ])

    res.status(201).json({
      message:      'Inversión creada exitosamente',
      inversion_id: result.insertId,
      cabezas,
      fechaFin:     fechaFin.toISOString().split('T')[0]
    })
  } catch (err) {
    console.error('Error en crearInversion:', err)
    res.status(500).json({ error: 'Error creando inversión' })
  }
}

// ── Obtener inversiones del inversor ──────────────
const getMisInversiones = async (req, res) => {
  try {
    const [inversiones] = await pool.query(`
      SELECT
        i.*,
        CONCAT('Finca ', ELT(i.finca_id, 'Alfa', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa')) AS nombre_ficticio
        dp.ubicacion,
        DATEDIFF(i.fecha_fin, CURDATE()) AS dias_restantes,
        ROUND(DATEDIFF(CURDATE(), i.fecha_inicio) / i.dias_ciclo * 100) AS progreso
      FROM inversiones i
      JOIN datos_propietario dp ON i.finca_id = dp.id
      WHERE i.inversionista_id = ?
      ORDER BY i.created_at DESC
    `, [req.usuario.id])

    res.json(inversiones)
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo inversiones' })
  }
}

module.exports = { getConfiguracion, updateConfiguracion, getFincasDisponibles, crearInversion, getMisInversiones }