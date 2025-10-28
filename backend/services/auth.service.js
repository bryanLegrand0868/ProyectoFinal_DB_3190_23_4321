const { getConnection, oracledb } = require('../config/database');
const jwt = require('jsonwebtoken');

class AuthService {
  
async authenticate(usuario, contrasena, ipOrigen = '0.0.0.0') {
  let connection;
  
  try {
    connection = await getConnection();
    
    const result = await connection.execute(
      `BEGIN 
        sp_autenticar_usuario(
          p_usuario => :usuario,
          p_contrasena => :contrasena,
          p_ip_origen => :ip_origen,
          p_resultado => :resultado,
          p_id_usuario => :id_usuario,
          p_id_rol => :id_rol,
          p_nombre_rol => :nombre_rol,
          p_id_empleado => :id_empleado,
          p_id_sucursal => :id_sucursal
        );
      END;`,
      {
        usuario,
        contrasena,
        ip_origen: ipOrigen,
        resultado: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
        id_usuario: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        id_rol: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        nombre_rol: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 50 },
        id_empleado: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        id_sucursal: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    const { resultado, id_usuario, id_rol, nombre_rol, id_empleado, id_sucursal } = result.outBinds;

    if (resultado === 'OK') {
      // 🔥 NUEVO: Obtener id_cliente si el usuario es Cliente
      let id_cliente = null;
      if (nombre_rol === 'Cliente') {
        const clienteResult = await connection.execute(
          `SELECT id_cliente FROM usuarios WHERE id_usuario = :id_usuario`,
          { id_usuario },
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        if (clienteResult.rows.length > 0) {
          id_cliente = clienteResult.rows[0].ID_CLIENTE;
        }
      }

      // Generar token JWT
      const token = jwt.sign(
        {
          id_usuario,
          usuario,
          id_rol,
          nombre_rol,
          id_empleado,
          id_sucursal,
          id_cliente  // 🔥 AGREGADO
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      // Obtener permisos del usuario
      const permisos = await this.getPermisosUsuario(connection, id_rol);

      return {
        success: true,
        token,
        user: {
          id_usuario,
          usuario,
          id_rol,
          nombre_rol,
          id_empleado,
          id_sucursal,
          id_cliente,  // 🔥 AGREGADO
          permisos
        }
      };
    } else {
      return {
        success: false,
        message: resultado
      };
    }
    
  } catch (error) {
    console.error('Error en autenticación:', error);
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

  async getPermisosUsuario(connection, idRol) {
    try {
      const result = await connection.execute(
        `SELECT 
          m.id_menu,
          m.titulo,
          m.url,
          m.icono,
          m.id_menu_padre,
          p.leer,
          p.crear,
          p.editar,
          p.eliminar
        FROM permisos_rol p
        JOIN menu_sistema m ON p.id_menu = m.id_menu
        WHERE p.id_rol = :id_rol
        AND m.estado = 'A'
        ORDER BY m.orden`,
        { id_rol: idRol },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      return result.rows;
    } catch (error) {
      console.error('Error al obtener permisos:', error);
      return [];
    }
  }

  async crearUsuario(idRol, usuario, contrasena) {
    let connection;
    
    try {
      connection = await getConnection();
      
      const result = await connection.execute(
        `BEGIN 
          sp_crear_usuario(
            p_id_rol => :id_rol,
            p_usuario => :usuario,
            p_contrasena => :contrasena,
            p_resultado => :resultado,
            p_id_usuario => :id_usuario
          );
        END;`,
        {
          id_rol: idRol,
          usuario,
          contrasena,
          resultado: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
          id_usuario: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        }
      );

      const { resultado, id_usuario } = result.outBinds;

      if (resultado === 'Usuario creado correctamente') {
        await connection.commit();
        return {
          success: true,
          message: resultado,
          id_usuario
        };
      } else {
        return {
          success: false,
          message: resultado
        };
      }
      
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      console.error('Error al crear usuario:', error);
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

  async cambiarContrasena(idUsuario, contrasenaActual, contrasenaNueva) {
    let connection;
    
    try {
      connection = await getConnection();
      
      const result = await connection.execute(
        `BEGIN 
          sp_cambiar_contrasena(
            p_id_usuario => :id_usuario,
            p_contrasena_actual => :contrasena_actual,
            p_contrasena_nueva => :contrasena_nueva,
            p_resultado => :resultado
          );
        END;`,
        {
          id_usuario: idUsuario,
          contrasena_actual: contrasenaActual,
          contrasena_nueva: contrasenaNueva,
          resultado: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 }
        }
      );

      const { resultado } = result.outBinds;

      if (resultado === 'Contraseña actualizada correctamente') {
        await connection.commit();
        return {
          success: true,
          message: resultado
        };
      } else {
        return {
          success: false,
          message: resultado
        };
      }
      
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      console.error('Error al cambiar contraseña:', error);
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

module.exports = new AuthService();