const authService = require('../services/auth.service');
const { validationResult } = require('express-validator');

class AuthController {
  
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          errors: errors.array() 
        });
      }

      const { usuario, contrasena } = req.body;
      const ipOrigen = req.ip || req.connection.remoteAddress;

      const result = await authService.authenticate(usuario, contrasena, ipOrigen);

      if (result.success) {
        return res.json(result);
      } else {
        return res.status(401).json(result);
      }
      
    } catch (error) {
      console.error('Error en login:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Error interno del servidor' 
      });
    }
  }

  async getCurrentUser(req, res) {
    try {
      return res.json({
        success: true,
        user: req.user
      });
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Error interno del servidor' 
      });
    }
  }

  async changePassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          errors: errors.array() 
        });
      }

      const { contrasenaActual, contrasenaNueva } = req.body;
      const idUsuario = req.user.id_usuario;

      const result = await authService.cambiarContrasena(
        idUsuario, 
        contrasenaActual, 
        contrasenaNueva
      );

      return res.json(result);
      
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Error interno del servidor' 
      });
    }
  }
}

module.exports = new AuthController();