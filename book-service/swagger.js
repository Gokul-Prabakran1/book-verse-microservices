const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Book Service API',
      version: '1.0.0',
      description: 'API documentation for the Book microservice',
    },
    servers: [
      { url: 'http://localhost:5002' }
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
