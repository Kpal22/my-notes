const fs = require('fs');
const { generateKeyPairSync } = require('crypto');

const genKeys = () => generateKeyPairSync('rsa', {
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

try {
    fs.writeFileSync('.env', `#Mongodb connection URL\n`);
    fs.appendFileSync('.env', `MONGODB_URL = \'mongodb://127.0.0.1:27017/my-notes\'\n`);
    const { publicKey, privateKey } = genKeys();
    fs.appendFileSync('.env', `\n#[n] is the delimiter used in public & private keys in place of \'Next Line\'\n`);
    fs.appendFileSync('.env', `PUBLIC_KEY = \'${publicKey.replace(/\n/g, '[n]')}\'\n`);
    fs.appendFileSync('.env', `PRIVATE_KEY = \'${privateKey.replace(/\n/g, '[n]')}\'\n`);
    fs.appendFileSync('.env', `\n#Token expritaion time in seconds\n`);
    fs.appendFileSync('.env', `EXPIRATION_TIME = 3600\n`);
    fs.appendFileSync('.env', `\n#Host URL used in swagger\n`);
    fs.appendFileSync('.env', `HOST = \'localhost:3000\'\n`);
    fs.appendFileSync('.env', `\n#Application\n`);
    fs.appendFileSync('.env', `PORT = 3000`);
    console.log('Created .env file in root successfully');
} catch (err) {
    console.log('Error while creating .env file in root');
    console.log(err);
}

try {
    fs.writeFileSync('./test/.env', `#Mongodb connection URL for test only\n`);
    fs.appendFileSync('./test/.env', `MONGODB_URL = \'mongodb://127.0.0.1:27017/my-notes-test\'\n`);
    const { publicKey, privateKey } = genKeys();
    fs.appendFileSync('./test/.env', `\n#[n] is the delimiter used in public & private keys in place of \'Next Line\'\n`);
    fs.appendFileSync('./test/.env', `PUBLIC_KEY = \'${publicKey.replace(/\n/g, '[n]')}\'\n`);
    fs.appendFileSync('./test/.env', `PRIVATE_KEY = \'${privateKey.replace(/\n/g, '[n]')}\'\n`);
    fs.appendFileSync('./test/.env', `\n#Token expritaion time in seconds\n`);
    fs.appendFileSync('./test/.env', `EXPIRATION_TIME = 3600\n`);
    console.log('Created .env file in test successfully');
} catch (err) {
    console.log('Error while creating .env file in test');
    console.log(err);
}