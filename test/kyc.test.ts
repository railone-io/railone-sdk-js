import axios from 'axios';
import generateAuth from '../index';

describe('Test kyc', () => {
    it('test get', () => {
        const url = '/api/v1/customers/accounts?acct_no=1&page_num=1&page_size=20';
        const apiKey = '14db63d7f3614664ad1c71dd134a21dc';
        const apiSecret = 'ed8cb3a0-8365-4340-9d9c-33f051eedccd';
        const p = axios(`https://api.sandbox.railone.io${url}`, {
            headers: {
                'Authorization': generateAuth({
                    method: 'GET',
                    apiKey,
                    apiSecret,
                    path: url
                }),
                'Access-Passphrase': '12345678a'
            }
        });
        return p.then((res) => {
            expect(res.data.code).toBe(0);
        });
    });
    it('test post', () => {
        const url = '/api/v1/customers/accounts';
        const apiKey = '14db63d7f3614664ad1c71dd134a21dc';
        const apiSecret = 'ed8cb3a0-8365-4340-9d9c-33f051eedccd';
        const image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAyCAMAAADGIxO9AAABdFBMVEUAAAAA//+AgP8zmf9Jkv9Vqv9Nmf9Gov9Aqv9Onf9JpP9Eqv9Qn/9Lpf9Hqv9Dof9Npv9Jnv9Gov9Dpv9Kn/9Ho/9Fp/9Mof9JpP9Gp/9In/9Lpf9Ho/9HoP9KpP9Jof9Hpf9Kov9Go/9Iov9Ho/9Jov9Iov9JpP9Iov9Ho/9Jov9Hof9Iov9Jo/9IpP9Jo/9Iov9Ho/9Iov9Io/9Iov9JpP9Iov9Ho/9Io/9IpP9Hov9IpP9JpP9Io/9Io/9Io/9Io/9Hov9Io/9IpP9Ho/9Jov9Io/9Io/9Io/9IpP9Io/9Io/9Io/9Ho/9Iov9Io/9Io/9Jo/9Io/9Io/9Ho/9Io/9Io/9Io/9Jo/9IpP9Io/9Ho/9Iov9Io/9Io/9Jo/9Io/9IpP9Io/9Jo/9Io/9Io/9Io/9Io/9Jo/9Io/9Io/9Io/9Io/9Io/9Io/9Io/9Io/9Io/9Io/9Io/9Io/9Io/9Io/9Io/9Io/9Io/9Io/////9nZg6jAAAAenRSTlMAAQIFBwkKCwwNDg8QERITFBUWFxgZGhscHSAiJCstMTY3Ojw9QkdJSktNT1VbXF5gYWNneXt8fYCDhIaJipucpKirra+ztLW3uL3AwsjJysvMzc7P0NHS09TV1tfY2drb3+Dh5OXm5+jp6uvs7vHz9PX3+Pn6+/z9/pduSYEAAAABYktHRHtP0rX8AAACGElEQVRIx5XWWVvTQBQG4K+oiG1jm2ap1n0XRa0b1gVRWVxwAWwbaJZaQBAxuGLw/HovKjqTzILnKk9y3nyTZCbPANnKHbs5PvM+juM4nBq7bGYb7PSJo/d6xNb2i+uDqRafRyeebFOmPt4pcE3EImtcIIiI1m8MsIZ6tZ3jkU2S1ssqayhw+o/e+EWKWj3FGlqqAdjziNT1fYQ1FDpA8a3G0NYwayh0gVJTh76eYQ0t1YDCKx3acFlDgbObpKc51uwyqc4ZCmyg1NKYlSHOUK8GFF5r0Chv6N0hPVof5A35FlBuq9GVlKFuFSiqk56lDXUswPSUs+FA2vST3qjQhYyhRV3S3azRJk0IDC1UgMqC1LREhrouUJyVmTWhoUiFPosNeSZQWRRfSySGPBOwOhLzTYIiFzBmxWZD9qihCxhzQtORvtN2GbB8kZmUfzxJUoL7ilnSKgO2nzXnVdMxdACznTH5LRVqlgA7SBtMkTbJS5tr6qXcLAFOkDJ7V9UoSCclAG5p/k6BzaMEQP6DBs0fBNyQM7hK/5WUAMDAcx2aNwA3Yg2Mng759r/l3jc4+UWH5gyg2mUNhn9qUR6oRqzBuU2NeZDDn+H9NTi9phLJ7X6XG7EGpmLiLZ/d6XIj1gCXliUbg8Y+5tYeZ1BsfBIM6/FxrsntpHZZ++vTP/ilOnpEu3sDhi6OTUdxHMcrMw/rhwVbQvwGOaukvpva6/sAAAAASUVORK5CYII=';
        const reqBody = {
            acct_name: 'test01@railone.io',
            acct_no: `mock${Date.now()}`,
            address: 'street 1',
            back_doc: image,
            birthday: '1991-01-01',
            city: 'moon',
            country: 'A',
            country_code: '96',
            doc_no: '1234',
            doc_type: 'passport',
            first_name: 'micky',
            front_doc: image,
            gender: 'male',
            kyc_info: 'string',
            last_name: 'Wang',
            maiden_name: 'mom',
            mail: 'test01@railone.io',
            // "mail_token": "123456",
            // "mail_verification_code": "123456",
            mix_doc: image,
            mobile: '1582170000',
            nationality: 'A',
            state: 'moon',
            zipcode: '123456',
            card_type_id: '80000005'
        };
        const p = axios(`https://api.sandbox.railone.io${url}`, {
            method: 'post',
            headers: {
                'Authorization': generateAuth({
                    method: 'POST',
                    apiKey,
                    apiSecret,
                    path: url,
                    reqBody
                }),
                'Access-Passphrase': '12345678a'
            },
            data: reqBody
        });
        return p.then((res) => {
            expect(res.data.code).toBe(0);
        });
    });
});
