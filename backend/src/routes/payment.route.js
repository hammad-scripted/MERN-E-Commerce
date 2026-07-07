import express from 'express';
import { Router } from 'express';
import { protectRoute } from '../middlewares/protect.js';

export const router = Router();

router.post('/create-checkout-session', protectRoute, createCheckoutSession);
