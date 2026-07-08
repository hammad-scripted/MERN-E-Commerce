import express from 'express';
import { Router } from 'express';
import { protectRoute } from '../middlewares/protect.js';
import { adminRoute } from '../middlewares/protect.js';
import { getAnalytics } from '../controllers/analytics.controller.js';
export const router = Router();

router.get('/', protectRoute, adminRoute, getAnalytics);
