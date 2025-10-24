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
        ORDER BY p.nombre`,
        {},
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      return result.rows;
      
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

      if (!result.rows) return null;
      
      // Mapear solo las propiedades necesarias
      const cleanRows = result.rows.map(row => ({
        id_producto: row.ID_PRODUCTO || row.id_producto,
        nombre: row.NOMBRE || row.nombre,
        descripcion: row.DESCRIPCION || row.descripcion,
        precio_venta: row.PRECIO_VENTA || row.precio_venta,
        precio_compra: row.PRECIO_COMPRA || row.precio_compra,
        id_categoria: row.ID_CATEGORIA || row.id_categoria,
        nombre_categoria: row.NOMBRE_CATEGORIA || row.nombre_categoria,
        id_marca: row.ID_MARCA || row.id_marca,
        nombre_marca: row.NOMBRE_MARCA || row.nombre_marca,
        codigo_barras: row.CODIGO_BARRAS || row.codigo_barras,
        imagen_url: row.IMAGEN_URL || row.imagen_url,
        estado: row.ESTADO || row.estado
      }));

      return cleanRows[0];
      
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
      
      // Generar código de barras único si no se proporciona
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
        },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const id_producto = result.outBinds.id_producto[0];

      await connection.commit();
      return {
        success: true,
        message: 'Producto creado correctamente',
        id_producto
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
        },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
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