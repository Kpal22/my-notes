const app = require('./app');
const logger = require('./logger');

const port = process.env.PORT;

app.listen(port, () => logger.success('Server started on port ' + port));