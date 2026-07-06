import { decryptRSA } from '../utils';
import * as crypto from 'crypto';

describe('Test Utils', () => {
    it('test decryptRSA', () => {
        const encryptedData = "Wr/Y/DF0xI0HcZUMYD+oU7eZjDLZN98xGmWV6p6+/awOmjo/26la815ThimYWG+PgZN3dK4iVcw71j/FUlJLygrp/tW0BVTdBjkH7Vr5jWQkRC9NQLKa378OBweFX0UPUz6c3uBs8fwXhH+2hU9PrHmCz9GIqiueMj+tLVPZRKo=";
        const privateKey = "MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAIO3Fz7DcuWG0XcNxuBLzOq+Nizxn6zTcOu1tBvyKKB4wBsqNctutZnBfoimuZVFqd0u4zc9XdRTsvhIJ0lkFFSOAR7SrcX+RR7VfAWGyXhqhb0Ucor9396bnSodItfD8o9fYfJn0TL0b9tXo7Ale+RRh9K0GMc2A+XAVxrXtCG5AgMBAAECgYAi/YadU8q4EuKeX/iPKVPcoH8/3Uhv3xPGalTYf7IvPyS5krMLwfNYT0DQCIqQjxsa+RO/XvwIJdwLfQ+CvaVwlr44f7ytmFAiKlWGGy7xIrfAVzyxZiEVJMLpiBxwhPjAm0Z1IpuQygXxfMJ1ZVD3vltwt5yWGE6cCaqvU8kR6QJBAM3LTkrEm9xVxTCj3fQzI+qk4kwLZREDb/AnZ9rJKFmgAD5JmCl/M8PJty/ucXcKQuXU3a6zGZsRNLLWlSjlbe8CQQCj2T+Ezjx/i7yns5fugJ87MlvuD1NKUFdo94EaxF6cF5n7BmhI9LFhqXi5KaQVuITB6DMsyQYkCiABq1OBVhLXAkAw7FAkfjD/ZHSIZ6xwTWgQdDpIEb1pGgQWd4e8/21UQTFNnXlLBC5uMRoXjvvybMISmVRKH9HKh4Cbs1+qZUCJAkEAihSFgShEt8BNZo7lVSu0BTE1Y/QqXxBB+cXLWYFvsd/59iC6NfFwozss7+51x5BO4RMMPYvTzv9xZba6kt601QJBAJ6A5/YzzPU9Aeiy43dL59GHYrPG8NHatUcY2GiMuvrXREWzde/s261EIK3+6etVTQuqJkmighNCDsACxcBZn1U=";

        const result = decryptRSA(encryptedData, privateKey)
        const cardInfo = JSON.parse(result);
        expect(cardInfo.card_number).toBe('1001022400001101');
        expect(cardInfo.cvv).toBe('123');
        expect(cardInfo.expire).toBe('022022');
    });

    it('test decryptRSA with multiple blocks', () => {
        // Generate a 1024-bit RSA key pair, consistent with  Java SDK RsaUtils.genKeyPair().
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 1024,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        });

        // Build a longer plaintext so that encryption produces multiple 128-byte RSA blocks.
        const plaintext = JSON.stringify({
            cvv: '123',
            card_number: '1001022400001101',
            expire: '022022',
            iframe_url: 'https://embedded-sandbox.tech.com/iframe/card?token=pan_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50X2lkIjoiZDU3ZjBlZDU',
        });

        // Simulate block-by-block RSA encryption: max plaintext per block = 128 - 11 (PKCS1 v1.5 padding).
        const maxPlaintext = 128 - 11;
        const buf = Buffer.from(plaintext, 'utf8');
        const blocks = [];
        for (let off = 0; off < buf.length; off += maxPlaintext) {
            const chunk = buf.slice(off, off + maxPlaintext);
            blocks.push(
                crypto.publicEncrypt(
                    { key: publicKey, padding: crypto.constants.RSA_PKCS1_PADDING },
                    chunk
                )
            );
        }
        const encryptData = [Buffer.concat(blocks).toString('base64')];

        const cipherLen = Buffer.from(encryptData[0], 'base64').length;
        expect(cipherLen % 128).toBe(0);
        expect(cipherLen / 128).toBeGreaterThan(1);

        // decryptRSA must correctly decrypt block by block.
        const decrypted = decryptRSA(encryptData[0], privateKey);
        expect(JSON.parse(decrypted)).toEqual(JSON.parse(plaintext));
    });
});
