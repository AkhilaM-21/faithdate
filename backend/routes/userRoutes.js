const router = require("express").Router();
const auth = require("../middleware/authMiddleware");

const {
  getProfile,
  updateProfile,
  discover,
  getMatches,
  likeUser,
  deleteAccount
} = require("../controllers/userController");

router.get("/me", auth, getProfile);
router.put("/profile", auth, updateProfile);
router.get("/discover", auth, discover);
router.post("/like", auth, likeUser);
router.get("/matches", auth, getMatches);
router.delete("/", auth, deleteAccount);

module.exports = router;
