import { create } from 'zustand';
import axiosInstance from '../lib/axios';
import toast from 'react-hot-toast';

export const useCartStore = create((set, get) => ({
  coupon: null,
  cart: [],
  total: 0,
  subtotal: 0,
  isCouponApplied: false,
  getMyCoupon: async () => {
    try {
      const response = await axiosInstance.get('/coupon');
      set({ coupon: response.data.data });
    } catch (error) {
      console.error('Error fetching coupon:', error);
    }
  },
  applyCoupon: async (code) => {
    try {
      const response = await axiosInstance.post('/coupon/validate', { code });
      set({ coupon: response.data.data, isCouponApplied: true });
      get().calculateTotals();
      toast.success('Coupon applied successfully');
    } catch (error) {
      toast.error(error.response?.data?.errors || 'Failed to apply coupon');
    }
  },
  removeCoupon: () => {
    set({ coupon: null, isCouponApplied: false });
    get().calculateTotals();
    toast.success('Coupon removed');
  },
  getCartItems: async () => {
    try {
      const response = await axiosInstance.get('/cart');
      set({ cart: response.data.data });
      get().calculateTotals();
    } catch (error) {
      set({ cart: [] });
      toast.error(error.response?.data?.errors || 'An error occurred');
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
      toast.error(error.response?.data?.errors || 'An error occurred');
    }
  },

  removeFromCart: async (productId) => {
    await axiosInstance.delete(`/cart`, { data: { productId } });
    toast.success('Removed from cart successfully!');
    set((prevState) => ({
      cart: prevState.cart.filter((item) => item._id !== productId),
    }));
    get().calculateTotals();
  },
  updateQuantity: async (productId, quantity) => {
    await axiosInstance.put(`/cart/${productId}`, { productId, quantity });
    toast.success('Quantity updated successfully!');
    set((prevState) => ({
      cart: prevState.cart.map((item) =>
        item._id === productId ? { ...item, quantity } : item,
      ),
    }));
    get().calculateTotals();
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
