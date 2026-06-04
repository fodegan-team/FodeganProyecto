const pool = require('../config/database')

// ── Dashboard inicio ──────────────────────────────
const getDashboard = async (req, res) => {

  try {
    const propietarioId = req.usuario.id
    console.log('Propietario ID:', propietarioId)
    // Mi finca
    const [fincas] = await pool.query(
      'SELECT * FROM fincas WHERE propietario_id = ?',
      [propietarioId]
    )
    console.log('Fincas encontradas:', fincas.length, fincas.map(f => f.id))
    if (fincas.length === 0) return res.json({ finca: null, inversiones: [], stats: {} })

    const finca = fincas[0]

    // Inversiones activas con datos del inversor
    const [inversiones] = await pool.query(`
      SELECT i.*,
        CONCAT('Inversor #', LPAD(i.inversionista_id, 4, '0')) as inversor_codigo,
        DATEDIFF(i.fecha_fin_ciclo, CURDATE()) AS dias_restantes,
        ROUND(DATEDIFF(CURDATE(), i.fecha_inicio_ciclo) / i.dias_ciclo * 100) AS progreso
      FROM inversiones i
      WHERE i.finca_id = ? AND i.estado = 'activa'
    `, [finca.id])

    // Para cada inversión obtener peso ganado total
    for (const inv of inversiones) {
      const [pesos] = await pool.query(`
        SELECT
          SUM(sp.peso_kg - a.peso_inicial) as peso_ganado_total,
          COUNT(DISTINCT a.id) as total_animales
        FROM animales a
        LEFT JOIN seguimiento_peso sp ON sp.animal_id = a.id
          AND sp.mes_numero = (SELECT MAX(mes_numero) FROM seguimiento_peso WHERE animal_id = a.id)
        WHERE a.inversion_id = ?
      `, [inv.id])

      inv.peso_ganado_total = pesos[0].peso_ganado_total || 0
      inv.total_animales    = pesos[0].total_animales    || inv.cantidad_animales

      // Ganancia propietario (40%)
      const valorGanado = inv.peso_ganado_total * inv.precio_kilo
      inv.ganancia_propietario = valorGanado * 0.40
    }

    // Stats generales
    const totalAnimales = inversiones.reduce((a, i) => a + i.total_animales, 0)
    const gananciaTotal = inversiones.reduce((a, i) => a + i.ganancia_propietario, 0)
    const diasRestantes = inversiones.length > 0 ? Math.min(...inversiones.map(i => Math.max(i.dias_restantes, 0))) : 0

    res.json({
      finca,
      inversiones,
      stats: {
        total_animales:  totalAnimales,
        capacidad_total: finca.capacidad_total,
        ganancia_total:  gananciaTotal,
        dias_restantes:  diasRestantes,
        inversiones_activas: inversiones.length
      }
    })
  } catch (err) {
    console.error('Error getDashboard propietario:', err)
    res.status(500).json({ error: 'Error obteniendo dashboard' })
  }
}

// ── Animales de una inversión ─────────────────────
const getAnimalesInversion = async (req, res) => {
  try {
    const { inversion_id } = req.params
    const [animales] = await pool.query(`
      SELECT a.*,
        sp.peso_kg       as ultimo_peso,
        sp.estado        as ultimo_estado,
        sp.fecha_registro as fecha_ultimo_peso
      FROM animales a
      LEFT JOIN seguimiento_peso sp ON sp.animal_id = a.id
        AND sp.mes_numero = (SELECT MAX(mes_numero) FROM seguimiento_peso WHERE animal_id = a.id)
      WHERE a.inversion_id = ?
      ORDER BY a.codigo
    `, [inversion_id])
    res.json(animales)
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo animales' })
  }
}

// ── Reportes de una inversión ─────────────────────
const getReportesInversion = async (req, res) => {
  try {
    const { inversion_id } = req.params
    const [reportes] = await pool.query(`
      SELECT rt.*, u.nombre as zootecnista_nombre, a.codigo as animal_codigo
      FROM reportes_tecnicos rt
      JOIN usuarios u ON rt.zootecnista_id = u.id
      LEFT JOIN animales a ON rt.animal_id = a.id
      WHERE rt.inversion_id = ?
      ORDER BY rt.created_at DESC
    `, [inversion_id])
    res.json(reportes)
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo reportes' })
  }
}

