process.env.MONGODB_URL = 'mongodb://127.0.0.1:00000/my-notes-test';
const { generateKeyPairSync } = require('crypto');
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
process.env.PUBLIC_KEY = publicKey.replace(/\n/g, '[n]');
process.env.PRIVATE_KEY = privateKey.replace(/\n/g, '[n]');

require('./error/db/mongoose');
require('./error/utils/note');
require('./error/routes/user');
