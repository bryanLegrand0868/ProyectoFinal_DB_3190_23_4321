const { getConnection, oracledb } = require('../config/database');

class InventoryService {
  
  async getAllInventory() {
    let connection;
    
    try {
      connection = await getConnection();
      
      const result = await connection.execute(
        `SELECT 
          i.id_inventario,
          i.id_producto,
          p.nombre AS nombre_producto,
          i.id_sucursal,
          s.nombre AS nombre_sucursal,
          i.cantidad_disponible,
          i.cantidad_minima,
          i.cantidad_maxima,
          i.fecha_actualizacion,
          CASE 
            WHEN i.cantidad_disponible <= i.cantidad_minima THEN 'BAJO'
            WHEN i.cantidad_disponible <= i.cantidad_minima * 2 THEN 'MEDIO'
            ELSE 'ALTO'
          END as nivel_stock
        FROM inventario i
        JOIN productos p ON i.id_producto = p.id_producto
        JOIN sucursales s ON i.id_sucursal = s.id_sucursal
        ORDER BY s.nombre, p.nombre`,
        {},
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      return result.rows;
      
    } catch (error) {
      console.error('Error al obtener inventario:', error);
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

  async getInventoryBySucursal(idSucursal) {
    let connection;
    
    try {
      connection = await getConnection();
      
      const result = await connection.execute(
        `SELECT 
          i.id_inventario,
          i.id_producto,
          p.nombre AS nombre_producto,
          i.cantidad_disponible,
          i.cantidad_minima,
          i.cantidad_maxima,
          i.fecha_actualizacion,
          CASE 
            WHEN i.cantidad_disponible <= i.cantidad_minima THEN 'BAJO'
            WHEN i.cantidad_disponible <= i.cantidad_minima * 2 THEN 'MEDIO'
            ELSE 'ALTO'
          END as nivel_stock
        FROM inventario i
        JOIN productos p ON i.id_producto = p.id_producto
        WHERE i.id_sucursal = :id_sucursal
        ORDER BY p.nombre`,
        { id_sucursal: idSucursal },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      return result.rows;
      
    } catch (error) {
      console.error('Error al obtener inventario por sucursal:', error);
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

  async ajustarInventario(idProducto, idSucursal, cantidad, tipoMovimiento, motivo) {
    let connection;
    
    try {
      connection = await getConnection();
      
      // Actualizar inventario directamente sin stored procedure
      if (tipoMovimiento === 'ENTRADA') {
        await connection.execute(
          `UPDATE inventario
           SET cantidad_disponible = cantidad_disponible + :cantidad,
               fecha_actualizacion = SYSDATE
           WHERE id_producto = :id_producto
           AND id_sucursal = :id_sucursal`,
          {
            cantidad,
            id_producto: idProducto,
            id_sucursal: idSucursal
          }
        );
      } else if (tipoMovimiento === 'SALIDA') {
        await connection.execute(
          `UPDATE inventario
           SET cantidad_disponible = cantidad_disponible - :cantidad,
               fecha_actualizacion = SYSDATE
           WHERE id_producto = :id_producto
           AND id_sucursal = :id_sucursal`,
          {
            cantidad,
            id_producto: idProducto,
            id_sucursal: idSucursal
          }
        );
      } else {
        return {
          success: false,
          message: 'Tipo de movimiento no válido. Use ENTRADA o SALIDA'
        };
      }

      await connection.commit();
      return {
        success: true,
        message: 'Inventario ajustado correctamente'
      };
      
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      console.error('Error al ajustar inventario:', error);
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

  async getMovimientos(idSucursal = null) {
    let connection;
    
    try {
      connection = await getConnection();
      
      // Como no existe tabla movimientos_inventario, usamos la bitácora
      let query = `SELECT 
          b.id_bitacora,
          b.fecha_hora,
          b.modulo,
          b.accion,
          b.descripcion,
          b.id_usuario
        FROM bitacora b
        WHERE b.modulo = 'INVENTARIO'`;
      
      const binds = {};
      
      query += ` ORDER BY b.fecha_hora DESC`;

      const result = await connection.execute(query, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });

      return result.rows;
      
    } catch (error) {
      console.error('Error al obtener movimientos:', error);
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

module.exports = new InventoryService();