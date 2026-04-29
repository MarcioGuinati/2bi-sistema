module.exports = (sequelize, DataTypes) => {
  const ScheduleParticipant = sequelize.define('ScheduleParticipant', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    scheduleId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    }
  });

  return ScheduleParticipant;
};
