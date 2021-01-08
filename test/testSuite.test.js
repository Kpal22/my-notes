process.env.MONGODB_URL = 'mongodb://127.0.0.1:27017/my-notes-test';
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

require('../src/db/mongoose');

require('./models/user');
require('./models/note');
require('./utils/user');
require('./utils/note');
require('./routes/user');
require('./routes/note');
require('./app');


