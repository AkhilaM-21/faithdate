const Like = require("../models/Like");
const Match = require("../models/Match");

exports.likeUser = async (req, res) => {
  const { userId } = req.body;

  await Like.create({
    from: req.user.id,
    to: userId
  });

  const mutual = await Like.findOne({
    from: userId,
    to: req.user.id
  });

  if (mutual) {
    const match = await Match.create({
      users: [req.user.id, userId]
    });

    return res.json({ matched: true, match });
  }

  res.json({ matched: false });
};
