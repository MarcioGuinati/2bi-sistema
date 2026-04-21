const { sequelize } = require('../backend/models');

async function checkTable() {
  try {
    const [results] = await sequelize.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Users'");
    console.log('Colunas da tabela Users:');
    console.table(results);
    process.exit(0);
  } catch (error) {
    console.error('Erro ao verificar tabela:', error);
    process.exit(1);
  }
}

checkTable();
