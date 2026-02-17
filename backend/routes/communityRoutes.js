const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { getPosts, createPost, likePost, addComment, reportPost } = require("../controllers/communityController");

router.get("/", auth, getPosts);
router.post("/", auth, createPost);
router.put("/like/:id", auth, likePost);
router.post("/comment/:id", auth, addComment);
router.post("/report/:id", auth, reportPost);

module.exports = router;