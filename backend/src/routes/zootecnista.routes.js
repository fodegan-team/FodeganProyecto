const express = require('express')
const router  = express.Router()
const pool    = require('../config/database')

const {
  getDashboard, getMisFincas, getInversionesFinca, getAnimalesInversion,
  registrarPeso, crearReporte, subirEvidencia,
  getReportesAnimal, getEvidenciasAnimal,
  getMisVisitas, agregarComentario, getHistorialFincas
} = require('../controllers/zootecnista.controller')

const { verificarToken, verificarRol } = require('../middlewares/auth.middleware')
const auth = [verificarToken, verificarRol('zootecnista')]

router.get('/dashboard',                              ...auth, getDashboard)
router.get('/fincas',                                 ...auth, getMisFincas)
router.get('/fincas/:finca_id/inversiones',           ...auth, getInversionesFinca)
router.get('/inversiones/:inversion_id/animales',     ...auth, getAnimalesInversion)
router.post('/peso',                                  ...auth, registrarPeso)
router.post('/reporte',                               ...auth, crearReporte)
router.post('/evidencia',                             ...auth, subirEvidencia)
router.get('/animales/:animal_id/reportes',           ...auth, getReportesAnimal)
router.get('/animales/:animal_id/evidencias',         ...auth, getEvidenciasAnimal)
router.get('/visitas',                                ...auth, getMisVisitas)
router.post('/comentario',                            ...auth, agregarComentario)
router.get('/historial',                              ...auth, getHistorialFincas)

router.get('/comentarios/:inversion_id', ...auth, async (req, res) => {
  try {
    const [comentarios] = await pool.query(`
      SELECT c.*, u.nombre as zootecnista_nombre
      FROM comentarios c
      JOIN usuarios u ON c.zootecnista_id = u.id
      WHERE c.inversion_id = ?
      ORDER BY c.created_at DESC
    `, [req.params.inversion_id])
    res.json(comentarios)
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo comentarios' })
  }
})

module.exports = router