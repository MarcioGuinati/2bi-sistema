const { sequelize } = require('../models');

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log('Conectado ao banco de dados. Iniciando migração...');
    
    // Sincroniza apenas as mudanças necessárias (como a nova coluna customFields)
    await sequelize.sync({ alter: true });
    
    console.log('Migração concluída com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro durante a migração:', error);
    process.exit(1);
  }
}

migrate();
