import axios from 'axios';
import generateAuth from '../index';
import { decryptRSA } from '../utils';

describe('Query Virtualcard sensitive information', () => {

    it('test get', () => {
        const url = '/api/v1/bank/virtualcard';
        const privateKey = "e733f462bcd1f828820a8f6477f3ccc3b8928b00499fcf55b828bb8ed4b6ea6d";
        const publicKey = "031194af2b8ad8cba709509a630dfcc3746c24dfbbe9af48264df5663ad308e16f";

        const apiKey = '14db63d7f3614664ad1c71dd134a21dc';
        const apiSecret = 'ed8cb3a0-8365-4340-9d9c-33f051eedccd';
        const apiPassphrase = '12345678a'
        const data = {
            card_no: '4334094500000041101',
            publickey: publicKey
        };
        const reqGetUrl = `${url}?card_no=${data.card_no}&publickey=${data.publickey}`
        const requestUrl = `https://api-sandbox.railone.io${url}?card_no=${data.card_no}&publickey=${data.publickey}`
        const p = axios(requestUrl, {
            method: 'get',
            headers: {
                'Authorization': generateAuth({
                    method: 'GET',
                    apiKey,
                    apiSecret,
                    path: reqGetUrl,
                }),
                'Access-Passphrase': apiPassphrase
            },
        });
        p.catch((err) => {
            console.error('Error:', err.response ? err.response.data : err.message);
        });
        return p.then((res) => {
            console.log('res', res.data.result.encrypt_data);
            const endata = res.data.result.encrypt_data;
            expect(endata.length).toBe(3);
            // This test only verifies the encrypted payload length.
            // For full ECIES decryption details, see query-card-sensitive-info.test.ts.
        });
    });
    it('test post', () => {
        const url = '/api/v1/bank/virtualcard';
        const publicKey= "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCDtxc+w3LlhtF3DcbgS8zqvjYs8Z+s03DrtbQb8iigeMAbKjXLbrWZwX6IprmVRandLuM3PV3UU7L4SCdJZBRUjgEe0q3F/kUe1XwFhsl4aoW9FHKK/d/em50qHSLXw/KPX2HyZ9Ey9G/bV6OwJXvkUYfStBjHNgPlwFca17QhuQIDAQAB";

        const privateKey= "MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAIO3Fz7DcuWG0XcNxuBLzOq+Nizxn6zTcOu1tBvyKKB4wBsqNctutZnBfoimuZVFqd0u4zc9XdRTsvhIJ0lkFFSOAR7SrcX+RR7VfAWGyXhqhb0Ucor9396bnSodItfD8o9fYfJn0TL0b9tXo7Ale+RRh9K0GMc2A+XAVxrXtCG5AgMBAAECgYAi/YadU8q4EuKeX/iPKVPcoH8/3Uhv3xPGalTYf7IvPyS5krMLwfNYT0DQCIqQjxsa+RO/XvwIJdwLfQ+CvaVwlr44f7ytmFAiKlWGGy7xIrfAVzyxZiEVJMLpiBxwhPjAm0Z1IpuQygXxfMJ1ZVD3vltwt5yWGE6cCaqvU8kR6QJBAM3LTkrEm9xVxTCj3fQzI+qk4kwLZREDb/AnZ9rJKFmgAD5JmCl/M8PJty/ucXcKQuXU3a6zGZsRNLLWlSjlbe8CQQCj2T+Ezjx/i7yns5fugJ87MlvuD1NKUFdo94EaxF6cF5n7BmhI9LFhqXi5KaQVuITB6DMsyQYkCiABq1OBVhLXAkAw7FAkfjD/ZHSIZ6xwTWgQdDpIEb1pGgQWd4e8/21UQTFNnXlLBC5uMRoXjvvybMISmVRKH9HKh4Cbs1+qZUCJAkEAihSFgShEt8BNZo7lVSu0BTE1Y/QqXxBB+cXLWYFvsd/59iC6NfFwozss7+51x5BO4RMMPYvTzv9xZba6kt601QJBAJ6A5/YzzPU9Aeiy43dL59GHYrPG8NHatUcY2GiMuvrXREWzde/s261EIK3+6etVTQuqJkmighNCDsACxcBZn1U=";

        const apiKey = '14db63d7f3614664ad1c71dd134a21dc';
        const apiSecret = 'ed8cb3a0-8365-4340-9d9c-33f051eedccd';
        const apiPassphrase = '12345678a'
        const data = {
        card_no: '4334094500000041101',
        publickey: publicKey
        };
        const p = axios(`https://api-sandbox.railone.io${url}`, {
            method: 'post',
            headers: {
                'Authorization': generateAuth({
                    method: 'POST',
                    apiKey,
                    apiSecret,
                    path: url,
                    reqBody: data
                }),
                'Content-Type': 'application/json',
                'Access-Passphrase': apiPassphrase
            },
            data: data
        });
        p.catch((err) => {
            console.error('Error:', err.response ? err.response.data : err.message);
        });
        return p.then((res) => {
            const endata = res.data.result.encrypt_data[0];
            const decrypted = decryptRSA(endata, privateKey);
            const cardInfo = JSON.parse(decrypted);
            console.log('cardInfo', cardInfo);
            expect(cardInfo).not.toBeNull();
            // For ECIES / RSA decryption details and physical card examples,
            // see query-card-sensitive-info.test.ts.
            // expect(cardInfo.card_number).toBe('1001022400001101');
            // expect(cardInfo.cvv).toBe('123');
            // expect(cardInfo.expire).toBe('022022');
        });
    });
});
