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
      type: DataTypes.ENUM('admin', 'partner', 'client'),
      defaultValue: 'client'
    },
    partner_id: {
      type: DataTypes.UUID,
      allowNull: true
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
    customFields: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    },
    asaasId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    onboardingData: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {}
    },
    isLead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    leadSource: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    hasReportAccess: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    hasAIAccess: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    twoFactorSecret: {
      type: DataTypes.STRING,
      allowNull: true
    },
    twoFactorEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    avatar_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true
    }
  });

  return User;
};
