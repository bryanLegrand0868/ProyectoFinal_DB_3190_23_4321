const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ 
      success: false,
      message: 'Token de autenticación no proporcionado' 
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = {
      id_usuario: decoded.id_usuario,
      usuario: decoded.usuario,
      id_rol: decoded.id_rol,
      nombre_rol: decoded.nombre_rol,
      id_empleado: decoded.id_empleado,
      id_sucursal: decoded.id_sucursal
    };
    
    next();
  } catch (err) {
    return res.status(403).json({ 
      success: false,
      message: 'Token inválido o expirado' 
    });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'No autenticado' 
      });
    }

    // Convertir ambos a mayúsculas para comparación case-insensitive
    const userRole = req.user.nombre_rol?.toUpperCase();
    const allowedRoles = roles.map(role => role.toUpperCase());

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        success: false,
        message: `El rol ${req.user.nombre_rol} no tiene permiso para esta acción` 
      });
    }

    next();
  };
};

module.exports = {
  authenticateJWT,
  authorizeRoles
};