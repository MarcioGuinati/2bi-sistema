module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('admin', 'client'),
      defaultValue: 'client'
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    cpf: {
      type: DataTypes.STRING,
      allowNull: true
    },
    income: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    occupation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    financialGoal: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    asaasId: {
      type: DataTypes.STRING,
      allowNull: true
    }
  });

  return User;
};
