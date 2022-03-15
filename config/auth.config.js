module.exports = {
    secret: "bezkoder-secret-key",
    // jwtExpiration: 3600,         // 1 hour
    // jwtRefreshExpiration: 86400, // 24 hours
  
    jwtExpiration: 6000,          // 1 minute
    jwtRefreshExpiration: 12000,  // 2 minutes
    BACKEND_DOMAIN: "http://happybirthdayhub.com:3000",
    FRONTEND_DOMAIN: "http://happybirthdayhub"
  };
  