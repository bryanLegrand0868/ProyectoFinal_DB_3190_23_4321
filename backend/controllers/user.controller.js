const userService = require('../services/user.service');
const authService = require('../services/auth.service');
const { validationResult } = require('express-validator');

class UserController {
  
  async getAllUsers(req, res) {
    try {
      const users = await userService.getAllUsers();
      return res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Error interno del servidor' 
      });
    }
  }

  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(parseInt(id));
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      return res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Error interno del servidor' 
      });
    }
  }

  async createUser(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          errors: errors.array() 
        });
      }

      const { usuario, contrasena, id_rol } = req.body;

      const result = await authService.crearUsuario(id_rol, usuario, contrasena);

      if (result.success) {
        const newUser = await userService.getUserById(result.id_usuario);
        return res.status(201).json({
          success: true,
          message: result.message,
          data: newUser
        });
      } else {
        return res.status(400).json(result);
      }
      
    } catch (error) {
      console.error('Error al crear usuario:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Error interno del servidor' 
      });
    }
  }

  async updateUser(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          errors: errors.array() 
        });
      }

      const { id } = req.params;
      const data = req.body;

      const updatedUser = await userService.updateUser(parseInt(id), data);

      return res.json({
        success: true,
        message: 'Usuario actualizado correctamente',
        data: updatedUser
      });
      
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Error interno del servidor' 
      });
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      await userService.deleteUser(parseInt(id));

      return res.json({
        success: true,
        message: 'Usuario eliminado correctamente'
      });
      
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Error interno del servidor' 
      });
    }
  }

  async getRoles(req, res) {
    try {
      const roles = await userService.getRoles();
      return res.json({
        success: true,
        data: roles
      });
    } catch (error) {
      console.error('Error al obtener roles:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Error interno del servidor' 
      });
    }
  }
}

module.exports = new UserController();