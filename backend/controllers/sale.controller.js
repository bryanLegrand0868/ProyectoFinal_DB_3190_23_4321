const ventaService = require('../services/venta.service');
const { validationResult } = require('express-validator');

class SaleController {
  
  async getAllSales(req, res) {
    try {
      const ventas = await ventaService.getAllVentas();
      return res.json({
        success: true,
        data: ventas
      });
    } catch (error) {
      console.error('Error al obtener ventas:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Error interno del servidor' 
      });
    }
  }

  async getSaleById(req, res) {
    try {
      const { id } = req.params;
      const venta = await ventaService.getVentaById(parseInt(id));
      
      if (!venta) {
        return res.status(404).json({
          success: false,
          message: 'Venta no encontrada'
        });
      }

      return res.json({
        success: true,
        data: venta
      });
    } catch (error) {
      console.error('Error al obtener venta:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Error interno del servidor' 
      });
    }
  }

  async createSale(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          errors: errors.array() 
        });
      }

      const { id_cliente, id_sucursal: sucursal_body, detalles } = req.body;
      const id_empleado = req.user.id_empleado;
      const id_sucursal = req.user.id_sucursal || sucursal_body;

      if (!id_sucursal) {
        return res.status(400).json({
          success: false,
          message: 'Debe especificar una sucursal para la venta'
        });
      }

      if (!detalles || detalles.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Debe incluir al menos un producto en la venta'
        });
      }

      const result = await ventaService.registrarVenta(
        id_empleado,
        id_cliente,
        id_sucursal,
        detalles
      );

      if (result.success) {
        const venta = await ventaService.getVentaById(result.id_venta);
        return res.status(201).json({
          success: true,
          message: result.message,
          data: venta
        });
      } else {
        return res.status(400).json(result);
      }
      
    } catch (error) {
      console.error('Error al crear venta:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Error interno del servidor' 
      });
    }
  }

  async cancelSale(req, res) {
    try {
      const { id } = req.params;

      const result = await ventaService.anularVenta(parseInt(id));

      if (result.success) {
        return res.json(result);
      } else {
        return res.status(400).json(result);
      }
      
    } catch (error) {
      console.error('Error al anular venta:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Error interno del servidor' 
      });
    }
  }
}

module.exports = new SaleController();