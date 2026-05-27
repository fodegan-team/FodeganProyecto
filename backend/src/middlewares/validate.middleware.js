const { validationResult } = require('express-validator')

const validar = (req, res, next) => {
  const errores = validationResult(req)
  if (!errores.isEmpty()) {
    return res.status(400).json({
      error: 'Datos inválidos',
      detalles: errores.array().map(e => ({
        campo:   e.path,
        mensaje: e.msg
      }))
    })
  }
  next()
}

module.exports = { validar }