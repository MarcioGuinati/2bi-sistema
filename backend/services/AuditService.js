const { AuditLog } = require('../models');

class AuditService {
  /**
   * Logs an action to the audit log
   * @param {number|null} userId - The ID of the user performing the action
   * @param {string} action - The action identifier (e.g., 'LOGIN', 'TRANSACTION_DELETE')
   * @param {string} resource - The module or resource being acted upon
   * @param {object} details - Additional metadata for the log
   * @param {string|null} ipAddress - The client's IP address
   */
  static async log(userId, action, resource, details = {}, ipAddress = null) {
    try {
      // Limpar prefixo IPv6 se existir para IPv4
      const cleanIp = ipAddress && ipAddress.startsWith('::ffff:') 
        ? ipAddress.replace('::ffff:', '') 
        : ipAddress;

      await AuditLog.create({
        userId,
        action,
        resource,
        details,
        ipAddress: cleanIp
      });
    } catch (err) {
      // We don't want to break the main flow if auditing fails, but we should log it
      console.error('Failed to create audit log:', err);
    }
  }
}

module.exports = AuditService;
