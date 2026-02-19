const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const {
    getAccountInfo,
    changePassword,
    sendOTP,
    verifyOTP,
    changePhone,
    toggleNotifications
} = require("../controllers/accountController");

router.get("/me", auth, getAccountInfo);
router.put("/password", auth, changePassword);
router.post("/send-otp", auth, sendOTP);
router.post("/verify-otp", auth, verifyOTP);
router.put("/phone", auth, changePhone);
router.put("/notifications", auth, toggleNotifications);

module.exports = router;
