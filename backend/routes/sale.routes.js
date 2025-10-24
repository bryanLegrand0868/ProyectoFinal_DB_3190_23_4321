const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const saleController = require('../controllers/sale.controller');
const { authenticateJWT, authorizeRoles } = require('../middlewares/auth.middleware');

// Obtener todas las ventas
router.get('/', 
  authenticateJWT,
  saleController.getAllSales
);

// Obtener venta por ID
router.get('/:id',
  authenticateJWT,
  saleController.getSaleById
);

// Crear venta
router.post('/',
  authenticateJWT,
  [
    body('id_cliente').optional().isNumeric().withMessage('El ID del cliente debe ser numérico'),
    body('detalles').isArray({ min: 1 }).withMessage('Debe incluir al menos un producto'),
    body('detalles.*.id_producto').isNumeric().withMessage('ID de producto inválido'),
    body('detalles.*.cantidad').isInt({ min: 1 }).withMessage('La cantidad debe ser mayor a 0'),
    body('detalles.*.precio_unitario').isFloat({ min: 0 }).withMessage('El precio debe ser válido')
  ],
  saleController.createSale
);

// Anular venta
router.put('/:id/cancel',
  authenticateJWT,
  authorizeRoles('Administrador', 'Gerente'),
  saleController.cancelSale
);

module.exports = router;