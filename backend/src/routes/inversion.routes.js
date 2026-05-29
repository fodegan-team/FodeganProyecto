const express = require('express')
const router  = express.Router()

const {
  getConfiguracion,
  updateConfiguracion,
  getFincasDisponibles,
  crearInversion,
  getMisInversiones
} = require('../controllers/inversion.controller')

const { verificarToken, verificarRol } = require('../middlewares/auth.middleware')

// Configuración — solo admin
router.get('/configuracion',    getConfiguracion)
router.put('/configuracion',    verificarToken, verificarRol('administrador'), updateConfiguracion)

// Fincas disponibles — solo inversores
router.get('/fincas-disponibles', verificarToken, verificarRol('inversionista'), getFincasDisponibles)

// Inversiones
router.post('/',    verificarToken, verificarRol('inversionista'), crearInversion)
router.get('/mias', verificarToken, verificarRol('inversionista'), getMisInversiones)

module.exports = router