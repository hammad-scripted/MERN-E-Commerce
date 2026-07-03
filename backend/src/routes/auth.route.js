import express from 'express';
import { Router } from 'express';
import { login, logout, signup } from '../controllers/auth.controller.js';
export const router = Router();

router.post('/signup', signup);
router.post('/logout', logout);
router.post('/login', login);
