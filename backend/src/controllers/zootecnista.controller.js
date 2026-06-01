const pool = require('../config/database')

// ── Mis fincas asignadas ──────────────────────────
const getMisFincas = async (req, res) => {
  try {
    const [fincas] = await pool.query(`
      SELECT f.*, u.nombre as propietario_nombre,
        COUNT(DISTINCT i.id) as inversiones_activas
      FROM asignaciones_zootecnista az
      JOIN fincas f ON az.finca_id = f.id
      JOIN usuarios u ON f.propietario_id = u.id
      LEFT JOIN inversiones i ON i.finca_id = f.id AND i.estado = 'activa'
      WHERE az.zootecnista_id = ? AND az.activa = TRUE
      GROUP BY f.id
    `, [req.usuario.id])
    res.json(fincas)
  } catch (err) {
    console.error('Error getMisFincas:', err)
    res.status(500).json({ error: 'Error obteniendo fincas' })
  }
}

// ── Inversiones activas de una finca ─────────────
const getInversionesFinca = async (req, res) => {
  try {
    const { finca_id } = req.params
    const [inversiones] = await pool.query(`
      SELECT i.*, f.nombre_ficticio,
        u.nombre as inversor_nombre,
        DATEDIFF(i.fecha_fin_ciclo, CURDATE()) AS dias_restantes,
        ROUND(DATEDIFF(CURDATE(), i.fecha_inicio_ciclo) / i.dias_ciclo * 100) AS progreso
      FROM inversiones i
      JOIN fincas f ON i.finca_id = f.id
      JOIN usuarios u ON i.inversionista_id = u.id
      WHERE i.finca_id = ? AND i.estado = 'activa'
    `, [finca_id])
    res.json(inversiones)
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo inversiones' })
  }
}

// ── Animales de una inversión ─────────────────────
const getAnimalesInversion = async (req, res) => {
  try {
    const { inversion_id } = req.params
    const [animales] = await pool.query(`
      SELECT a.*,
        sp.peso_kg as ultimo_peso,
        sp.estado as ultimo_estado,
        sp.mes_numero as ultimo_mes,
        (SELECT COUNT(*) FROM seguimiento_peso WHERE animal_id = a.id) as total_registros
      FROM animales a
      LEFT JOIN seguimiento_peso sp ON sp.animal_id = a.id
        AND sp.mes_numero = (
          SELECT MAX(mes_numero) FROM seguimiento_peso WHERE animal_id = a.id
        )
      WHERE a.inversion_id = ?
      ORDER BY a.codigo
    `, [inversion_id])
    res.json(animales)
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo animales' })
  }
}

// ── Registrar peso mensual ────────────────────────
const registrarPeso = async (req, res) => {
  try {
    const { animal_id, inversion_id, mes_numero, peso_kg, estado, observaciones } = req.body

    // Verificar que el animal existe
    const [animales] = await pool.query('SELECT * FROM animales WHERE id = ?', [animal_id])
    if (animales.length === 0) return res.status(404).json({ error: 'Animal no encontrado' })

    // Insertar o actualizar seguimiento
    await pool.query(`
      INSERT INTO seguimiento_peso
        (animal_id, inversion_id, mes_numero, peso_kg, estado, zootecnista_id, fecha_registro)
      VALUES (?, ?, ?, ?, ?, ?, CURDATE())
      ON DUPLICATE KEY UPDATE
        peso_kg = VALUES(peso_kg),
        estado  = VALUES(estado),
        zootecnista_id = VALUES(zootecnista_id),
        fecha_registro = CURDATE()
    `, [animal_id, inversion_id, mes_numero, peso_kg, estado, req.usuario.id])

    // Actualizar estado actual del animal
    await pool.query(
      'UPDATE animales SET estado_actual = ? WHERE id = ?',
      [estado, animal_id]
    )

    res.json({ message: 'Peso registrado correctamente' })
  } catch (err) {
    console.error('Error registrarPeso:', err)
    res.status(500).json({ error: 'Error registrando peso' })
  }
}

// ── Agregar comentario ────────────────────────────
const agregarComentario = async (req, res) => {
  try {
    const { inversion_id, animal_id, contenido } = req.body

    await pool.query(`
      INSERT INTO comentarios (inversion_id, animal_id, zootecnista_id, contenido)
      VALUES (?, ?, ?, ?)
    `, [inversion_id, animal_id || null, req.usuario.id, contenido])

    res.status(201).json({ message: 'Comentario agregado correctamente' })
  } catch (err) {
    res.status(500).json({ error: 'Error agregando comentario' })
  }
}

// ── Historial de fincas (finalizadas) ────────────
const getHistorialFincas = async (req, res) => {
  try {
    const [historial] = await pool.query(`
      SELECT i.*, f.nombre_ficticio, f.nombre_real,
        u.nombre as inversor_nombre
      FROM inversiones i
      JOIN fincas f ON i.finca_id = f.id
      JOIN usuarios u ON i.inversionista_id = u.id
      JOIN asignaciones_zootecnista az ON az.finca_id = f.id
      WHERE az.zootecnista_id = ? AND i.estado = 'finalizada'
      ORDER BY i.fecha_fin_ciclo DESC
    `, [req.usuario.id])
    res.json(historial)
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo historial' })
  }
}

module.exports = {
  getMisFincas, getInversionesFinca, getAnimalesInversion,
  registrarPeso, agregarComentario, getHistorialFincas
}