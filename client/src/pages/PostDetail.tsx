import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { postsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  Calendar,
  Clock,
  Eye,
  Heart,
  Tag,
  User,
  Edit,
  Trash2,
  ArrowLeft,
  Lock
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import toast from 'react-hot-toast';
import 'highlight.js/styles/github.css';

interface Post {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  tags: string[];
  privacy: 'public' | 'private';
  author: {
    _id: string;
    username: string;
    avatar?: string;
    bio?: string;
  };
  createdAt: string;
  updatedAt: string;
  readTime: number;
  views: number;
  likes: string[];
  coverImage?: string;
}

const PostDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await postsAPI.getPost(slug!);
      const postData = response.data.post;
      setPost(postData);
      setLikesCount(postData.likes.length);
      if (user) {
        setIsLiked(postData.likes.includes(user.id));
      }
    } catch (error: any) {
      console.error('Error fetching post:', error);
      if (error.response?.status === 404) {
        toast.error('Post not found');
        navigate('/');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to view this post');
        navigate('/');
      } else {
        toast.error('Failed to load post');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to like posts');
      return;
    }

    try {
      const response = await postsAPI.toggleLike(post!._id);
      setIsLiked(response.data.liked);
      setLikesCount(response.data.likesCount);
      toast.success(response.data.message);
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to toggle like');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await postsAPI.deletePost(post!._id);
      toast.success('Post deleted successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTagColor = (tag: string) => {
    return tag === 'technical'
      ? 'bg-blue-100 text-blue-800'
      : 'bg-green-100 text-green-800';
  };

  const isAuthor = user && post && user.id === post.author._id;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Post not found</h2>
          <p className="text-gray-600 mb-4">The post you're looking for doesn't exist.</p>
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to posts
        </Link>
      </div>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="mb-8">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-64 object-cover rounded-lg shadow-md"
          />
        </div>
      )}

      {/* Post Header */}
      <header className="mb-8">
        {/* Tags and Privacy */}
        <div className="flex items-center space-x-2 mb-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTagColor(tag)}`}
            >
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </span>
          ))}
          {post.privacy === 'private' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              <Lock className="h-3 w-3 mr-1" />
              private
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
          {post.title}
        </h1>

        {/* Meta Information */}
        <div className="flex flex-wrap items-center justify-between mb-6 text-sm text-gray-600">
          <div className="flex items-center space-x-4 mb-2 sm:mb-0">
            <div className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span className="font-medium">{post.author.username}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(post.createdAt)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{post.readTime} min read</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{post.views}</span>
            </div>
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 transition-colors duration-200 ${
                isLiked
                  ? 'text-red-600 hover:text-red-700'
                  : 'text-gray-600 hover:text-red-600'
              }`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likesCount}</span>
            </button>
          </div>
        </div>

        {/* Author Actions */}
        {(isAuthor || user?.role === 'admin') && (
          <div className="flex items-center space-x-2 mb-6">
            <Link
              to={`/edit/${post._id}`}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors duration-200"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors duration-200"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </button>
          </div>
        )}
      </header>

      {/* Post Content */}
      <article className="prose prose-lg max-w-none mb-12">
        <div className="markdown-content">
          <ReactMarkdown
            rehypePlugins={[rehypeHighlight]}
          >
          {post.content}
          </ReactMarkdown>
        </div>
      </article>

      {/* Author Bio */}
      <div className="border-t border-gray-200 pt-8">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-blue-600 font-medium text-xl">
              {post.author.username[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {post.author.username}
            </h3>
            {post.author.bio ? (
              <p className="text-gray-600">{post.author.bio}</p>
            ) : (
              <p className="text-gray-500 italic">No bio available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
