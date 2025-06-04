import * as NodeRSA from 'node-rsa';
import * as crypto from 'crypto' 
const { createPrivateKey } = crypto;
import * as elliptic from 'elliptic';
export const decryptRSA = (encryptedData, privateKey) => {
    try {
      if (!encryptedData || !privateKey) {
        throw new Error('Missing encrypted data or private key');
      }

      // Convert base64 private key to PEM format
      const privateKeyPEM = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;

      // Create RSA instance with specific options
      const key = new NodeRSA(privateKeyPEM, 'pkcs8-private-pem', {
        encryptionScheme: 'pkcs1',
        environment: 'browser'
      });
      console.log('keysize private', key.getKeySize())
  
      // Decrypt data
      const decrypted = key.decrypt(encryptedData, 'utf8');
      return decrypted;
    } catch (error) {
      console.error('RSA decryption failed:', error);
      throw error;
    }
};
