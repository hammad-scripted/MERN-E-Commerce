import express from 'express';
import { Router } from 'express';
import { login, logout, register } from '../controllers/auth.controller.js';
export const router = Router();

router.post('/register', register);
router.post('/logout', logout);
router.post('/login', login);
