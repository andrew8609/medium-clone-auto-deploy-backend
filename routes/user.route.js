const { authJwt, uploadImage } = require("../middleware");
const userController = require("../controllers/users.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get( "/api/user/me", [authJwt.verifyToken], userController.getMyProfile); 
  app.put( "/api/user/me", [authJwt.verifyToken, uploadImage.multerMiddleware], userController.updateMyProfile);
  app.delete( "/api/user/me", [authJwt.verifyToken], userController.deleteMyProfile);

  app.get( "/api/user/:userId/profile", userController.getPublicProfile);
  
  
  app.get("/api/user/:userId/comment", userController.getUserComments);
  app.get("/api/user/:userId/follow", userController.getUserFollowers);
  
  app.get("/api/user/:userId", userController.getUserProfile);            // returns pagination. page=1&size=1
  
  

};
