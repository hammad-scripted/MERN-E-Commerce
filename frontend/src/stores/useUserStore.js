import { create } from 'zustand';
import axiosInstance from '../lib/axios';
import { toast } from 'react-hot-toast';
import { getErrorMessage } from '../lib/getErrorMessage';

export const useUserStore = create((set) => ({
  // ? states
  user: null,
  loading: false,
  checkingAuth: true,

  //? actions
  signup: async ({ name, email, password, confirmPassword }) => {
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    set({ loading: true });
    try {
      const res = await axiosInstance.post('auth/signup', {
        name,
        email,
        password,
      });
      set({ user: res.data.data, loading: false });
      toast.success('Account created successfully');
    } catch (error) {
      set({ loading: false });
      toast.error(getErrorMessage(error));
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.post('auth/login', { email, password });
      set({ user: res.data.data, loading: false });
      toast.success('Logged in successfully');
    } catch (error) {
      set({ loading: false });
      toast.error(getErrorMessage(error));
    }
  },

  checkAuth: async () => {
    set({ checkingAuth: true });
    try {
      const res = await axiosInstance.get('auth/profile');
      set({ user: res.data.data, checkingAuth: false });
    } catch {
      // expected when the user isn't logged in — fail silently, no toast
      set({ user: null, checkingAuth: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post('auth/logout');
      set({ user: null });
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  },
}));

let refreshingToken = null;

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isRefreshRequest = originalRequest?.url?.includes('auth/refresh-token');

    // A guest has no refresh-token cookie. Do not try to refresh the refresh
    // request itself, otherwise its 401 response creates an endless loop.
    if (
      !error.response ||
      error.response.status !== 401 ||
      originalRequest._retry ||
      isRefreshRequest
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshingToken) {
        refreshingToken = axiosInstance.post('auth/refresh-token');
      }

      // The backend renews HTTP-only cookies. There is no access token in the
      // JSON response, and JavaScript should not attempt to manage one.
      await refreshingToken;

      return axiosInstance(originalRequest);
    } catch {
      return Promise.reject(error);
    } finally {
      refreshingToken = null;
    }
  }
);
