const { getConnection, oracledb } = require('../config/database');

class EmployeeService {
  async getAllEmployeesWithCountry() {
    let connection;
    try {
      connection = await getConnection();
      const result = await connection.execute(
        `SELECT 
          e.id_empleado,
          e.nombres || ' ' || e.apellidos AS nombre_completo,
          e.email,
          e.telefono,
          e.estado,
          s.id_sucursal,
          s.nombre AS sucursal,
          c.nombre AS ciudad,
          p.id_pais,
          p.nombre AS pais
        FROM empleados e
        JOIN sucursales s ON e.id_sucursal = s.id_sucursal
        JOIN ciudades c ON s.id_ciudad = c.id_ciudad
        JOIN paises p ON c.id_pais = p.id_pais
        ORDER BY p.nombre, s.nombre, e.nombres`,
        {},
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows;
    } catch (error) {
      console.error('Error en getAllEmployeesWithCountry:', error);
      throw error;
    } finally {
      if (connection) await connection.close();
    }
  }

  async getEmployeesBySucursal(idSucursal) {
    let connection;
    try {
      connection = await getConnection();
      const result = await connection.execute(
        `SELECT 
          e.id_empleado,
          e.nombres || ' ' || e.apellidos AS nombre_completo,
          e.email,
          e.telefono,
          e.fecha_contratacion,
          e.salario,
          e.estado
        FROM empleados e
        WHERE e.id_sucursal = :id_sucursal
        ORDER BY e.nombres`,
        { id_sucursal: idSucursal },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows;
    } catch (error) {
      console.error('Error en getEmployeesBySucursal:', error);
      throw error;
    } finally {
      if (connection) await connection.close();
    }
  }
}

module.exports = new EmployeeService();