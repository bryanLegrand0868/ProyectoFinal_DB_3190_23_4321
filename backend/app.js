const express = require('express');
const cors = require('cors');
const { initialize } = require('./config/database');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/sales', require('./routes/sale.routes'));
app.use('/api/inventory', require('./routes/inventory.routes'));

const PORT = process.env.PORT || 3000;

initialize().then(() => {
  app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
}).catch(err => {
  console.error('Error iniciando servidor:', err);
  process.exit(1);
});