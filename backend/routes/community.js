const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const auth = require('../middleware/auth');

// Get all posts
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'first_name photos')
      .populate('comments.author', 'first_name photos')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Create a post
router.post('/', auth, async (req, res) => {
  try {
    const newPost = new Post({
      author: req.user.id,
      content: req.body.content,
      type: req.body.type
    });
    const post = await newPost.save();
    await post.populate('author', 'first_name photos');
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Like a post
router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Check if already liked
    if (post.likes.some(like => like.toString() === req.user.id)) {
      post.likes = post.likes.filter(like => like.toString() !== req.user.id);
    } else {
      post.likes.unshift(req.user.id);
    }

    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Comment on a post
router.post('/comment/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const newComment = {
      text: req.body.text,
      author: req.user.id
    };

    post.comments.unshift(newComment);
    await post.save();
    
    const updatedPost = await Post.findById(req.params.id).populate('comments.author', 'first_name photos');
    res.json(updatedPost.comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Report a post
router.post('/report/:id', auth, async (req, res) => {
  res.json({ message: 'Report received' });
});

module.exports = router;