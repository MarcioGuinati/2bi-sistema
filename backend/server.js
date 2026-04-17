const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');
const { sequelize } = require('./models');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api', routes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to PostgreSQL database.');
    
    // Sync models
    await sequelize.sync({ alter: true });
    console.log('Database synced with schema updates.');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

startServer();
