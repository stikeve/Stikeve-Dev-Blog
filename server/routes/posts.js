const express = require('express');
const { body, validationResult, param, query } = require('express-validator');
const Post = require('../models/Post');
const { auth, optionalAuth } = require('../middleware/auth');
const slugify = require('slugify');
const router = express.Router();

// @route   GET /api/posts
// @desc    Get all posts (with filtering)
// @access  Public/Private (shows different posts based on auth)
router.get('/', optionalAuth, [
  query('tags')
    .optional()
    .isIn(['technical', 'personal', 'technical,personal'])
    .withMessage('Tags must be technical, personal, or both'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { status: 'published' };

    // Privacy filter - only show public posts unless user is authenticated and owns the post
    if (!req.user) {
      filter.privacy = 'public';
    } else {
      filter.$or = [
        { privacy: 'public' },
        { privacy: 'private', author: req.user._id }
      ];
    }

    // Tag filter
    if (req.query.tags) {
      const tags = req.query.tags.split(',');
      filter.tags = { $in: tags };
    }

    // Search filter
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    const posts = await Post.find(filter)
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-content'); // Don't send full content in list view

    const total = await Post.countDocuments(filter);

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/posts/:slug → // @route   GET /api/posts/id/:id
// @desc    Get single post by ID (for editing)
// @access  Private (author only)
router.get('/id/:id', auth, [
  param('id').isMongoId().withMessage('Invalid post ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const post = await Post.findById(req.params.id)
      .populate('author', 'username avatar bio');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is the author
    if (post.author._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied - not the author' });
    }

    res.json({ post });
  } catch (error) {
    console.error('Get post by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// @route   GET /api/posts/:slug
// @desc    Get single post by slug
// @access  Public/Private
router.get('/:slug', optionalAuth, [
  param('slug').notEmpty().withMessage('Slug is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const post = await Post.findOne({ slug: req.params.slug })
      .populate('author', 'username avatar bio');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check privacy permissions
    if (post.privacy === 'private') {
      if (!req.user || req.user._id.toString() !== post.author._id.toString()) {
        return res.status(403).json({ message: 'Access denied to private post' });
      }
    }

    // Increment view count (only for public posts and not by author)
    if (post.privacy === 'public' &&
        (!req.user || req.user._id.toString() !== post.author._id.toString())) {
      await Post.findByIdAndUpdate(post._id, { $inc: { views: 1 } });
      post.views += 1;
    }

    res.json({ post });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', auth, [
  body('title')
    .trim()
    .notEmpty()
    .isLength({ max: 200 })
    .withMessage('Title is required and must be less than 200 characters'),
  body('content')
    .notEmpty()
    .withMessage('Content is required'),
  body('tags')
    .isArray({ min: 1, max: 2 })
    .withMessage('Must have 1-2 tags'),
  body('tags.*')
    .isIn(['technical', 'personal'])
    .withMessage('Tags must be technical or personal'),
  body('privacy')
    .isIn(['public', 'private'])
    .withMessage('Privacy must be public or private'),
  body('excerpt')
    .optional()
    .isLength({ max: 300 })
    .withMessage('Excerpt must be less than 300 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, content, tags, privacy, excerpt, coverImage, featured } = req.body;

    // Generate slug from title
    const slug = slugify(title, { lower: true, strict: true });

    // Optional: Check if slug already exists to avoid duplicates (you can add a unique suffix or return an error)
    const existingPost = await Post.findOne({ slug });
    if (existingPost) {
    return res.status(400).json({ message: 'Slug already exists, please change the title' });
    }
    // Create new post

    const post = new Post({
      title,
      slug,
      content,
      tags,
      privacy,
      excerpt,
      coverImage,
      featured: featured && req.user.role === 'admin' ? featured : false,
      author: req.user._id
    });

    await post.save();
    await post.populate('author', 'username avatar');

    res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/posts/:id
// @desc    Update a post
// @access  Private (author only)
router.put('/:id', auth, [
  param('id').isMongoId().withMessage('Invalid post ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be 1-200 characters'),
  body('content')
    .optional()
    .notEmpty()
    .withMessage('Content cannot be empty'),
  body('tags')
    .optional()
    .isArray({ min: 1, max: 2 })
    .withMessage('Must have 1-2 tags'),
  body('tags.*')
    .optional()
    .isIn(['technical', 'personal'])
    .withMessage('Tags must be technical or personal'),
  body('privacy')
    .optional()
    .isIn(['public', 'private'])
    .withMessage('Privacy must be public or private')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updateFields = {};
    const allowedFields = ['title', 'content', 'tags', 'privacy', 'excerpt', 'coverImage', 'status'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    // Only admin can set featured
    if (req.body.featured !== undefined && req.user.role === 'admin') {
      updateFields.featured = req.body.featured;
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).populate('author', 'username avatar');

    res.json({
      message: 'Post updated successfully',
      post: updatedPost
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private (author only)
router.delete('/:id', auth, [
  param('id').isMongoId().withMessage('Invalid post ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is the author or admin
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/posts/user/:userId
// @desc    Get posts by user
// @access  Public/Private
router.get('/user/:userId', optionalAuth, [
  param('userId').isMongoId().withMessage('Invalid user ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const filter = {
      author: req.params.userId,
      status: 'published'
    };

    // Privacy filter
    if (!req.user || req.user._id.toString() !== req.params.userId) {
      filter.privacy = 'public';
    }

    const posts = await Post.find(filter)
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
      .select('-content');

    res.json({ posts });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/posts/:id/like
// @desc    Toggle like on a post
// @access  Private
router.post('/:id/like', auth, [
  param('id').isMongoId().withMessage('Invalid post ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if post is accessible
    if (post.privacy === 'private' &&
        post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const userId = req.user._id;
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId.toString());
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.json({
      message: isLiked ? 'Post unliked' : 'Post liked',
      liked: !isLiked,
      likesCount: post.likes.length
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
