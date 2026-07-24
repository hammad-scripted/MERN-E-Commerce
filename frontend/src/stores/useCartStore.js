import { create } from 'zustand';
import axiosInstance from '../lib/axios';
import toast from 'react-hot-toast';

export const useCartStore = create((set, get) => ({
  coupon: null,
  cart: [],
  total: 0,
  subtotal: 0,

  getCartItems: async () => {
    try {
      const response = await axiosInstance.get('/cart');
      set({ cart: response.data.data });
      get().calculateTotals();
    } catch (error) {
      set({ cart: [] });
      toast.error(error.response?.data?.message || 'An error occurred');
    }
  },

  addToCart: async (product) => {
    try {
      await axiosInstance.post('/cart', {
        productId: product._id,
      });
      toast.success('Added to cart successfully!');
      set((prevState) => {
        const existingItem = prevState.cart.find(
          (item) => item._id === product._id,
        );
        const newCart = existingItem
          ? prevState.cart.map((item) =>
              item._id === product._id
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            )
          : [...prevState.cart, { ...product, quantity: 1 }];
        return { cart: newCart };
      });
      get().calculateTotals();
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred');
    }
  },

  calculateTotals: () => {
    const { cart, coupon } = get();
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    let total = subtotal;

    if (coupon) {
      const discount = subtotal * (coupon.discountPercentage / 100);
      total = subtotal - discount;
    }
    set({ total, subtotal });
  },
}));