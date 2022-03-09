const { authJwt, uploadImage } = require("../middleware");
const storyController = require("../controllers/story.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/clap", [authJwt.verifyToken], storyController.postClap);
};