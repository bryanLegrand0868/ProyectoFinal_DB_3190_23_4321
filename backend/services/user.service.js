const { getConnection, oracledb } = require('../config/database');

class UserService {
  
  async getAllUsers() {
    let connection;
    
    try {
      connection = await getConnection();
      
      const result = await connection.execute(
        `SELECT 
          u.id_usuario,
          u.usuario,
          u.id_rol,
          r.nombre_rol,
          u.fecha_creacion,
          u.ultimo_acceso,
          u.estado
        FROM usuarios u
        JOIN roles r ON u.id_rol = r.id_rol
        ORDER BY u.id_usuario DESC`
      );

      return result.rows;
      
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
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

  async getUserById(idUsuario) {
    let connection;
    
    try {
      connection = await getConnection();
      
      const result = await connection.execute(
        `SELECT 
          u.id_usuario,
          u.usuario,
          u.id_rol,
          r.nombre_rol,
          u.fecha_creacion,
          u.ultimo_acceso,
          u.estado
        FROM usuarios u
        JOIN roles r ON u.id_rol = r.id_rol
        WHERE u.id_usuario = :id_usuario`,
        { id_usuario: idUsuario }
      );

      return result.rows[0] || null;
      
    } catch (error) {
      console.error('Error al obtener usuario:', error);
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

  async updateUser(idUsuario, data) {
    let connection;
    
    try {
      connection = await getConnection();
      
      const { usuario, id_rol, estado } = data;
      
      await connection.execute(
        `UPDATE usuarios 
        SET usuario = NVL(:usuario, usuario),
            id_rol = NVL(:id_rol, id_rol),
            estado = NVL(:estado, estado)
        WHERE id_usuario = :id_usuario`,
        {
          usuario: usuario || null,
          id_rol: id_rol || null,
          estado: estado || null,
          id_usuario: idUsuario
        }
      );

      await connection.commit();

      return await this.getUserById(idUsuario);
      
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      console.error('Error al actualizar usuario:', error);
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

  async deleteUser(idUsuario) {
    let connection;
    
    try {
      connection = await getConnection();
      
      await connection.execute(
        `UPDATE usuarios SET estado = 'I' WHERE id_usuario = :id_usuario`,
        { id_usuario: idUsuario }
      );

      await connection.commit();

      return true;
      
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      console.error('Error al eliminar usuario:', error);
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

  async getRoles() {
    let connection;
    
    try {
      connection = await getConnection();
      
      const result = await connection.execute(
        `SELECT id_rol, nombre_rol, descripcion, estado 
        FROM roles 
        WHERE estado = 'A'
        ORDER BY nombre_rol`
      );

      return result.rows;
      
    } catch (error) {
      console.error('Error al obtener roles:', error);
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

module.exports = new UserService();