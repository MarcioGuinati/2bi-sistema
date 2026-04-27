const { Router } = require('express');
const AuthController = require('./controllers/AuthController');
const TransactionController = require('./controllers/TransactionController');
const CategoryController = require('./controllers/CategoryController');
const GoalController = require('./controllers/GoalController');
const NoteController = require('./controllers/NoteController');
const ContractController = require('./controllers/ContractController');
const AccountController = require('./controllers/AccountController');
const BillingController = require('./controllers/BillingController');
const AnnouncementController = require('./controllers/AnnouncementController');
const ImportController = require('./controllers/ImportController');
const AdminController = require('./controllers/AdminController');
const ConfigController = require('./controllers/ConfigController');
const AIController = require('./controllers/AIController');
const AuditController = require('./controllers/AuditController');
const ReportController = require('./controllers/ReportController');
const authMiddleware = require('./middleware/auth');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

const routes = new Router();

// Public routes
routes.post('/login', AuthController.login);
routes.post('/2fa/verify-login', AuthController.verify2FALogin);
routes.post('/register-lead', AuthController.registerLead);
routes.post('/forgot-password', AuthController.forgotPassword);
routes.post('/reset-password', AuthController.resetPassword);
routes.post('/webhooks/assinafy', BillingController.handleAssinafyWebhook);
routes.post('/logout', authMiddleware, AuthController.logout);

// Protected routes
routes.use(authMiddleware);

// Profile
routes.put('/profile', AuthController.updateProfile);
routes.get('/profile/onboarding', AuthController.getOnboardingData);

// 2FA Management
routes.get('/2fa/status', AuthController.get2FAStatus);
routes.post('/2fa/setup', AuthController.setup2FA);
routes.post('/2fa/enable', AuthController.enable2FA);
routes.post('/2fa/disable', AuthController.disable2FA);

// Auth & Users
routes.post('/register-client', AuthController.registerClient);
routes.get('/clients', AuthController.listClients);
routes.get('/admin/partners', AdminController.listPartners);
routes.post('/admin/register-partner', AuthController.registerPartner);
routes.put('/admin/partners/:id', AuthController.updatePartner);
routes.delete('/admin/partners/:id', AuthController.deletePartner);
routes.get('/admin/mentorship-overview', AdminController.getMentorshipOverview);
routes.get('/admin/ai-config', ConfigController.getAIConfig);
routes.post('/admin/ai-config', ConfigController.updateAIConfig);
routes.get('/admin/ai-usage', ConfigController.getAIUsage);
routes.get('/admin/ai-usage-detailed', ConfigController.getDetailedAIUsage);
routes.get('/ai-insights', AIController.getInsights);
routes.get('/ai-insights/history', AIController.listInsights);
routes.delete('/ai-insights/:id', AIController.deleteInsight);
routes.put('/clients/:id', AuthController.updateClient);
routes.delete('/clients/:id', AuthController.deleteClient);
routes.post('/admin/clients/:id/resend-welcome', AuthController.resendWelcomeEmail);
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
routes.post('/transactions/bulk-delete', TransactionController.bulkDelete);
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
routes.post('/contracts/:id/signature', BillingController.sendToAssinafy);
routes.get('/contracts/:id/signature/status', BillingController.getSignatureStatus);
routes.get('/contracts/:id/signature/download', authMiddleware, BillingController.downloadSignedContract);
routes.put('/contracts/:id', BillingController.updateContract);
routes.delete('/contracts/:id', BillingController.deleteContract);
routes.get('/payments/:userId', BillingController.listPayments);
routes.put('/payments/:id/pay', BillingController.markPaymentAsPaid);
routes.put('/payments/:id/unpay', BillingController.markPaymentAsPending);
routes.get('/admin/billing/payments', BillingController.listAllPayments);
routes.put('/admin/billing/payments/:id', BillingController.updatePayment);
routes.delete('/admin/billing/payments/:id', BillingController.deletePayment);
routes.get('/billing/stats', BillingController.getOverallStats);

// CRM Notes
routes.get('/notes/:userId', NoteController.index);
routes.post('/notes/:userId', NoteController.store);
routes.put('/notes/:id', NoteController.update);
routes.delete('/notes/:id', NoteController.delete);

// Announcements (Avisos)
routes.get('/announcements', AnnouncementController.index);
routes.get('/admin/announcements', AnnouncementController.index);
routes.post('/admin/announcements', AnnouncementController.store);
routes.put('/admin/announcements/:id', AnnouncementController.update);
routes.delete('/admin/announcements/:id', AnnouncementController.delete);

// Auditoria & Relatórios
routes.get('/admin/audit-logs', AuditController.index);
routes.get('/reports', ReportController.index);
routes.post('/reports', ReportController.store);
routes.delete('/reports/:id', ReportController.delete);

// Import
routes.post('/import/ofx-preview', upload.single('file'), ImportController.preview);
routes.post('/import/ofx-confirm', ImportController.confirm);

module.exports = routes;
