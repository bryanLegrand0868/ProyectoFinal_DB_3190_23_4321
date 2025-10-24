const oracledb = require('oracledb');
require('dotenv').config();

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECT_STRING
};

let pool;

async function initialize() {
  try {
    pool = await oracledb.createPool({
      ...dbConfig,
      poolMin: 2,
      poolMax: 10,
      poolIncrement: 1,
      poolTimeout: 60,
      enableStatistics: true
    });
    
    // Configuración global de Oracle
    oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
    oracledb.autoCommit = false;
    
    console.log('Pool de conexiones Oracle inicializado correctamente');
  } catch (err) {
    console.error('Error al crear pool de conexiones:', err);
    throw err;
  }
}

async function getConnection() {
  try {
    const connection = await pool.getConnection();
    return connection;
  } catch (err) {
    console.error('Error al obtener conexión:', err);
    throw err;
  }
}

async function close() {
  try {
    if (pool) {
      await pool.close(10);
      console.log('Pool de conexiones cerrado');
    }
  } catch (err) {
    console.error('Error al cerrar pool:', err);
    throw err;
  }
}

module.exports = {
  initialize,
  getConnection,
  close,
  oracledb
};