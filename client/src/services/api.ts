import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post("/auth/login", credentials),

  register: (userData: { username: string; email: string; password: string }) =>
    api.post("/auth/register", userData),

  getProfile: () => api.get("/auth/me"),

  updateProfile: (data: { username?: string; bio?: string; avatar?: string }) =>
    api.put("/auth/profile", data),
};

// Posts API calls
export const postsAPI = {
  getPosts: (params?: {
    page?: number;
    limit?: number;
    tags?: string;
    search?: string;
  }) => api.get("/posts", { params }),

  getPost: (slug: string) => api.get(`/posts/${slug}`),
  getPostById: (id: string) => api.get(`/posts/id/${id}`),
  createPost: (postData: {
    title: string;
    content: string;
    tags: string[];
    privacy: "public" | "private";
    excerpt?: string;
    coverImage?: string;
  }) => api.post("/posts", postData),

  updatePost: (
    id: string,
    postData: Partial<{
      title: string;
      content: string;
      tags: string[];
      privacy: "public" | "private";
      excerpt: string;
      coverImage: string;
      status: "draft" | "published";
    }>
  ) => api.put(`/posts/${id}`, postData),

  deletePost: (id: string) => api.delete(`/posts/${id}`),

  getUserPosts: (userId: string) => api.get(`/posts/user/${userId}`),

  toggleLike: (id: string) => api.post(`/posts/${id}/like`),
};

export default api;
