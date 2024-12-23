const performanceMiddleware = (req, res, next) => {
  const start = process.hrtime();
  
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000;
    
    if (duration > 1000) {
      console.warn(`Slow request: ${req.method} ${req.url} took ${duration}ms`);
    }
  });
  
  next();
};

module.exports = performanceMiddleware; 