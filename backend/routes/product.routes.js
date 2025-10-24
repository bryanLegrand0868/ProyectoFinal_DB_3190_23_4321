const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const productController = require('../controllers/product.controller');
const { authenticateJWT, authorizeRoles } = require('../middlewares/auth.middleware');

// Obtener todos los productos
router.get('/', 
  authenticateJWT,
  productController.getAllProducts
);

// Obtener producto por ID
router.get('/:id',
  authenticateJWT,
  productController.getProductById
);

// Crear producto
router.post('/',
  authenticateJWT,
  authorizeRoles('Administrador', 'Gerente'),
  [
    body('nombre').notEmpty().withMessage('El nombre del producto es requerido'),
    body('precio_venta').isFloat({ min: 0 }).withMessage('El precio de venta debe ser válido'),
    body('precio_compra').isFloat({ min: 0 }).withMessage('El precio de compra debe ser válido')
  ],
  productController.createProduct
);

// Actualizar producto
router.put('/:id',
  authenticateJWT,
  authorizeRoles('Administrador', 'Gerente'),
  productController.updateProduct
);

// Eliminar producto
router.delete('/:id',
  authenticateJWT,
  authorizeRoles('Administrador'),
  productController.deleteProduct
);

module.exports = router;