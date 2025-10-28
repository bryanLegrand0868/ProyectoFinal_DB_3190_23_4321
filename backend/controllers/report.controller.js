const reportService = require('../services/report.service');

class ReportController {
  async getTop10Clients(req, res) {
    try {
      const { id_pais, id_sucursal } = req.query;
      const clients = await reportService.getTop10Clients(id_pais, id_sucursal);
      return res.json({ success: true, data: clients });
    } catch (error) {
      console.error('Error al obtener top clientes:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor' 
      });
    }
  }

  async getTop10Employees(req, res) {
    try {
      const { id_pais, id_sucursal } = req.query;
      const employees = await reportService.getTop10Employees(id_pais, id_sucursal);
      return res.json({ success: true, data: employees });
    } catch (error) {
      console.error('Error al obtener top empleados:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor' 
      });
    }
  }

  async getSalesReport(req, res) {
    try {
      const filters = req.query;
      const sales = await reportService.getSalesReport(filters);
      return res.json({ success: true, data: sales });
    } catch (error) {
      console.error('Error al obtener reporte de ventas:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor' 
      });
    }
  }
}

module.exports = new ReportController();