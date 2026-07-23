import { create } from 'zustand';
import axiosInstance from '../lib/axios';
import toast from 'react-hot-toast';

export const useProductStore = create((set, get) => ({
  products: [],
  loading: false,

  setProducts: (products) => set({ products }),

  createProduct: async (productData) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.post('/product', productData);
      set((previousState) => ({
        products: [...previousState.products, res.data.data],
      }));
      set({ loading: false });
      toast.success('Product created successfully');
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || 'Product creation failed');
    }
  },
  deleteProduct: async (productId) => {
    try {
      const res = await axiosInstance.delete(`/product/${productId}`);
      set((previousProducts) => ({
        products: previousProducts.products.filter(
          (product) => product._id !== productId,
        ),
        loading: false,
      }));
      toast.success(res.data.message);
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || 'Product deletion failed');
    }
  },
  fetchAllProducts: async () => {
    set({ loading: true });
    try {
      const res = await axiosInstance.get('/product');
      set({ products: res.data.data, loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || 'Product creation failed');
    }
  },
  toggleFeaturedProduct: async (productId) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.patch(`/product/${productId}`);
      set((previousProducts) => ({
        products: previousProducts.products.map((product) => {
          if (product._id === productId) {
            return { ...product, isFeatured: res.data.data.isFeatured };
          }
          return product;
        }),
        loading: false,
      }));
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Product creation failed');
    }
  },
}));
