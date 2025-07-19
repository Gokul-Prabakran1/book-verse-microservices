require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const redis = require('./config/redis');
const logger = require('./middleware/logger');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const reviewRoutes = require('./routes/reviewRoutes');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use((req, res, next) => { logger.info(`${req.method} ${req.url}`); next(); });

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api', reviewRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

connectDB().then(() => {
  app.listen(PORT, () => { logger.info(`Review Service running on port ${PORT}`); });
}); 