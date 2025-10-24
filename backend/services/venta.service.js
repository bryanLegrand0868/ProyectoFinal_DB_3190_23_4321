// services/venta.service.js
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
      
      // 🔥 ARREGLO: Usar 'P' si cambiaste el CHECK, o 'Pendiente' si no
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
        }
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
          }
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
          }
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

      // 🔥 ARREGLO: Mapear filas
      return result.rows.map(row => ({
        id_venta: row.ID_VENTA,
        id_empleado: row.ID_EMPLEADO,
        nombre_empleado: row.NOMBRE_EMPLEADO,
        id_cliente: row.ID_CLIENTE,
        nombre_cliente: row.NOMBRE_CLIENTE,
        id_sucursal: row.ID_SUCURSAL,
        nombre_sucursal: row.NOMBRE_SUCURSAL,
        fecha_venta: row.FECHA_VENTA,
        subtotal: row.SUBTOTAL,
        iva: row.IVA,
        total: row.TOTAL,
        estado_pago: row.ESTADO_PAGO,
        estado: row.ESTADO
      }));
      
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

      const row = ventaResult.rows[0];
      const venta = {
        id_venta: row.ID_VENTA,
        id_empleado: row.ID_EMPLEADO,
        nombre_empleado: row.NOMBRE_EMPLEADO,
        id_cliente: row.ID_CLIENTE,
        nombre_cliente: row.NOMBRE_CLIENTE,
        id_sucursal: row.ID_SUCURSAL,
        nombre_sucursal: row.NOMBRE_SUCURSAL,
        fecha_venta: row.FECHA_VENTA,
        subtotal: row.SUBTOTAL,
        iva: row.IVA,
        total: row.TOTAL,
        estado_pago: row.ESTADO_PAGO,
        estado: row.ESTADO
      };

      // Obtener detalles
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

      venta.detalles = detallesResult.rows.map(d => ({
        id_detalle_venta: d.ID_DETALLE_VENTA,
        id_producto: d.ID_PRODUCTO,
        nombre_producto: d.NOMBRE_PRODUCTO,
        cantidad: d.CANTIDAD,
        precio_unitario: d.PRECIO_UNITARIO,
        descuento: d.DESCUENTO,
        subtotal: d.SUBTOTAL
      }));

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
      
      const detallesResult = await connection.execute(
        `SELECT id_producto, cantidad FROM detalles_venta WHERE id_venta = :id_venta`,
        { id_venta: idVenta },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      
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
          }
        );
      }
      
      // Anular la venta
      await connection.execute(
        `UPDATE ventas SET estado = 'I', estado_pago = 'A' WHERE id_venta = :id_venta`,
        { id_venta: idVenta }
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