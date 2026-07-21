import { create } from 'zustand';
import axiosInstance from '../lib/axios';
import { toast } from 'react-hot-toast';

export const useUserStore = create((set, get) => ({
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
      toast.error(error.response?.data?.message || 'Signup failed');
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
      toast.error(error.response?.data?.message || 'Login failed');
    }
  },

  checkAuth: async () => {
    set({ checkingAuth: true });
    try {
      const res = await axiosInstance.get('auth/profile');
      set({ user: res.data.data, checkingAuth: false });
    } catch (error) {
      // expected when the user isn't logged in — fail silently, no toast
      set({ user: null, checkingAuth: false });
      console.log(error);
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post('auth/logout');
      set({ user: null });
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Logout failed');
    }
  },
}));
