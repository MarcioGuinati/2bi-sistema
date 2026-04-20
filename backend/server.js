const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const routes = require('./routes');
const { sequelize } = require('./models');
require('dotenv').config();

const app = express();

// Security Hardening
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Muitas requisições deste IP, por favor tente novamente após 15 minutos'
});

// App Settings
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://2bi.orionchat.cloud'] 
    : true,
  credentials: true
}));
app.use(express.json());
app.use(morgan('combined'));

app.use('/api', limiter); // Apply rate limiting to all api routes
app.use('/api', routes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to PostgreSQL database.');
    
    // Sync models - ONLY IN DEVELOPMENT
    if (process.env.NODE_ENV !== 'production') {
      try {
        await sequelize.sync(); // Changed from { alter: true } to prevent crash
        console.log('Database synced.');
      } catch (syncError) {
        console.error('Database sync warning (continuing...):', syncError.message);
      }
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

startServer();
