const { sequelize, AuditLog } = require('./models');

async function sync() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    await AuditLog.sync({ alter: true });
    console.log('AuditLog table has been created/altered successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

sync();
