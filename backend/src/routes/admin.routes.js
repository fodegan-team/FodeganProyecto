const express = require('express')
const router  = express.Router()

const { getUsuarios, aprobarUsuario, getAnimalesInversion } = require('../controllers/admin.controller')
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware')

router.get('/usuarios',                    verificarToken, verificarRol('administrador'), getUsuarios)
router.put('/usuarios/:id/aprobar',        verificarToken, verificarRol('administrador'), aprobarUsuario)
router.get('/inversiones/:id/animales',    verificarToken, verificarRol('administrador'), getAnimalesInversion)

module.exports = router