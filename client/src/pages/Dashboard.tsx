import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  PenTool,
  Edit,
  Trash2,
  Eye,
  Heart,
  Calendar,
  Clock,
  Tag,
  Lock,
  Globe,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Post {
  _id: string;
  title: string;
  excerpt: string;
  slug: string;
  tags: string[];
  privacy: 'public' | 'private';
  createdAt: string;
  updatedAt: string;
  readTime: number;
  views: number;
  likes: string[];
  status: 'draft' | 'published';
}

const Dashboard: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserPosts();
    }
  }, [user]);

  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      const response = await postsAPI.getUserPosts(user!.id);
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      toast.error('Failed to load your posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string, postTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${postTitle}"?`)) {
      return;
    }

    try {
      await postsAPI.deletePost(postId);
      setPosts(posts.filter(post => post._id !== postId));
      toast.success('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTagColor = (tag: string) => {
    return tag === 'technical'
      ? 'bg-blue-100 text-blue-800'
      : 'bg-green-100 text-green-800';
  };

  const stats = {
    total: posts.length,
    published: posts.filter(p => p.status === 'published').length,
    drafts: posts.filter(p => p.status === 'draft').length,
    totalViews: posts.reduce((sum, post) => sum + post.views, 0),
    totalLikes: posts.reduce((sum, post) => sum + post.likes.length, 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Manage your blog posts</p>
          </div>
          <Link
            to="/create"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Posts</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
            <div className="text-sm text-gray-600">Published</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-yellow-600">{stats.drafts}</div>
            <div className="text-sm text-gray-600">Drafts</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{stats.totalViews}</div>
            <div className="text-sm text-gray-600">Total Views</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-red-600">{stats.totalLikes}</div>
            <div className="text-sm text-gray-600">Total Likes</div>
          </div>
        </div>
      </div>

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <PenTool className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
          <p className="text-gray-600 mb-4">Start writing your first blog post</p>
          <Link
            to="/create"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Post
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Your Posts</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {posts.map((post) => (
              <div key={post._id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Tags and Privacy */}
                    <div className="flex items-center space-x-2 mb-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTagColor(tag)}`}
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        post.privacy === 'public'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {post.privacy === 'public' ? (
                          <><Globe className="h-3 w-3 mr-1" />public</>
                        ) : (
                          <><Lock className="h-3 w-3 mr-1" />private</>
                        )}
                      </span>
                      {post.status === 'draft' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Draft
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      <Link
                        to={`/post/${post.slug}`}
                        className="hover:text-blue-600 transition-colors duration-200"
                      >
                        {post.title}
                      </Link>
                    </h3>

                    {/* Excerpt */}
                    {post.excerpt && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}

                    {/* Meta Info */}
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(post.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{post.readTime} min</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{post.views}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="h-3 w-3" />
                        <span>{post.likes.length}</span>
                      </div>
                      {post.updatedAt !== post.createdAt && (
                        <span className="text-gray-400">
                          Updated {formatDate(post.updatedAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      to={`/post/${post.slug}`}
                      className="p-2 text-gray-500 hover:text-blue-600 transition-colors duration-200"
                      title="View post"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      to={`/edit/${post._id}`}
                      className="p-2 text-gray-500 hover:text-blue-600 transition-colors duration-200"
                      title="Edit post"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(post._id, post.title)}
                      className="p-2 text-gray-500 hover:text-red-600 transition-colors duration-200"
                      title="Delete post"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
