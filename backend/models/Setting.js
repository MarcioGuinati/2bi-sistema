module.exports = (sequelize, DataTypes) => {
  const Setting = sequelize.define('Setting', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    key: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  });

  return Setting;
};
