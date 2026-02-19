const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { first_name, email, password, gender, interested_in, date_of_birth, location, phoneNumber } = req.body;

  try {
    // Age verification: must be 18+
    if (date_of_birth) {
      const dob = new Date(date_of_birth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      if (age < 18) {
        return res.status(400).json({ msg: "You must be at least 18 years old to register" });
      }
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    user = new User({
      first_name,
      email,
      password,
      gender,
      interested_in,
      date_of_birth,
      location,
      phoneNumber,
      authProvider: "email"
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = { user: { id: user.id } };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

    const payload = { user: { id: user.id } };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" }, (err, token) => {
      if (err) throw err;
      res.json({ token, isProfileComplete: user.isProfileComplete });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// POST /api/auth/social - Social login stub (Google/Facebook/Apple)
exports.socialLogin = async (req, res) => {
  const { provider, socialId, email, first_name } = req.body;

  if (!provider || !socialId) {
    return res.status(400).json({ msg: "Provider and socialId are required" });
  }

  const validProviders = ["google", "facebook", "apple"];
  if (!validProviders.includes(provider)) {
    return res.status(400).json({ msg: "Invalid provider. Use: google, facebook, or apple" });
  }

  try {
    // Check if user already exists with this social account
    let user = await User.findOne({ authProvider: provider, socialId });

    if (!user && email) {
      // Check if email already exists
      user = await User.findOne({ email });
      if (user) {
        // Link social account to existing email user
        user.authProvider = provider;
        user.socialId = socialId;
        await user.save();
      }
    }

    if (!user) {
      // Create new user
      user = new User({
        first_name: first_name || "User",
        email: email || `${provider}_${socialId}@social.faithdate`,
        authProvider: provider,
        socialId
      });
      await user.save();
    }

    const payload = { user: { id: user.id } };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" }, (err, token) => {
      if (err) throw err;
      res.json({ token, isProfileComplete: user.isProfileComplete });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};