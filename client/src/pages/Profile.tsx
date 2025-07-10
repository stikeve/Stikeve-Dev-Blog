import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Save, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
    avatar: user?.avatar || ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username.trim()) {
      toast.error('Username is required');
      return;
    }

    if (formData.username.length < 3 || formData.username.length > 20) {
      toast.error('Username must be between 3 and 20 characters');
      return;
    }

    if (formData.bio.length > 500) {
      toast.error('Bio must be less than 500 characters');
      return;
    }

    setLoading(true);

    try {
      await updateUser(formData);
    } catch (error) {
      // Error handling is done in the updateUser function
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      username: user?.username || '',
      bio: user?.bio || '',
      avatar: user?.avatar || ''
    });
  };

  const hasChanges =
    formData.username !== (user?.username || '') ||
    formData.bio !== (user?.bio || '') ||
    formData.avatar !== (user?.avatar || '');

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
        <p className="text-gray-600">Update your profile information</p>
      </div>

      {/* Profile Form */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              {formData.avatar ? (
                <img
                  src={formData.avatar}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = `
                      <span class="text-blue-600 font-medium text-2xl">
                        ${user?.username?.[0]?.toUpperCase() || 'U'}
                      </span>
                    `;
                  }}
                />
              ) : (
                <span className="text-blue-600 font-medium text-2xl">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div className="flex-1">
              <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-1">
                Avatar URL (Optional)
              </label>
              <input
                type="url"
                id="avatar"
                name="avatar"
                value={formData.avatar}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/avatar.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Provide a URL to your profile picture
              </p>
            </div>
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="username"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your username"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              3-20 characters. This will be displayed on your posts.
            </p>
          </div>

          {/* Email (Read-only) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                value={user?.email || ''}
                disabled
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Email cannot be changed. Contact support if you need to update it.
            </p>
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
              Bio (Optional)
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              value={formData.bio}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tell us about yourself..."
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">
                Share a bit about yourself with your readers
              </p>
              <span className={`text-xs ${formData.bio.length > 450 ? 'text-red-500' : 'text-gray-500'}`}>
                {formData.bio.length}/500
              </span>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Role:</span> {user?.role}
              </div>
              <div>
                <span className="font-medium">Member since:</span> Just now
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleReset}
              disabled={!hasChanges || loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Reset Changes
            </button>

            <button
              type="submit"
              disabled={!hasChanges || loading}
              className="flex items-center space-x-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Security Section */}
      <div className="mt-8 bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Security</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Password changes and other security settings will be available in future updates.
          </p>
          <button
            disabled
            className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-md cursor-not-allowed"
          >
            Change Password (Coming Soon)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
