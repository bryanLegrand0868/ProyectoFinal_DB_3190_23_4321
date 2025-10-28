const { getConnection, oracledb } = require('../config/database');

class OrderService {
  async createOrder(idCliente, orderData) {
    let connection;
    try {
      connection = await getConnection();
      
      const { direccion_envio, ciudad_envio, pais_envio, telefono_contacto, 
              tipo_pago, detalles } = orderData;

      let subtotal = 0;
      for (const d of detalles) {
        subtotal += d.cantidad * d.precio_unitario;
      }

      const costo_envio = 10.00;
      const iva = subtotal * 0.13;
      const total = subtotal + costo_envio + iva;

      const pedidoResult = await connection.execute(
        `INSERT INTO pedidos_online (
          id_pedido, id_cliente, fecha_pedido, direccion_envio,
          ciudad_envio, pais_envio, telefono_contacto,
          subtotal, costo_envio, iva, total,
          estado_pedido, estado_pago, tipo_pago
        ) VALUES (
          seq_pedido_online.NEXTVAL, :id_cliente, SYSDATE, :direccion_envio,
          :ciudad_envio, :pais_envio, :telefono_contacto,
          :subtotal, :costo_envio, :iva, :total,
          'PENDIENTE', 'P', :tipo_pago
        ) RETURNING id_pedido INTO :id_pedido`,
        {
          id_cliente: idCliente,
          direccion_envio,
          ciudad_envio,
          pais_envio,
          telefono_contacto,
          subtotal,
          costo_envio,
          iva,
          total,
          tipo_pago,
          id_pedido: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        }
      );

      const id_pedido = pedidoResult.outBinds.id_pedido[0];

      for (const d of detalles) {
        await connection.execute(
          `INSERT INTO detalles_pedido (
            id_detalle_pedido, id_pedido, id_producto,
            cantidad, precio_unitario, descuento, subtotal
          ) VALUES (
            seq_detalle_pedido.NEXTVAL, :id_pedido, :id_producto,
            :cantidad, :precio_unitario, 0, :subtotal
          )`,
          {
            id_pedido,
            id_producto: d.id_producto,
            cantidad: d.cantidad,
            precio_unitario: d.precio_unitario,
            subtotal: d.cantidad * d.precio_unitario
          }
        );
      }

      await connection.execute(
        `INSERT INTO seguimiento_pedidos (
          id_seguimiento, id_pedido, estado, descripcion
        ) VALUES (
          seq_seguimiento.NEXTVAL, :id_pedido, 'PENDIENTE', 'Pedido recibido'
        )`,
        { id_pedido }
      );

      await connection.commit();
      return { success: true, id_pedido, total };
    } catch (error) {
      if (connection) await connection.rollback();
      console.error('Error en createOrder:', error);
      throw error;
    } finally {
      if (connection) await connection.close();
    }
  }

  async getOrdersByClient(idCliente) {
    let connection;
    try {
      connection = await getConnection();
      const result = await connection.execute(
        `SELECT 
          p.id_pedido,
          p.fecha_pedido,
          p.direccion_envio,
          p.total,
          p.estado_pedido,
          p.estado_pago,
          p.tipo_pago,
          p.fecha_entrega_estimada
        FROM pedidos_online p
        WHERE p.id_cliente = :id_cliente
        ORDER BY p.fecha_pedido DESC`,
        { id_cliente: idCliente },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows;
    } catch (error) {
      console.error('Error en getOrdersByClient:', error);
      throw error;
    } finally {
      if (connection) await connection.close();
    }
  }

  async getOrderTracking(idPedido) {
    let connection;
    try {
      connection = await getConnection();
      const result = await connection.execute(
        `SELECT 
          s.id_seguimiento,
          s.fecha_hora,
          s.estado,
          s.descripcion,
          s.ubicacion
        FROM seguimiento_pedidos s
        WHERE s.id_pedido = :id_pedido
        ORDER BY s.fecha_hora DESC`,
        { id_pedido: idPedido },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows;
    } catch (error) {
      console.error('Error en getOrderTracking:', error);
      throw error;
    } finally {
      if (connection) await connection.close();
    }
  }
}

module.exports = new OrderService();