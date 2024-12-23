const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const helmet = require('helmet');
require('dotenv').config();
const os = require('os');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

const checkMemoryRequirements = () => {
const totalMemGB = os.totalmem() / (1024 ** 3);
const requiredMemGB = process.env.NODE_ENV === 'production' ? 64 : 32;
 
if (totalMemGB < requiredMemGB) {
   console.error(`Insufficient memory: ${Math.floor(totalMemGB)}GB available, ${requiredMemGB}GB required`);
   console.error('Consider using cloud infrastructure for production deployment');
   process.exit(1);
   }
 };
 
checkMemoryRequirements();

const app = express();

// Add security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://eth-mainnet.alchemyapi.io"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
app.use(cors());
app.use(express.json({ limit: '10kb' }));

// Add rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// Use routes
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`[Error] ${new Date().toISOString()} - ${err.message}`);
  
  res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 

// Add graceful shutdown
const gracefulShutdown = () => {
  console.log('Received shutdown signal');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Add uncaught exception handler
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
