import express from 'express';
import { Router } from 'express';
import { protectRoute } from '../middlewares/protect.js';
import { createCheckoutSession,createSuccessSession} from '../controllers/payment.controller.js';
export const router = Router();

router.post('/create-checkout-session', protectRoute, createCheckoutSession);

router.post('/checkout-success', protectRoute, createSuccessSession);
