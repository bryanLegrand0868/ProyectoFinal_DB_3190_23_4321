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

  async updateOrderStatus(idPedido, nuevoEstado, idUsuario, idSucursalDespacho = null) {
    let connection;

    try {
      connection = await getConnection();

      // 🔍 VALIDAR ESTADOS PERMITIDOS
      const estadosValidos = ['PENDIENTE', 'PROCESANDO', 'ENVIADO', 'ENTREGADO', 'CANCELADO'];
      if (!estadosValidos.includes(nuevoEstado)) {
        return {
          success: false,
          message: `Estado inválido. Use: ${estadosValidos.join(', ')}`
        };
      }

      // 🔍 OBTENER PEDIDO ACTUAL
      const pedidoResult = await connection.execute(
        `SELECT 
        p.id_pedido,
        p.estado_pedido,
        p.estado_pago,
        p.id_sucursal_despacho,
        p.total
      FROM pedidos_online p
      WHERE p.id_pedido = :id_pedido`,
        { id_pedido: idPedido },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (pedidoResult.rows.length === 0) {
        return {
          success: false,
          message: 'Pedido no encontrado'
        };
      }

      const pedido = pedidoResult.rows[0];
      const estadoAnterior = pedido.ESTADO_PEDIDO;

      // ⚠️ VALIDAR TRANSICIONES DE ESTADO
      if (estadoAnterior === 'CANCELADO') {
        return {
          success: false,
          message: 'No se puede modificar un pedido cancelado'
        };
      }

      if (estadoAnterior === 'ENTREGADO' && nuevoEstado !== 'CANCELADO') {
        return {
          success: false,
          message: 'No se puede modificar un pedido ya entregado'
        };
      }

      // 🎯 SI CAMBIA A "PROCESANDO" → DESCONTAR INVENTARIO
      if (nuevoEstado === 'PROCESANDO' && estadoAnterior === 'PENDIENTE') {

        // Validar que tenga sucursal de despacho
        const sucursalFinal = idSucursalDespacho || pedido.ID_SUCURSAL_DESPACHO;

        if (!sucursalFinal) {
          return {
            success: false,
            message: 'Debe especificar la sucursal de despacho'
          };
        }

        // Obtener detalles del pedido
        const detallesResult = await connection.execute(
          `SELECT id_producto, cantidad 
         FROM detalles_pedido 
         WHERE id_pedido = :id_pedido`,
          { id_pedido: idPedido },
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        // 🔒 VALIDAR Y DESCONTAR STOCK
        for (const detalle of detallesResult.rows) {
          const idProducto = detalle.ID_PRODUCTO;
          const cantidad = detalle.CANTIDAD;

          // Verificar stock disponible con LOCK
          const stockResult = await connection.execute(
            `SELECT cantidad_disponible 
           FROM inventario 
           WHERE id_producto = :id_producto 
             AND id_sucursal = :id_sucursal
           FOR UPDATE NOWAIT`,
            {
              id_producto: idProducto,
              id_sucursal: sucursalFinal
            },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
          );

          if (stockResult.rows.length === 0) {
            await connection.rollback();
            return {
              success: false,
              message: `Producto ID ${idProducto} no tiene inventario en la sucursal seleccionada`
            };
          }

          const stockDisponible = stockResult.rows[0].CANTIDAD_DISPONIBLE;

          if (stockDisponible < cantidad) {
            await connection.rollback();
            return {
              success: false,
              message: `Stock insuficiente para producto ID ${idProducto}. Disponible: ${stockDisponible}, Requerido: ${cantidad}`
            };
          }

          // ✅ DESCONTAR INVENTARIO
          await connection.execute(
            `UPDATE inventario
           SET cantidad_disponible = cantidad_disponible - :cantidad,
               fecha_actualizacion = SYSDATE
           WHERE id_producto = :id_producto
             AND id_sucursal = :id_sucursal`,
            {
              cantidad: cantidad,
              id_producto: idProducto,
              id_sucursal: sucursalFinal
            }
          );
        }

        // Actualizar sucursal de despacho
        await connection.execute(
          `UPDATE pedidos_online
         SET id_sucursal_despacho = :id_sucursal
         WHERE id_pedido = :id_pedido`,
          {
            id_sucursal: sucursalFinal,
            id_pedido: idPedido
          }
        );
      }

      // 🔄 SI CAMBIA A "CANCELADO" → DEVOLVER INVENTARIO
      if (nuevoEstado === 'CANCELADO' && estadoAnterior === 'PROCESANDO') {

        const sucursalDespacho = pedido.ID_SUCURSAL_DESPACHO;

        if (sucursalDespacho) {
          const detallesResult = await connection.execute(
            `SELECT id_producto, cantidad 
           FROM detalles_pedido 
           WHERE id_pedido = :id_pedido`,
            { id_pedido: idPedido },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
          );

          // ↩️ DEVOLVER AL INVENTARIO
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
                id_sucursal: sucursalDespacho
              }
            );
          }
        }
      }

      // 📝 ACTUALIZAR ESTADO DEL PEDIDO
      let fechaEntregaReal = null;
      if (nuevoEstado === 'ENTREGADO') {
        fechaEntregaReal = new Date();
      }

      await connection.execute(
        `UPDATE pedidos_online
       SET estado_pedido = :estado_pedido,
           fecha_entrega_real = :fecha_entrega_real
       WHERE id_pedido = :id_pedido`,
        {
          estado_pedido: nuevoEstado,
          fecha_entrega_real: fechaEntregaReal,
          id_pedido: idPedido
        }
      );

      // 📍 REGISTRAR EN SEGUIMIENTO
      const descripcionSeguimiento = {
        'PENDIENTE': 'Pedido recibido',
        'PROCESANDO': 'Pedido en preparación',
        'ENVIADO': 'Pedido en camino',
        'ENTREGADO': 'Pedido entregado exitosamente',
        'CANCELADO': 'Pedido cancelado'
      };

      await connection.execute(
        `INSERT INTO seguimiento_pedidos (
        id_seguimiento, id_pedido, estado, descripcion, fecha_hora
      ) VALUES (
        seq_seguimiento.NEXTVAL, :id_pedido, :estado, :descripcion, SYSTIMESTAMP
      )`,
        {
          id_pedido: idPedido,
          estado: nuevoEstado,
          descripcion: descripcionSeguimiento[nuevoEstado]
        }
      );

      // 📋 REGISTRAR EN BITÁCORA
      await connection.execute(
        `INSERT INTO bitacora (
        id_bitacora, id_usuario, modulo, accion, descripcion, ip_origen
      ) VALUES (
        seq_bitacora.NEXTVAL, :id_usuario, 'PEDIDOS_ONLINE', 'CAMBIO_ESTADO',
        'Pedido #' || :id_pedido || ' cambió de ' || :estado_anterior || ' a ' || :estado_nuevo,
        SYS_CONTEXT('USERENV', 'IP_ADDRESS')
      )`,
        {
          id_usuario: idUsuario,
          id_pedido: idPedido,
          estado_anterior: estadoAnterior,
          estado_nuevo: nuevoEstado
        }
      );

      await connection.commit();

      return {
        success: true,
        message: `Pedido actualizado a: ${nuevoEstado}`,
        estado_anterior: estadoAnterior,
        estado_nuevo: nuevoEstado
      };

    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      console.error('Error en updateOrderStatus:', error);
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }
}

module.exports = new OrderService();