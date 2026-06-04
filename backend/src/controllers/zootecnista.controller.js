const pool = require('../config/database')

// ── Dashboard inicio ──────────────────────────────
const getDashboard = async (req, res) => {
  try {
    const zooId = req.usuario.id

    // Fincas asignadas
    const [fincas] = await pool.query(`
      SELECT f.*, u.nombre as propietario_nombre
      FROM asignaciones_zootecnista az
      JOIN fincas f ON az.finca_id = f.id
      JOIN usuarios u ON f.propietario_id = u.id
      WHERE az.zootecnista_id = ? AND az.activa = TRUE
    `, [zooId])

    // Animales en seguimiento
    const [animales] = await pool.query(`
      SELECT COUNT(DISTINCT a.id) as total
      FROM animales a
      JOIN inversiones i ON a.inversion_id = i.id
      JOIN asignaciones_zootecnista az ON az.finca_id = i.finca_id
      WHERE az.zootecnista_id = ? AND az.activa = TRUE AND i.estado = 'activa'
    `, [zooId])

    // Próximas visitas (próximos 30 días)
    const [visitas] = await pool.query(`
      SELECT v.*, f.nombre_ficticio, f.nombre_real
      FROM visitas v
      JOIN fincas f ON v.finca_id = f.id
      WHERE v.zootecnista_id = ?
        AND v.fecha_visita >= NOW()
        AND v.fecha_visita <= DATE_ADD(NOW(), INTERVAL 30 DAY)
        AND v.estado != 'cancelada'
      ORDER BY v.fecha_visita ASC
    `, [zooId])

    // Alertas sanitarias activas
    const [alertas] = await pool.query(`
      SELECT al.*, a.codigo as animal_codigo, f.nombre_ficticio
      FROM alertas_sanitarias al
      JOIN animales a ON al.animal_id = a.id
      JOIN inversiones i ON al.inversion_id = i.id
      JOIN fincas f ON i.finca_id = f.id
      WHERE al.zootecnista_id = ? AND al.estado = 'activa'
      ORDER BY al.created_at DESC
    `, [zooId])

    // Recordatorios (tareas pendientes próximos 15 días)
    const [recordatorios] = await pool.query(`
      SELECT v.*, f.nombre_ficticio
      FROM visitas v
      JOIN fincas f ON v.finca_id = f.id
      WHERE v.zootecnista_id = ?
        AND v.fecha_visita >= NOW()
        AND v.fecha_visita <= DATE_ADD(NOW(), INTERVAL 15 DAY)
        AND v.estado IN ('pendiente','confirmada')
      ORDER BY v.fecha_visita ASC
    `, [zooId])

    res.json({
      fincas_asignadas:    fincas.length,
      animales_seguimiento: animales[0].total,
      proximas_visitas:    visitas.length,
      alertas_urgentes:    alertas.filter(a => a.urgencia === 'alta' || a.urgencia === 'critica').length,
      visitas,
      alertas,
      recordatorios
    })
  } catch (err) {
    console.error('Error getDashboard:', err)
    res.status(500).json({ error: 'Error obteniendo dashboard' })
  }
}

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
    res.status(500).json({ error: 'Error obteniendo fincas' })
  }
}

// ── Inversiones activas de una finca ─────────────
const getInversionesFinca = async (req, res) => {
  try {
    const { finca_id } = req.params
    const [inversiones] = await pool.query(`
      SELECT i.*,
        f.nombre_ficticio,
        DATEDIFF(i.fecha_fin_ciclo, CURDATE()) AS dias_restantes,
        ROUND(DATEDIFF(CURDATE(), i.fecha_inicio_ciclo) / i.dias_ciclo * 100) AS progreso
      FROM inversiones i
      JOIN fincas f ON i.finca_id = f.id
      WHERE i.finca_id = ? AND i.estado = 'activa'
    `, [finca_id])
    res.json(inversiones)
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo inversiones' })
  }
}

