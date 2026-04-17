module.exports = (sequelize, DataTypes) => {
  const Contract = sequelize.define('Contract', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    value: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    billingCycle: {
      type: DataTypes.ENUM('monthly', 'annual', 'once'),
      defaultValue: 'monthly'
    },
    startDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    nextDueDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'expired', 'cancelled'),
      defaultValue: 'active'
    }
  });

  return Contract;
};
