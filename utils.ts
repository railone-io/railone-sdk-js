import * as crypto from 'crypto';

/**
 * KDF2 (ISO 18033-2 / IEEE P1363a) with SHA-256, counter starts at 1.
 */
const kdf2 = (sharedSeed: Buffer, keyLen: number): Buffer => {
    let out = Buffer.alloc(0);
    let counter = 1;
    while (out.length < keyLen) {
        const c = Buffer.allocUnsafe(4);
        c.writeUInt32BE(counter);
        out = Buffer.concat([
            out,
            crypto
                .createHash('sha256')
                .update(Buffer.concat([sharedSeed, c]))
                .digest(),
        ]);
        counter += 1;
    }
    return out.slice(0, keyLen);
};

/**
 * ECIES decryption (aligned with Java SDK com.github.ontio.sdk.manager.ECIES).
 *
 * Curve: secp256r1 (prime256v1)
 * KEM: ECIES-KEM, SharedSecret = X coordinate of the shared point,
 *      KDF input = ephemeralPub || sharedX
 * Symmetric encryption: AES-256-CBC/PKCS7Padding, IV = encrypt_data[0] (16 bytes hex)
 *
 * @param privateKeyHex 32-byte private key in hex
 * @param encryptData encrypt_data array returned by the server
 */
export const decryptECIES = (privateKeyHex: string, encryptData: string[]): string => {
    if (!encryptData || encryptData.length !== 3) {
        throw new Error('ECIES encrypt_data must be an array of length 3: [iv, ephemeralPub, cipher]');
    }

    const iv = Buffer.from(encryptData[0], 'hex');
    const ephemeralPub = Buffer.from(encryptData[1], 'hex');
    const ciphertext = Buffer.from(encryptData[2], 'hex');

    const ecdh = crypto.createECDH('prime256v1');
    ecdh.setPrivateKey(Buffer.from(privateKeyHex, 'hex'));

    // Node.js ECDH computeSecret returns the X coordinate of the shared point (same as BC's PEH).
    const sharedX = ecdh.computeSecret(ephemeralPub);
    const aesKey = kdf2(Buffer.concat([ephemeralPub, sharedX]), 32);

    const decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, iv);
    decipher.setAutoPadding(true);
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return plaintext.toString('utf8');
};

/**
 * RSA block decryption (aligned with Java SDK RsaUtils.decryptByPrivateKey).
 *
 * Padding: RSA/ECB/PKCS1Padding
 * Blocking: decrypt in 128-byte blocks (for 1024-bit keys)
 *
 * Note: May return RSA ciphertext with multiple blocks. It must be decrypted
 *       in 128-byte blocks; do not pass the entire ciphertext to crypto.privateDecrypt()
 *       at once, or it will fail.
 *
 * @param encryptedData base64 ciphertext string (may contain one or more 128-byte RSA blocks)
 * @param privateKey PEM or base64 private key
 */
const wrapBase64Key = (base64Key: string, header: string, footer: string): string =>
    `${header}\n${base64Key.replace(/(.{64})/g, '$1\n')}\n${footer}`;

/**
 * Create a Node.js KeyObject from a PEM or raw base64 private key.
 * For raw base64, PKCS#8 is tried first, then PKCS#1.
 */
const createRsaPrivateKey = (privateKey: string): crypto.KeyObject => {
    if (privateKey.includes('-----BEGIN')) {
        return crypto.createPrivateKey(privateKey);
    }

    const pkcs8Pem = wrapBase64Key(
        privateKey,
        '-----BEGIN PRIVATE KEY-----',
        '-----END PRIVATE KEY-----'
    );
    try {
        return crypto.createPrivateKey(pkcs8Pem);
    } catch (err) {
        const pkcs1Pem = wrapBase64Key(
            privateKey,
            '-----BEGIN RSA PRIVATE KEY-----',
            '-----END RSA PRIVATE KEY-----'
        );
        return crypto.createPrivateKey(pkcs1Pem);
    }
};

export const decryptRSA = (encryptedData: string, privateKey: string): string => {
    if (!encryptedData || !privateKey) {
        throw new Error('Missing encrypted data or private key');
    }

    const keyObj = createRsaPrivateKey(privateKey);
    const encrypted = Buffer.from(encryptedData, 'base64');

    // 1024-bit RSA: 128 bytes per block.
    const blockSize = 128;

    if (encrypted.length % blockSize !== 0) {
        throw new Error(
            `Ciphertext length ${encrypted.length} is not a multiple of ${blockSize}; ` +
            'the ciphertext may be truncated or the key size does not match.'
        );
    }

    const parts = [];
    for (let off = 0; off < encrypted.length; off += blockSize) {
        const block = encrypted.slice(off, off + blockSize);
        parts.push(
            crypto.privateDecrypt(
                { key: keyObj, padding: crypto.constants.RSA_PKCS1_PADDING },
                block
            )
        );
    }
    return Buffer.concat(parts).toString('utf8');
};
