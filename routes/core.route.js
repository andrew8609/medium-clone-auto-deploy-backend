const { authJwt, uploadImage } = require("../middleware");
const coreController = require("../controllers/core.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post('/api/image', uploadImage.multerMiddleware, coreController.uploadImage);
  app.get('/api/search', authJwt.verifyToken, coreController.searchEngine);
  app.get('/api/hashtag', coreController.getHashtags);
};