// ── Mis visitas pendientes ────────────────────────
const getMisVisitas = async (req, res) => {
  try {
    const [fincas] = await pool.query(
      'SELECT id FROM fincas WHERE propietario_id = ?',
      [req.usuario.id]
    )
    if (fincas.length === 0) return res.json([])

    const fincaId = fincas[0].id
    const [visitas] = await pool.query(`
      SELECT v.*, u.nombre as zootecnista_nombre, f.nombre_ficticio
      FROM visitas v
      JOIN usuarios u ON v.zootecnista_id = u.id
      JOIN fincas f ON v.finca_id = f.id
      WHERE v.finca_id = ?
      ORDER BY v.fecha_visita ASC
    `, [fincaId])
    res.json(visitas)
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo visitas' })
  }
}

// ── Confirmar visita ──────────────────────────────
const confirmarVisita = async (req, res) => {
  try {
    const { id } = req.params
    await pool.query(
      `UPDATE visitas SET estado = 'confirmada', confirmado_propietario = TRUE WHERE id = ?`,
      [id]
    )
    res.json({ message: 'Visita confirmada correctamente' })
  } catch (err) {
    res.status(500).json({ error: 'Error confirmando visita' })
  }
}

// ── Rechazar visita ───────────────────────────────
const rechazarVisita = async (req, res) => {
  try {
    const { id } = req.params
    await pool.query(
      `UPDATE visitas SET estado = 'cancelada' WHERE id = ?`,
      [id]
    )
    res.json({ message: 'Visita rechazada' })
  } catch (err) {
    res.status(500).json({ error: 'Error rechazando visita' })
  }
}

// ── Mi finca ──────────────────────────────────────
const getMiFinca = async (req, res) => {
  try {
    const [fincas] = await pool.query(
      'SELECT * FROM fincas WHERE propietario_id = ?',
      [req.usuario.id]
    )
    res.json(fincas[0] || null)
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo finca' })
  }
}

// ── Subir documento (contrato/escrituras) ─────────
const subirDocumento = async (req, res) => {
  try {
    const { tipo, documento_base64, nombre_archivo } = req.body
    const [fincas] = await pool.query(
      'SELECT id FROM fincas WHERE propietario_id = ?',
      [req.usuario.id]
    )
    if (fincas.length === 0) return res.status(404).json({ error: 'Finca no encontrada' })

    const campo = tipo === 'contrato' ? 'contrato_url' : 'escrituras_url'

    // Verificar si la columna existe, si no agregarla
    try {
      await pool.query(`ALTER TABLE fincas ADD COLUMN contrato_url LONGTEXT NULL`)
    } catch {}
    try {
      await pool.query(`ALTER TABLE fincas ADD COLUMN escrituras_url LONGTEXT NULL`)
    } catch {}

    await pool.query(
      `UPDATE fincas SET ${campo} = ? WHERE id = ?`,
      [documento_base64, fincas[0].id]
    )

    res.json({ message: `${tipo === 'contrato' ? 'Contrato' : 'Escrituras'} subido correctamente` })
  } catch (err) {
    console.error('Error subirDocumento:', err)
    res.status(500).json({ error: 'Error subiendo documento' })
  }
}

// ── Historial inversiones ─────────────────────────
const getHistorial = async (req, res) => {
  try {
    const [fincas] = await pool.query(
      'SELECT id FROM fincas WHERE propietario_id = ?',
      [req.usuario.id]
    )
    if (fincas.length === 0) return res.json([])

    const [historial] = await pool.query(`
      SELECT i.*,
        CONCAT('Inversor #', LPAD(i.inversionista_id, 4, '0')) as inversor_codigo
      FROM inversiones i
      WHERE i.finca_id = ? AND i.estado = 'finalizada'
      ORDER BY i.fecha_fin_ciclo DESC
    `, [fincas[0].id])
    res.json(historial)
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo historial' })
  }
}

const actualizarFinca = async (req, res) => {
  try {
    const { nombre_real, ubicacion, hectareas, capacidad_total } = req.body
    const [fincas] = await pool.query(
      'SELECT id FROM fincas WHERE propietario_id = ?',
      [req.usuario.id]
    )
    if (fincas.length === 0) return res.status(404).json({ error: 'Finca no encontrada' })

    await pool.query(
      `UPDATE fincas SET nombre_real = ?, ubicacion = ?, hectareas = ?, capacidad_total = ? WHERE id = ?`,
      [nombre_real, ubicacion, hectareas, capacidad_total, fincas[0].id]
    )
    res.json({ message: 'Finca actualizada correctamente' })
  } catch (err) {
    res.status(500).json({ error: 'Error actualizando finca' })
  }
}

module.exports = {
  getDashboard, getAnimalesInversion, getReportesInversion,
  getMisVisitas, confirmarVisita, rechazarVisita,
  getMiFinca, subirDocumento, getHistorial, actualizarFinca
}