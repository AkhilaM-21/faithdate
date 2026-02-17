const Post = require("../models/Post");

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("author", "first_name photos")
      .populate("comments.author", "first_name photos");
    res.json(posts);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

exports.createPost = async (req, res) => {
  try {
    const newPost = new Post({
      author: req.user.id,
      content: req.body.content,
      type: req.body.type,
      image: req.body.image
    });
    const post = await newPost.save();
    await post.populate("author", "first_name photos");
    res.json(post);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

exports.addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const newComment = { author: req.user.id, text: req.body.text };
    post.comments.unshift(newComment);
    await post.save();
    await post.populate("comments.author", "first_name photos");
    res.json(post.comments);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.likes.includes(req.user.id)) {
      post.likes = post.likes.filter(id => id.toString() !== req.user.id);
    } else {
      post.likes.push(req.user.id);
    }
    await post.save();
    res.json(post.likes);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

exports.reportPost = async (req, res) => {
  try {
    res.json({ message: "Report received" });
  } catch (err) {
    res.status(500).send("Server Error");
  }
};