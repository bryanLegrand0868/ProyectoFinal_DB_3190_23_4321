const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { authenticateJWT } = require('../middlewares/auth.middleware');

// Login
router.post('/login', [
  body('usuario').notEmpty().withMessage('El usuario es requerido'),
  body('contrasena').notEmpty().withMessage('La contraseña es requerida')
], authController.login);

// Obtener usuario actual
router.get('/me', authenticateJWT, authController.getCurrentUser);

// Cambiar contraseña
router.post('/change-password', [
  authenticateJWT,
  body('contrasenaActual').notEmpty().withMessage('La contraseña actual es requerida'),
  body('contrasenaNueva')
    .isLength({ min: 6 })
    .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
], authController.changePassword);

module.exports = router;