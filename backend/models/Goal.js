module.exports = (sequelize, DataTypes) => {
  const Goal = sequelize.define('Goal', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    targetAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    currentAmount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    deadline: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: true
    }
  });

  return Goal;
};
