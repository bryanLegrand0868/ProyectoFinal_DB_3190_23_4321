const { getConnection, oracledb } = require('../config/database');

class VentaService {
  
  async registrarVenta(idEmpleado, idCliente, idSucursal, detalles) {
    let connection;
    
    try {
      connection = await getConnection();
      
      // Calcular subtotal
      let subtotal = 0;
      for (const detalle of detalles) {
        subtotal += detalle.cantidad * detalle.precio_unitario;
      }
      
      const iva = subtotal * 0.13; // 13% IVA
      const total = subtotal + iva;
      
      // Insertar la venta
      const ventaResult = await connection.execute(
        `INSERT INTO ventas (
          id_venta, id_sucursal, id_empleado, id_cliente,
          fecha_venta, subtotal, descuento, iva, total,
          estado_pago, estado
        ) VALUES (
          seq_venta.NEXTVAL, :id_sucursal, :id_empleado, :id_cliente,
          SYSDATE, :subtotal, 0, :iva, :total,
          'P', 'A'
        ) RETURNING id_venta INTO :id_venta`,
        {
          id_sucursal: idSucursal,
          id_empleado: idEmpleado,
          id_cliente: idCliente || null,
          subtotal,
          iva,
          total,
          id_venta: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const id_venta = ventaResult.outBinds.id_venta[0];

      // Registrar detalles de venta
      for (const detalle of detalles) {
        const subtotalDetalle = detalle.cantidad * detalle.precio_unitario;
        
        await connection.execute(
          `INSERT INTO detalles_venta (
            id_detalle_venta, id_venta, id_producto,
            cantidad, precio_unitario, descuento, subtotal
          ) VALUES (
            seq_detalle_venta.NEXTVAL, :id_venta, :id_producto,
            :cantidad, :precio_unitario, 0, :subtotal
          )`,
          {
            id_venta,
            id_producto: detalle.id_producto,
            cantidad: detalle.cantidad,
            precio_unitario: detalle.precio_unitario,
            subtotal: subtotalDetalle
          },
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        
        // Actualizar inventario
        await connection.execute(
          `UPDATE inventario
           SET cantidad_disponible = cantidad_disponible - :cantidad,
               fecha_actualizacion = SYSDATE
           WHERE id_producto = :id_producto
           AND id_sucursal = :id_sucursal`,
          {
            cantidad: detalle.cantidad,
            id_producto: detalle.id_producto,
            id_sucursal: idSucursal
          },
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
      }

      await connection.commit();
      
      return {
        success: true,
        message: 'Venta registrada correctamente',
        id_venta,
        total
      };
      
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      console.error('Error al registrar venta:', error);
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

  async getAllVentas() {
    let connection;
    
    try {
      connection = await getConnection();
      
      const result = await connection.execute(
        `SELECT 
          v.id_venta,
          v.id_empleado,
          e.nombres || ' ' || e.apellidos as nombre_empleado,
          v.id_cliente,
          c.nombres || ' ' || c.apellidos as nombre_cliente,
          v.id_sucursal,
          s.nombre AS nombre_sucursal,
          v.fecha_venta,
          v.subtotal,
          v.iva,
          v.total,
          v.estado_pago,
          v.estado
        FROM ventas v
        JOIN empleados e ON v.id_empleado = e.id_empleado
        LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
        JOIN sucursales s ON v.id_sucursal = s.id_sucursal
        WHERE v.estado = 'A'
        ORDER BY v.fecha_venta DESC`,
        {},
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      return result.rows;
      
    } catch (error) {
      console.error('Error al obtener ventas:', error);
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

  async getVentaById(idVenta) {
    let connection;
    
    try {
      connection = await getConnection();
      
      // Obtener datos de la venta
      const ventaResult = await connection.execute(
        `SELECT 
          v.id_venta,
          v.id_empleado,
          e.nombres || ' ' || e.apellidos as nombre_empleado,
          v.id_cliente,
          c.nombres || ' ' || c.apellidos as nombre_cliente,
          v.id_sucursal,
          s.nombre AS nombre_sucursal,
          v.fecha_venta,
          v.subtotal,
          v.iva,
          v.total,
          v.estado_pago,
          v.estado
        FROM ventas v
        JOIN empleados e ON v.id_empleado = e.id_empleado
        LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
        JOIN sucursales s ON v.id_sucursal = s.id_sucursal
        WHERE v.id_venta = :id_venta`,
        { id_venta: idVenta },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (ventaResult.rows.length === 0) {
        return null;
      }

      const venta = ventaResult.rows[0];

      // Obtener detalles de la venta
      const detallesResult = await connection.execute(
        `SELECT 
          dv.id_detalle_venta,
          dv.id_producto,
          p.nombre AS nombre_producto,
          dv.cantidad,
          dv.precio_unitario,
          dv.descuento,
          dv.subtotal
        FROM detalles_venta dv
        JOIN productos p ON dv.id_producto = p.id_producto
        WHERE dv.id_venta = :id_venta`,
        { id_venta: idVenta },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      venta.detalles = detallesResult.rows;

      return venta;
      
    } catch (error) {
      console.error('Error al obtener venta:', error);
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

  async anularVenta(idVenta) {
    let connection;
    
    try {
      connection = await getConnection();
      
      // Primero obtener los detalles para devolver el inventario
      const detallesResult = await connection.execute(
        `SELECT id_producto, cantidad FROM detalles_venta WHERE id_venta = :id_venta`,
        { id_venta: idVenta },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      
      // Obtener id_sucursal de la venta
      const ventaResult = await connection.execute(
        `SELECT id_sucursal FROM ventas WHERE id_venta = :id_venta`,
        { id_venta: idVenta },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      
      if (ventaResult.rows.length === 0) {
        return {
          success: false,
          message: 'Venta no encontrada'
        };
      }
      
      const id_sucursal = ventaResult.rows[0].ID_SUCURSAL;
      
      // Devolver productos al inventario
      for (const detalle of detallesResult.rows) {
        await connection.execute(
          `UPDATE inventario
           SET cantidad_disponible = cantidad_disponible + :cantidad,
               fecha_actualizacion = SYSDATE
           WHERE id_producto = :id_producto
           AND id_sucursal = :id_sucursal`,
          {
            cantidad: detalle.CANTIDAD,
            id_producto: detalle.ID_PRODUCTO,
            id_sucursal
          },
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
      }
      
      // Anular la venta
      await connection.execute(
        `UPDATE ventas SET estado = 'I', estado_pago = 'A' WHERE id_venta = :id_venta`,
        { id_venta: idVenta },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      await connection.commit();
      return {
        success: true,
        message: 'Venta anulada correctamente'
      };
      
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      console.error('Error al anular venta:', error);
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

module.exports = new VentaService();