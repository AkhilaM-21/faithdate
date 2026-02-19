const User = require("../models/User");
const bcrypt = require("bcryptjs");

// GET /api/account/me - Get account info (email masked, phone masked)
exports.getAccountInfo = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select(
            "email phoneNumber phoneVerified authProvider notificationsEnabled first_name"
        );
        if (!user) return res.status(404).json({ msg: "User not found" });

        // Mask email: show first 2 chars + ***@domain
        const maskEmail = (email) => {
            if (!email) return null;
            const [local, domain] = email.split("@");
            return local.slice(0, 2) + "***@" + domain;
        };

        // Mask phone: show last 4 digits
        const maskPhone = (phone) => {
            if (!phone) return null;
            return "****" + phone.slice(-4);
        };

        res.json({
            email: user.email,
            maskedEmail: maskEmail(user.email),
            phoneNumber: user.phoneNumber,
            maskedPhone: maskPhone(user.phoneNumber),
            phoneVerified: user.phoneVerified,
            authProvider: user.authProvider,
            notificationsEnabled: user.notificationsEnabled,
            first_name: user.first_name
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// PUT /api/account/password - Change password
exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ msg: "Please provide current and new password" });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ msg: "New password must be at least 6 characters" });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: "User not found" });

        if (user.authProvider !== "email") {
            return res.status(400).json({ msg: "Cannot change password for social login accounts" });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Current password is incorrect" });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ msg: "Password changed successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// POST /api/account/send-otp - Send OTP (simulated - logs to console)
exports.sendOTP = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: "User not found" });

        if (!user.phoneNumber) {
            return res.status(400).json({ msg: "No phone number on file. Update your phone number first." });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        // SIMULATED: In production, send via SMS service (Twilio, etc.)
        console.log(`📱 OTP for ${user.phoneNumber}: ${otp} (expires in 5 min)`);

        res.json({ msg: "OTP sent successfully", hint: `(Dev mode) OTP: ${otp}` });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// POST /api/account/verify-otp - Verify OTP code
exports.verifyOTP = async (req, res) => {
    const { code } = req.body;

    if (!code) return res.status(400).json({ msg: "OTP code is required" });

    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: "User not found" });

        if (!user.otp || !user.otpExpires) {
            return res.status(400).json({ msg: "No OTP requested. Please send OTP first." });
        }

        if (new Date() > user.otpExpires) {
            user.otp = null;
            user.otpExpires = null;
            await user.save();
            return res.status(400).json({ msg: "OTP has expired. Please request a new one." });
        }

        if (user.otp !== code) {
            return res.status(400).json({ msg: "Invalid OTP code" });
        }

        user.phoneVerified = true;
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        res.json({ msg: "Phone verified successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// PUT /api/account/phone - Change phone number (resets verification)
exports.changePhone = async (req, res) => {
    const { newPhone } = req.body;

    if (!newPhone) return res.status(400).json({ msg: "New phone number is required" });

    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: "User not found" });

        user.phoneNumber = newPhone;
        user.phoneVerified = false;
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        res.json({ msg: "Phone number updated. Please verify with OTP.", phoneNumber: newPhone });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// PUT /api/account/notifications - Toggle notifications
exports.toggleNotifications = async (req, res) => {
    const { enabled } = req.body;

    if (typeof enabled !== "boolean") {
        return res.status(400).json({ msg: "enabled must be a boolean" });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: "User not found" });

        user.notificationsEnabled = enabled;
        await user.save();

        res.json({ msg: `Notifications ${enabled ? "enabled" : "disabled"}`, notificationsEnabled: enabled });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};
