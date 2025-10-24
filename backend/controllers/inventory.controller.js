const inventoryService = require('../services/inventory.service');
const { validationResult } = require('express-validator');

class InventoryController {
  
  async getAllInventory(req, res) {
    try {
      const inventory = await inventoryService.getAllInventory();
      return res.json({
        success: true,
        data: inventory
      });
    } catch (error) {
      console.error('Error al obtener inventario:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Error interno del servidor' 
      });
    }
  }

  async getInventoryBySucursal(req, res) {
    try {
      const { id_sucursal } = req.params;
      const inventory = await inventoryService.getInventoryBySucursal(parseInt(id_sucursal));
      return res.json({
        success: true,
        data: inventory
      });
    } catch (error) {
      console.error('Error al obtener inventario por sucursal:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Error interno del servidor' 
      });
    }
  }

  async ajustarInventario(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          errors: errors.array() 
        });
      }

      const { id_producto, id_sucursal, cantidad, tipo_movimiento, motivo } = req.body;

      const result = await inventoryService.ajustarInventario(
        id_producto,
        id_sucursal,
        cantidad,
        tipo_movimiento,
        motivo
      );

      if (result.success) {
        return res.json(result);
      } else {
        return res.status(400).json(result);
      }
      
    } catch (error) {
      console.error('Error al ajustar inventario:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Error interno del servidor' 
      });
    }
  }

  async getMovimientos(req, res) {
    try {
      const { id_sucursal } = req.query;
      const movimientos = await inventoryService.getMovimientos(
        id_sucursal ? parseInt(id_sucursal) : null
      );
      return res.json({
        success: true,
        data: movimientos
      });
    } catch (error) {
      console.error('Error al obtener movimientos:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Error interno del servidor' 
      });
    }
  }
}

module.exports = new InventoryController();