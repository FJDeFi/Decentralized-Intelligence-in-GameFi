const errorHandler = (err, req, res, next) => {
  // Add detailed error logging
  logger.error({
    error: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
    requestId: req.id,
    path: req.path,
    method: req.method
  });

  // Add custom error responses
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: err.message,
      details: err.details
    });
  }

  if (err.name === 'BlockchainError') {
    return res.status(503).json({
      status: 'error',
      code: 'BLOCKCHAIN_ERROR',
      message: 'Blockchain service temporarily unavailable'
    });
  }

  // Default error response
  res.status(500).json({
    status: 'error',
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred'
  });
};

module.exports = errorHandler; 