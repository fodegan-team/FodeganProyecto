const express = require('express')
const router  = express.Router()

const {
  getFincasDisponibles,
  getAllFincas,
  aprobarFinca,
  rechazarFinca,
  getMiFinca
} = require('../controllers/finca.controller')

const { verificarToken, verificarRol } = require('../middlewares/auth.middleware')

// Inversor
router.get('/disponibles', verificarToken, verificarRol('inversionista'), getFincasDisponibles)

// Admin
router.get('/',              verificarToken, verificarRol('administrador'), getAllFincas)
router.put('/:id/aprobar',   verificarToken, verificarRol('administrador'), aprobarFinca)
router.put('/:id/rechazar',  verificarToken, verificarRol('administrador'), rechazarFinca)

// Propietario
router.get('/mia', verificarToken, verificarRol('propietario'), getMiFinca)

module.exports = router