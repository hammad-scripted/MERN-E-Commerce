import express from 'express';
import { Router } from 'express';
import { getAllProducts } from '../controllers/product.controller.js';
export const router = Router();

router.get('/',getAllProducts)