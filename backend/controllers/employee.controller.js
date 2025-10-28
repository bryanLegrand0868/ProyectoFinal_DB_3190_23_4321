const employeeService = require('../services/employee.service');

class EmployeeController {
  async getAllWithCountry(req, res) {
    try {
      const employees = await employeeService.getAllEmployeesWithCountry();
      return res.json({ success: true, data: employees });
    } catch (error) {
      console.error('Error al obtener empleados:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor' 
      });
    }
  }

  async getBySucursal(req, res) {
    try {
      const { id_sucursal } = req.params;
      const employees = await employeeService.getEmployeesBySucursal(parseInt(id_sucursal));
      return res.json({ success: true, data: employees });
    } catch (error) {
      console.error('Error al obtener empleados:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor' 
      });
    }
  }
}

module.exports = new EmployeeController();
