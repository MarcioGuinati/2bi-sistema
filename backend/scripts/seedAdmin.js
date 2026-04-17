const { User, sequelize } = require('../models');
const bcrypt = require('bcryptjs');

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB for seeding.');

    await sequelize.sync();
    console.log('Database synced.');

    const passwordHash = await bcrypt.hash('2biadmin123', 8);

    const [user, created] = await User.findOrCreate({
      where: { email: 'contato@2biplanejamento.com.br' },
      defaults: {
        name: 'Sócios 2BI',
        password: passwordHash,
        role: 'admin'
      }
    });

    if (created) {
      console.log('Admin user created successfully.');
    } else {
      console.log('Admin user already exists.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seed();
