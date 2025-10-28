const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authenticateJWT, authorizeRoles } = require('../middlewares/auth.middleware');

router.get('/top-clients',
  authenticateJWT,
  authorizeRoles('Administrador', 'Gerente General', 'Contador'),
  reportController.getTop10Clients
);

router.get('/top-employees',
  authenticateJWT,
  authorizeRoles('Administrador', 'Gerente General'),
  reportController.getTop10Employees
);

router.get('/sales',
  authenticateJWT,
  authorizeRoles('Administrador', 'Gerente General', 'Contador'),
  reportController.getSalesReport
);

module.exports = router;