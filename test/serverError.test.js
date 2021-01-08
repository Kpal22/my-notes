process.env.MONGODB_URL = '';

console.log('Testing with no mongodb url, intending to get internal server error');
require('../src/db/mongoose');

require('./error/db/mongoose');
require('./error/utils/note');
require('./error/routes/user');
