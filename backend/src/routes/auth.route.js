import express from 'express';
import { Router } from 'express';
import { login, logout, signup,refreshToken,getProfile } from '../controllers/auth.controller.js';
import {validate} from '../middlewares/validator.js';
import {userValidationRules} from '../validators/user.validator.js';
import { protect } from '../middlewares/protect.js';
export const router = Router();

router.post('/signup', userValidationRules(), validate, signup);
router.post('/logout', logout);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.get('/profile',protect,getProfile);