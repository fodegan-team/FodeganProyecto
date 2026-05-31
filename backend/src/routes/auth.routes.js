const express  = require('express')
const { body } = require('express-validator')
const router   = express.Router()

const { register, login, logout, refreshToken, actualizarPerfil } = require('../controllers/auth.controller')
const { verificarToken } = require('../middlewares/auth.middleware')
const { validar }        = require('../middlewares/validate.middleware')

const validarLogin = [
  body('email').trim().notEmpty().withMessage('Email requerido').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').notEmpty().withMessage('Contraseña requerida'),
  validar
]

const validarRegistroBase = [
  body('nombre').trim().notEmpty().withMessage('Nombre requerido').isLength({ min: 2 }).withMessage('Mínimo 2 caracteres'),
  body('apellido').trim().notEmpty().withMessage('Apellido requerido'),
  body('email').trim().notEmpty().withMessage('Email requerido').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').notEmpty().withMessage('Contraseña requerida').isLength({ min: 8 }).withMessage('Mínimo 8 caracteres').matches(/[A-Z]/).withMessage('Debe tener una mayúscula').matches(/[0-9]/).withMessage('Debe tener un número'),
  body('telefono').notEmpty().withMessage('Teléfono requerido'),
  body('rol_id').notEmpty().withMessage('Rol requerido').isInt({ min: 1, max: 3 }).withMessage('Rol inválido'),
  validar
]

router.post('/register', validarRegistroBase, register)
router.post('/login',    validarLogin,        login)
router.post('/logout',   verificarToken,      logout)
router.post('/refresh',                       refreshToken)
router.get('/me',        verificarToken, (req, res) => res.json({ usuario: req.usuario }))
router.put('/perfil',    verificarToken,      actualizarPerfil)

module.exports = router