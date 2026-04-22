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
  max: process.env.NODE_ENV === 'production' ? 500 : 10000, 
  message: 'Muitas requisições deste IP, por favor tente novamente após 15 minutos',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for Lead Registration (Prevent Bot Spam)
const leadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per 15 minutes
  message: 'Limite de solicitações atingido. Por favor, aguarde alguns minutos antes de tentar novamente.',
  standardHeaders: true,
  legacyHeaders: false,
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

app.use('/api', limiter); // Apply general rate limiting
app.use('/api/register-lead', leadLimiter); // Apply strict limiting only for leads
app.use('/api', routes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to PostgreSQL database.');
    
    // Sync models - In Dev or when DB_ALTER is set to true
    if (process.env.NODE_ENV !== 'production' || process.env.DB_ALTER === 'true') {
      try {
        await sequelize.sync({ alter: true });
        console.log('Database synced with alter: true.');
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
