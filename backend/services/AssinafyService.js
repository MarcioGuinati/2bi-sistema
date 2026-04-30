const axios = require('axios');
const FormData = require('form-data');

class AssinafyService {
  constructor() {
    this.token = process.env.ASSINAFY_TOKEN;
    this.baseUrl = 'https://api.assinafy.com.br/v1';
  }

  // 1. Descobrir o ID da conta (Workspace)
  async getAccountId() {
    try {
      const response = await axios.get(`${this.baseUrl}/accounts`, {
        headers: { 'X-Api-Key': this.token }
      });
      // Retorna o ID da primeira conta encontrada
      return response.data.data?.[0]?.id || response.data?.[0]?.id;
    } catch (error) {
      console.error('Assinafy Discovery Error:', error.response?.data || error.message);
      return null;
    }
  }

  // Método para checar status (webhook seria melhor, mas polling resolve momentaneamente)
  async checkDocumentStatus(documentId) {
    try {
      const accountId = await this.getAccountId();
      if (!accountId) return null;

      const response = await axios.get(`${this.baseUrl}/documents/${documentId}`, {
        headers: { 'X-Api-Key': this.token }
      });
      return response.data;
    } catch (error) {
      console.error('Assinafy Status Error:', error.response?.data || error.message);
      return null;
    }
  }

  // 2. Fluxo Completo de Envio
  async sendContractForSignature(contract, user, documentBase64) {
    try {
      const accountId = await this.getAccountId();
      if (!accountId) throw new Error('Não foi possível localizar o ID da conta Assinafy.');

      console.log('Usando Conta Assinafy:', accountId);

      // PASSO A: Upload do Documento (Multipart)
      const form = new FormData();
      // Converter base64 de volta para buffer para o form-data
      const buffer = Buffer.from(documentBase64, 'base64');
      form.append('file', buffer, { filename: `contrato_${contract.id}.pdf`, contentType: 'application/pdf' });

      const uploadRes = await axios.post(`${this.baseUrl}/accounts/${accountId}/documents`, form, {
        headers: {
          ...form.getHeaders(),
          'X-Api-Key': this.token
        }
      });

      const documentId = uploadRes.data.id || uploadRes.data.data?.id;
      console.log('Documento Uploaded:', documentId);

      // PASSO B: Criar/Buscar Signatário do Cliente
      const signerClientRes = await axios.post(`${this.baseUrl}/accounts/${accountId}/signers`, {
        full_name: user.name,
        email: user.email
      }, {
        headers: { 'X-Api-Key': this.token }
      });

      const clientSignerId = signerClientRes.data.data?.id || signerClientRes.data.id;
      const signerIds = [clientSignerId];

      // PASSO B.1: Criar/Buscar Signatário do Sócio (Fixo)
      const partnerEmail = process.env.ASSINAFY_PARTNER_EMAIL;
      const partnerName = process.env.ASSINAFY_PARTNER_NAME;

      if (partnerEmail && partnerEmail !== user.email) {
        try {
          const signerPartnerRes = await axios.post(`${this.baseUrl}/accounts/${accountId}/signers`, {
            full_name: partnerName || 'Sócio 2Bi',
            email: partnerEmail
          }, {
            headers: { 'X-Api-Key': this.token }
          });
          const partnerSignerId = signerPartnerRes.data.data?.id || signerPartnerRes.data.id;
          signerIds.push(partnerSignerId);
        } catch (err) {
          console.warn('Não foi possível adicionar o sócio como assinante fixo:', err.message);
        }
      }

      // PASSO C: Solicitar Assinatura (Assignment para ambos)
      const assignRes = await axios.post(`${this.baseUrl}/documents/${documentId}/assignments`, {
        method: 'virtual',
        signerIds: signerIds
      }, {
        headers: { 'X-Api-Key': this.token }
      });

      return {
        id: documentId,
        status: 'pending',
        result: assignRes.data
      };

    } catch (error) {
      console.error('ERRO DETALHADO ASSINAFY:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Falha no fluxo de assinatura Assinafy');
    }
  }
}

module.exports = new AssinafyService();
