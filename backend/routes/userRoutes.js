const router = require("express").Router();
const auth = require("../middleware/authMiddleware");

const {
  getProfile,
  updateProfile,
  discover,
  getMatches,
  likeUser,
  deleteAccount,
  verifyProfile,
  getProfileViews,
  recordProfileView,
  getWhoLikedMe,
  unmatchUser,
  reportUser,
  getUserById
} = require("../controllers/userController");

router.get("/me", auth, getProfile);
router.put("/profile", auth, updateProfile);
router.get("/discover", auth, discover);
router.post("/like", auth, likeUser);
router.get("/matches", auth, getMatches);
router.delete("/", auth, deleteAccount);

// Profile features
router.post("/verify", auth, verifyProfile);
router.get("/views", auth, getProfileViews);
router.post("/:id/view", auth, recordProfileView);
router.post("/:id/view", auth, recordProfileView);
router.get("/likes", auth, getWhoLikedMe);
router.get("/:id", auth, getUserById);

// Match management
router.post("/matches/:matchId/unmatch", auth, unmatchUser);
router.post("/report", auth, reportUser);

module.exports = router;
