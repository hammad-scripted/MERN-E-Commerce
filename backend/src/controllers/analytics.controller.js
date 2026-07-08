import { StatusCodes } from 'http-status-codes';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';
import { User } from '../models/user.model.js';
import { Product } from '../models/product.model.js';
import { Order } from '../models/order.model.js';
export const getAnalyticsData = async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();
  const salesData = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalSales: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
      },
    },
  ]);

  const { totalSales, totalRevenue } = salesData[0] || {
    totalSales: 0,
    totalRevenue: 0,
  };

  return res.status(StatusCodes.OK).json(
    new ApiResponse(
      true,
      {
        users: totalUsers,
        products: totalProducts,
        sales: totalSales,
        revenue: totalRevenue,
      },
      'Analytics fetched successfully',
    ),
  );
};

export const getDailySalesData = async (startDate, endDate) => {
  const dailySales = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        totalSales: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ]);
  return dailySales;
};
