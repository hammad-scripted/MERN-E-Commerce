import express from 'express';
import { Router } from 'express';
import {
  getAllProducts,
  getFeaturedProducts,
} from '../controllers/product.controller.js';
import { protectRoute } from '../middlewares/protect.js';
import { adminRoute } from '../middlewares/protect.js';
import { validate } from '../middlewares/validator.js';
import { productValidationRules } from '../validators/product.validator.js';
export const router = Router();

router.get('/', protectRoute, adminRoute, getAllProducts);
router.get('/featured', getFeaturedProducts);
router.post(
  '/',
  protectRoute,
  adminRoute,
  productValidationRules(),
  validate,
  createProducts,
);
