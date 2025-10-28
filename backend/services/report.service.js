const { getConnection, oracledb } = require('../config/database');

class ReportService {
  // Top 10 clientes por país y sucursal
  async getTop10Clients(idPais = null, idSucursal = null) {
    let connection;
    try {
      connection = await getConnection();
      let query = `SELECT * FROM vw_top10_clientes_pais_sucursal WHERE 1=1`;
      const binds = {};

      if (idPais) {
        query += ` AND id_pais = :id_pais`;
        binds.id_pais = idPais;
      }
      if (idSucursal) {
        query += ` AND id_sucursal = :id_sucursal`;
        binds.id_sucursal = idSucursal;
      }

      const result = await connection.execute(query, binds, { 
        outFormat: oracledb.OUT_FORMAT_OBJECT 
      });
      
      return result.rows;
    } catch (error) {
      console.error('Error en getTop10Clients:', error);
      throw error;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error('Error al cerrar conexión:', err);
        }
      }
    }
  }

  // Top 10 empleados por país y sucursal
  async getTop10Employees(idPais = null, idSucursal = null) {
    let connection;
    try {
      connection = await getConnection();
      let query = `SELECT * FROM vw_top_empleados_pais_sucursal WHERE 1=1`;
      const binds = {};

      if (idPais) {
        query += ` AND pais = (SELECT nombre FROM paises WHERE id_pais = :id_pais)`;
        binds.id_pais = idPais;
      }
      if (idSucursal) {
        query += ` AND sucursal = (SELECT nombre FROM sucursales WHERE id_sucursal = :id_sucursal)`;
        binds.id_sucursal = idSucursal;
      }

      const result = await connection.execute(query, binds, { 
        outFormat: oracledb.OUT_FORMAT_OBJECT 
      });
      
      return result.rows;
    } catch (error) {
      console.error('Error en getTop10Employees:', error);
      throw error;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error('Error al cerrar conexión:', err);
        }
      }
    }
  }

  // Ventas con filtros avanzados
  async getSalesReport(filters = {}) {
    let connection;
    try {
      connection = await getConnection();
      
      let query = `
        SELECT 
          v.id_venta,
          v.fecha_venta,
          s.nombre AS sucursal,
          p.nombre AS pais,
          e.nombres || ' ' || e.apellidos AS vendedor,
          v.total,
          v.tipo_pago,
          v.estado_pago
        FROM ventas v
        JOIN sucursales s ON v.id_sucursal = s.id_sucursal
        JOIN ciudades c ON s.id_ciudad = c.id_ciudad
        JOIN paises p ON c.id_pais = p.id_pais
        JOIN empleados e ON v.id_empleado = e.id_empleado
        WHERE v.estado = 'A'
      `;
      
      const binds = {};

      if (filters.fecha_desde) {
        query += ` AND v.fecha_venta >= TO_DATE(:fecha_desde, 'YYYY-MM-DD')`;
        binds.fecha_desde = filters.fecha_desde;
      }
      if (filters.fecha_hasta) {
        query += ` AND v.fecha_venta <= TO_DATE(:fecha_hasta, 'YYYY-MM-DD')`;
        binds.fecha_hasta = filters.fecha_hasta;
      }
      if (filters.id_sucursal) {
        query += ` AND v.id_sucursal = :id_sucursal`;
        binds.id_sucursal = filters.id_sucursal;
      }
      if (filters.id_pais) {
        query += ` AND p.id_pais = :id_pais`;
        binds.id_pais = filters.id_pais;
      }

      query += ` ORDER BY v.fecha_venta DESC`;

      const result = await connection.execute(query, binds, { 
        outFormat: oracledb.OUT_FORMAT_OBJECT 
      });
      
      return result.rows;
    } catch (error) {
      console.error('Error en getSalesReport:', error);
      throw error;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error('Error al cerrar conexión:', err);
        }
      }
    }
  }
}

module.exports = new ReportService();