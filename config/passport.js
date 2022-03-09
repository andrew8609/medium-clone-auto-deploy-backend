var passport         = require('passport');
var GoogleStrategy   = require('passport-google-oauth2').Strategy;
const config = require("./auth.config");

passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new GoogleStrategy(
  {
    clientID      : process.env.GOOGLE_CLIENT_ID,
    clientSecret  : process.env.GOOGLE_SECRET,
    callbackURL   : `${config.BACKEND_DOMAIN}/auth/google/callback`,
    passReqToCallback   : true
  }, function(request, accessToken, refreshToken, profile, done){
    
    request.email = profile.email;
    request.displayName = profile.displayName;
    request.picture = profile.picture;
    
    var user = profile;

    done(null, user);
  }
));

module.exports = passport;
