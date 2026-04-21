const { Router } = require('express');
const AuthController = require('./controllers/AuthController');
const TransactionController = require('./controllers/TransactionController');
const CategoryController = require('./controllers/CategoryController');
const GoalController = require('./controllers/GoalController');
const NoteController = require('./controllers/NoteController');
const ContractController = require('./controllers/ContractController');
const AccountController = require('./controllers/AccountController');
const BillingController = require('./controllers/BillingController');
const authMiddleware = require('./middleware/auth');

const routes = new Router();

// Public routes
routes.post('/login', AuthController.login);

// Protected routes
routes.use(authMiddleware);

// Auth & Users
routes.post('/register-client', AuthController.registerClient);
routes.get('/clients', AuthController.listClients);
routes.put('/clients/:id', AuthController.updateClient);
routes.delete('/clients/:id', AuthController.deleteClient);
routes.post('/admin/impersonate/:id', AuthController.impersonate);

// Accounts
routes.get('/accounts', AccountController.index);
routes.post('/accounts', AccountController.store);
routes.put('/accounts/:id', AccountController.update);
routes.delete('/accounts/:id', AccountController.delete);

// Categories
routes.get('/categories', CategoryController.index);
routes.post('/categories', CategoryController.store);
routes.put('/categories/:id', CategoryController.update);
routes.delete('/categories/:id', CategoryController.delete);

// Transactions
routes.get('/transactions', TransactionController.index);
routes.post('/transactions', TransactionController.store);
routes.put('/transactions/:id', TransactionController.update);
routes.delete('/transactions/:id', TransactionController.delete);
routes.get('/transactions/stats', TransactionController.stats);
routes.get('/transactions/dashboard-stats', TransactionController.dashboardStats);

// Goals
routes.get('/goals', GoalController.index);
routes.post('/goals', GoalController.store);
routes.put('/goals/:id', GoalController.update);
routes.delete('/goals/:id', GoalController.delete);

// Billing & Contracts
routes.get('/contracts/:userId', BillingController.listContracts);
routes.post('/contracts', BillingController.storeContract);
routes.put('/contracts/:id', BillingController.updateContract);
routes.delete('/contracts/:id', BillingController.deleteContract);
routes.get('/payments/:userId', BillingController.listPayments);
routes.put('/payments/:id/pay', BillingController.markPaymentAsPaid);
routes.get('/admin/billing/payments', BillingController.listAllPayments);
routes.put('/admin/billing/payments/:id', BillingController.updatePayment);
routes.delete('/admin/billing/payments/:id', BillingController.deletePayment);
routes.get('/billing/stats', BillingController.getOverallStats);

// CRM Notes
routes.get('/notes/:userId', NoteController.index);
routes.post('/notes/:userId', NoteController.store);
routes.put('/notes/:id', NoteController.update);
routes.delete('/notes/:id', NoteController.delete);

module.exports = routes;
