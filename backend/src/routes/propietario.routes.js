const express = require('express')
const router  = express.Router()

const {
  getDashboard, getAnimalesInversion, getReportesInversion,
  getMisVisitas, confirmarVisita, rechazarVisita,
  getMiFinca, subirDocumento, getHistorial, actualizarFinca
} = require('../controllers/propietario.controller')

const { verificarToken, verificarRol } = require('../middlewares/auth.middleware')
const auth = [verificarToken, verificarRol('propietario')]

router.get('/dashboard',                          ...auth, getDashboard)
router.get('/inversiones/:inversion_id/animales', ...auth, getAnimalesInversion)
router.get('/inversiones/:inversion_id/reportes', ...auth, getReportesInversion)
router.get('/visitas',                            ...auth, getMisVisitas)
router.put('/visitas/:id/confirmar',              ...auth, confirmarVisita)
router.put('/visitas/:id/rechazar',               ...auth, rechazarVisita)
router.get('/finca',                              ...auth, getMiFinca)
router.post('/documento',                         ...auth, subirDocumento)
router.get('/historial',                          ...auth, getHistorial)
router.put('/finca',                              ...auth, actualizarFinca)

module.exports = router