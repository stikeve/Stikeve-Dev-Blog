import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postsAPI } from '../services/api';
import { PenTool, Eye, Save, Tag, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import toast from 'react-hot-toast';
import 'highlight.js/styles/github.css';
import api from '../services/api';

interface Post {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  privacy: 'public' | 'private';
  coverImage?: string;
  status: 'draft' | 'published';
}

const EditPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    tags: [] as string[],
    privacy: 'public' as 'public' | 'private',
    coverImage: '',
    status: 'published' as 'draft' | 'published'
  });
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [post, setPost] = useState<Post | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

const fetchPost = async () => {
  try {
    setLoading(true);
    
    // Directly fetch the post by ID using the new endpoint
    const response = await api.get(`/posts/id/${id}`);
    
    // Set the post data and form state
    setPost(response.data.post);
    setFormData({
      title: response.data.post.title,
      content: response.data.post.content,
      excerpt: response.data.post.excerpt || '',
      tags: response.data.post.tags,
      privacy: response.data.post.privacy,
      coverImage: response.data.post.coverImage || '',
      status: response.data.post.status
    });
    
  } catch (error: any) {
    console.error('Error fetching post:', error);
    toast.error(error.response?.data?.message || 'Failed to load post for editing');
    navigate('/dashboard');
  } finally {
    setLoading(false);
  }
};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagChange = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!formData.title.trim() || !formData.content.trim()) {
    toast.error('Title and content are required');
    return;
  }

  if (formData.tags.length === 0) {
    toast.error('Please select at least one tag');
    return;
  }

  setSaving(true);

  try {
    // Update using the post ID (your existing PUT /posts/:id endpoint)
    const response = await api.put(`/posts/${id}`, formData);
    toast.success('Post updated successfully!');
    navigate(`/post/${response.data.post.slug}`);
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to update post';
    toast.error(message);
  } finally {
    setSaving(false);
  }
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
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Post</h1>
        <p className="text-gray-600">Update your blog post</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your post title..."
          />
        </div>

        {/* Excerpt */}
        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
            Excerpt (Optional)
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            rows={2}
            value={formData.excerpt}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Brief description of your post..."
          />
        </div>

        {/* Tags and Privacy */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags * (Select 1-2)
            </label>
            <div className="space-y-2">
              {['technical', 'personal'].map((tag) => (
                <label key={tag} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.tags.includes(tag)}
                    onChange={() => handleTagChange(tag)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize flex items-center">
                    <Tag className="h-4 w-4 mr-1" />
                    {tag}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Privacy */}
          <div>
            <label htmlFor="privacy" className="block text-sm font-medium text-gray-700 mb-2">
              Privacy
            </label>
            <select
              id="privacy"
              name="privacy"
              value={formData.privacy}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="public">🌍 Public</option>
              <option value="private">🔒 Private</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="published">📢 Published</option>
              <option value="draft">📝 Draft</option>
            </select>
          </div>
        </div>

        {/* Cover Image */}
        {/* <div>
          <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-2">
            Cover Image URL (Optional)
          </label>
          <input
            type="url"
            id="coverImage"
            name="coverImage"
            value={formData.coverImage}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://example.com/image.jpg"
          />
        </div> */}

        {/* Content Editor */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Content * (Markdown supported)
            </label>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
            >
              <Eye className="h-4 w-4" />
              <span>{showPreview ? 'Edit' : 'Preview'}</span>
            </button>
          </div>

          <div className="border border-gray-300 rounded-md overflow-hidden">
            {showPreview ? (
              <div className="p-4 min-h-[400px] bg-white prose prose-sm max-w-none">
                <div className="markdown-content">
                  <ReactMarkdown
                    rehypePlugins={[rehypeHighlight]}
                  >
                  {formData.content || 'Nothing to preview yet. Start writing!'}
                  </ReactMarkdown>
                </div>
              </div>
            ) : (
              <textarea
                id="content"
                name="content"
                required
                rows={20}
                value={formData.content}
                onChange={handleChange}
                className="w-full px-4 py-3 border-0 focus:outline-none focus:ring-0 resize-none"
                placeholder="Update your post content..."
              />
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{saving ? 'Updating...' : 'Update Post'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPost;
