import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { postsAPI } from '../services/api';
import { Clock, Calendar, Tag, Eye, Heart, User, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

interface Post {
  _id: string;
  title: string;
  excerpt: string;
  slug: string;
  tags: string[];
  privacy: 'public' | 'private';
  author: {
    _id: string;
    username: string;
    avatar?: string;
  };
  createdAt: string;
  readTime: number;
  views: number;
  likes: string[];
}

const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const selectedTags = searchParams.get('tags');

  useEffect(() => {
    fetchPosts();
  }, [selectedTags]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 20 };
      if (selectedTags) {
        params.tags = selectedTags;
      }

      const response = await postsAPI.getPosts(params);
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to My DevBlog
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          A personal blog sharing thoughts on development, technology, and life.
          Discover insights, and personal experiences.
        </p>
      </div>

      {/* Filter Tags */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-4">
          <Link
            to="/"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
              !selectedTags
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Posts
          </Link>
          <Link
            to="/?tags=technical"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
              selectedTags === 'technical'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Technical
          </Link>
          <Link
            to="/?tags=personal"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
              selectedTags === 'personal'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Personal
          </Link>
        </div>
      </div>

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
          <p className="text-gray-600">
            {selectedTags
              ? `No posts found with the tag "${selectedTags}"`
              : 'No posts have been published yet'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {posts.map((post) => (
            <article
              key={post._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-6">
                {/* Post Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
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
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors duration-200">
                  <Link to={`/post/${post.slug}`}>
                    {post.title}
                  </Link>
                </h2>

                {/* Excerpt */}
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {post.excerpt}
                </p>

                {/* Meta Information */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{post.author.username}</span>
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
                    <div className="flex items-center space-x-1">
                      <Heart className="h-4 w-4" />
                      <span>{post.likes.length}</span>
                    </div>
                  </div>
                </div>

                {/* Read More Link */}
                <div className="mt-4">
                  <Link
                    to={`/post/${post.slug}`}
                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                  >
                    Read more →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
