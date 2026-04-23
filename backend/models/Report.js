module.exports = (sequelize, DataTypes) => {
  const Report = sequelize.define('Report', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    period_start: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    period_end: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    summary_data: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    consultant_note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    published_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    }
  }, {
    tableName: 'reports',
    underscored: true,
  });

  Report.associate = (models) => {
    Report.belongsTo(models.User, { foreignKey: 'user_id', as: 'client' });
    Report.belongsTo(models.User, { foreignKey: 'published_by', as: 'consultant' });
  };

  return Report;
};
