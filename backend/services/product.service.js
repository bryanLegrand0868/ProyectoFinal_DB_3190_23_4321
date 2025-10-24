// services/product.service.js
const { getConnection, oracledb } = require('../config/database');

class ProductService {
  
  async getAllProducts() {
    let connection;
    
    try {
      connection = await getConnection();
      
      const result = await connection.execute(
        `SELECT 
          p.id_producto,
          p.nombre,
          p.descripcion,
          p.precio_venta,
          p.precio_compra,
          p.id_categoria,
          c.nombre AS nombre_categoria,
          p.id_marca,
          m.nombre AS nombre_marca,
          p.codigo_barras,
          p.imagen_url,
          p.estado
        FROM productos p
        LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
        LEFT JOIN marcas m ON p.id_marca = m.id_marca
        WHERE p.estado = 'A'
        ORDER BY p.nombre`,
       [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // Función auxiliar para limpiar los objetos
    const limpiarObjeto = (obj) => {
      const limpio = {};
      for (const [key, value] of Object.entries(obj)) {
        // Solo incluir propiedades primitivas
        if (value !== null && typeof value !== 'object') {
          // Convertir a minúsculas las claves
          limpio[key.toLowerCase()] = value;
        }
      }
      return limpio;
    };

    return result.rows.map(limpiarObjeto);
    
    } catch (error) {
      console.error('Error al obtener productos:', error);
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

  async getProductById(idProducto) {
    let connection;
    
    try {
      connection = await getConnection();
      
      const result = await connection.execute(
        `SELECT 
          p.id_producto,
          p.nombre,
          p.descripcion,
          p.precio_venta,
          p.precio_compra,
          p.id_categoria,
          c.nombre AS nombre_categoria,
          p.id_marca,
          m.nombre AS nombre_marca,
          p.codigo_barras,
          p.imagen_url,
          p.estado
        FROM productos p
        LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
        LEFT JOIN marcas m ON p.id_marca = m.id_marca
        WHERE p.id_producto = :id_producto`,
        { id_producto: idProducto },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

       const limpiarObjeto = (obj) => {
      const limpio = {};
      for (const [key, value] of Object.entries(obj)) {
        // Solo incluir propiedades primitivas
        if (value !== null && typeof value !== 'object') {
          // Convertir a minúsculas las claves
          limpio[key.toLowerCase()] = value;
        }
      }
      return limpio;
    };

    return result.rows.map(limpiarObjeto);
      
    } catch (error) {
      console.error('Error al obtener producto:', error);
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

  async createProduct(data) {
    let connection;
    
    try {
      connection = await getConnection();
      
      const { nombre, descripcion, precio_venta, precio_compra, id_categoria, id_marca, codigo_barras } = data;
      
      const codigoBarrasFinal = codigo_barras || `AUTO${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      
      const result = await connection.execute(
        `INSERT INTO productos (
          id_producto, id_categoria, id_marca, codigo_barras, nombre, 
          descripcion, precio_compra, precio_venta, estado
        ) VALUES (
          seq_producto.NEXTVAL, :id_categoria, :id_marca, :codigo_barras, :nombre,
          :descripcion, :precio_compra, :precio_venta, 'A'
        ) RETURNING id_producto INTO :id_producto`,
        {
          id_categoria: id_categoria || null,
          id_marca: id_marca || null,
          codigo_barras: codigoBarrasFinal,
          nombre,
          descripcion: descripcion || null,
          precio_compra,
          precio_venta,
          id_producto: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        }
      );

      const id_producto = result.outBinds.id_producto[0];

      await connection.commit();
      
      return {
        success: true,
        message: 'Producto creado correctamente',
        id_producto: Number(id_producto)
      };
      
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      console.error('Error al crear producto:', error);
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

  async updateProduct(idProducto, data) {
    let connection;
    
    try {
      connection = await getConnection();
      
      const { nombre, descripcion, precio_venta, precio_compra, id_categoria, id_marca, codigo_barras, estado } = data;
      
      await connection.execute(
        `UPDATE productos 
        SET nombre = NVL(:nombre, nombre),
            descripcion = NVL(:descripcion, descripcion),
            precio_venta = NVL(:precio_venta, precio_venta),
            precio_compra = NVL(:precio_compra, precio_compra),
            id_categoria = NVL(:id_categoria, id_categoria),
            id_marca = NVL(:id_marca, id_marca),
            codigo_barras = NVL(:codigo_barras, codigo_barras),
            estado = NVL(:estado, estado)
        WHERE id_producto = :id_producto`,
        {
          nombre: nombre || null,
          descripcion: descripcion || null,
          precio_venta: precio_venta || null,
          precio_compra: precio_compra || null,
          id_categoria: id_categoria || null,
          id_marca: id_marca || null,
          codigo_barras: codigo_barras || null,
          estado: estado || null,
          id_producto: idProducto
        }
      );

      await connection.commit();

      return await this.getProductById(idProducto);
      
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      console.error('Error al actualizar producto:', error);
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

  async deleteProduct(idProducto) {
    let connection;
    
    try {
      connection = await getConnection();
      
      await connection.execute(
        `UPDATE productos SET estado = 'I' WHERE id_producto = :id_producto`,
        { id_producto: idProducto }
      );

      await connection.commit();

      return true;
      
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      console.error('Error al eliminar producto:', error);
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

module.exports = new ProductService();