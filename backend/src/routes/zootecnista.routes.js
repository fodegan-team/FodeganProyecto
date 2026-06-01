const express = require('express')
const router  = express.Router()

const {
  getMisFincas, getInversionesFinca, getAnimalesInversion,
  registrarPeso, agregarComentario, getHistorialFincas
} = require('../controllers/zootecnista.controller')

const { verificarToken, verificarRol } = require('../middlewares/auth.middleware')

router.get('/fincas',                          verificarToken, verificarRol('zootecnista'), getMisFincas)
router.get('/fincas/:finca_id/inversiones',    verificarToken, verificarRol('zootecnista'), getInversionesFinca)
router.get('/inversiones/:inversion_id/animales', verificarToken, verificarRol('zootecnista'), getAnimalesInversion)
router.post('/peso',                           verificarToken, verificarRol('zootecnista'), registrarPeso)
router.post('/comentario',                     verificarToken, verificarRol('zootecnista'), agregarComentario)
router.get('/historial',                       verificarToken, verificarRol('zootecnista'), getHistorialFincas)

router.get('/comentarios/:inversion_id', verificarToken, verificarRol('zootecnista'), async (req, res) => {
  try {
    const [comentarios] = await require('../config/database').query(`
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