require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('./middleware/logger');
const bookRoutes = require('./routes/bookRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const redisClient = require('./config/redis');

const app = express();
const PORT = process.env.PORT || 5002;

app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use((req, res, next) => { logger.info(`${req.method} ${req.url}`); next(); });

app.use('/api/books', bookRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Book service running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
