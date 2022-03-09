const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const User = require("../db/models").User;

const { TokenExpiredError } = jwt;

const catchError = (err, res) => {
  if (err instanceof TokenExpiredError) {
    return res.status(401).send({ message: "Unauthorized! Access Token was expired!" });
  }

  return res.status(401).json({ message: "Unauthorized!" + err });
};

const checkFetchPrivateStories = (req, res, next) => {
  if(req.query.type == "mine") {
    verifyToken(req, res, next);
  } else {
    next();
  }
};
const verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
    if (err) {
      return catchError(err, res);
    }
    req.userId = decoded.id;
    
    next();
  });
};

const verifyRequestIsMine = (req, res, next) => {
  if(req.userId) {
    if(req.params.userId == req.userId || req.body.user_id == req.userId) {
      next();
    } else {
    return res.status(302).send({message: "request is modified. you are trying to impersonate other user!"});
    }
  } else {
    return res.status(400).json({message: "user id not set"});
  }
};

const isAdmin = (req, res, next) => {
  User.findByPk(req.userId).then(user => {
    user.getRoles().then(roles => {
      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === "admin") {
          next();
          return;
        }
      }

      res.status(403).send({
        message: "Require Admin Role!"
      });
      return;
    });
  });
};

const authJwt = {
  verifyToken: verifyToken,
  isAdmin: isAdmin,
  verifyRequestIsMine: verifyRequestIsMine,
  checkFetchPrivateStories: checkFetchPrivateStories
};
module.exports = authJwt;
