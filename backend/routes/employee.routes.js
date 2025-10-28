const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');
const { authenticateJWT, authorizeRoles } = require('../middlewares/auth.middleware');

router.get('/', 
  authenticateJWT, 
  authorizeRoles('Administrador', 'Gerente General'),
  employeeController.getAllWithCountry
);

router.get('/sucursal/:id_sucursal',
  authenticateJWT,
  authorizeRoles('Administrador', 'Gerente General', 'Gerente Sucursal'),
  employeeController.getBySucursal
);

module.exports = router;