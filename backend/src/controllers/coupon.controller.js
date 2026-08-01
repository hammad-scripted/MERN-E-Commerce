import { Coupon } from '../models/coupon.model.js';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';
import { StatusCodes } from 'http-status-codes';

export const getCoupon = async (req, res, next) => {
  const coupon = await Coupon.findOne({
    userId: req.user._id,
    isActive: true,
  });

  if (!coupon) {
    return next(
      new ApiError(
        StatusCodes.NOT_FOUND,
        'Coupon not found!',
      ),
    );
  }

  return res.status(StatusCodes.OK).json(
    new ApiResponse(
      StatusCodes.OK,
      coupon,
      'Coupon fetched successfully',
    ),
  );
};

export const validateCoupon = async (req, res, next) => {
  const { code } = req.body;

  const coupon = await Coupon.findOne({
    code,
    userId: req.user._id,
    isActive: true,
  });

  if (!coupon) {
    return next(
      new ApiError(StatusCodes.BAD_REQUEST, 'Invalid coupon code'),
    );
  }

  if (coupon.expirationDate < new Date()) {
    coupon.isActive = false;
    await coupon.save();

    return next(
      new ApiError(StatusCodes.BAD_REQUEST, 'Coupon Code expired'),
    );
  }

  return res.status(StatusCodes.OK).json(
    new ApiResponse(
      StatusCodes.OK,
      coupon,
      'Coupon fetched successfully',
    ),
  );
};
