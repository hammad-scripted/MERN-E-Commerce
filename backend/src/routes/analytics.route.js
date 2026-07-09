import express from 'express';
import { Router } from 'express';
import { protectRoute } from '../middlewares/protect.js';
import { adminRoute } from '../middlewares/protect.js';
import {
  getAnalyticsData,
  getDailySalesData,
} from '../controllers/analytics.controller.js';

import ApiResponse from '../utils/apiResponse.js';
import ApiError from '../utils/apiError.js';
export const router = Router();

router.get('/', protectRoute, adminRoute, async (req, res) => {
  const analyticsData = await getAnalyticsData();
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  const dailySalesData = await getDailySalesData(startDate, endDate);

  res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(true, analyticsData, 'Analytics fetched successfully'),
    );
});
