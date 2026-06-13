const express = require('express')
const router  = express.Router()

const {
  getUsuarios, aprobarUsuario, getAnimalesInversion,
  asignarZootecnista, getZootecnistas,
  crearVisita, getVisitas, getAlertasSanitarias,
  getInversionesZootecnista,getReportesInversion
} = require('../controllers/admin.controller')

const { verificarToken, verificarRol } = require('../middlewares/auth.middleware')
const auth = [verificarToken, verificarRol('administrador')]

router.get('/usuarios',                        ...auth, getUsuarios)
router.put('/usuarios/:id/aprobar',            ...auth, aprobarUsuario)
router.get('/inversiones/:id/animales',        ...auth, getAnimalesInversion)
router.post('/asignar-zootecnista',            ...auth, asignarZootecnista)
router.get('/zootecnistas',                    ...auth, getZootecnistas)
router.post('/visitas',                        ...auth, crearVisita)
router.get('/visitas',                         ...auth, getVisitas)
router.get('/alertas',                         ...auth, getAlertasSanitarias)
router.get('/zootecnistas/:zootecnista_id/inversiones', ...auth, getInversionesZootecnista)
router.get('/inversiones/:id/reportes', verificarToken, verificarRol('administrador'), getReportesInversion)

module.exports = router

