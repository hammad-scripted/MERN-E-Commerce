import express from 'express';
import { Router } from 'express';
import { protectRoute } from '../middlewares/protect.js';

import { getCoupon, validateCoupon } from '../controllers/coupon.controller.js';
export const router = Router();

router.get('/', protectRoute, getCoupon);
router.get('/validate', protectRoute, validateCoupon);

