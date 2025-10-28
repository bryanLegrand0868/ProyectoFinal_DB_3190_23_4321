const orderService = require('../services/order.service');
const { validationResult } = require('express-validator');

class OrderController {
  async createOrder(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          errors: errors.array() 
        });
      }

      // 🔥 ACTUALIZADO: Obtener id_cliente del token o del body
      const idCliente = req.user.id_cliente || req.body.id_cliente;
      
      if (!idCliente) {
        return res.status(400).json({
          success: false,
          message: 'El ID del cliente es requerido'
        });
      }

      const result = await orderService.createOrder(idCliente, req.body);
      
      return res.status(201).json({ 
        success: true, 
        ...result 
      });
    } catch (error) {
      console.error('Error al crear pedido:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor' 
      });
    }
  }

  async getMyOrders(req, res) {
    try {
      // 🔥 ACTUALIZADO: Obtener id_cliente del token, query param o body
      const idCliente = req.user.id_cliente || req.query.id_cliente || req.body.id_cliente;
      
      if (!idCliente) {
        return res.status(400).json({
          success: false,
          message: 'ID de cliente requerido'
        });
      }

      const orders = await orderService.getOrdersByClient(parseInt(idCliente));
      return res.json({ success: true, data: orders });
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor' 
      });
    }
  }

  async getOrderTracking(req, res) {
    try {
      const { id_pedido } = req.params;
      const tracking = await orderService.getOrderTracking(parseInt(id_pedido));
      return res.json({ success: true, data: tracking });
    } catch (error) {
      console.error('Error al obtener seguimiento:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor' 
      });
    }
  }
}

module.exports = new OrderController();