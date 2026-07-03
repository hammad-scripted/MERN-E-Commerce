import express from 'express';
import { Router } from 'express';
import { login, logout, signup } from '../controllers/auth.controller.js';
import {validate, userValidationRules} from '../middlewares/validator.js';
export const router = Router();

router.post('/signup', userValidationRules(), validate, signup);
router.post('/logout', logout);
router.post('/login', login);
