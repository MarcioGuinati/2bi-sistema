const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = require('./User')(sequelize, DataTypes);
const Category = require('./Category')(sequelize, DataTypes);
const Transaction = require('./Transaction')(sequelize, DataTypes);
const Goal = require('./Goal')(sequelize, DataTypes);
const Schedule = require('./Schedule')(sequelize, DataTypes);
const Note = require('./Note')(sequelize, DataTypes);
const Contract = require('./Contract')(sequelize, DataTypes);
const Account = require('./Account')(sequelize, DataTypes);
const Payment = require('./Payment')(sequelize, DataTypes);
const Announcement = require('./Announcement')(sequelize, DataTypes);
const Setting = require('./Setting')(sequelize, DataTypes);
const Insight = require('./Insight')(sequelize, DataTypes);

// User & Category
User.hasMany(Category, { foreignKey: 'user_id' });
Category.belongsTo(User, { foreignKey: 'user_id' });

// User & Transaction
User.hasMany(Transaction, { foreignKey: 'user_id' });
Transaction.belongsTo(User, { foreignKey: 'user_id' });

// User & Insight
User.hasMany(Insight, { foreignKey: 'user_id' });
Insight.belongsTo(User, { foreignKey: 'user_id' });

// User & Account
User.hasMany(Account, { foreignKey: 'user_id' });
Account.belongsTo(User, { foreignKey: 'user_id' });

// Category & Transaction
Category.hasMany(Transaction, { foreignKey: 'category_id' });
Transaction.belongsTo(Category, { foreignKey: 'category_id' });

// Account & Transaction
Account.hasMany(Transaction, { foreignKey: 'account_id' });
Transaction.belongsTo(Account, { foreignKey: 'account_id' });

// User & Goal
User.hasMany(Goal, { foreignKey: 'user_id' });
Goal.belongsTo(User, { foreignKey: 'user_id' });

// Category & Goal (Budgeting)
Category.hasMany(Goal, { foreignKey: 'category_id' });
Goal.belongsTo(Category, { foreignKey: 'category_id' });

// User & Notes (CRM)
User.hasMany(Note, { foreignKey: 'user_id' });
Note.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Note, { as: 'AuthoredNotes', foreignKey: 'admin_id' });
Note.belongsTo(User, { as: 'Admin', foreignKey: 'admin_id' });

// User & Contracts
User.hasMany(Contract, { foreignKey: 'user_id' });
Contract.belongsTo(User, { foreignKey: 'user_id' });

// User & Schedules
User.hasMany(Schedule, { as: 'AdminSchedules', foreignKey: 'adminId' });
User.hasMany(Schedule, { as: 'ClientSchedules', foreignKey: 'clientId' });
Schedule.belongsTo(User, { as: 'Admin', foreignKey: 'adminId' });
Schedule.belongsTo(User, { as: 'Client', foreignKey: 'clientId' });

// User & Payments
User.hasMany(Payment, { foreignKey: 'user_id' });
Payment.belongsTo(User, { foreignKey: 'user_id' });

// Contract & Payments
Contract.hasMany(Payment, { foreignKey: 'contract_id' });
Payment.belongsTo(Contract, { foreignKey: 'contract_id' });

module.exports = {
  sequelize,
  User,
  Category,
  Transaction,
  Goal,
  Schedule,
  Note,
  Contract,
  Account,
  Payment,
  Announcement,
  Setting,
  Insight
};
