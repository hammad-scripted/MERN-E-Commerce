import express from 'express';
import { Router } from 'express';

import {
  addToCart,
  removeAllFromCart,
  getCartProducts,
  updateQuantity,
} from '../controllers/cart.controller.js';
import { protectRoute } from '../middlewares/protect.js';
export const router = Router();

router.get('/', protectRoute, getCartProducts);
router.post('/', protectRoute, addToCart);
router.delete('/', protectRoute, removeAllFromCart);
router.put('/:id', protectRoute, updateQuantity);
