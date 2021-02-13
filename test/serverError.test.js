process.env.MONGODB_URL = '';
require('../src/db/mongoose');

require('./error/db/mongoose');
require('./error/utils/note');
require('./error/routes/user');
