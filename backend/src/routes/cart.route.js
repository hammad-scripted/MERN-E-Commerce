import express from 'express';
import { Router } from 'express';
import { protectRoute } from '../middleware/protect.js';
import { adminRoute } from '../middlewares/protect.js';

import {
  addToCart,
  removeAllFromCart,
  getCartProducts,
  updateQuantity,
} from '../controllers/cart.controller.js';
const router = Router();

router.get('/', protectRoute, getCartProducts);
router.post('/', protectRoute, addToCart);
router.delete('/', protectRoute, removeAllFromCart);
router.put('/:id', protectRoute, updateQuantity);

export default router;
