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
    },
    credit_limit: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    invoice_closing_day: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    due_day: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    color: {
      type: DataTypes.STRING,
      defaultValue: '#1e293b'
    }
  });

  Account.associate = (models) => {
    Account.hasMany(models.Transaction, { foreignKey: 'account_id' });
  };

  return Account;
};
