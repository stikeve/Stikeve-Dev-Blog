const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title must be less than 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  excerpt: {
    type: String,
    maxlength: [300, 'Excerpt must be less than 300 characters']
  },
  slug: {
    type: String,
    unique: true,
    required: true
  },
  tags: {
    type: [String],
    enum: ['technical', 'personal'],
    required: [true, 'At least one tag is required'],
    validate: {
      validator: function(tags) {
        return tags.length > 0 && tags.length <= 2;
      },
      message: 'Post must have 1-2 tags from: technical, personal'
    }
  },
  privacy: {
    type: String,
    enum: ['public', 'private'],
    required: [true, 'Privacy setting is required'],
    default: 'public'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  featured: {
    type: Boolean,
    default: false
  },
  coverImage: {
    type: String,
    default: ''
  },
  readTime: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published'
  }
}, {
  timestamps: true
});

// Create slug from title before saving
postSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    // Add timestamp to ensure uniqueness
    if (this.isNew) {
      this.slug += '-' + Date.now();
    }
  }

  // Calculate read time (average 200 words per minute)
  if (this.isModified('content')) {
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / 200);

    // Generate excerpt if not provided
    if (!this.excerpt) {
      this.excerpt = this.content
        .replace(/[#*`]/g, '')
        .substring(0, 150)
        .trim() + '...';
    }
  }

  next();
});

// Index for better query performance
postSchema.index({ createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ privacy: 1 });
postSchema.index({ author: 1 });
postSchema.index({ slug: 1 });

module.exports = mongoose.model('Post', postSchema);
// This model defines the structure of a blog post in the database.
// It includes fields for title, content, excerpt, slug, tags, privacy, author,