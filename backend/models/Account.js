module.exports = (sequelize, DataTypes) => {
  const Account = sequelize.define('Account', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      defaultValue: 'Corrente'
    },
    initial_balance: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    }
  });

  return Account;
};
