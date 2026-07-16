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
    set({ loading: true });
    if (password != confirmPassword)
      return toast.error('Passwords do not match');

    try {
      const res = await axiosInstance.post('/auth/signup', {
        name,
        email,
        password,
      });
      set({ user: res.data.user, loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error(error.response.data.message);
    }
  },
}));
