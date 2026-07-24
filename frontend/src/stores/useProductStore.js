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
      const response = await axiosInstance.post('/product', productData);
      set((previousState) => ({
        products: [...previousState.products, response.data.data],
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
      const response = await axiosInstance.delete(`/product/${productId}`);
      set((previousProducts) => ({
        products: previousProducts.products.filter(
          (product) => product._id !== productId,
        ),
        loading: false,
      }));
      toast.success(response.data.message);
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || 'Product deletion failed');
    }
  },
  fetchAllProducts: async () => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get('/product');
      set({ products: response.data.data, loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || 'Product fetching failed');
    }
  },
  toggleFeaturedProduct: async (productId) => {
    set({ loading: true });
    try {
      const response = await axiosInstance.patch(`/product/${productId}`);
      set((previousProducts) => ({
        products: previousProducts.products.map((product) => {
          if (product._id === productId) {
            return { ...product, isFeatured: response.data.data.isFeatured };
          }
          return product;
        }),
        loading: false,
      }));
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Product creation failed');
    }
  },
  fetchProductsByCategory:async (category) => {
    set({loading:true});
    try {
      const response=await axiosInstance.get(`/product/category/${category}`);
      set({products:response.data.data,loading:false})
    } catch (error) {
      set({error:"Failed to fetch products",loading:false});
      toast.error(error.response?.data?.message||"Failed to fetch products!")
      
    }
    
  }
}));
