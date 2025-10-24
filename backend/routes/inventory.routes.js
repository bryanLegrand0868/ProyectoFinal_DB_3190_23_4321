const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const inventoryController = require('../controllers/inventory.controller');
const { authenticateJWT, authorizeRoles } = require('../middlewares/auth.middleware');

// Obtener todo el inventario
router.get('/', 
  authenticateJWT,
  inventoryController.getAllInventory
);

// Obtener inventario por sucursal
router.get('/sucursal/:id_sucursal',
  authenticateJWT,
  inventoryController.getInventoryBySucursal
);

// Ajustar inventario
router.post('/ajuste',
  authenticateJWT,
  authorizeRoles('Administrador', 'Gerente'),
  [
    body('id_producto').isNumeric().withMessage('El ID del producto es requerido'),
    body('id_sucursal').isNumeric().withMessage('El ID de la sucursal es requerido'),
    body('cantidad').isInt().withMessage('La cantidad debe ser un número entero'),
    body('tipo_movimiento').isIn(['ENTRADA', 'SALIDA', 'AJUSTE']).withMessage('Tipo de movimiento inválido'),
    body('motivo').notEmpty().withMessage('El motivo es requerido')
  ],
  inventoryController.ajustarInventario
);

// Obtener movimientos de inventario
router.get('/movimientos',
  authenticateJWT,
  inventoryController.getMovimientos
);

module.exports = router;