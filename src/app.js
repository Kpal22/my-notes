require('./db/mongoose');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const express = require('express');
const userRouter = require('./routes/user');
const noteRouter = require('./routes/note');
const swaggerJsdoc = require('swagger-jsdoc');
const { serve, setup } = require('swagger-ui-express');

const app = express();
app.use(cors());
app.use(morgan(':remote-addr :remote-user :method :url :status :res[content-length] bytes -- :response-time ms'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/users', userRouter);
app.use('/notes', noteRouter);

app.use((err, _req, res, _next) => res.status(err.status).send(err.message));

const options = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            version: '1.0.0',
            title: 'My-Notes',
            description: "User can signup/login and create/update/delete Notes",
        },
        host: process.env.HOST,
        basePath: '/',
        produces: ['application/json'],
        schemes: ['http'],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    apis: [path.join(__dirname + '/models/*.js'), path.join(__dirname + '/routes/*.js')],
};

app.use('/api-docs', serve, setup(swaggerJsdoc(options)));
app.get('/', (_req, res) => res.redirect('/api-docs'));

module.exports = app;