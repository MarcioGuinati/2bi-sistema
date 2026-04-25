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
    setupValue: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0
    },
    monthlyValue: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0
    },
    recurrence: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
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
    },
    hasReportAccess: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    hasAIAccess: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });

  const syncUserFeatures = async (contract) => {
    const { User } = sequelize.models;
    const userId = contract.user_id;
    if (!userId) return;

    // Find all active contracts for this user
    const activeContracts = await contract.constructor.findAll({
      where: { user_id: userId, status: 'active' }
    });

    const hasReportAccess = activeContracts.some(c => c.hasReportAccess);
    const hasAIAccess = activeContracts.some(c => c.hasAIAccess);

    await User.update(
      { hasReportAccess, hasAIAccess },
      { where: { id: userId } }
    );
  };

  Contract.afterCreate(syncUserFeatures);
  Contract.afterUpdate(syncUserFeatures);
  Contract.afterDestroy(syncUserFeatures);

  return Contract;
};
