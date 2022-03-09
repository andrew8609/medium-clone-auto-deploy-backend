const { authJwt } = require("../middleware");
const storyController = require("../controllers/story.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/stories/", [authJwt.checkFetchPrivateStories], storyController.getStories);
  
  app.get("/api/story/:storyId", [authJwt.verifyToken], storyController.getStory);            // returns pagination. page=1&size=1
  app.post("/api/story", [authJwt.verifyToken], storyController.postNewStory);
  app.put("/api/story/:storyId", [authJwt.verifyToken], storyController.updateStory);
  app.delete("/api/story/:storyId", [authJwt.verifyToken], storyController.deleteStory);
  
  app.get("/api/story/:storyId/comment", storyController.getStoryComment);
  app.put("/api/story/:storyId/comment", storyController.putStoryComment);
  app.post("/api/story/:storyId/comment", [authJwt.verifyToken], storyController.postStoryComment);
  app.delete("/api/story/:storyId/comment", storyController.deleteStoryComment);

  app.post("/api/story/:storyId/hashtag", storyController.postStoryHashtag);
  app.get("/api/story/:storyId/hashtag", storyController.getStoryHashtag);
};
