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
app.get("/api/follow",[authJwt.verifyToken], userController.getUserFollows);      
app.post("/api/follow", [authJwt.verifyToken], userController.postUserFollows);
app.delete("/api/follow", [authJwt.verifyToken], userController.deleteUserFollows); // app.delete("/api/user/:userId/follow", [authJwt.verifyToken, authJwt.verifyRequestIsMineForParam], userController.deleteUserFollows);
}

    