const express = require('express')
const router  = express.Router()

const {
  getConfiguracion, updateConfiguracion,
  crearInversion, aprobarInversion, rechazarInversion,
  getMisInversiones, getDetalleInversion,
  getAllInversiones, finalizarInversion, registrarAnimalesInversion
} = require('../controllers/inversion.controller')

const { verificarToken, verificarRol } = require('../middlewares/auth.middleware')

// Configuración
router.get('/configuracion', getConfiguracion)
router.put('/configuracion', verificarToken, verificarRol('administrador'), updateConfiguracion)

// Inversor
router.post('/',      verificarToken, verificarRol('inversionista'), crearInversion)
router.get('/mias',   verificarToken, verificarRol('inversionista'), getMisInversiones)
router.get('/:id',    verificarToken, verificarRol('inversionista'), getDetalleInversion)
router.post('/:id/animales', verificarToken, verificarRol('administrador'), registrarAnimalesInversion)
// Admin
router.get('/',              verificarToken, verificarRol('administrador'), getAllInversiones)
router.put('/:id/aprobar',   verificarToken, verificarRol('administrador'), aprobarInversion)
router.put('/:id/rechazar',  verificarToken, verificarRol('administrador'), rechazarInversion)
router.put('/:id/finalizar', verificarToken, verificarRol('administrador'), finalizarInversion)

module.exports = router