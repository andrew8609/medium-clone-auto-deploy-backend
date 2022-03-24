
const request = require('request-promise');

const verifyRecaptcha = (req, res, next) => {
   
    const options = {
        method: 'POST',
        uri: 'https://www.google.com/recaptcha/api/siteverify',
        json: true,
        form: {
            secret: "6LdWAwgfAAAAADZUKVAkgJqvEm_SRCwJNzmT6-Uh",
            response: req.body.g_recaptcha_response,
            remoteip: req.ip
        }
    };
    request(options)
    .then((res)=>{
        if(res.success) {
            console.log("suc");
            next();
        }
        throw new Error('failed robot test');
        
    })
    .catch((err)=>{
        console.log(err);
        throw new Error('robot check failed')
    })
  };

const recaptcha = {
    verifyRecaptcha: verifyRecaptcha
};

module.exports = recaptcha;
