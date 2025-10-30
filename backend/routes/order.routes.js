const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const orderController = require('../controllers/order.controller');
const { authenticateJWT, authorizeRoles } = require('../middlewares/auth.middleware');

router.post('/',
  authenticateJWT,
  [
    body('direccion_envio').notEmpty().withMessage('La dirección de envío es requerida'),
    body('ciudad_envio').notEmpty().withMessage('La ciudad de envío es requerida'),
    body('pais_envio').notEmpty().withMessage('El país de envío es requerido'),
    body('telefono_contacto').notEmpty().withMessage('El teléfono de contacto es requerido'),
    body('tipo_pago').isIn(['TARJETA_CREDITO', 'TARJETA_DEBITO', 'PAYPAL', 'TRANSFERENCIA'])
      .withMessage('Tipo de pago inválido'),
    body('detalles').isArray({ min: 1 }).withMessage('Debe incluir al menos un producto')
  ],
  orderController.createOrder
);

router.get('/my-orders',
  authenticateJWT,
  orderController.getMyOrders
);

router.get('/:id_pedido/tracking',
  authenticateJWT,
  orderController.getOrderTracking
);

router.put('/:id_pedido/status',
  authenticateJWT,
  authorizeRoles('Administrador', 'Gerente General', 'Gerente Sucursal'),
  [
    body('estado')
      .isIn(['PENDIENTE', 'PROCESANDO', 'ENVIADO', 'ENTREGADO', 'CANCELADO'])
      .withMessage('Estado inválido'),
    body('id_sucursal_despacho')
      .optional()
      .isNumeric()
      .withMessage('ID de sucursal debe ser numérico')
  ],
  orderController.updateOrderStatus
);

module.exports = router;