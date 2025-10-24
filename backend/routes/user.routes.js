const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const { authenticateJWT, authorizeRoles } = require('../middlewares/auth.middleware');

// Obtener todos los usuarios
router.get('/', 
  authenticateJWT, 
  authorizeRoles('Administrador'),
  userController.getAllUsers
);

// Obtener usuario por ID
router.get('/:id',
  authenticateJWT,
  userController.getUserById
);

// Crear usuario
router.post('/',
  authenticateJWT,
  authorizeRoles('Administrador'),
  [
    body('usuario').notEmpty().withMessage('El usuario es requerido'),
    body('contrasena')
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('id_rol').isNumeric().withMessage('El rol es requerido')
  ],
  userController.createUser
);

// Actualizar usuario
router.put('/:id',
  authenticateJWT,
  userController.updateUser
);

// Eliminar usuario
router.delete('/:id',
  authenticateJWT,
  authorizeRoles('Administrador'),
  userController.deleteUser
);

// Obtener roles
router.get('/catalogo/roles',
  authenticateJWT,
  userController.getRoles
);

module.exports = router;