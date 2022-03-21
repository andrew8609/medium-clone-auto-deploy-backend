const userController = require('../controllers').users
const authController = require('../controllers').auth
const commentController = require('../controllers').comments

var passport = require('../config/passport.js');


module.exports = (app) => {
  app.use(function(req, res, next) {
    res.setHeader(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post('/api/auth/signUpByEmail', authController.signUpByEmail);
  app.post('/api/auth/confirmSignupByToken', authController.confirmSignupByToken); 
  app.post("/api/auth/refreshToken", authController.refreshToken);
  app.get("/api/auth/checkAccessToken", authController.checkAccessToken);
  app.post("/api/auth/signinWithEmail", authController.signinWithEmail);
  app.post('/api/auth/confirmSigninByToken', authController.confirmSigninByToken); 

  app.get('/login', function(req,res){  res.render('auth/login'); });
  
  
  app.get('/api/google', (req, res, next) => {
    const { requestType } = req.query
    const state = requestType
        ? Buffer.from(JSON.stringify({ requestType })).toString('base64') : undefined
    const authenticator = passport.authenticate('google', { scope: ['email', 'profile'], state })
    authenticator(req, res, next)
})

app.get('/api/auth/google/callback', passport.authenticate('google'), authController.googleSignUpOrSignIn);
  
}

