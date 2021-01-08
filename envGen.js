const fs = require('fs');
const { generateKeyPairSync } = require('crypto');

try {
    fs.writeFileSync('.env', `MONGODB_URL = \'mongodb://127.0.0.1:27017/my-notes\'\n`);
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });
    fs.appendFileSync('.env', `PUBLIC_KEY = \'${publicKey.replace(/\n/g, '[n]')}\'\n`);
    fs.appendFileSync('.env', `PRIVATE_KEY = \'${privateKey.replace(/\n/g, '[n]')}\'\n`);
    fs.appendFileSync('.env', `HOST = \'localhost:3000\'\n`);
    fs.appendFileSync('.env', `PORT = 3000`);
    console.log('Created .env file in root successfully');
} catch (err) {
    console.log('Error while creating .env file in root');
    console.log(err);
}