// ── Animales de una inversión con último peso ─────
const getAnimalesInversion = async (req, res) => {
  try {
    const { inversion_id } = req.params
    const [animales] = await pool.query(`
      SELECT a.*,
        sp.peso_kg       as ultimo_peso,
        sp.estado        as ultimo_estado,
        sp.mes_numero    as ultimo_mes,
        sp.fecha_registro as fecha_ultimo_peso,
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

// ── Registrar peso ────────────────────────────────
const registrarPeso = async (req, res) => {
  try {
    const { animal_id, inversion_id, mes_numero, peso_kg, estado } = req.body

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

    await pool.query(
      'UPDATE animales SET estado_actual = ? WHERE id = ?',
      [estado, animal_id]
    )

    res.json({ message: 'Peso registrado correctamente' })
  } catch (err) {
    res.status(500).json({ error: 'Error registrando peso' })
  }
}

// ── Crear reporte técnico ─────────────────────────
const crearReporte = async (req, res) => {
  console.log('=== CREAR REPORTE ===')
  console.log('Body:', req.body)
  console.log('Usuario:', req.usuario)
  try {
    const { animal_id, inversion_id, tipo_revision, estado_animal, observaciones, visita_id } = req.body

    if (!observaciones || observaciones.length < 20) {
      return res.status(400).json({ error: 'Las observaciones deben tener mínimo 20 caracteres' })
    }

    console.log('Antes de insertar...')
    const [result] = await pool.query(`
      INSERT INTO reportes_tecnicos
        (animal_id, inversion_id, zootecnista_id, visita_id, tipo_revision, estado_animal, observaciones)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [animal_id, inversion_id, req.usuario.id, visita_id || null, tipo_revision, estado_animal, observaciones])

    console.log('Insertado ID:', result.insertId)

    // Actualizar estado del animal
    const estadoMap = {
      'excelente': 'excelente',
      'bueno':     'buen_estado',
      'regular':   'buen_estado',
      'enfermo':   'enfermo',
      'muerto':    'mal_estado'
    }
    await pool.query(
      'UPDATE animales SET estado_actual = ? WHERE id = ?',
      [estadoMap[estado_animal] || 'buen_estado', animal_id]
    )

    console.log('Estado animal actualizado')

    // Si es urgente crear alerta sanitaria
    if (estado_animal === 'enfermo' || estado_animal === 'muerto') {
      await pool.query(`
        INSERT INTO alertas_sanitarias (animal_id, inversion_id, zootecnista_id, descripcion, urgencia)
        VALUES (?, ?, ?, ?, ?)
      `, [animal_id, inversion_id, req.usuario.id,
          `Animal reportado como ${estado_animal}: ${observaciones.substring(0, 100)}`,
          estado_animal === 'muerto' ? 'critica' : 'alta'])
      console.log('Alerta sanitaria creada')
    }

    console.log('Enviando respuesta exitosa...')
    res.status(201).json({ message: 'Reporte creado correctamente', reporte_id: result.insertId })
  } catch (err) {
    console.error('Error SQL:', err.message)
    console.error('SQL:', err.sql)
    res.status(500).json({ error: err.message })
  }
}

// ── Subir evidencia ───────────────────────────────
const subirEvidencia = async (req, res) => {
  console.log('=== SUBIR EVIDENCIA ===')
  console.log('Body keys:', Object.keys(req.body))
  console.log('animal_id:', req.body.animal_id)
  console.log('inversion_id:', req.body.inversion_id)
  try {
    const { animal_id, inversion_id, reporte_id, descripcion, imagen_base64 } = req.body

    if (!imagen_base64) return res.status(400).json({ error: 'Imagen requerida' })

    // Guardar solo los primeros 100 chars del base64 para no saturar la BD
    // En producción usar S3 o Cloudinary
    const url_imagen = `data:image/jpeg;base64,${imagen_base64}`

    await pool.query(`
      INSERT INTO evidencias (animal_id, inversion_id, zootecnista_id, reporte_id, url_imagen, descripcion)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [animal_id, inversion_id, req.usuario.id, reporte_id || null, url_imagen, descripcion || ''])

    res.status(201).json({ message: 'Evidencia subida correctamente' })
  } catch (err) {
    console.error('Error subirEvidencia:', err.message)
    res.status(500).json({ error: err.message })
  }
}

// ── Obtener reportes de un animal ─────────────────
const getReportesAnimal = async (req, res) => {
  try {
    const { animal_id } = req.params
    const [reportes] = await pool.query(`
      SELECT rt.*, u.nombre as zootecnista_nombre,
        (SELECT COUNT(*) FROM evidencias WHERE reporte_id = rt.id) as evidencias
      FROM reportes_tecnicos rt
      JOIN usuarios u ON rt.zootecnista_id = u.id
      WHERE rt.animal_id = ?
      ORDER BY rt.created_at DESC
    `, [animal_id])
    res.json(reportes)
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo reportes' })
  }
}

// ── Obtener evidencias de un animal ───────────────
const getEvidenciasAnimal = async (req, res) => {
  try {
    const { animal_id } = req.params
    const [evidencias] = await pool.query(`
      SELECT e.*, u.nombre as zootecnista_nombre
      FROM evidencias e
      JOIN usuarios u ON e.zootecnista_id = u.id
      WHERE e.animal_id = ?
      ORDER BY e.created_at DESC
    `, [animal_id])
    res.json(evidencias)
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo evidencias' })
  }
}

// ── Mis visitas (calendario) ──────────────────────
const getMisVisitas = async (req, res) => {
  try {
    const [visitas] = await pool.query(`
      SELECT v.*, f.nombre_ficticio, f.nombre_real, f.ubicacion
      FROM visitas v
      JOIN fincas f ON v.finca_id = f.id
      WHERE v.zootecnista_id = ?
      ORDER BY v.fecha_visita ASC
    `, [req.usuario.id])
    res.json(visitas)
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo visitas' })
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

// ── Historial ─────────────────────────────────────
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
  getDashboard, getMisFincas, getInversionesFinca, getAnimalesInversion,
  registrarPeso, crearReporte, subirEvidencia,
  getReportesAnimal, getEvidenciasAnimal,
  getMisVisitas, agregarComentario, getHistorialFincas
}