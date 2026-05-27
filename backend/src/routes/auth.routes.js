const express  = require('express')
const { body } = require('express-validator')
const router   = express.Router()

const { register, login, logout, refreshToken } = require('../controllers/auth.controller')
const { verificarToken } = require('../middlewares/auth.middleware')
const { validar }        = require('../middlewares/validate.middleware')

// ── Validaciones de registro ──────────────────────
const validarRegistro = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2 }).withMessage('Mínimo 2 caracteres'),

  body('apellido')
    .trim()
    .notEmpty().withMessage('El apellido es requerido')
    .isLength({ min: 2 }).withMessage('Mínimo 2 caracteres'),

  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 8 }).withMessage('Mínimo 8 caracteres')
    .matches(/[A-Z]/).withMessage('Debe tener al menos una mayúscula')
    .matches(/[0-9]/).withMessage('Debe tener al menos un número'),

  body('rol_id')
    .optional()
    .isInt({ min: 1, max: 4 }).withMessage('Rol inválido'),

  validar
]

// ── Validaciones de login ─────────────────────────
const validarLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('La contraseña es requerida'),

  validar
]

// ── Rutas ─────────────────────────────────────────
router.post('/register', validarRegistro, register)
router.post('/login',    validarLogin,    login)
router.post('/logout',   verificarToken,  logout)
router.post('/refresh',                  refreshToken)

// Ruta protegida de prueba
router.get('/me', verificarToken, (req, res) => {
  res.json({ usuario: req.usuario })
})

module.exports = router