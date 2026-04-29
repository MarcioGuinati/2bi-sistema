module.exports = (sequelize, DataTypes) => {
  const Schedule = sequelize.define('Schedule', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    clientName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    meet_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'cancelled'),
      defaultValue: 'pending'
    }
  });

  return Schedule;
};
