const jwt = require('jsonwebtoken');

const User = require('../db/models').User;
const RefreshToken = require('../db/models').RefreshToken;
const comment = require('../db/models').Comment;
const SendEmail = require('../core').SendEmail;
const config = require("../config/auth.config");
const crypto = require("crypto");
const { TokenExpiredError } = jwt;


module.exports = {
    signUpByEmail(req, res) {
       
        return User
        .findOne({
            where: { email: req.body.email}
        })
        .then(userRecord => {
            
            const date = new Date();
            date.setHours(date.getHours() + 2);
            var token = jwt.sign({ email: req.body.email}, process.env.JWT_EMAIL_LINK_SECRET, { expiresIn: '2h'});
            console.log("signup token: " + token);

            // if user already exists, send signin link to email account
            if(userRecord) {
                
                if(userRecord.is_activated) {
                    SendEmail.send(
                         req.body.email,
                        //"05ba041830-4a42ae@inbox.mailtrap.io",
                        'please signin',
                        `hello please sign in. Your account is already existing. This is the link: ${config.FRONTEND_DOMAIN}/auth/confirmSigninByToken?token=${token}
                        <a href="${config.FRONTEND_DOMAIN}/auth/confirmSigninByToken?token=${token}" style="color: rgb(255, 255, 255); text-decoration: none; display: inline-block; position: relative; height: 38px; line-height: 38px; padding: 0px 24px; border: 0px none; outline: currentcolor none 0px; background-color: rgb(26, 137, 23); font-size: 14px; font-style: normal; font-weight: 400; text-align: center; cursor: pointer; white-space: nowrap; text-rendering: optimizelegibility; user-select: none; border-radius: 99em; margin-top: 35px; margin-bottom: 35px;">Create your account</a>`
                    );
                    return res.status(200).json({message: "mail sent to your email account"});
                } else {

                    SendEmail.send(
                        req.body.email,
                        //"05ba041830-4a42ae@inbox.mailtrap.io",
                        'Sign Up',
                        `hello please sign up.  This is the link: ${config.FRONTEND_DOMAIN}/auth/confirmSignupByToken?token=${token}`
                    );
                    return res.status(200).json({message: "mail sent to your email account"});
                }                          
                
            }
            // if user does not exist, create new record in db and send magic link for signup completion
            var username   = req.body.email.substring(0, req.body.email.lastIndexOf("@"));
            return User
            .create({
                username: username,
                email: req.body.email,
                id: crypto.randomBytes(10).toString('hex')
            })
            .then(() => {
                SendEmail.send(
                     req.body.email,
                    //"05ba041830-4a42ae@inbox.mailtrap.io",
                    'please signup',
                    `hello please sign up. This is the link: ${config.FRONTEND_DOMAIN}/auth/confirmSignupByToken?token=${token}`
                );
                
                res.status(200).json({message: "mail sent to your email account"})
            })
            .catch((error) => res.status(500).json({message: error}))
        });
    },

    confirmSignupByToken(req, res) {
        jwt.verify(req.body.token, process.env.JWT_EMAIL_LINK_SECRET, function(err, decoded) {

            if (err) {
                
                if(err instanceof jwt.TokenExpiredError){
                    res.status(200).send({ message: "Unauthorized! Access Token was expired!" });
                }
                res.status(200).send({ message: err });
            }
            
            User.findOne({
                where: {
                    email: decoded.email
                }
            }).then (async (user) =>{
                
                if(!user) {
                    res.status(404).send({ message: "User Not found." });
                }
                await user.update(
                        { is_activated: 1 },
                        { where: { email: decoded.email }}
                    )
                res.status(200).send({message: "activated successfully"});
            })
          });
    },
    async signinWithEmail(req, res) {

        await User
        .findOne({
            where: { email: req.body.email} 
        })
        .then(userRecord => {

            const date = new Date();
            date.setHours(date.getHours() + 2);
            var token = jwt.sign({ email: req.body.email}, process.env.JWT_EMAIL_LINK_SECRET, { expiresIn: '2h'});
            console.log("token: " + token);

            // if user already exists, send signin link to email account
            if(userRecord) {  
                if (userRecord.is_activated) {
                    SendEmail.send(
                          req.body.email,
                         //"05ba041830-4a42ae@inbox.mailtrap.io",
                         'please signin',
                         `hello please sign in. Your account is already existing. This is the link: ${config.FRONTEND_DOMAIN}/auth/confirmSigninByToken?token=${token}
                         <a href="${config.FRONTEND_DOMAIN}/auth/confirmSigninByToken?token=${token}" style="color: rgb(255, 255, 255); text-decoration: none; display: inline-block; position: relative; height: 38px; line-height: 38px; padding: 0px 24px; border: 0px none; outline: currentcolor none 0px; background-color: rgb(26, 137, 23); font-size: 14px; font-style: normal; font-weight: 400; text-align: center; cursor: pointer; white-space: nowrap; text-rendering: optimizelegibility; user-select: none; border-radius: 99em; margin-top: 35px; margin-bottom: 35px;">Create your account</a>`
                     );
                } else {
                    return res.status(200).json({message: "Sorry, we didn't recognize that email."});
                }
                
                return res.status(200).json({message: "mail sent to your email account"});
            }

            // if user does not exist, create new record in db and send magic link for signup completion
            return res.status(200).json({message: "Sorry, we didn't recognize that email."});
        })
        .catch(error => res.status(500).json({message: error}));
    },
    
    confirmSigninByToken(req, res) {

        jwt.verify(req.body.token, process.env.JWT_EMAIL_LINK_SECRET, function(err, decoded) {
            if (err) {
                
                if(err instanceof jwt.TokenExpiredError){
                    res.status(400).send({ message: "Unauthorized! Access Token was expired!" });
                }
                res.status(400).send({ message: err });
            }
            
            User.findOne({
                where: {
                    email: decoded.email
                }
            }).then (async (user) =>{
                if(!user) {
                    res.status(404).send({ message: "User Not found." });
                }

                const token = jwt.sign({ id: user.id }, process.env.JWT_ACCESS_SECRET, {
                    expiresIn: config.jwtExpiration
                  });
                
                let refreshToken = await RefreshToken.createToken(user);
                res.status(200).send({
                    id: user.random_id,
                    username: user.username,
                    email: user.email,
                    photo_url: user.photo_url,
                    bio_note: user.bio_note,
                    accessToken: token,
                    refreshToken: refreshToken,
                  });  
            })
          });
    },
    async refreshToken(req, res) {
        const { refreshToken: requestToken } = req.body;
      
        if (requestToken == null) {
          return res.status(403).json({ message: "Refresh Token is required!" });
        }
        
        try {
      
          let refreshToken = await RefreshToken.findOne({ where: { refresh_token: requestToken } });
    
      
          if (!refreshToken) {
            res.status(403).json({ message: "Refresh token is not in database!" });
            return;
          }
      
          if (RefreshToken.verifyExpiration(refreshToken)) {
            RefreshToken.destroy({ where: { id: refreshToken.id } });
            
            res.status(405).json({
                status: "405",
              message: "Refresh token was expired. Please make a new signin request",
            });
            return;
          }
      
          const user = await refreshToken.getUser();

          let newAccessToken = jwt.sign({ id: user.id }, process.env.JWT_ACCESS_SECRET, {
            expiresIn: config.jwtExpiration,
          });
      
          return res.status(200).json({
            accessToken: newAccessToken,
            //refreshToken: refreshToken.refresh_token,
          });
        } catch (err) {
          return res.status(500).send({ message: err });
        }
      },
      async checkAccessToken(req, res) { 
        jwt.verify(req.headers["x-access-token"], process.env.JWT_ACCESS_SECRET, (err, decoded) => {
            if (err instanceof TokenExpiredError) {
                return res.status(401).send({ status: "401", message: "Unauthorized! Access Token was expired!" });
            }
        });
      },

      async googleSignUpOrSignIn (req, res) {

        const { state } = req.query;
        const { requestType } = JSON.parse(Buffer.from(state, 'base64').toString());
        await User.findOne({ 
            where: {
                email: req.email
            }
        })
        .then( user => {
            if(!user) { // if this user is not registered
                if(requestType == "login") {
                    res.redirect(`${config.FRONTEND_DOMAIN}/auth/signupFirst`);
                   
                } else if (requestType == "signup") {
                    let user_id = crypto.randomBytes(10).toString('hex');
                    User.create({
                        id: user_id,
                        username: req.displayName,
                        email: req.email,
                        photo_url: req.picture,
                        is_activated: 1,
                        register_type: 1 // ????
                    })
                    .then(() => {
                        
                        const token = jwt.sign({ id: user_id }, process.env.JWT_ACCESS_SECRET, {
                            expiresIn: config.jwtExpiration
                        });
                        User.findOne({where: {id: user_id}}).then((user) => {
                            let refreshToken = RefreshToken.createToken(user);
                            res.redirect(`${config.FRONTEND_DOMAIN}/auth/welcomePage` + '?accessToken=' + token + "&refreshToken=" + refreshToken);
                        });
                        
                    })
                    .catch( (error) => {
                        res.status(500).send({ error: "error in creating new user " + error });
                    })
                }
                
            } else {
                const token = jwt.sign({ id: user.id }, process.env.JWT_ACCESS_SECRET, {
                    expiresIn: config.jwtExpiration
                  });
                
                let refreshToken = RefreshToken.createToken(user);
                res.redirect(`${config.FRONTEND_DOMAIN}/auth/welcomePage` + '?accessToken=' + token + "&refreshToken=" + refreshToken);
            }
        })
        .catch( err => {
            return res.status(500).send({ message: "err in google oauth signup " + err });
        })
      },  
}